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

export const StaffMenuView = () => {
  const [searchParams] = useSearchParams();
  const qrTableId = searchParams.get('tableId');
  const qrTableName = searchParams.get('tableName') || 'QR table';
  const [items, setItems] = useState<MenuItemDTO[]>([]);
  const [reservations, setReservations] = useState<ReservationDTO[]>([]);
  const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [categories, setCategories] = useState<{ id: string, name: string, icon?: string, color?: string }[]>([]);
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

    api.get('/reservations?page=0&size=100').then((res) => {
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
      toast.error('Please select a table first');
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
            <p>{canOrder ? `${tableLabel} - Select items to order` : 'Select a table to take order'}</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <Input
              type="text" placeholder="Search menu..." value={search} onChange={(e) => {
                setSearch(e.target.value);
                setSelectedCategory(null);
              }}
              icon={<Search size={16} />} style={{ width: '240px', paddingLeft: '36px' }}
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
                <Card.Content style={{ padding: 'var(--sp-4)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                    <AlertCircle size={20} color="var(--amber)" />
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: '4px' }}>Select a Table</div>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                        Choose a reservation below to take order
                      </div>
                    </div>
                  </div>
                </Card.Content>
              </Card>
            )}

            {activeReservations.length > 0 && (
              <Card variant="elevated">
                <Card.Header>
                  <Card.Title>Active Reservations</Card.Title>
                </Card.Header>
                <Card.Content>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--sp-3)' }}>
                    {activeReservations.map(res => (
                      <motion.div
                        key={res.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <button
                          onClick={() => setSelectedReservationId(res.id)}
                          style={{
                            width: '100%',
                            padding: 'var(--sp-4)',
                            border: selectedReservationId === res.id ? '2px solid var(--orange-500)' : '1px solid var(--border-main)',
                            borderRadius: 'var(--r-lg)',
                            background: selectedReservationId === res.id ? 'var(--orange-50)' : 'var(--bg-card)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            textAlign: 'left',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--sp-2)' }}>
                            <div style={{ fontWeight: 700, fontSize: 'var(--text-lg)', color: 'var(--text-heading)' }}>
                              {res.tableName}
                            </div>
                            <Badge variant={res.status === 'CHECKED_IN' ? 'success' : 'warning'} size="small">
                              {res.status}
                            </Badge>
                          </div>
                          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: '2px' }}>
                            {res.customerName}
                          </div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                            {res.numberOfGuests} guests · {new Date(res.reservationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </Card.Content>
              </Card>
            )}
          </div>
        )}

        {/* Categories */}
        {categories.length > 0 && (
          <div style={{ display: 'flex', gap: 'var(--sp-2)', marginBottom: 'var(--sp-4)', flexWrap: 'wrap' }}>
            <Button
              variant={selectedCategory === null ? 'primary' : 'ghost'}
              size="small"
              onClick={() => { setSelectedCategory(null); setSearch(''); }}
            >
              All
            </Button>
            {categories.map(cat => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? 'primary' : 'ghost'}
                size="small"
                onClick={() => { setSelectedCategory(cat.id); setSearch(''); }}
              >
                {cat.name}
              </Button>
            ))}
          </div>
        )}

        {/* Menu Items Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 'var(--sp-4)',
          overflowY: 'auto',
          flex: 1,
        }}>
          {filtered.map(item => (
            <motion.div key={item.id} layout>
              <Card variant="elevated" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Card.Content style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ marginBottom: 'var(--sp-3)' }}>
                    <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--sp-1)' }}>{item.name}</h3>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{item.description}</p>
                  </div>
                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--orange-600)' }}>
                      ${(item.price || 0).toFixed(2)}
                    </span>
                    <Button variant="primary" size="small" onClick={() => addToCart(item)} disabled={!canOrder}>
                      <Plus size={14} /> Add
                    </Button>
                  </div>
                </Card.Content>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Cart Drawer */}
      {isDrawerOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '400px',
          background: 'var(--bg-card)',
          boxShadow: 'var(--shadow-2xl)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{ padding: 'var(--sp-5)', borderBottom: '1px solid var(--border-main)' }}>
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>Order Summary</h2>
            {selectedReservation && (
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                {selectedReservation.tableName} - {selectedReservation.customerName}
              </p>
            )}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--sp-4)' }}>
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--sp-8)', color: 'var(--text-muted)' }}>
                No items in order
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 'var(--sp-3)',
                  borderBottom: '1px solid var(--border-main)',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                      ${(item.price || 0).toFixed(2)} each
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 'var(--r-sm)',
                        border: '1px solid var(--border-main)',
                        background: 'var(--bg-card)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Minus size={14} />
                    </button>
                    <span style={{ minWidth: 30, textAlign: 'center', fontWeight: 600 }}>{item.cartQuantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 'var(--r-sm)',
                        border: '1px solid var(--border-main)',
                        background: 'var(--bg-card)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <div style={{ minWidth: 70, textAlign: 'right', fontWeight: 600 }}>
                    ${((item.price || 0) * item.cartQuantity).toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ padding: 'var(--sp-5)', borderTop: '1px solid var(--border-main)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--sp-4)', fontSize: 'var(--text-lg)', fontWeight: 700 }}>
              <span>Total</span>
              <span style={{ color: 'var(--orange-600)' }}>${cartTotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
              <Button variant="ghost" onClick={() => setIsDrawerOpen(false)} style={{ flex: 1 }}>
                Close
              </Button>
              <Button variant="primary" onClick={handlePlaceOrder} disabled={cart.length === 0} style={{ flex: 1 }}>
                Place Order
              </Button>
            </div>
          </div>
        </div>
      )}

      {isDrawerOpen && (
        <div
          onClick={() => setIsDrawerOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 999,
          }}
        />
      )}
    </div>
  );
};
