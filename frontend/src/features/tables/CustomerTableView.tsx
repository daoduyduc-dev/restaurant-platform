import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import type { TableDTO } from '../../services/types';
import { FloorPlanEnhanced } from './FloorPlanEnhanced';
import { useWebSocket } from '../../services/useWebSocket';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card, Input } from '../../components/ui';
import { Calendar, Users, Clock, CheckCircle } from 'lucide-react';
import { toast } from '../../store/toastStore';

export const CustomerTableView = () => {
  const navigate = useNavigate();
  const [tables, setTables] = useState<TableDTO[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableDTO | null>(null);
  const [availableTables, setAvailableTables] = useState<Set<string>>(new Set());

  // Booking form state
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('19:00');
  const [guests, setGuests] = useState(2);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [bookedTimeSlots, setBookedTimeSlots] = useState<Set<string>>(new Set());

  const fetchTables = async () => {
    try {
      const res = await api.get('/tables');
      setTables(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch tables:', error);
    }
  };

  useEffect(() => { fetchTables(); }, []);
  useWebSocket<any>('/topic/tables', () => fetchTables());

  // Check available tables for selected date/time
  useEffect(() => {
    const checkAvailability = async () => {
      if (!date || !time) return;

      setCheckingAvailability(true);
      try {
        const reservationTime = `${date}T${time}:00`;
        const res = await api.get('/reservations/available-tables', {
          params: {
            reservationTime,
            numberOfGuests: guests
          }
        });
        const availableIds = new Set<string>((res.data.data || []).map((t: TableDTO) => t.id));
        setAvailableTables(availableIds);
      } catch (error) {
        console.error('Failed to check availability:', error);
        // If endpoint fails, fall back to status-based availability
        setAvailableTables(new Set(tables.filter(t => t.status === 'AVAILABLE').map(t => t.id)));
      } finally {
        setCheckingAvailability(false);
      }
    };

    checkAvailability();
  }, [date, time, guests, tables]);

  // Check booked time slots for selected date and table
  useEffect(() => {
    const checkBookedSlots = async () => {
      if (!date || !selectedTable) return;

      try {
        // Fetch all reservations for the selected date and table
        const res = await api.get('/reservations', {
          params: {
            tableId: selectedTable.id,
            date: date,
            page: 0,
            size: 100
          }
        });

        const reservations = res.data.data?.items || res.data.data || [];
        const bookedSlots = new Set<string>();

        reservations.forEach((reservation: any) => {
          if (['PENDING', 'RESERVED', 'CHECKED_IN'].includes(reservation.status)) {
            const resTime = new Date(reservation.reservationTime);
            const timeStr = resTime.toTimeString().substring(0, 5); // HH:MM format
            bookedSlots.add(timeStr);
          }
        });

        setBookedTimeSlots(bookedSlots);
      } catch (error) {
        console.error('Failed to check booked slots:', error);
        setBookedTimeSlots(new Set());
      }
    };

    checkBookedSlots();
  }, [date, selectedTable]);

  const handleTableClick = (table: TableDTO) => {
    if (!availableTables.has(table.id)) {
       toast.error('This table is not available for the selected date/time. Please choose a different table or time.');
       return;
    }
    setSelectedTable(table);
  };

  const submitBooking = async () => {
    if (!selectedTable || !name || !phone) return toast.error('Please fill all fields');

    // Validate date/time is not in the past
    const reservationDateTime = new Date(`${date}T${time}:00`);
    const now = new Date();
    if (reservationDateTime < now) {
      return toast.error('Cannot book a table in the past. Please select a future date and time.');
    }

    try {
      await api.post('/reservations', {
        tableId: selectedTable.id,
        customerName: name,
        phone,
        reservationTime: `${date}T${time}:00`,
        numberOfGuests: guests
      });
      toast.success('🎉 Đặt bàn thành công! Mời bạn qua menu để chọn món hoặc check-in tại nhà hàng đúng giờ.');
      setSelectedTable(null);
      setName('');
      setPhone('');
      fetchTables();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message;
      if (errorMessage) {
        toast.error(errorMessage);
      } else {
        toast.error('Failed to book table. Please try again.');
      }
    }
  };

  return (
    <div style={{ display: 'flex', height: '100%', gap: 'var(--sp-6)' }}>
      {/* Floor Plan */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: 'var(--sp-4)' }}>
          <h1 style={{ color: 'var(--orange-600)', margin: 0 }}>Select a Table</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>Choose your preferred dining spot. Only green tables are available.</p>
        </div>
        
        <Card variant="elevated" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
          <FloorPlanEnhanced
            tables={tables.map(t => ({
              ...t,
              status: availableTables.has(t.id) ? 'AVAILABLE' : 'OCCUPIED'
            }))}
            selectedId={selectedTable?.id}
            onTableClick={handleTableClick}
            dimUnavailable={true}
          />
          {checkingAvailability && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(255,255,255,0.9)',
              padding: 'var(--sp-4)',
              borderRadius: 'var(--r-lg)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 10,
            }}>
              <div className="spinner" />
              <p style={{ marginTop: 'var(--sp-2)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Checking availability...</p>
            </div>
          )}
        </Card>
      </div>

      {/* Booking Form Sidebar */}
      <AnimatePresence>
        {selectedTable && (
          <motion.div
            initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}
            style={{ width: 380, display: 'flex', flexDirection: 'column' }}
          >
            <Card variant="elevated" style={{ height: '100%', display: 'flex', flexDirection: 'column', borderTop: '4px solid var(--orange-500)' }}>
              <Card.Header style={{ paddingBottom: 'var(--sp-4)', borderBottom: '1px solid var(--border-main)' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                   <div>
                     <Card.Title>Book {selectedTable.name}</Card.Title>
                     <Card.Description>Up to {selectedTable.capacity} guests</Card.Description>
                   </div>
                   <button onClick={() => setSelectedTable(null)} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize: 24 }}>×</button>
                 </div>
              </Card.Header>

              <Card.Content style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)', paddingTop: 'var(--sp-5)' }}>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-3)' }}>
                    <div>
                      <label className="input-label" style={{ marginBottom: 4, display: 'block' }}>Date</label>
                      <div className="input-container">
                        <Calendar size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 10 }} />
                        <input type="date" className="input-field" style={{ paddingLeft: 34 }} value={date} onChange={e=>setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                      </div>
                    </div>
                    <div>
                      <label className="input-label" style={{ marginBottom: 4, display: 'block' }}>Time</label>
                      <div className="input-container">
                        <Clock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 10 }} />
                        <select
                          className="input-field"
                          style={{ paddingLeft: 34 }}
                          value={time}
                          onChange={e=>setTime(e.target.value)}
                        >
                          {Array.from({ length: 24 }, (_, i) => {
                            const hour = i.toString().padStart(2, '0');
                            return ['00', '30'].map(minute => {
                              const timeValue = `${hour}:${minute}`;
                              const isBooked = bookedTimeSlots.has(timeValue);
                              return (
                                <option
                                  key={timeValue}
                                  value={timeValue}
                                  disabled={isBooked}
                                  style={{
                                    opacity: isBooked ? 0.5 : 1,
                                    color: isBooked ? 'var(--text-muted)' : 'inherit'
                                  }}
                                >
                                  {timeValue} {isBooked ? '(Booked)' : ''}
                                </option>
                              );
                            });
                          }).flat()}
                        </select>
                      </div>
                    </div>
                 </div>
                 
                 <div>
                    <label className="input-label" style={{ marginBottom: 4, display: 'block' }}>Guests</label>
                    <div className="input-container">
                      <Users size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 10 }} />
                      <input type="number" min="1" max={selectedTable.capacity} className="input-field" style={{ paddingLeft: 34 }} value={guests} onChange={e=>setGuests(parseInt(e.target.value)||1)} />
                    </div>
                 </div>

                 <Input label="Your Name" value={name} onChange={e=>setName(e.target.value)} placeholder="John Doe" />
                 <Input label="Phone Number" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+1 234 567 890" />

                 <div style={{ flex: 1 }} />
                 <Button variant="primary" size="large" style={{ width: '100%', justifyContent: 'center' }} onClick={submitBooking}>
                    <CheckCircle size={18} /> Confirm Booking
                 </Button>
              </Card.Content>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
