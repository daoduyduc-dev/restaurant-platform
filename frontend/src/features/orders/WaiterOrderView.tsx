import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import type { OrderDTO, MenuItemDTO } from '../../services/types';
import { ClipboardList, Bell, CheckCircle, Clock, ChevronRight, Zap, Timer } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useWebSocket } from '../../services/useWebSocket';
import { Button, Card, Badge, Modal, Input } from '../../components/ui';
import { toast } from '../../store/toastStore';
import { translateStatus } from '../../utils/translations';

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } }
};
const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const STATUS_COLS = [
  { key: 'OPEN',    label: 'Mới',       color: '#3B82F6', bg: 'rgba(59,130,246,0.08)' },
  { key: 'COOKING', label: 'Đang nấu',   color: '#D97706', bg: 'rgba(217,119,6,0.08)' },
  { key: 'SERVED',  label: 'Đã phục vụ',    color: '#6B7280', bg: 'rgba(107,114,128,0.08)' },
];

function timeSince(dateStr: string) {
  const d = new Date(dateStr);
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return 'vừa xong';
  if (mins < 60) return `${mins} phút`;
  return `${Math.floor(mins / 60)} giờ ${mins % 60} phút`;
}

export const WaiterOrderView = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderDTO | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItemDTO[]>([]);
  const [addMenuId, setAddMenuId] = useState('');
  const [addQty, setAddQty] = useState(1);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      const items = res.data.data?.items || res.data.data || [];
      setOrders(Array.isArray(items) ? items : []);
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  useWebSocket<OrderDTO>(['/topic/orders', '/topic/orders/role/WAITER'], (newOrder) => {
    fetchOrders();
    if (selectedOrder?.id === newOrder?.id) {
       setSelectedOrder(newOrder); // Update modal if open
    }
  });

  const fetchMenu = async () => {
     if (menuItems.length === 0) {
        try {
           const res = await api.get('/menu');
           setMenuItems(res.data.data?.items || res.data.data || []);
        } catch { }
     }
  };

  const handleOpenOrder = (order: OrderDTO) => {
     setSelectedOrder(order);
     fetchMenu();
  };

  const handleAddItem = async () => {
     if (!selectedOrder || !addMenuId || addQty < 1) return;
     try {
        await api.post(`/orders/${selectedOrder.id}/items`, {
           menuItemId: addMenuId,
           quantity: addQty
        });
        toast.success('Đã thêm món');
        setAddMenuId('');
        setAddQty(1);
        fetchOrders(); // The WS updates selectedOrder too, but we can refetch just in case
     } catch { toast.error('Không thể thêm món'); }
  };

  const handleRemoveItem = async (itemId: string) => {
     if (!selectedOrder) return;
     try {
        await api.delete(`/orders/${selectedOrder.id}/items/${itemId}`);
        toast.success('Đã xóa món');
        fetchOrders();
     } catch { toast.error('Không thể xóa món'); }
  };

  const handleMarkServed = async (id: string) => {
    try {
      await api.patch(`/orders/${id}/status?status=SERVED`);
      toast.success('Đã đánh dấu phục vụ');
      fetchOrders();
    } catch { toast.error('Không thể cập nhật'); }
  };

  const handleMoveToCooking = async (id: string) => {
    try {
      await api.patch(`/orders/${id}/status?status=COOKING`);
      toast.success('Đã chuyển sang nấu');
      fetchOrders();
    } catch { toast.error('Không thể cập nhật'); }
  };

  const grouped = STATUS_COLS.map(col => ({
    ...col,
    orders: orders.filter(o => o.status === col.key),
  }));

  const cookingCount = grouped.find(g => g.key === 'COOKING')?.orders.length || 0;

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--sp-16)' }}><div className="spinner" /></div>;

  return (
    <motion.div variants={container} initial="hidden" animate="show" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <motion.div variants={item} className="page-header">
        <div>
          <h1 style={{ color: 'var(--orange-600)' }}>
            <Zap size={28} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
            Order của tôi
          </h1>
          <p>Quản lý order phục vụ bàn</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--sp-2)', alignItems: 'center' }}>
          {cookingCount > 0 && (
            <Badge variant="warning" size="medium">
              <Clock size={14} /> {cookingCount} Đang nấu
            </Badge>
          )}
          <Button variant="primary" size="medium" onClick={() => navigate('/tables')}>
            <ClipboardList size={16} /> Order mới
          </Button>
        </div>
      </motion.div>

      <motion.div variants={item} style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${STATUS_COLS.length}, 1fr)`,
        gap: 'var(--sp-4)',
        flex: 1,
        minHeight: 0,
      }}>
        {grouped.map(col => (
          <div key={col.key} style={{
            background: col.bg,
            borderRadius: 'var(--r-xl)',
            border: `1px solid ${col.color}20`,
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}>
            <div style={{
              padding: 'var(--sp-4) var(--sp-5)',
              borderBottom: `2px solid ${col.color}30`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'var(--bg-card)',
            }}>
              <div style={{ fontWeight: 700, color: col.color, fontSize: 'var(--text-sm)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {col.label}
              </div>
              <Badge variant="neutral" size="small">{col.orders.length}</Badge>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--sp-3)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
              {col.orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--sp-6)', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                  Không có order
                </div>
              ) : col.orders.map(order => (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--r-lg)',
                    padding: 'var(--sp-4)',
                    border: '1px solid var(--border-main)',
                    boxShadow: 'var(--shadow-xs)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => handleOpenOrder(order)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--sp-2)' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: 'var(--text-base)' }}>
                      {order.tableName}
                    </span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Timer size={12} /> {timeSince(order.createdAt || order.createdDate)}
                    </span>
                  </div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--sp-2)' }}>
                    {order.items?.length || 0} món · ${(order.totalAmount || 0).toFixed(2)}
                  </div>
                  {col.key === 'OPEN' && (
                    <Button variant="primary" size="small" style={{ width: '100%', marginTop: 'var(--sp-2)' }} onClick={(e) => { e.stopPropagation(); handleMoveToCooking(order.id); }}>
                      <ChevronRight size={14} /> Bắt đầu nấu
                    </Button>
                  )}
                  {col.key === 'COOKING' && (
                    <Button variant="primary" size="small" style={{ width: '100%', marginTop: 'var(--sp-2)' }} onClick={(e) => { e.stopPropagation(); handleMarkServed(order.id); }}>
                      <CheckCircle size={14} /> Đánh dấu đã phục vụ
                    </Button>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </motion.div>

      <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={selectedOrder ? `Chi tiết Order - ${selectedOrder.tableName}` : ''}>
        {selectedOrder && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                   <Badge variant="neutral">{translateStatus(selectedOrder.status)}</Badge>
                   <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 8 }}>
                      Tổng: ${(selectedOrder.totalAmount || 0).toFixed(2)}
                   </span>
                </div>
             </div>

             <div style={{ maxHeight: 300, overflowY: 'auto', border: '1px solid var(--border-main)', borderRadius: 'var(--r-md)', padding: 'var(--sp-2)' }}>
                {selectedOrder.items?.map(item => (
                   <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--sp-2)', borderBottom: '1px solid var(--gray-100)' }}>
                      <div>
                         <div style={{ fontWeight: 600 }}>{item.quantity}x {item.menuItemName}</div>
                         <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>${(item.price || 0).toFixed(2)} mỗi món</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                         <div style={{ fontWeight: 600 }}>${(item.total || 0).toFixed(2)}</div>
                         {['OPEN', 'PENDING'].includes(selectedOrder.status) && (
                           <Button variant="ghost" size="small" style={{ color: 'var(--rose)', padding: '4px 8px' }} onClick={() => handleRemoveItem(item.id)}>Xóa</Button>
                         )}
                      </div>
                   </div>
                ))}
                {(!selectedOrder.items || selectedOrder.items.length === 0) && (
                   <div style={{ padding: 'var(--sp-4)', textAlign: 'center', color: 'var(--text-muted)' }}>Chưa có món nào.</div>
                )}
             </div>

             {['OPEN', 'PENDING'].includes(selectedOrder.status) && (
                <div style={{ display: 'flex', gap: 'var(--sp-2)', alignItems: 'flex-end', background: 'var(--gray-50)', padding: 'var(--sp-3)', borderRadius: 'var(--r-md)' }}>
                   <div style={{ flex: 1 }}>
                     <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Thêm món</label>
                     <select
                       value={addMenuId}
                       onChange={e => setAddMenuId(e.target.value)}
                       style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-main)', borderRadius: 'var(--r-sm)' }}
                     >
                        <option value="">-- Chọn món --</option>
                        {menuItems.map(m => (
                           <option key={m.id} value={m.id}>{m.name} - ${(m.price||0).toFixed(2)}</option>
                        ))}
                     </select>
                   </div>
                   <div style={{ width: 80 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Số lượng</label>
                      <Input type="number" min={1} value={addQty} onChange={e => setAddQty(parseInt(e.target.value, 10)||1)} />
                   </div>
                   <Button variant="primary" onClick={handleAddItem} disabled={!addMenuId}>Thêm</Button>
                </div>
             )}

             <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--sp-2)' }}>
                <Button variant="ghost" onClick={() => setSelectedOrder(null)}>Đóng</Button>
             </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};
