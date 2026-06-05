import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, CreditCard, DollarSign, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';

import api from '../../services/api';
import type { OrderDTO, ReservationDTO } from '../../services/types';
import { Card, Button, Badge, Input } from '../../components/ui';
import { toast } from '../../store/toastStore';
import { translateStatus } from '../../utils/translations';
import { formatVndCurrency } from '../../utils/formatters';

export const StaffPaymentView = () => {
  const { t } = useTranslation();
  const [reservations, setReservations] = useState<ReservationDTO[]>([]);
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState<ReservationDTO | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderDTO | null>(null);

  const fetchData = async () => {
    try {
      const [reservationResponse, orderResponse] = await Promise.allSettled([
        api.get('/reservations?page=0&size=100'),
        api.get('/orders/active'),
      ]);

      if (reservationResponse.status === 'fulfilled') {
        const reservationItems = reservationResponse.value.data.data?.items || reservationResponse.value.data.data || [];
        setReservations(Array.isArray(reservationItems) ? reservationItems : []);
      } else {
        setReservations([]);
      }

      if (orderResponse.status === 'fulfilled') {
        const orderItems = orderResponse.value.data.data?.items || orderResponse.value.data.data || [];
        setOrders(Array.isArray(orderItems) ? orderItems : []);
      } else {
        setOrders([]);
      }

      if (reservationResponse.status === 'rejected' && orderResponse.status === 'rejected') {
        toast.error(t('payment.paymentError'));
      }
    } catch {
      toast.error(t('payment.paymentError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const unpaidOrders = orders.filter((order) =>
    !['PAID', 'CANCELED'].includes(order.status) && (order.items?.length || 0) > 0
  );

  const filteredOrders = unpaidOrders.filter((order) =>
    order.tableName?.toLowerCase().includes(search.toLowerCase()) ||
    order.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectOrder = (order: OrderDTO) => {
    const reservation = reservations.find((r) =>
      (order.reservationId && r.id === order.reservationId) ||
      (!order.reservationId && r.tableId === order.tableId && r.status === 'CHECKED_IN')
    );

    setSelectedOrder(order);
    setSelectedReservation(reservation || null);
  };

  const handlePayment = async () => {
    if (!selectedOrder) {
      toast.error(t('payment.missingOrder'));
      return;
    }

    try {
      await api.post(`/orders/${selectedOrder.id}/pay`);
      toast.success(t('payment.paymentSuccess'));
      setSelectedReservation(null);
      setSelectedOrder(null);
      await fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('payment.paymentError'));
    }
  };

  const selectedTableName = selectedReservation?.tableName || selectedOrder?.tableName || '-';
  const selectedCustomerName = selectedReservation?.customerName || 'Walk-in customer';
  const selectedPhone = selectedReservation?.phone || '-';
  const selectedGuestCount = selectedReservation?.numberOfGuests != null
    ? String(selectedReservation.numberOfGuests)
    : '-';
  const selectedStatus = selectedReservation?.status || selectedOrder?.status || 'SERVED';
  const selectedCheckInTime = selectedReservation?.startTime || selectedReservation?.reservationTime || selectedOrder?.createdAt;

  if (loading) {
    return <div className="spinner" style={{ margin: 'auto' }} />;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="page-header">
        <div>
          <h1 style={{ color: 'var(--orange-600)' }}>
            <DollarSign size={28} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
            {t('payment.title')}
          </h1>
          <p>{t('payment.subtitle')}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 'var(--sp-6)', flex: 1, minHeight: 0 }}>
        <Card variant="elevated" style={{ width: 400, display: 'flex', flexDirection: 'column' }}>
          <Card.Header style={{ borderBottom: '1px solid var(--border-main)' }}>
            <Input
              placeholder={t('ui.searchPlaceholder')}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              icon={<Search size={16} />}
            />
          </Card.Header>

          <Card.Content style={{ flex: 1, overflowY: 'auto', padding: 'var(--sp-2)' }}>
            {filteredOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--sp-8)', color: 'var(--text-muted)' }}>
                {t('payment.noActiveGuests')}
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => handleSelectOrder(order)}
                  style={{
                    padding: 'var(--sp-3)',
                    margin: 'var(--sp-2)',
                    borderRadius: 'var(--r-md)',
                    background: selectedOrder?.id === order.id ? 'var(--orange-50)' : 'var(--white)',
                    border: `2px solid ${selectedOrder?.id === order.id ? 'var(--orange-500)' : 'var(--gray-200)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16 }}>{order.tableName}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Order #{order.id.substring(0, 8)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: 'var(--orange-600)' }}>
                        {formatVndCurrency(order.finalAmount ?? order.totalAmount, i18n.language)}
                      </div>
                      <Badge variant="warning" size="small">{translateStatus(order.status)}</Badge>
                    </div>
                  </div>

                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {order.items?.length || 0} {t('payment.items')} - {new Date(order.createdAt).toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            )}
          </Card.Content>
        </Card>

        <Card variant="elevated" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {!selectedOrder ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                <CreditCard size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
                <h3>{t('payment.selectTable')}</h3>
              </div>
            </div>
          ) : (
            <>
              <Card.Header style={{ borderBottom: '1px solid var(--border-main)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Card.Title>{selectedTableName} - {selectedCustomerName}</Card.Title>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                      {selectedPhone} - {selectedGuestCount} {t('payment.guests')}
                    </div>
                  </div>
                  <Badge variant="success">{translateStatus(selectedStatus)}</Badge>
                </div>
              </Card.Header>

              <Card.Content style={{ flex: 1, overflowY: 'auto', padding: 'var(--sp-5)' }}>
                <div style={{ textAlign: 'center', marginBottom: 'var(--sp-5)', paddingBottom: 'var(--sp-4)', borderBottom: '2px solid var(--border-main)' }}>
                  <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--orange-600)', marginBottom: 4 }}>
                    ServeGenius Restaurant
                  </h2>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                    {t('payment.invoice')}
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 'var(--sp-3)',
                  marginBottom: 'var(--sp-4)',
                  padding: 'var(--sp-3)',
                  background: 'var(--gray-50)',
                  borderRadius: 'var(--r-md)',
                }}>
                  <InfoCell label={t('payment.customer')} value={selectedCustomerName} />
                  <InfoCell label={t('payment.phone')} value={selectedPhone} />
                  <InfoCell label={t('payment.table')} value={`${selectedTableName}${selectedOrder.tableType === 'VIP' ? ' (VIP)' : ''}`} />
                  <InfoCell label={t('payment.guests')} value={selectedGuestCount} />
                  <InfoCell
                    label={t('payment.checkInTime')}
                    value={selectedCheckInTime ? new Date(selectedCheckInTime).toLocaleString(i18n.language) : '-'}
                  />
                  <InfoCell label={t('payment.paymentTime')} value={new Date().toLocaleString(i18n.language)} />
                </div>

                <div style={{ marginBottom: 'var(--sp-4)' }}>
                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--sp-3)', textTransform: 'uppercase' }}>
                    {t('payment.orderDetails')}
                  </h3>

                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border-main)', background: 'var(--gray-50)' }}>
                        <th style={{ padding: 'var(--sp-2)', textAlign: 'left' }}>{t('payment.item')}</th>
                        <th style={{ padding: 'var(--sp-2)', textAlign: 'center' }}>{t('payment.quantity')}</th>
                        <th style={{ padding: 'var(--sp-2)', textAlign: 'right' }}>{t('payment.unitPrice')}</th>
                        <th style={{ padding: 'var(--sp-2)', textAlign: 'right' }}>{t('payment.amount')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item) => (
                        <tr key={item.id} style={{ borderBottom: '1px solid var(--border-main)' }}>
                          <td style={{ padding: 'var(--sp-2)' }}>{item.menuItemName}</td>
                          <td style={{ padding: 'var(--sp-2)', textAlign: 'center' }}>{item.quantity}</td>
                          <td style={{ padding: 'var(--sp-2)', textAlign: 'right' }}>{formatVndCurrency(item.price, i18n.language)}</td>
                          <td style={{ padding: 'var(--sp-2)', textAlign: 'right', fontWeight: 600 }}>{formatVndCurrency(item.total, i18n.language)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{
                  padding: 'var(--sp-4)',
                  background: 'var(--gray-50)',
                  borderRadius: 'var(--r-md)',
                  marginBottom: 'var(--sp-4)',
                }}>
                  <SummaryRow label={t('payment.subtotal')} value={formatVndCurrency(selectedOrder.totalAmount, i18n.language)} />
                  {(selectedOrder.vipSurchargeAmount || 0) > 0 && (
                    <SummaryRow label={t('payment.vipSurcharge')} value={formatVndCurrency(selectedOrder.vipSurchargeAmount, i18n.language)} />
                  )}
                  <SummaryRow
                    label={t('payment.grandTotal')}
                    value={formatVndCurrency(selectedOrder.finalAmount ?? selectedOrder.totalAmount, i18n.language)}
                    strong
                  />
                </div>

                {selectedOrder.loyaltyEligible && (
                  <div style={{ marginBottom: 'var(--sp-4)', color: 'var(--orange-700)', fontSize: 'var(--text-sm)' }}>
                    {t('payment.loyaltyNotice')}
                  </div>
                )}

                <div style={{ textAlign: 'center', marginBottom: 'var(--sp-4)' }}>
                  <div style={{ fontWeight: 600, marginBottom: 'var(--sp-2)' }}>{t('payment.scanToPay')}</div>
                  <img src="/MaQR.jpg" alt={t('payment.qrAlt')} style={{ width: 180, height: 180, borderRadius: 'var(--r-md)', border: '1px solid var(--border-main)', objectFit: 'contain' }} />
                </div>

                <Button
                  variant="primary"
                  onClick={handlePayment}
                  style={{ width: '100%', padding: 'var(--sp-4)', fontSize: 'var(--text-lg)' }}
                >
                  <CheckCircle size={20} /> {t('payment.confirmPayment')}
                </Button>

                <div style={{ textAlign: 'center', marginTop: 'var(--sp-4)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  {t('payment.thankYou')}
                </div>
              </Card.Content>
            </>
          )}
        </Card>
      </div>
    </motion.div>
  );
};

const InfoCell = ({ label, value }: { label: string; value: string }) => (
  <div>
    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
    <div style={{ fontWeight: 600 }}>{value}</div>
  </div>
);

const SummaryRow = ({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: strong ? 0 : 'var(--sp-2)',
      marginTop: strong ? 'var(--sp-3)' : 0,
      paddingTop: strong ? 'var(--sp-3)' : 0,
      borderTop: strong ? '2px solid var(--border-main)' : 'none',
      fontSize: strong ? 'var(--text-lg)' : 'var(--text-sm)',
      fontWeight: strong ? 700 : 500,
    }}
  >
    <span>{label}</span>
    <span style={strong ? { color: 'var(--orange-600)' } : undefined}>{value}</span>
  </div>
);
