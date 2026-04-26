import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import type { TableDTO, OrderDTO } from '../../services/types';
import { FloorPlan } from './FloorPlan';
import { useWebSocket } from '../../services/useWebSocket';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Badge, Button, Modal, Input } from '../../components/ui';
import { toast } from '../../store/toastStore';
import { BarChart3, AlertTriangle, Clock, MapPin, Search } from 'lucide-react';

function getMinutes(dateStr: string) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
}

export const ManagerTableView = () => {
  const navigate = useNavigate();
  const [tables, setTables] = useState<TableDTO[]>([]);
  const [activeOrders, setActiveOrders] = useState<Record<string, OrderDTO>>({});
  const [selectedTable, setSelectedTable] = useState<TableDTO | null>(null);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Partial<TableDTO> | null>(null);

  const fetchData = async () => {
    try {
      const [tRes, oRes] = await Promise.all([
        api.get('/tables'),
        api.get('/orders')
      ]);
      setTables(tRes.data.data || []);
      const orders: OrderDTO[] = oRes.data.data?.items || oRes.data.data || [];
      const activeMap = orders
        .filter(o => !['PAID', 'CANCELED'].includes(o.status))
        .reduce((acc, o) => {
          if (o.tableId) acc[o.tableId] = o;
          return acc;
        }, {} as Record<string, OrderDTO>);
      setActiveOrders(activeMap);
    } catch { console.error('Failed'); }
  };

  useEffect(() => { fetchData(); }, []);
  useWebSocket<any>(['/topic/tables', '/topic/orders'], () => fetchData());

  const handleTableClick = (table: TableDTO) => setSelectedTable(table);

  const handleSaveTable = async () => {
    try {
      if (editingTable?.id) {
        await api.put(`/tables/${editingTable.id}`, editingTable);
      } else {
        await api.post('/tables', editingTable);
      }
      setIsTableModalOpen(false);
      fetchData();
      toast.success('Table saved successfully');
    } catch {
      toast.error('Failed to save table');
    }
  };

  const handleDeleteTable = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this table?')) return;
    try {
      await api.delete(`/tables/${id}`);
      setSelectedTable(null);
      fetchData();
      toast.success('Table deleted');
    } catch {
      toast.error('Failed to delete table');
    }
  };

  const totalSeats = tables.reduce((sum, t) => sum + t.capacity, 0);
  const occupiedSeats = tables.filter(t => t.status === 'OCCUPIED').reduce((sum, t) => sum + t.capacity, 0);
  const occupancyRate = totalSeats > 0 ? Math.round((occupiedSeats / totalSeats) * 100) : 0;

  // Determine tables sitting too long (alert > 90 mins since order start, or dirty > 15 mins)
  // For dirty we don't have a timestamp, but we can highlight them generically for the manager.
  const bottleneckTables = tables.filter(t => {
     if (t.status === 'DIRTY') return true;
     const o = activeOrders[t.id];
     if (o && getMinutes(o.createdAt || o.createdDate) > 90) return true;
     return false;
  });

  return (
    <div style={{ display: 'flex', height: '100%', gap: 'var(--sp-6)' }}>
      {/* Floor Plan */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-4)' }}>
          <div>
            <h1 style={{ color: 'var(--orange-600)', margin: 0 }}>Operations Map</h1>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>Monitor floor utilization and address bottlenecks.</p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--sp-2)', alignItems: 'center' }}>
             <Badge variant={occupancyRate > 80 ? 'warning' : 'success'}>
                {occupancyRate}% Occupancy ({occupiedSeats}/{totalSeats} seats)
             </Badge>
             <Button variant="primary" size="small" onClick={() => { setEditingTable({ name: '', capacity: 2, status: 'AVAILABLE' }); setIsTableModalOpen(true); }}>
                Add Table
             </Button>
          </div>
        </div>
        
        <Card variant="elevated" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', border: bottleneckTables.length > 0 ? '2px solid rgba(225,29,72,0.3)' : undefined }}>
          <FloorPlan
            tables={tables}
            selectedId={selectedTable?.id}
            onTableClick={handleTableClick}
            highlightStatuses={['DIRTY']}
            renderExtra={(table) => {
               const isBottleneck = bottleneckTables.some(t => t.id === table.id);
               if (!isBottleneck) return null;
               
               return (
                  <div style={{
                    position: 'absolute', top: -10, left: -10,
                    color: 'var(--rose)', background: '#fff', borderRadius: '50%', padding: 2,
                    boxShadow: 'var(--shadow-sm)', animation: 'pulse 1.5s infinite'
                  }}>
                    <AlertTriangle size={20} fill="currentColor" color="#fff" />
                  </div>
               );
            }}
          />
        </Card>
      </div>

      {/* Side Panel */}
      <AnimatePresence>
        <motion.div
           initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}
           style={{ width: 360, display: 'flex', flexDirection: 'column' }}
        >
          {selectedTable ? (
            <Card variant="elevated" style={{ height: '100%', display: 'flex', flexDirection: 'column', borderTop: '4px solid var(--orange-500)' }}>
               <Card.Header style={{ paddingBottom: 'var(--sp-4)', borderBottom: '1px solid var(--border-main)' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                   <div>
                     <Card.Title>Table {selectedTable.name}</Card.Title>
                     <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                       <Badge variant={selectedTable.status === 'AVAILABLE' ? 'success' : 'neutral'}>{selectedTable.status}</Badge>
                       <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{selectedTable.capacity} seats</span>
                     </div>
                   </div>
                   <div style={{ display: 'flex', gap: 4 }}>
                     <Button variant="ghost" size="small" onClick={() => { setEditingTable(selectedTable); setIsTableModalOpen(true); }}>Edit</Button>
                     <Button variant="ghost" size="small" style={{ color: 'var(--red-500)' }} onClick={() => handleDeleteTable(selectedTable.id)}>Delete</Button>
                     <button onClick={() => setSelectedTable(null)} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize: 24, marginLeft: 8 }}>×</button>
                   </div>
                 </div>
              </Card.Header>

              <Card.Content style={{ flex: 1, overflowY: 'auto', paddingTop: 'var(--sp-5)' }}>
                 {(() => {
                    const ord = activeOrders[selectedTable.id];
                    if (selectedTable.status === 'DIRTY') {
                       return (
                          <div style={{ padding: 'var(--sp-4)', background: 'var(--rose-bg)', borderRadius: 'var(--r-md)', border: '1px solid rgba(225,29,72,0.2)' }}>
                             <h4 style={{ color: 'var(--rose)', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 6 }}><AlertTriangle size={16}/> Cleaning Overdue</h4>
                             <p style={{ margin: 0, fontSize: 13, color: 'var(--text-heading)' }}>Table has been marked DIRTY but not cleared. Dispatch staff.</p>
                          </div>
                       );
                    }
                    if (ord) {
                       const mins = getMinutes(ord.createdAt || ord.createdDate);
                       return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
                             <div style={{ padding: 'var(--sp-4)', background: mins > 90 ? 'var(--rose-bg)' : 'var(--gray-50)', borderRadius: 'var(--r-md)', border: '1px solid var(--border-main)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                                   <Badge variant={ord.status === 'READY' ? 'success' : 'warning'}>{ord.status}</Badge>
                                   <span style={{ fontWeight: 600, color: mins > 90 ? 'var(--rose)' : 'var(--text-muted)' }}>
                                      <Clock size={14} style={{ display: 'inline', verticalAlign: '-2px' }}/> {mins}m seated
                                   </span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                                   <div>
                                      <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Items</div>
                                      <div style={{ fontWeight: 600 }}>{ord.items?.length || 0}</div>
                                   </div>
                                   <div>
                                      <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total</div>
                                      <div style={{ fontWeight: 600 }}>${(ord.totalAmount||0).toFixed(2)}</div>
                                   </div>
                                </div>
                                {mins > 90 && (
                                   <div style={{ fontSize: 12, color: 'var(--rose)', fontWeight: 600, marginTop: 8 }}>
                                      ! Guest seated &gt; 90 mins. May affect upcoming reservations.
                                   </div>
                                )}
                             </div>
                             
                             <div style={{ display: 'flex', gap: 8 }}>
                                <Button variant="secondary" style={{ flex: 1 }} onClick={() => navigate('/orders')}>View Order</Button>
                                <Button variant="secondary" style={{ flex: 1 }} onClick={() => navigate('/orders')}>View Order</Button>
                             </div>
                          </div>
                       );
                    }
                    return (
                       <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--sp-8)' }}>
                          No active operations on this table.
                       </div>
                    );
                 })()}
              </Card.Content>
            </Card>
          ) : (
            <Card variant="elevated" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
               <Card.Header>
                  <Card.Title style={{ display: 'flex', alignItems: 'center', gap: 8 }}><BarChart3 size={18} color="var(--orange-500)"/> Floor Overview</Card.Title>
               </Card.Header>
               <Card.Content style={{ flex: 1, overflowY: 'auto' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
                     {bottleneckTables.length > 0 ? (
                        <div style={{ border: '1px solid var(--rose)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
                           <div style={{ background: 'var(--rose)', color: '#fff', padding: '8px 12px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                              <AlertTriangle size={14}/> Bottleneck Alerts
                           </div>
                           <div style={{ padding: '12px' }}>
                              {bottleneckTables.map(t => (
                                 <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, paddingBottom: 8, borderBottom: '1px dashed var(--gray-200)' }}>
                                    <span style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{t.name}</span>
                                    <span style={{ fontSize: 13, color: 'var(--rose)' }}>{t.status === 'DIRTY' ? 'Needs cleaning' : 'Seated > 90m'}</span>
                                 </div>
                              ))}
                           </div>
                        </div>
                     ) : (
                        <div style={{ padding: 'var(--sp-4)', background: 'var(--teal-bg)', color: 'var(--teal)', borderRadius: 'var(--r-md)', textAlign: 'center', fontSize: 14, fontWeight: 600 }}>
                           All operations running smoothly.
                        </div>
                     )}

                     <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--r-md)', padding: 'var(--sp-4)', marginTop: 16 }}>
                        <h4 style={{ margin: '0 0 16px 0', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Status Breakdown</h4>
                        {Object.entries(tables.reduce((acc, t) => { acc[t.status] = (acc[t.status]||0)+1; return acc; }, {} as Record<string, number>)).map(([status, count]) => (
                           <div key={status} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                              <span style={{ fontSize: 14, color: 'var(--text-heading)' }}>{status}</span>
                              <span style={{ fontWeight: 600 }}>{count}</span>
                           </div>
                        ))}
                     </div>
                  </div>
               </Card.Content>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      <Modal isOpen={isTableModalOpen} onClose={() => setIsTableModalOpen(false)} title={editingTable?.id ? 'Edit Table' : 'New Table'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          <Input 
            label="Table Name / Number" 
            value={editingTable?.name || ''} 
            onChange={(e) => setEditingTable({ ...editingTable, name: e.target.value })} 
          />
          <Input 
            type="number" 
            label="Capacity (Seats)" 
            value={editingTable?.capacity || ''} 
            onChange={(e) => setEditingTable({ ...editingTable, capacity: parseInt(e.target.value) || 2 })} 
          />
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--sp-3)', marginTop: 'var(--sp-4)' }}>
            <Button variant="ghost" onClick={() => setIsTableModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveTable}>Save Table</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
