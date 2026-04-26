import { useState, useEffect } from 'react';
import api from '../../services/api';
import type { ReservationDTO, OrderDTO } from '../../services/types';
import { CreditCard, CheckCircle, Search, DollarSign, QrCode, Receipt } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, Button, Badge, Input, Modal } from '../../components/ui';
import { toast } from '../../store/toastStore';
import { translateStatus } from '../../utils/translations';

export const StaffPaymentView = () => {
  const [reservations, setReservations] = useState<ReservationDTO[]>([]);
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState<ReservationDTO | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderDTO | null>(null);

  const fetchData = async () => {
    try {
      const [resRes, ordRes] = await Promise.all([
        api.get('/reservations?page=0&size=100'),
        api.get('/orders')
      ]);
      const resData = resRes.data.data?.items || resRes.data.data || [];
      setReservations(Array.isArray(resData) ? resData : []);

      const ordData = ordRes.data.data?.items || ordRes.data.data || [];
      setOrders(Array.isArray(ordData) ? ordData : []);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // Show reservations that are CHECKED_IN (customers are dining)
  const activeReservations = reservations.filter(r => r.status === 'CHECKED_IN');
  const filtered = activeReservations.filter(r =>
    r.customerName?.toLowerCase().includes(search.toLowerCase()) ||
    r.tableName?.toLowerCase().includes(search.toLowerCase()) ||
    r.phone?.includes(search)
  );

  const handleSelectReservation = (res: ReservationDTO) => {
    setSelectedReservation(res);
    // Find order for this reservation
    const order = orders.find(o => o.reservationId === res.id);
    setSelectedOrder(order || null);
  };

  const handlePayment = async () => {
    if (!selectedOrder) {
      toast.error('Không tìm thấy order cho đặt bàn này');
      return;
    }
    try {
      await api.post(`/orders/${selectedOrder.id}/pay`, { paymentMethod: 'CASH' });
      toast.success('Thanh toán thành công!');
      setSelectedReservation(null);
      setSelectedOrder(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Thanh toán thất bại');
    }
  };

  if (loading) return <div className="spinner" style={{ margin: 'auto' }} />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="page-header">
         <div>
            <h1 style={{ color: 'var(--orange-600)' }}><DollarSign size={28} style={{ display:'inline', marginRight: 8, verticalAlign:'middle' }}/> Xử lý Payment</h1>
            <p>Thanh toán cho khách hàng đang dùng bữa</p>
         </div>
      </div>

      <div style={{ display: 'flex', gap: 'var(--sp-6)', flex: 1, minHeight: 0 }}>
         {/* Reservation List */}
         <Card variant="elevated" style={{ width: 400, display: 'flex', flexDirection: 'column' }}>
            <Card.Header style={{ borderBottom: '1px solid var(--border-main)' }}>
               <Input placeholder="Tìm khách hàng, bàn, số điện thoại..." value={search} onChange={e=>setSearch(e.target.value)} icon={<Search size={16}/>} />
            </Card.Header>
            <Card.Content style={{ flex: 1, overflowY: 'auto', padding: 'var(--sp-2)' }}>
               {filtered.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 'var(--sp-8)', color: 'var(--text-muted)' }}>Không có khách đang dùng bữa</div>
               ) : (
                  filtered.map(res => {
                    const order = orders.find(o => o.reservationId === res.id);
                    return (
                      <div
                        key={res.id}
                        onClick={() => handleSelectReservation(res)}
                        style={{
                          padding: 'var(--sp-3)',
                          margin: 'var(--sp-2)',
                          borderRadius: 'var(--r-md)',
                          background: selectedReservation?.id === res.id ? 'var(--orange-50)' : 'var(--white)',
                          border: `2px solid ${selectedReservation?.id === res.id ? 'var(--orange-500)' : 'var(--gray-200)'}`,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                           <div>
                             <div style={{ fontWeight: 700, fontSize: 16 }}>{res.tableName}</div>
                             <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{res.customerName}</div>
                           </div>
                           <div style={{ textAlign: 'right' }}>
                             <div style={{ fontWeight: 700, color: 'var(--orange-600)' }}>
                               ${order ? (order.totalAmount||0).toFixed(2) : '0.00'}
                             </div>
                             <Badge variant="success" size="small">{translateStatus(res.status)}</Badge>
                           </div>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {res.numberOfGuests} khách · {new Date(res.reservationTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                    );
                  })
               )}
            </Card.Content>
         </Card>

         {/* Payment Details */}
         <Card variant="elevated" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {!selectedReservation ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                   <CreditCard size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
                   <h3>Chọn bàn để xử lý thanh toán</h3>
                </div>
              </div>
            ) : (
              <>
                <Card.Header style={{ borderBottom: '1px solid var(--border-main)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Card.Title>{selectedReservation.tableName} - {selectedReservation.customerName}</Card.Title>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                        {selectedReservation.phone} · {selectedReservation.numberOfGuests} khách
                      </div>
                    </div>
                    <Badge variant="success">{translateStatus(selectedReservation.status)}</Badge>
                  </div>
                </Card.Header>

                <Card.Content style={{ flex: 1, overflowY: 'auto', padding: 'var(--sp-5)' }}>
                  {!selectedOrder ? (
                    <div style={{ textAlign: 'center', padding: 'var(--sp-8)', color: 'var(--text-muted)' }}>
                      Không tìm thấy order cho đặt bàn này
                    </div>
                  ) : (
                    <>
                      {/* Restaurant Header */}
                      <div style={{ textAlign: 'center', marginBottom: 'var(--sp-5)', paddingBottom: 'var(--sp-4)', borderBottom: '2px solid var(--border-main)' }}>
                        <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--orange-600)', marginBottom: 4 }}>
                          ServeGenius Restaurant
                        </h2>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                          123 Food Street, District 1, Ho Chi Minh City
                        </div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                          Tel: (028) 1234-5678 | Tax Code: 0123456789
                        </div>
                      </div>

                      {/* Bill Title */}
                      <div style={{ textAlign: 'center', marginBottom: 'var(--sp-4)' }}>
                        <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          HÓA ĐƠN THANH TOÁN
                        </h3>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: 4 }}>
                          PAYMENT INVOICE
                        </div>
                      </div>

                      {/* Customer & Order Info */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 'var(--sp-3)',
                        marginBottom: 'var(--sp-4)',
                        padding: 'var(--sp-3)',
                        background: 'var(--gray-50)',
                        borderRadius: 'var(--r-md)',
                      }}>
                        <div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 2 }}>Khách hàng / Customer</div>
                          <div style={{ fontWeight: 600 }}>{selectedReservation.customerName}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 2 }}>Số điện thoại / Phone</div>
                          <div style={{ fontWeight: 600 }}>{selectedReservation.phone}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 2 }}>Bàn / Table</div>
                          <div style={{ fontWeight: 600 }}>{selectedReservation.tableName}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 2 }}>Số khách / Guests</div>
                          <div style={{ fontWeight: 600 }}>{selectedReservation.numberOfGuests} khách</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 2 }}>Giờ vào / Check-in</div>
                          <div style={{ fontWeight: 600 }}>
                            {new Date(selectedReservation.reservationTime).toLocaleString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 2 }}>Giờ thanh toán / Payment Time</div>
                          <div style={{ fontWeight: 600 }}>
                            {new Date().toLocaleString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div style={{ marginBottom: 'var(--sp-4)' }}>
                        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--sp-3)', textTransform: 'uppercase' }}>
                          Chi tiết món ăn / Order Details
                        </h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ borderBottom: '2px solid var(--border-main)', background: 'var(--gray-50)' }}>
                              <th style={{ padding: 'var(--sp-2)', textAlign: 'left', fontSize: 'var(--text-sm)', fontWeight: 600 }}>Món / Item</th>
                              <th style={{ padding: 'var(--sp-2)', textAlign: 'center', fontSize: 'var(--text-sm)', fontWeight: 600 }}>SL / Qty</th>
                              <th style={{ padding: 'var(--sp-2)', textAlign: 'right', fontSize: 'var(--text-sm)', fontWeight: 600 }}>Đơn giá / Price</th>
                              <th style={{ padding: 'var(--sp-2)', textAlign: 'right', fontSize: 'var(--text-sm)', fontWeight: 600 }}>Thành tiền / Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedOrder.items?.map((item, idx) => (
                              <tr key={item.id} style={{ borderBottom: '1px solid var(--border-main)' }}>
                                <td style={{ padding: 'var(--sp-2)', fontSize: 'var(--text-sm)' }}>{item.menuItemName}</td>
                                <td style={{ padding: 'var(--sp-2)', textAlign: 'center', fontSize: 'var(--text-sm)' }}>{item.quantity}</td>
                                <td style={{ padding: 'var(--sp-2)', textAlign: 'right', fontSize: 'var(--text-sm)' }}>
                                  {(item.price||0).toLocaleString('vi-VN')}đ
                                </td>
                                <td style={{ padding: 'var(--sp-2)', textAlign: 'right', fontSize: 'var(--text-sm)', fontWeight: 600 }}>
                                  {(item.total||0).toLocaleString('vi-VN')}đ
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Total Calculation */}
                      <div style={{
                        padding: 'var(--sp-4)',
                        background: 'var(--gray-50)',
                        borderRadius: 'var(--r-md)',
                        marginBottom: 'var(--sp-4)',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--sp-2)', fontSize: 'var(--text-sm)' }}>
                          <span>Tạm tính / Subtotal:</span>
                          <span style={{ fontWeight: 600 }}>{(selectedOrder.totalAmount||0).toLocaleString('vi-VN')}đ</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--sp-2)', fontSize: 'var(--text-sm)' }}>
                          <span>VAT (10%):</span>
                          <span style={{ fontWeight: 600 }}>{((selectedOrder.totalAmount||0) * 0.1).toLocaleString('vi-VN')}đ</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--sp-2)', fontSize: 'var(--text-sm)' }}>
                          <span>Phí phục vụ / Service (5%):</span>
                          <span style={{ fontWeight: 600 }}>{((selectedOrder.totalAmount||0) * 0.05).toLocaleString('vi-VN')}đ</span>
                        </div>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginTop: 'var(--sp-3)',
                          paddingTop: 'var(--sp-3)',
                          borderTop: '2px solid var(--border-main)',
                          fontSize: 'var(--text-lg)',
                          fontWeight: 700,
                        }}>
                          <span>TỔNG CỘNG / TOTAL:</span>
                          <span style={{ color: 'var(--orange-600)' }}>
                            {((selectedOrder.totalAmount||0) * 1.15).toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                      </div>

                      {/* QR Code Payment */}
                      <div style={{
                        padding: 'var(--sp-4)',
                        border: '2px solid var(--orange-300)',
                        borderRadius: 'var(--r-lg)',
                        textAlign: 'center',
                        marginBottom: 'var(--sp-4)',
                        background: 'var(--orange-50)',
                      }}>
                        <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--sp-3)' }}>
                          Quét mã QR để thanh toán / Scan QR to Pay
                        </h4>
                        <div style={{
                          width: 250,
                          height: 250,
                          margin: '0 auto var(--sp-3)',
                          background: 'var(--white)',
                          borderRadius: 'var(--r-md)',
                          padding: 'var(--sp-2)',
                          boxShadow: 'var(--shadow-md)',
                        }}>
                          <img
                            src="/MaQR.jpg"
                            alt="Payment QR Code"
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          />
                        </div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--sp-2)' }}>
                          <strong>Ngân hàng / Bank:</strong> Vietcombank
                        </div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--sp-2)' }}>
                          <strong>Chủ tài khoản / Account Name:</strong> DAO DUY DUC
                        </div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                          <strong>Số tài khoản / Account No:</strong> 1038674985
                        </div>
                      </div>

                      <Button
                        variant="primary"
                        onClick={handlePayment}
                        style={{ width: '100%', padding: 'var(--sp-4)', fontSize: 'var(--text-lg)' }}
                      >
                        <CheckCircle size={20} /> Xác nhận đã thanh toán / Confirm Payment
                      </Button>

                      <div style={{
                        textAlign: 'center',
                        marginTop: 'var(--sp-4)',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--text-muted)',
                        fontStyle: 'italic',
                      }}>
                        Cảm ơn quý khách! Hẹn gặp lại! / Thank you! See you again!
                      </div>
                    </>
                  )}
                </Card.Content>
              </>
            )}
         </Card>
      </div>
    </motion.div>
  );
};
