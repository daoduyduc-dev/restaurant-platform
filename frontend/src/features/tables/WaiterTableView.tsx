import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import type { TableDTO, OrderDTO } from '../../services/types';
import { FloorPlan } from './FloorPlan';
import { useWebSocket } from '../../services/useWebSocket';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge, Button, Card } from '../../components/ui';
import { PlusCircle, CheckCircle, CreditCard } from 'lucide-react';

export const WaiterTableView = () => {
  const navigate = useNavigate();
  const [tables, setTables] = useState<TableDTO[]>([]);
  const [activeOrders, setActiveOrders] = useState<Record<string, OrderDTO>>({});
  const [selectedTable, setSelectedTable] = useState<TableDTO | null>(null);

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

  return (
    <div style={{ display: 'flex', height: '100%', gap: 'var(--sp-6)' }}>
      {/* Floor Plan */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-4)' }}>
          <div>
            <h1 style={{ color: 'var(--orange-600)', margin: 0 }}>Table Map</h1>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>Select a table to manage orders</p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
             <Badge variant="warning">{Object.values(activeOrders).filter(o=>o.status ==='COOKING').length} Cooking</Badge>
             <Badge variant="success">{Object.values(activeOrders).filter(o=>o.status ==='READY').length} Ready to Serve</Badge>
          </div>
        </div>
        
        <Card variant="elevated" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <FloorPlan
            tables={tables}
            selectedId={selectedTable?.id}
            onTableClick={handleTableClick}
            highlightStatuses={['DIRTY']}
            renderExtra={(table) => {
               const ord = activeOrders[table.id];
               if (!ord) return null;
               
               let col = 'var(--blue)';
               let icon = '📝';
               if(ord.status === 'READY') { col = 'var(--teal)'; icon = '✅'; }
               if(ord.status === 'COOKING') { col = 'var(--amber)'; icon = '🔥'; }
               
               return (
                  <div style={{
                    position: 'absolute', top: -10, right: -10,
                    background: '#fff', padding: '2px 8px', borderRadius: '12px',
                    boxShadow: 'var(--shadow-sm)', fontSize: 12, fontWeight: 700,
                    color: col, display: 'flex', gap: 4, alignItems: 'center',
                    border: `1px solid ${col}40`, animation: ord.status === 'READY' ? 'pulse 2s infinite' : 'none'
                  }}>
                    <span>{icon}</span> {ord.status}
                  </div>
               );
            }}
          />
        </Card>
      </div>

      {/* Right Drawer Panel */}
      <AnimatePresence>
        {selectedTable && (
          <motion.div
            initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}
            style={{ width: 360, display: 'flex', flexDirection: 'column' }}
          >
            <Card variant="elevated" style={{ height: '100%', display: 'flex', flexDirection: 'column', borderTop: '4px solid var(--orange-500)' }}>
              <Card.Header style={{ paddingBottom: 'var(--sp-4)', borderBottom: '1px solid var(--border-main)' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                   <div>
                     <Card.Title style={{ fontSize: 'var(--text-2xl)' }}>{selectedTable.name}</Card.Title>
                     <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                       <Badge variant={selectedTable.status === 'AVAILABLE' ? 'success' : 'neutral'}>{selectedTable.status}</Badge>
                       <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{selectedTable.capacity} seats</span>
                     </div>
                   </div>
                   <button onClick={() => setSelectedTable(null)} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize: 24 }}>×</button>
                 </div>
              </Card.Header>

              <Card.Content style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)', paddingTop: 'var(--sp-5)' }}>
                {(() => {
                  const ord = activeOrders[selectedTable.id];

                  if (selectedTable.status === 'DIRTY') {
                    return (
                       <div style={{ textAlign: 'center', padding: 'var(--sp-8)' }}>
                          <div style={{ fontSize: 40, marginBottom: 16 }}>🧹</div>
                          <h3 style={{ marginBottom: 8 }}>Table needs cleaning</h3>
                          <Button variant="outline" style={{ width: '100%' }}>Mark as Clean (Available)</Button>
                       </div>
                    );
                  }

                  if (!ord) {
                    return (
                       <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', marginTop: 'var(--sp-4)' }}>
                         <Button variant="primary" size="large" style={{ justifyContent: 'center', padding: '16px' }} onClick={() => navigate('/menu')}>
                           <PlusCircle /> New Order
                         </Button>
                         {selectedTable.status !== 'OCCUPIED' && (
                             <Button variant="secondary" size="large" style={{ justifyContent: 'center' }}>Mark as Occupied</Button>
                         )}
                       </div>
                    );
                  }

                  // Has active order
                  return (
                    <>
                      <div style={{ background: 'var(--gray-50)', padding: 'var(--sp-4)', borderRadius: 'var(--r-md)', border: '1px solid var(--border-main)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                           <span style={{ fontWeight: 600 }}>Active Order</span>
                           <Badge variant="info">{ord.status}</Badge>
                        </div>
                        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>
                          {ord.items?.length || 0} items | ${(ord.totalAmount||0).toFixed(2)}
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                           {ord.status === 'READY' && (
                              <Button variant="primary" style={{ background: 'var(--teal)', borderColor: 'var(--teal)' }}><CheckCircle size={16}/> Mark Served</Button>
                           )}
                           <Button variant="secondary" onClick={() => navigate('/menu')}><PlusCircle size={16}/> Add Items</Button>
                           <Button variant="outline" onClick={() => navigate('/payment')}><CreditCard size={16}/> View Bill & Pay</Button>
                        </div>
                      </div>
                      
                      <div style={{ flex: 1, overflowY: 'auto' }}>
                         <h4 style={{ fontSize: 13, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>Items</h4>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {ord.items?.map(itm => (
                               <div key={itm.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '8px 0', borderBottom: '1px dashed var(--gray-200)' }}>
                                  <span>{itm.quantity}x {itm.menuItemName}</span>
                                  <span style={{ fontWeight: 600 }}>${itm.subtotal?.toFixed(2)}</span>
                               </div>
                            ))}
                         </div>
                      </div>
                    </>
                  );
                })()}
              </Card.Content>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
