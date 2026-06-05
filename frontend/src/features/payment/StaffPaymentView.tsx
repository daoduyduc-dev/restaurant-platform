import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, CreditCard, DollarSign, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';

import api from '../../services/api';
import type { OrderDTO, OrderItemDTO, ReservationDTO } from '../../services/types';
import { Card, Button, Badge, Input } from '../../components/ui';
import { toast } from '../../store/toastStore';
import { translateStatus } from '../../utils/translations';
import { formatVndCurrency } from '../../utils/formatters';

interface PaymentGroup {
  groupKey: string;
  primaryOrderId: string;
  tableId: string;
  tableName: string;
  displayLabel: string;
  reservationId: string | null;
  reservation: ReservationDTO | null;
  orders: OrderDTO[];
  items: OrderItemDTO[];
  status: string;
  subtotal: number;
  vipSurchargeAmount: number;
  finalAmount: number;
  loyaltyEligible: boolean;
}

function aggregateItems(orders: OrderDTO[]): OrderItemDTO[] {
  const byItem = new Map<string, OrderItemDTO>();

  orders.forEach((order) => {
    (order.items || []).forEach((item) => {
      const key = `${item.menuItemId}:${item.price}`;
      const existing = byItem.get(key);
      if (existing) {
        existing.quantity += item.quantity;
        existing.total += item.total;
      } else {
        byItem.set(key, { ...item });
      }
    });
  });

  return Array.from(byItem.values());
}

function buildPaymentGroups(orders: OrderDTO[], reservations: ReservationDTO[]): PaymentGroup[] {
  const groups = new Map<string, PaymentGroup>();

  orders.forEach((order) => {
    const groupKey = order.reservationId ?? `table:${order.tableId}`;
    const reservation = order.reservationId
      ? reservations.find((item) => item.id === order.reservationId) || null
      : reservations.find((item) => item.tableId === order.tableId && item.status === 'CHECKED_IN') || null;

    const existing = groups.get(groupKey);
    if (existing) {
      existing.orders.push(order);
      existing.subtotal += order.totalAmount || 0;
      existing.vipSurchargeAmount = Math.max(existing.vipSurchargeAmount, order.groupVipSurchargeAmount ?? order.vipSurchargeAmount ?? 0);
      existing.finalAmount = Math.max(existing.finalAmount, order.groupFinalAmount ?? order.finalAmount ?? 0);
      existing.loyaltyEligible = existing.loyaltyEligible || Boolean(order.loyaltyEligible);
      if (new Date(order.createdAt || order.createdDate).getTime() < new Date(existing.orders[0].createdAt || existing.orders[0].createdDate).getTime()) {
        existing.primaryOrderId = order.id;
      }
      existing.items = aggregateItems(existing.orders);
      return;
    }

    groups.set(groupKey, {
      groupKey,
      primaryOrderId: order.id,
      tableId: order.tableId,
      tableName: order.tableName,
      displayLabel: reservation?.tableName || order.tableName,
      reservationId: order.reservationId,
      reservation,
      orders: [order],
      items: aggregateItems([order]),
      status: order.status,
      subtotal: order.groupSubtotalAmount ?? order.totalAmount ?? 0,
      vipSurchargeAmount: order.groupVipSurchargeAmount ?? order.vipSurchargeAmount ?? 0,
      finalAmount: order.groupFinalAmount ?? order.finalAmount ?? 0,
      loyaltyEligible: Boolean(order.loyaltyEligible),
    });
  });

  return Array.from(groups.values()).sort(
    (a, b) => new Date(a.orders[0].createdAt || a.orders[0].createdDate).getTime()
      - new Date(b.orders[0].createdAt || b.orders[0].createdDate).getTime()
  );
}

export const StaffPaymentView = () => {
  const { t } = useTranslation();
  const [reservations, setReservations] = useState<ReservationDTO[]>([]);
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedGroupKey, setSelectedGroupKey] = useState<string | null>(null);

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

  const unpaidOrders = useMemo(() => (
    orders.filter((order) => !['PAID', 'CANCELED'].includes(order.status) && (order.items?.length || 0) > 0)
  ), [orders]);

  const paymentGroups = useMemo(() => buildPaymentGroups(unpaidOrders, reservations), [unpaidOrders, reservations]);

  const filteredGroups = useMemo(() => (
    paymentGroups.filter((group) =>
      group.displayLabel.toLowerCase().includes(search.toLowerCase())
      || group.primaryOrderId.toLowerCase().includes(search.toLowerCase())
      || group.orders.some((order) => order.id.toLowerCase().includes(search.toLowerCase()))
    )
  ), [paymentGroups, search]);

  const selectedGroup = filteredGroups.find((group) => group.groupKey === selectedGroupKey)
    || paymentGroups.find((group) => group.groupKey === selectedGroupKey)
    || null;

  const handlePayment = async () => {
    if (!selectedGroup) {
      toast.error(t('payment.missingOrder'));
      return;
    }

    try {
      await api.post(`/orders/${selectedGroup.primaryOrderId}/pay`);
      toast.success(t('payment.paymentSuccess'));
      setSelectedGroupKey(null);
      await fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('payment.paymentError'));
    }
  };

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
            {filteredGroups.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--sp-8)', color: 'var(--text-muted)' }}>
                {t('payment.noActiveGuests')}
              </div>
            ) : (
              filteredGroups.map((group) => (
                <div
                  key={group.groupKey}
                  onClick={() => setSelectedGroupKey(group.groupKey)}
                  style={{
                    padding: 'var(--sp-3)',
                    margin: 'var(--sp-2)',
                    borderRadius: 'var(--r-md)',
                    background: selectedGroup?.groupKey === group.groupKey ? 'var(--orange-50)' : 'var(--white)',
                    border: `2px solid ${selectedGroup?.groupKey === group.groupKey ? 'var(--orange-500)' : 'var(--gray-200)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16 }}>{group.displayLabel}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        {group.orders.length} order{group.orders.length > 1 ? 's' : ''} · Bill #{group.primaryOrderId.substring(0, 8)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: 'var(--orange-600)' }}>
                        {formatVndCurrency(group.finalAmount, i18n.language)}
                      </div>
                      <Badge variant="warning" size="small">{translateStatus(group.status)}</Badge>
                    </div>
                  </div>

                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {group.items.reduce((sum, item) => sum + item.quantity, 0)} {t('payment.items')} - {new Date(group.orders[0].createdAt || group.orders[0].createdDate).toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            )}
          </Card.Content>
        </Card>

        <Card variant="elevated" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {!selectedGroup ? (
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
                    <Card.Title>{selectedGroup.displayLabel} - {selectedGroup.reservation?.customerName || 'Walk-in customer'}</Card.Title>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                      {(selectedGroup.reservation?.phone || '-')}{' '}
                      - {(selectedGroup.reservation?.numberOfGuests ?? '-')} {t('payment.guests')}
                    </div>
                  </div>
                  <Badge variant="success">{translateStatus(selectedGroup.status)}</Badge>
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
                  <InfoCell label={t('payment.customer')} value={selectedGroup.reservation?.customerName || 'Walk-in customer'} />
                  <InfoCell label={t('payment.phone')} value={selectedGroup.reservation?.phone || '-'} />
                  <InfoCell label={t('payment.table')} value={`${selectedGroup.tableName}${selectedGroup.orders[0].tableType === 'VIP' ? ' (VIP)' : ''}`} />
                  <InfoCell label={t('payment.guests')} value={String(selectedGroup.reservation?.numberOfGuests ?? '-')} />
                  <InfoCell
                    label={t('payment.checkInTime')}
                    value={selectedGroup.reservation?.startTime
                      ? new Date(selectedGroup.reservation.startTime || selectedGroup.reservation.reservationTime).toLocaleString(i18n.language)
                      : '-'}
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
                      {selectedGroup.items.map((item) => (
                        <tr key={`${item.menuItemId}:${item.price}`} style={{ borderBottom: '1px solid var(--border-main)' }}>
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
                  <SummaryRow label={t('payment.subtotal')} value={formatVndCurrency(selectedGroup.subtotal, i18n.language)} />
                  {selectedGroup.vipSurchargeAmount > 0 && (
                    <SummaryRow label={t('payment.vipSurcharge')} value={formatVndCurrency(selectedGroup.vipSurchargeAmount, i18n.language)} />
                  )}
                  <SummaryRow
                    label={t('payment.grandTotal')}
                    value={formatVndCurrency(selectedGroup.finalAmount, i18n.language)}
                    strong
                  />
                </div>

                {selectedGroup.loyaltyEligible && (
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
