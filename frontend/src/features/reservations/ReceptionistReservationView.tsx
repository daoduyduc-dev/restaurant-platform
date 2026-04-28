import { useState, useEffect } from 'react';
import api from '../../services/api';
import type { ReservationDTO, TableDTO } from '../../services/types';
import { useWebSocket } from '../../services/useWebSocket';
import { Calendar, Phone, Users, CheckCircle, XCircle, Search, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Badge, Button, Input, Modal } from '../../components/ui';
import { toast } from '../../store/toastStore';

export const ReceptionistReservationView = () => {
   const [reservations, setReservations] = useState<ReservationDTO[]>([]);
   const [tables, setTables] = useState<TableDTO[]>([]);
   const [search, setSearch] = useState('');
   const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
   const [filterStatus, setFilterStatus] = useState('');
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [formData, setFormData] = useState({
      customerName: '', phone: '', reservationTime: '', numberOfGuests: 2, tableId: ''
   });

   const fetchData = async () => {
      try {
         const [rRes, tRes] = await Promise.all([
            api.get('/reservations?size=100'),
            api.get('/tables')
         ]);
         const resItems = rRes.data.data?.items || rRes.data.data || [];
         setReservations(Array.isArray(resItems) ? resItems : []);
         setTables(tRes.data.data || []);
      } catch (error) {
         console.error('Failed to fetch reservations or tables:', error);
      }
   };

   useEffect(() => { fetchData(); }, []);
   useWebSocket<any>('/topic/reservations', () => fetchData());

   const handleCreate = async () => {
      try {
         await api.post('/reservations', formData);
         toast.success('Reservation created');
         setIsModalOpen(false);
         fetchData();
      } catch { toast.error('Failed to create'); }
   };

   const updateStatus = async (id: string, status: string) => {
      try {
         if (status === 'CHECKED_IN') {
            await api.post(`/reservations/${id}/check-in`);
         } else if (status === 'CANCELLED') {
            await api.post(`/reservations/${id}/cancel`);
         } else {
            await api.patch(`/reservations/${id}/status?status=${status}`);
         }
         toast.success(`Updated to ${status}`);
         fetchData();
      } catch { toast.error('Failed to update'); }
   };

   // Filter and sort reservations
   const todayStr = new Date().toISOString().split('T')[0];

   const filtered = reservations
      .filter(r => {
         // Date filter
         if (filterDate && !r.reservationTime.startsWith(filterDate)) return false;

         // Status filter
         if (filterStatus && r.status !== filterStatus) return false;

         // Search filter (name, phone)
         if (search) {
            const searchLower = search.toLowerCase();
            return r.customerName.toLowerCase().includes(searchLower) ||
               r.phone.includes(search);
         }

         return true;
      })
      .sort((a, b) => new Date(a.reservationTime).getTime() - new Date(b.reservationTime).getTime());

   const todayRes = reservations.filter(r => r.reservationTime.startsWith(todayStr));
   const pendingCount = todayRes.filter(r => r.status === 'PENDING').length;
   const checkedInCount = todayRes.filter(r => r.status === 'CHECKED_IN').length;

   return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
         <div className="page-header">
            <div>
               <h1 style={{ color: 'var(--orange-600)' }}><Calendar size={28} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} /> Guest Reservations</h1>
               <p>Manage bookings, walk-ins, and seating assignments</p>
            </div>
            <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
               <Button variant="secondary" onClick={() => window.location.href = '/tables'}><MapPin size={16} /> View Floor Plan</Button>
               <Button variant="primary" onClick={() => setIsModalOpen(true)}><Calendar size={16} /> Add Walk-in / Booking</Button>
            </div>
         </div>

         <div className="stats-grid" style={{ marginBottom: 'var(--sp-6)' }}>
            <Card variant="elevated">
               <Card.Content style={{ padding: 'var(--sp-5)' }}>
                  <div className="stat-card">
                     <div className="stat-card-value">{todayRes.length}</div>
                     <div className="stat-card-label">Total Today</div>
                  </div>
               </Card.Content>
            </Card>
            <Card variant="elevated">
               <Card.Content style={{ padding: 'var(--sp-5)' }}>
                  <div className="stat-card">
                     <div className="stat-card-value" style={{ color: 'var(--orange-500)' }}>{pendingCount}</div>
                     <div className="stat-card-label">Pending Arrival</div>
                  </div>
               </Card.Content>
            </Card>
            <Card variant="elevated">
               <Card.Content style={{ padding: 'var(--sp-5)' }}>
                  <div className="stat-card">
                     <div className="stat-card-value" style={{ color: 'var(--teal)' }}>{checkedInCount}</div>
                     <div className="stat-card-label">Seated Currently</div>
                  </div>
               </Card.Content>
            </Card>
         </div>

         <Card variant="elevated">
            <Card.Header>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: 'var(--sp-3)' }}>
                  <Card.Title>All Reservations</Card.Title>
                  <div style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'center' }}>
                     <Input
                        type="date"
                        value={filterDate}
                        onChange={e => setFilterDate(e.target.value)}
                        style={{ width: 160 }}
                     />
                     <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        style={{ padding: '8px 12px', border: '1px solid var(--border-main)', borderRadius: 'var(--r-sm)', fontSize: '14px' }}
                     >
                        <option value="">All Status</option>
                        <option value="PENDING">PENDING</option>
                        <option value="RESERVED">RESERVED</option>
                        <option value="CHECKED_IN">CHECKED_IN</option>
                        <option value="CANCELLED">CANCELLED</option>
                        <option value="COMPLETED">COMPLETED</option>
                     </select>
                     <Input
                        placeholder="Search name, phone..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        icon={<Search size={16} />}
                        style={{ width: 220, paddingLeft: '36px' }}
                     />
                  </div>
               </div>
            </Card.Header>
            <Card.Content style={{ padding: 0 }}>
               <table className="data-table">
                  <thead>
                     <tr>
                        <th>Guest Name</th><th>Phone</th><th>Date & Time</th><th>Party Size</th><th>Table</th><th>Status</th><th>Actions</th>
                     </tr>
                  </thead>
                  <tbody>
                     {filtered.map(res => {
                        const date = new Date(res.reservationTime);
                        return (
                           <tr key={res.id}>
                              <td style={{ fontWeight: 600 }}>{res.customerName}</td>
                              <td style={{ color: 'var(--text-muted)' }}>{res.phone}</td>
                              <td>
                                 <div style={{ fontWeight: 600 }}>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                 <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{date.toLocaleDateString()}</div>
                              </td>
                              <td>{res.numberOfGuests} guests</td>
                              <td>{res.tableName || '—'}</td>
                              <td>
                                 <Badge variant={res.status === 'PENDING' ? 'warning' : res.status === 'CHECKED_IN' ? 'success' : res.status === 'CANCELLED' ? 'error' : 'neutral'}>{res.status}</Badge>
                              </td>
                              <td>
                                 <div style={{ display: 'flex', gap: 6 }}>
                                    {res.status === 'PENDING' && (
                                       <>
                                          <Button variant="primary" size="small" onClick={() => updateStatus(res.id, 'CHECKED_IN')}><CheckCircle size={14} /> Check In</Button>
                                          <Button variant="danger" size="small" onClick={() => updateStatus(res.id, 'CANCELLED')}><XCircle size={14} /> Cancel</Button>
                                       </>
                                    )}
                                    {res.status === 'RESERVED' && (
                                       <>
                                          <Button variant="primary" size="small" onClick={() => updateStatus(res.id, 'CHECKED_IN')}><CheckCircle size={14} /> Check In</Button>
                                          <Button variant="danger" size="small" onClick={() => updateStatus(res.id, 'CANCELLED')}><XCircle size={14} /> Cancel</Button>
                                       </>
                                    )}
                                    {res.status === 'CHECKED_IN' && (
                                       <Button variant="primary" size="small" onClick={() => updateStatus(res.id, 'COMPLETED')}>Complete</Button>
                                    )}
                                 </div>
                              </td>
                           </tr>
                        )
                     })}
                  </tbody>
               </table>
            </Card.Content>
         </Card>

         <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Reservation">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
               <Input label="Customer Name" value={formData.customerName} onChange={e => setFormData({ ...formData, customerName: e.target.value })} />
               <Input label="Phone Number" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
               <Input type="datetime-local" label="Reservation Time" value={formData.reservationTime} onChange={e => setFormData({ ...formData, reservationTime: e.target.value })} />
               <Input type="number" label="Number of Guests" value={formData.numberOfGuests} onChange={e => setFormData({ ...formData, numberOfGuests: parseInt(e.target.value, 10) || 1 })} />

               <div>
                  <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, display: 'block' }}>Assign Table (Optional)</label>
                  <select
                     value={formData.tableId}
                     onChange={e => setFormData({ ...formData, tableId: e.target.value })}
                     style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-main)', borderRadius: 'var(--r-sm)' }}
                  >
                     <option value="">No table assigned yet</option>
                     {tables.map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.capacity} seats) - {t.status}</option>
                     ))}
                  </select>
               </div>

               <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--sp-3)', marginTop: 'var(--sp-4)' }}>
                  <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  <Button variant="primary" onClick={handleCreate}>Save Booking</Button>
               </div>
            </div>
         </Modal>
      </motion.div>
   );
};
