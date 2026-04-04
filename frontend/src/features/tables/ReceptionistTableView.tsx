import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import type { TableDTO, ReservationDTO } from '../../services/types';
import { FloorPlan } from './FloorPlan';
import { useWebSocket } from '../../services/useWebSocket';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Badge, Button } from '../../components/ui';
import { Calendar, Users, Phone, ArrowRightLeft, UserCheck } from 'lucide-react';
import { toast } from '../../store/toastStore';

export const ReceptionistTableView = () => {
  const navigate = useNavigate();
  const [tables, setTables] = useState<TableDTO[]>([]);
  const [reservations, setReservations] = useState<ReservationDTO[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableDTO | null>(null);

  const fetchData = async () => {
    try {
      const [tRes, rRes] = await Promise.all([
        api.get('/tables'),
        api.get('/reservations')
      ]);
      setTables(tRes.data.data || []);
      const allRes: ReservationDTO[] = rRes.data.data?.items || rRes.data.data || [];
      // Only care about today's reservations
      setReservations(allRes.filter(r => ['PENDING', 'RESERVED'].includes(r.status)));
    } catch { console.error('Failed'); }
  };

  useEffect(() => { fetchData(); }, []);
  useWebSocket<any>(['/topic/tables', '/topic/reservations'], () => fetchData());

  const handleTableClick = (table: TableDTO) => setSelectedTable(table);

  const handleCheckIn = async (resId: string) => {
    if (!selectedTable) return;
    try {
      await api.post(`/reservations/${resId}/check-in`, { tableId: selectedTable.id });
      toast.success('Guest checked in & table assigned');
      fetchData();
      setSelectedTable(null);
    } catch { toast.error('Failed to check in'); }
  };

  return (
    <div style={{ display: 'flex', height: '100%', gap: 'var(--sp-6)' }}>
      {/* Floor Plan */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: 'var(--sp-4)' }}>
          <h1 style={{ color: 'var(--orange-600)', margin: 0 }}>Front Desk Map</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>Manage seating and walk-ins. Select an available table to seat pending guests.</p>
        </div>
        
        <Card variant="elevated" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <FloorPlan
            tables={tables}
            selectedId={selectedTable?.id}
            onTableClick={handleTableClick}
          />
        </Card>
      </div>

      {/* Receptionist Drawer Panel */}
      <AnimatePresence>
        {selectedTable && (
          <motion.div
            initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}
            style={{ width: 400, display: 'flex', flexDirection: 'column' }}
          >
            <Card variant="elevated" style={{ height: '100%', display: 'flex', flexDirection: 'column', borderTop: '4px solid var(--teal)' }}>
              <Card.Header style={{ paddingBottom: 'var(--sp-4)', borderBottom: '1px solid var(--border-main)' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                   <div>
                     <Card.Title>Table {selectedTable.name}</Card.Title>
                     <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                       <Badge variant={selectedTable.status === 'AVAILABLE' ? 'success' : selectedTable.status === 'RESERVED' ? 'warning' : 'neutral'}>{selectedTable.status}</Badge>
                       <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{selectedTable.capacity} seats</span>
                     </div>
                   </div>
                   <button onClick={() => setSelectedTable(null)} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize: 24 }}>×</button>
                 </div>
              </Card.Header>

              <Card.Content style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)', paddingTop: 'var(--sp-5)' }}>
                {selectedTable.status === 'AVAILABLE' ? (
                  <>
                    <h3 style={{ fontSize: 16, marginBottom: 8, color: 'var(--text-heading)' }}>Pending Guests</h3>
                    {reservations.length === 0 ? (
                       <div style={{ textAlign: 'center', padding: 'var(--sp-8)', color: 'var(--text-muted)', background: 'var(--gray-50)', borderRadius: 'var(--r-md)' }}>
                          No pending guests to seat
                       </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', overflowY: 'auto' }}>
                        {reservations.filter(r => r.numberOfGuests <= selectedTable.capacity).length === 0 && (
                          <div style={{ fontSize: 13, color: 'var(--orange-600)', padding: 8, background: 'var(--orange-50)', borderRadius: 4 }}>
                            Warning: Pending parties are larger than this table's capacity
                          </div>
                        )}
                        {reservations.map(res => {
                          const fits = res.numberOfGuests <= selectedTable.capacity;
                          return (
                            <div key={res.id} style={{ 
                              padding: 'var(--sp-3) var(--sp-4)', 
                              border: '1px solid var(--border-main)', 
                              borderRadius: 'var(--r-md)',
                              opacity: fits ? 1 : 0.5,
                            }}>
                               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                 <span style={{ fontWeight: 600 }}>{res.customerName}</span>
                                 <Badge variant="neutral" size="small"><Users size={12}/> {res.numberOfGuests}</Badge>
                               </div>
                               <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', gap: 12, marginBottom: 12 }}>
                                 <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={14}/> {new Date(res.reservationTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                 <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={14}/> {res.phone}</span>
                               </div>
                               <Button 
                                  variant="primary" 
                                  size="small" 
                                  style={{ width: '100%', background: 'var(--teal)', borderColor: 'var(--teal)' }}
                                  disabled={!fits}
                                  onClick={() => handleCheckIn(res.id)}
                               >
                                  <UserCheck size={16} /> Seat Here
                               </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    <div style={{ marginTop: 'auto', paddingTop: 'var(--sp-4)', borderTop: '1px solid var(--border-main)' }}>
                       <Button variant="outline" style={{ width: '100%' }} onClick={() => navigate('/reservations')}>
                         Create Walk-in Reservation
                       </Button>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: 'var(--sp-8)' }}>
                     <div style={{ fontSize: 40, marginBottom: 16 }}>{selectedTable.status === 'DIRTY' ? '🧹' : selectedTable.status === 'OCCUPIED' ? '🍽️' : '⏳'}</div>
                     <h3 style={{ marginBottom: 8 }}>Table is {selectedTable.status.toLowerCase()}</h3>
                     <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Only available tables can be assigned to new guests.</p>
                     
                     <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
                       {selectedTable.status === 'DIRTY' && (
                         <Button variant="primary" style={{ width: '100%' }}>Mark as Clean (Available)</Button>
                       )}
                       {['OCCUPIED', 'RESERVED'].includes(selectedTable.status) && (
                         <Button variant="outline" style={{ width: '100%' }}><ArrowRightLeft size={16}/> Transfer Table</Button>
                       )}
                     </div>
                  </div>
                )}
              </Card.Content>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
