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

export const CustomerTableView = () => {
  const navigate = useNavigate();
  const [tables, setTables] = useState<TableDTO[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableDTO | null>(null);
  
  // Booking form state
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('19:00');
  const [guests, setGuests] = useState(2);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const fetchTables = async () => {
    try {
      const res = await api.get('/tables');
      setTables(res.data.data || []);
    } catch {}
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

  const submitBooking = async () => {
    if (!selectedTable || !name || !phone) return toast.error('Please fill all fields');
    try {
      await api.post('/reservations', {
        tableId: selectedTable.id,
        customerName: name,
        phone,
        reservationTime: `${date}T${time}:00`,
        numberOfGuests: guests
      });
      toast.success('Reservation confirmed!');
      navigate('/reservations');
    } catch { toast.error('Failed to book table'); }
  };

  return (
    <div style={{ display: 'flex', height: '100%', gap: 'var(--sp-6)' }}>
      {/* Floor Plan */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
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
                        <input type="date" className="input-field" style={{ paddingLeft: 34 }} value={date} onChange={e=>setDate(e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label className="input-label" style={{ marginBottom: 4, display: 'block' }}>Time</label>
                      <div className="input-container">
                        <Clock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 10 }} />
                        <input type="time" className="input-field" style={{ paddingLeft: 34 }} value={time} onChange={e=>setTime(e.target.value)} />
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
