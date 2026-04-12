import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import type { TableDTO } from '../../services/types';
import { FloorPlan } from './FloorPlan';
import { useWebSocket } from '../../services/useWebSocket';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card, Input } from '../../components/ui';
import { Calendar, Users, Clock, CheckCircle } from 'lucide-react';
import { toast } from '../../store/toastStore';

const createReservationValidators = (today: string) => ({
  name: (value: string) => {
    if (!value?.trim()) return 'Vui lòng nhập tên';
    if (value.trim().length < 2) return 'Tên tối thiểu 2 ký tự';
    return undefined;
  },

  phone: (value: string) => {
    const normalizedPhone = value?.replace(/\s+/g, '');
    if (!normalizedPhone) return 'Vui lòng nhập số điện thoại';
    if (!/^(0|\+84)\d{9,10}$/.test(normalizedPhone)) return 'SĐT không hợp lệ';
    return undefined;
  },

  date: (value: string) => {
    if (!value) return 'Chọn ngày';
    if (value < today) return 'Ngày không hợp lệ';
    return undefined;
  },

  time: (value: string) => {
    if (!value) return 'Chọn giờ';
    if (value < '09:00' || value > '22:00') return 'Giờ 09:00-22:00';
    return undefined;
  }
});

export const CustomerTableView = () => {
  const navigate = useNavigate();
  const [tables, setTables] = useState<TableDTO[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableDTO | null>(null);

  // Booking form state
  const today = new Date().toISOString().split('T')[0];
  const validators = createReservationValidators(today);
  const [date, setDate] = useState(today);
  const [time, setTime] = useState('19:00');
  const [guests, setGuests] = useState(2);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const fetchTables = async () => {
    try {
      const res = await api.get('/tables');
      setTables(res.data.data || []);
    } catch { }
  };

  useEffect(() => { fetchTables(); }, []);
  useWebSocket<any>('/topic/tables', () => fetchTables());

  const handleTableClick = (table: TableDTO) => {
    if (table.status !== 'AVAILABLE') {
      toast.error('This table is not available right now. Please select a green table.');
      return;
    }
    setSelectedTable(table);
  };

  const validateField = (field: 'name' | 'phone' | 'date' | 'time', value: string) => {
    const error = validators[field](value);
    setErrors((prev) => ({ ...prev, [field]: error }));
    return error;
  };

  const validateForm = () => {
    const nextErrors = {
      name: validators.name(name),
      phone: validators.phone(phone),
      date: validators.date(date),
      time: validators.time(time)
    };

    setErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  };

  const submitBooking = async () => {
    if (!selectedTable) {
      toast.error('Please select a table first');
      return;
    }
    if (!validateForm()) {
      toast.error('Please double-check your reservation information.');
      return;
    }

    try {
      await api.post('/reservations', {
        tableId: selectedTable.id,
        customerName: name.trim(),
        phone: phone.replace(/\s+/g, ''),
        reservationTime: `${date}T${time}:00`,
        numberOfGuests: guests
      });
      toast.success('Reservation confirmed!');
      navigate('/reservations');
    } catch { toast.error('Failed to book table'); }
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 120px)', minHeight: 0, gap: 'var(--sp-6)' }}>
      {/* Floor Plan */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ marginBottom: 'var(--sp-4)' }}>
          <h1 style={{ color: 'var(--orange-600)', margin: 0 }}>Select a Table</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>Choose your preferred dining spot. Only green tables are available.</p>
        </div>

        <Card variant="elevated" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <FloorPlan
            tables={tables}
            selectedId={selectedTable?.id}
            onTableClick={handleTableClick}
            dimUnavailable={true} // Customer view dimms unavailable tables
          />
        </Card>
      </div>

      {/* Booking Form Sidebar */}
      <AnimatePresence>
        {selectedTable && (
          <motion.div
            initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}
            style={{ width: 380, display: 'flex', flexDirection: 'column', minHeight: 0 }}
          >
            <Card variant="elevated" style={{ height: '100%', display: 'flex', flexDirection: 'column', borderTop: '4px solid var(--orange-500)', minHeight: 0, overflow: 'hidden' }}>
              <Card.Header style={{ paddingBottom: 'var(--sp-4)', borderBottom: '1px solid var(--border-main)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <Card.Title>Book {selectedTable.name}</Card.Title>
                    <Card.Description>Up to {selectedTable.capacity} guests</Card.Description>
                  </div>
                  <button onClick={() => setSelectedTable(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 24 }}>×</button>
                </div>
              </Card.Header>

              <Card.Content style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', paddingTop: 'var(--sp-5)', minHeight: 0, overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-3)' }}>
                  <div>
                    <label className="input-label" style={{ marginBottom: 4, display: 'block' }}>Date</label>
                    <div className="input-container">
                      <Calendar size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 10 }} />
                      <input
                        type="date"
                        className="input-field"
                        style={{ paddingLeft: 34 }}
                        value={date}
                        min={today}
                        onChange={e => {
                          setDate(e.target.value);
                          validateField('date', e.target.value);
                        }}
                      />
                    </div>
                    {errors.date && <span className="input-message error">{errors.date}</span>}
                  </div>
                  <div>
                    <label className="input-label" style={{ marginBottom: 4, display: 'block' }}>Time</label>
                    <div className="input-container">
                      <Clock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 10 }} />
                      <input
                        type="time"
                        className="input-field"
                        style={{ paddingLeft: 34 }}
                        value={time}
                        min="09:00"
                        max="22:00"
                        onChange={e => {
                          setTime(e.target.value);
                          validateField('time', e.target.value);
                        }}
                      />
                    </div>
                    {errors.time && <span className="input-message error">{errors.time}</span>}
                  </div>
                </div>

                <div>
                  <label className="input-label" style={{ marginBottom: 4, display: 'block' }}>Guests</label>
                  <div className="input-container">
                    <Users size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 10 }} />
                    <input type="number" min="1" max={selectedTable.capacity} className="input-field" style={{ paddingLeft: 34 }} value={guests} onChange={e => setGuests(parseInt(e.target.value) || 1)} />
                  </div>
                </div>

                <Input
                  label="Your Name"
                  value={name}
                  error={errors.name}
                  onChange={e => {
                    setName(e.target.value);
                    validateField('name', e.target.value);
                  }}
                  placeholder="John Doe"
                />
                <Input
                  label="Phone Number"
                  value={phone}
                  error={errors.phone}
                  onChange={e => {
                    setPhone(e.target.value);
                    validateField('phone', e.target.value);
                  }}
                  placeholder="+84 901 234 567"
                />

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
