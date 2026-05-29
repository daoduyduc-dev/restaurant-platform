import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, MapPin, Minus, Plus, Search, ShoppingCart, Tag } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import api from '../../services/api';
import { resolveMediaUrl } from '../../services/media';
import type { MenuItemDTO, ReservationDTO } from '../../services/types';
import { useAuthStore } from '../../store/authStore';
import { toast } from '../../store/toastStore';
import { Badge, Button, Card, Input } from '../../components/ui';

interface CartItem extends MenuItemDTO {
  cartQuantity: number;
}

const formatMoney = (value: number) => `${Number(value || 0).toLocaleString('vi-VN')} đ`;

export const CustomerMenuOrderView = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [searchParams] = useSearchParams();
  const queryReservationId = searchParams.get('reservationId');
  const queryTableId = searchParams.get('tableId');
  const queryTableName = searchParams.get('tableName') || 'bàn đã chọn';

  const [items, setItems] = useState<MenuItemDTO[]>([]);
  const [reservations, setReservations] = useState<ReservationDTO[]>([]);
  const [selectedReservationId, setSelectedReservationId] = useState<string | null>(queryReservationId);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [categories, setCategories] = useState<Array<{ id: string; name: string; icon?: string; color?: string }>>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    void api.get('/menu?page=0&size=100')
      .then((response) => {
        const responseData = response.data.data;
        const data = (responseData && typeof responseData === 'object' && 'items' in responseData)
          ? responseData.items
          : responseData;

        if (Array.isArray(data)) {
          setItems(data.filter((item) => item.isAvailable ?? item.available));
        }
      })
      .catch(() => {
        toast.error('Không thể tải thực đơn lúc này.');
      });

    void api.get('/categories')
      .then((response) => {
        if (Array.isArray(response.data.data)) {
          setCategories(response.data.data);
        }
      })
      .catch(() => {
        setCategories([]);
      });
  }, []);

  useEffect(() => {
    if (!user) {
      setReservations([]);
      return;
    }

    void api.get('/reservations/my?page=0&size=100')
      .then((response) => {
        const data = response.data.data?.items || response.data.data || [];
        if (Array.isArray(data)) {
          setReservations(data);
        }
      })
      .catch(() => {
        setReservations([]);
      });
  }, [user]);

  const activeReservations = reservations.filter((reservation) => ['RESERVED', 'CHECKED_IN'].includes(reservation.status));
  const selectedReservation = reservations.find((reservation) => reservation.id === selectedReservationId) || null;

  useEffect(() => {
    if (queryReservationId) {
      setSelectedReservationId(queryReservationId);
      return;
    }

    if (activeReservations.length === 1 && !selectedReservationId) {
      setSelectedReservationId(activeReservations[0].id);
    }
  }, [activeReservations, queryReservationId, selectedReservationId]);

  const canOrder = Boolean(selectedReservationId);
  const tableLabel = useMemo(() => (
    queryTableName || selectedReservation?.tableName || 'bàn đã chọn'
  ), [queryTableName, selectedReservation?.tableName]);

  const addToCart = (item: MenuItemDTO) => {
    if (!canOrder) {
      toast.error('Bạn cần đặt bàn trước khi chọn món.');
      return;
    }

    setCart((currentCart) => {
      const existingItem = currentCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return currentCart.map((cartItem) => (
          cartItem.id === item.id
            ? { ...cartItem, cartQuantity: cartItem.cartQuantity + 1 }
            : cartItem
        ));
      }

      return [...currentCart, { ...item, cartQuantity: 1 }];
    });

    toast.success(`Đã thêm ${item.name} vào đơn.`);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((currentCart) => currentCart
      .map((cartItem) => (
        cartItem.id === id
          ? { ...cartItem, cartQuantity: cartItem.cartQuantity + delta }
          : cartItem
      ))
      .filter((cartItem) => cartItem.cartQuantity > 0));
  };

  const handlePlaceOrder = async () => {
    if (!canOrder || cart.length === 0) {
      return;
    }

    try {
      await api.post('/orders', {
        tableId: queryTableId || selectedReservation?.tableId,
        reservationId: selectedReservationId,
        items: cart.map((cartItem) => ({
          menuItemId: cartItem.id,
          quantity: cartItem.cartQuantity,
        })),
      });

      toast.success('Đã xác nhận order của bạn.');
      setCart([]);
      setIsDrawerOpen(false);

      // If not logged in, redirect to home after a short delay
      if (!user) {
        setTimeout(() => {
          toast.success('Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!');
          navigate('/');
        }, 1500);
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Không thể gửi đơn. Vui lòng thử lại.';
      toast.error(message);
    }
  };

  const filteredItems = search.trim()
    ? items.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
    : selectedCategory
      ? items.filter((item) => item.categoryId === selectedCategory)
      : items;
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);

  return (
    <div style={{ display: 'flex', height: '100%', gap: 'var(--sp-6)' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="page-header" style={{ marginBottom: 'var(--sp-4)' }}>
          <div>
            <h1 style={{ color: 'var(--orange-600)' }}>Chọn món cho bàn của bạn</h1>
            <p>
              {canOrder
                ? `${tableLabel} - bạn có thể chọn món ngay bây giờ.`
                : 'Hãy hoàn tất bước đặt bàn trước, sau đó hệ thống sẽ cho bạn chọn món.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Input
              type="text"
              placeholder="Tìm món ăn..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setSelectedCategory(null);
              }}
              icon={<Search size={16} />}
              style={{ width: '240px', paddingLeft: '36px' }}
            />
            <Button
              onClick={() => setIsDrawerOpen(true)}
              variant={cart.length > 0 ? 'primary' : 'secondary'}
              disabled={!canOrder}
            >
              <ShoppingCart size={16} /> Giỏ món ({cart.length})
            </Button>
          </div>
        </div>

        {!queryReservationId && (
          <div style={{ display: 'grid', gap: 'var(--sp-3)', marginBottom: 'var(--sp-5)' }}>
            {!canOrder && (
              <Card variant="elevated" style={{ borderLeft: '4px solid var(--amber)' }}>
                <Card.Content style={{ padding: 'var(--sp-4)', display: 'flex', gap: 12, alignItems: 'center', color: 'var(--text-heading)' }}>
                  <AlertCircle size={20} color="var(--amber)" />
                  <span style={{ fontWeight: 700 }}>
                    {user
                      ? 'Chọn một lượt đặt bàn còn hiệu lực để bắt đầu gọi món.'
                      : 'Khách không cần đăng nhập vẫn có thể đặt bàn. Sau khi đặt xong, hệ thống sẽ tự chuyển sang bước chọn món.'}
                  </span>
                </Card.Content>
              </Card>
            )}

            {reservations.length > 0 && activeReservations.length !== 1 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--sp-3)' }}>
                {reservations.map((reservation) => {
                  const selectable = ['RESERVED', 'CHECKED_IN'].includes(reservation.status);
                  return (
                    <button
                      key={reservation.id}
                      onClick={() => selectable && setSelectedReservationId(reservation.id)}
                      disabled={!selectable}
                      style={{
                        textAlign: 'left',
                        padding: '14px 16px',
                        borderRadius: 'var(--r-md)',
                        border: selectedReservationId === reservation.id ? '2px solid var(--orange-500)' : '1px solid var(--border-main)',
                        background: 'var(--bg-card)',
                        opacity: selectable ? 1 : 0.42,
                        cursor: selectable ? 'pointer' : 'not-allowed',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                        <strong style={{ color: 'var(--text-heading)' }}>{reservation.tableName}</strong>
                        <Badge variant={selectable ? 'success' : 'neutral'} size="small">{reservation.status}</Badge>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 13 }}>
                        <MapPin size={14} /> {new Date(reservation.reservationTime).toLocaleString('vi-VN')}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {canOrder && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--teal)', fontWeight: 700 }}>
                <CheckCircle size={18} /> Bạn đang chọn món cho {tableLabel}
              </div>
            )}
          </div>
        )}

        {categories.length > 0 && (
          <div style={{ display: 'flex', gap: 'var(--sp-2)', marginBottom: 'var(--sp-6)', flexWrap: 'wrap', alignItems: 'center' }}>
            <Tag size={16} style={{ color: 'var(--text-muted)' }} />
            <Button
              variant={!selectedCategory ? 'primary' : 'outline'}
              size="small"
              onClick={() => setSelectedCategory(null)}
            >
              Tất cả
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'primary' : 'outline'}
                size="small"
                onClick={() => setSelectedCategory(category.id)}
                style={{
                  borderColor: category.color || undefined,
                  color: category.color || undefined,
                }}
              >
                {category.icon && <span style={{ marginRight: 4 }}>{category.icon}</span>}
                {category.name}
              </Button>
            ))}
          </div>
        )}

        <div className="item-grid" style={{ overflowY: 'auto', paddingBottom: 'var(--sp-6)' }}>
          {filteredItems.map((item) => (
            <motion.div key={item.id} whileHover={{ y: -4 }}>
              <Card variant="elevated" style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ height: 200, overflow: 'hidden' }}>
                  <img src={resolveMediaUrl(item.imageUrl)} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <Card.Content style={{ flex: 1, padding: 'var(--sp-4)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>
                    {item.categoryName}
                  </div>
                  <h3 style={{ margin: 0, marginBottom: 8, fontSize: 18 }}>{item.name}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: 14, flex: 1 }}>{item.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                    <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--orange-600)' }}>{formatMoney(item.price)}</span>
                    <Button variant="outline" size="small" onClick={() => addToCart(item)} disabled={!canOrder}>
                      <Plus size={16} /> Thêm
                    </Button>
                  </div>
                </Card.Content>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {isDrawerOpen && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            style={{ width: 360, display: 'flex', flexDirection: 'column' }}
          >
            <Card variant="elevated" style={{ height: '100%', display: 'flex', flexDirection: 'column', borderTop: '4px solid var(--orange-500)' }}>
              <Card.Header style={{ borderBottom: '1px solid var(--border-main)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Card.Title>Đơn món của bạn</Card.Title>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 24 }}
                  >
                    ×
                  </button>
                </div>
              </Card.Header>
              <Card.Content style={{ flex: 1, overflowY: 'auto', padding: 'var(--sp-4)' }}>
                {cart.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 40 }}>
                    <ShoppingCart size={40} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
                    <p>Giỏ món đang trống</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {cart.map((cartItem) => (
                      <div key={cartItem.id} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div style={{ width: 60, height: 60, borderRadius: 8, overflow: 'hidden' }}>
                          <img src={resolveMediaUrl(cartItem.imageUrl)} alt={cartItem.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600 }}>{cartItem.name}</div>
                          <div style={{ color: 'var(--orange-600)', fontWeight: 700 }}>
                            {formatMoney(cartItem.price * cartItem.cartQuantity)}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <button onClick={() => updateQuantity(cartItem.id, -1)} style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--border-main)', background: 'var(--bg-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={14} /></button>
                          <span style={{ fontWeight: 600, minWidth: 16, textAlign: 'center' }}>{cartItem.cartQuantity}</span>
                          <button onClick={() => updateQuantity(cartItem.id, 1)} style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--border-main)', background: 'var(--bg-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card.Content>
              <Card.Footer style={{ padding: 'var(--sp-4)', background: 'var(--gray-50)', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontWeight: 700, fontSize: 18 }}>
                  <span>Tạm tính</span>
                  <span>{formatMoney(cartTotal)}</span>
                </div>
                <Button
                  variant="primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  disabled={cart.length === 0 || !canOrder}
                  onClick={handlePlaceOrder}
                >
                  Xác nhận
                </Button>
              </Card.Footer>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
