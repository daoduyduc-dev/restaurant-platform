import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import type { MenuItemDTO, ReservationDTO } from '../../services/types';
import { AlertCircle, CheckCircle, MapPin, Search, Plus, ShoppingCart, Minus, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Input, Badge, Card } from '../../components/ui';
import { toast } from '../../store/toastStore';

interface CartItem extends MenuItemDTO {
  cartQuantity: number;
}

export const CustomerMenuOrderView = () => {
  const [searchParams] = useSearchParams();
  const qrTableId = searchParams.get('tableId');
  const qrTableName = searchParams.get('tableName') || 'QR table';
  const [items, setItems] = useState<MenuItemDTO[]>([]);
  const [reservations, setReservations] = useState<ReservationDTO[]>([]);
  const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [categories, setCategories] = useState<{id: string, name: string, icon?: string, color?: string}[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    api.get('/menu?page=0&size=50').then((res) => {
      const responseData = res.data.data;
      const data = (responseData && typeof responseData === 'object' && 'items' in responseData)
        ? responseData.items
        : responseData;
      if (Array.isArray(data)) setItems(data.filter(i => i.isAvailable ?? i.available));
    }).catch(() => {
      toast.error('Failed to fetch menu items');
    });

    api.get('/categories').then((res) => {
      if (res.data.data) setCategories(res.data.data);
    }).catch(() => {
      console.error('Failed to fetch categories');
    });

    api.get('/reservations/my?page=0&size=100').then((res) => {
      const data = res.data.data?.items || res.data.data || [];
      if (Array.isArray(data)) setReservations(data);
    }).catch(() => {
      setReservations([]);
    });
  }, []);

  const activeReservations = reservations.filter(r => ['RESERVED', 'CHECKED_IN'].includes(r.status));
  const selectedReservation = reservations.find(r => r.id === selectedReservationId) || null;
  const canOrder = Boolean(qrTableId || selectedReservation);
  const tableLabel = qrTableId ? qrTableName : selectedReservation?.tableName;

  useEffect(() => {
    if (!qrTableId && activeReservations.length === 1 && !selectedReservationId) {
      setSelectedReservationId(activeReservations[0].id);
    }
  }, [activeReservations, qrTableId, selectedReservationId]);

  const addToCart = (item: MenuItemDTO) => {
    if (!canOrder) {
      toast.error('bạn cần book bàn trước khi chọn món');
      return;
    }
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, cartQuantity: i.cartQuantity + 1 } : i);
      }
      return [...prev, { ...item, cartQuantity: 1 }];
    });
    toast.success(`${item.name} added to order`);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => {
      const updated = prev.map(i => {
        if (i.id === id) {
          const newQ = i.cartQuantity + delta;
          return { ...i, cartQuantity: newQ };
        }
        return i;
      }).filter(i => i.cartQuantity > 0);
      return updated;
    });
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0 || !canOrder) return;
    try {
      await api.post('/orders', {
        tableId: qrTableId || selectedReservation?.tableId,
        reservationId: selectedReservation?.id,
        items: cart.map(c => ({ menuItemId: c.id, quantity: c.cartQuantity }))
      });
      toast.success('Order sent to kitchen!');
      setCart([]);
      setIsDrawerOpen(false);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message;
      if (errorMessage) {
        toast.error(errorMessage);
      } else {
        toast.error('Failed to place order. Please try again.');
      }
      console.error('Order error:', error?.response?.data || error);
    }
  };

  const filtered = search
    ? items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
    : selectedCategory
    ? items.filter(i => i.categoryId === selectedCategory)
    : items;
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);

  return (
    <div style={{ display: 'flex', height: '100%', gap: 'var(--sp-6)' }}>
      {/* Menu Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="page-header" style={{ marginBottom: 'var(--sp-4)' }}>
           <div>
              <h1 style={{ color: 'var(--orange-600)' }}>Menu Collection</h1>
              <p>{canOrder ? `${tableLabel} - mời bạn chọn món` : 'bạn cần book bàn trước khi chọn món'}</p>
           </div>
           <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
              <Input
                 type="text" placeholder="Search menu..." value={search} onChange={(e) => {
                   setSearch(e.target.value);
                   setSelectedCategory(null);
                 }}
                 icon={<Search size={16} />} style={{ width: 240 }}
              />
              <Button onClick={() => setIsDrawerOpen(true)} variant={cart.length > 0 ? 'primary' : 'secondary'} disabled={!canOrder}>
                 <ShoppingCart size={16} /> Order ({cart.length})
              </Button>
           </div>
        </div>

        {!qrTableId && (
          <div style={{
            display: 'grid',
            gap: 'var(--sp-3)',
            marginBottom: 'var(--sp-5)',
          }}>
            {!canOrder && (
              <Card variant="elevated" style={{ borderLeft: '4px solid var(--amber)' }}>
                <Card.Content style={{ padding: 'var(--sp-4)', display: 'flex', gap: 12, alignItems: 'center', color: 'var(--text-heading)' }}>
                  <AlertCircle size={20} color="var(--amber)" />
                  <span style={{ fontWeight: 700 }}>bạn cần book bàn trước khi chọn món</span>
                </Card.Content>
              </Card>
            )}
            {reservations.length > 0 && activeReservations.length !== 1 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--sp-3)' }}>
                {reservations.map(res => {
                  const selectable = ['RESERVED', 'CHECKED_IN'].includes(res.status);
                  return (
                    <button
                      key={res.id}
                      onClick={() => selectable && setSelectedReservationId(res.id)}
                      disabled={!selectable}
                      style={{
                        textAlign: 'left',
                        padding: '14px 16px',
                        borderRadius: 'var(--r-md)',
                        border: selectedReservationId === res.id ? '2px solid var(--orange-500)' : '1px solid var(--border-main)',
                        background: 'var(--bg-card)',
                        opacity: selectable ? 1 : 0.42,
                        cursor: selectable ? 'pointer' : 'not-allowed',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                        <strong style={{ color: 'var(--text-heading)' }}>{res.tableName}</strong>
                        <Badge variant={selectable ? 'success' : 'neutral'} size="small">{res.status}</Badge>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 13 }}>
                        <MapPin size={14} /> {new Date(res.reservationTime).toLocaleString()}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            {canOrder && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--teal)', fontWeight: 700 }}>
                <CheckCircle size={18} /> Ordering for {tableLabel}
              </div>
            )}
          </div>
        )}

        {/* Category Filter */}
        {categories.length > 0 && (
          <div style={{
            display: 'flex',
            gap: 'var(--sp-2)',
            marginBottom: 'var(--sp-6)',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <Tag size={16} style={{ color: 'var(--text-muted)' }} />
            <Button
              variant={!selectedCategory ? 'primary' : 'outline'}
              size="small"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Button>
            {categories.map(cat => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? 'primary' : 'outline'}
                size="small"
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  borderColor: cat.color || undefined,
                  color: cat.color || undefined,
                }}
              >
                {cat.icon && <span style={{ marginRight: '4px' }}>{cat.icon}</span>}
                {cat.name}
              </Button>
            ))}
          </div>
        )}

        <div className="item-grid" style={{ overflowY: 'auto', paddingBottom: 'var(--sp-6)' }}>
           {filtered.map(item => (
              <motion.div key={item.id} whileHover={{ y: -4 }}>
                 <Card variant="elevated" style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ height: 200, overflow: 'hidden' }}>
                       <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <Card.Content style={{ flex: 1, padding: 'var(--sp-4)', display: 'flex', flexDirection: 'column' }}>
                       <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>{item.categoryName}</div>
                       <h3 style={{ margin: 0, marginBottom: 8, fontSize: 18 }}>{item.name}</h3>
                       <p style={{ color: 'var(--text-muted)', fontSize: 14, flex: 1 }}>{item.description}</p>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                          <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--orange-600)' }}>${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}</span>
                          <Button variant="outline" size="small" onClick={() => addToCart(item)} disabled={!canOrder}><Plus size={16} /> Add</Button>
                       </div>
                    </Card.Content>
                 </Card>
              </motion.div>
           ))}
        </div>
      </div>

      {/* Cart Drawer */}
      <AnimatePresence>
         {isDrawerOpen && (
            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} style={{ width: 360, display: 'flex', flexDirection: 'column' }}>
               <Card variant="elevated" style={{ height: '100%', display: 'flex', flexDirection: 'column', borderTop: '4px solid var(--orange-500)' }}>
                  <Card.Header style={{ borderBottom: '1px solid var(--border-main)' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Card.Title>Your Order</Card.Title>
                        <button onClick={() => setIsDrawerOpen(false)} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize: 24 }}>×</button>
                     </div>
                  </Card.Header>
                  <Card.Content style={{ flex: 1, overflowY: 'auto', padding: 'var(--sp-4)' }}>
                     {cart.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 40 }}>
                           <ShoppingCart size={40} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
                           <p>Your order is empty</p>
                        </div>
                     ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                           {cart.map(c => (
                              <div key={c.id} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                 <div style={{ width: 60, height: 60, borderRadius: 8, overflow: 'hidden' }}>
                                    <img src={c.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                 </div>
                                 <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600 }}>{c.name}</div>
                                    <div style={{ color: 'var(--orange-600)', fontWeight: 700 }}>${(c.price * c.cartQuantity).toFixed(2)}</div>
                                 </div>
                                 <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <button onClick={() => updateQuantity(c.id, -1)} style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--border-main)', background: 'var(--bg-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={14} /></button>
                                    <span style={{ fontWeight: 600, minWidth: 16, textAlign: 'center' }}>{c.cartQuantity}</span>
                                    <button onClick={() => updateQuantity(c.id, 1)} style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--border-main)', background: 'var(--bg-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={14} /></button>
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}
                  </Card.Content>
                  <Card.Footer style={{ padding: 'var(--sp-4)', background: 'var(--gray-50)', flexDirection: 'column', gap: 12 }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontWeight: 700, fontSize: 18 }}>
                        <span>Total</span>
                        <span>${cartTotal.toFixed(2)}</span>
                     </div>
                     <Button variant="primary" style={{ width: '100%', justifyContent: 'center' }} disabled={cart.length === 0 || !canOrder} onClick={handlePlaceOrder}>
                        Place Order
                     </Button>
                  </Card.Footer>
               </Card>
            </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
};
