import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, CreditCard } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';

import api from '../../services/api';
import type { OrderDTO, OrderItemDTO } from '../../services/types';
import { Card, Button, Badge } from '../../components/ui';
import { toast } from '../../store/toastStore';
import { translateStatus } from '../../utils/translations';

interface CustomerPaymentGroup {
  groupKey: string;
  displayLabel: string;
  orders: OrderDTO[];
  items: OrderItemDTO[];
  subtotal: number;
  vipSurchargeAmount: number;
  finalAmount: number;
  status: string;
}

const money = (value: number | undefined) => {
  const formatted = new Intl.NumberFormat(i18n.language, {
    maximumFractionDigits: 0,
  }).format((value || 0) * 1000);
  return `${formatted} VNĐ`;
};

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

function buildGroups(orders: OrderDTO[]): CustomerPaymentGroup[] {
  const groups = new Map<string, CustomerPaymentGroup>();

  orders.forEach((order) => {
    const groupKey = order.reservationId ?? `table:${order.tableId}`;
    const existing = groups.get(groupKey);
    if (existing) {
      existing.orders.push(order);
      existing.items = aggregateItems(existing.orders);
      existing.subtotal = order.groupSubtotalAmount ?? existing.subtotal + (order.totalAmount || 0);
      existing.vipSurchargeAmount = Math.max(existing.vipSurchargeAmount, order.groupVipSurchargeAmount ?? order.vipSurchargeAmount ?? 0);
      existing.finalAmount = Math.max(existing.finalAmount, order.groupFinalAmount ?? order.finalAmount ?? 0);
      return;
    }

    groups.set(groupKey, {
      groupKey,
      displayLabel: order.displayLabel || order.tableName,
      orders: [order],
      items: aggregateItems([order]),
      subtotal: order.groupSubtotalAmount ?? order.totalAmount ?? 0,
      vipSurchargeAmount: order.groupVipSurchargeAmount ?? order.vipSurchargeAmount ?? 0,
      finalAmount: order.groupFinalAmount ?? order.finalAmount ?? 0,
      status: order.status,
    });
  });

  return Array.from(groups.values());
}

export const CustomerPaymentView = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/my');
      const items = response.data.data?.items || response.data.data || [];
      setOrders(Array.isArray(items) ? items : []);
    } catch {
      toast.error(t('payment.paymentError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchOrders();
  }, []);

  const unpaidGroups = useMemo(() => (
    buildGroups(orders.filter((order) => !['PAID', 'CANCELED'].includes(order.status)))
  ), [orders]);

  const handleCustomerAcknowledge = () => {
    toast.info(t('payment.customerWaiting'));
  };

  if (loading) {
    return <div className="spinner" style={{ margin: 'auto' }} />;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="page-header">
        <div>
          <h1 style={{ color: 'var(--orange-600)' }}>{t('payment.title')}</h1>
          <p>{t('payment.subtitle')}</p>
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
        <Card variant="elevated" style={{ background: 'linear-gradient(135deg, var(--orange-100) 0%, #FFFDF5 100%)', borderLeft: '4px solid var(--orange-500)' }}>
          <Card.Content style={{ padding: 'var(--sp-5)' }}>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase' }}>
              {t('payment.transferInfo')}
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{t('payment.accountName')}:</span>
                <span style={{ fontWeight: 700, fontSize: 'var(--text-lg)' }}>Dao Duy Duc</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{t('payment.bank')}:</span>
                <span style={{ fontWeight: 700, fontSize: 'var(--text-lg)' }}>VietComBank</span>
              </div>
            </div>
          </Card.Content>
        </Card>

        {unpaidGroups.length === 0 ? (
          <Card variant="elevated" style={{ textAlign: 'center', padding: 'var(--sp-8)' }}>
            <CheckCircle size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
            <h3>{t('payment.noActiveGuests')}</h3>
            <p style={{ color: 'var(--text-muted)' }}>{t('payment.thankYou')}</p>
          </Card>
        ) : (
          unpaidGroups.map((group) => (
            <Card key={group.groupKey} variant="elevated" style={{ borderTop: '4px solid var(--orange-500)' }}>
              <Card.Header>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Card.Title>{t('payment.table')}: {group.displayLabel}</Card.Title>
                    <Card.Description>{group.orders.length} order{group.orders.length > 1 ? 's' : ''}</Card.Description>
                  </div>
                  <Badge variant="warning">{translateStatus(group.status)}</Badge>
                </div>
              </Card.Header>

              <Card.Content>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                  {group.items.map((item) => (
                    <div key={`${item.menuItemId}:${item.price}`} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px dashed var(--gray-200)' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{item.quantity}x {item.menuItemName}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{money(item.price)} / {t('payment.itemUnit')}</div>
                      </div>
                      <div style={{ fontWeight: 600 }}>{money(item.total)}</div>
                    </div>
                  ))}
                </div>

                <div style={{ background: 'var(--gray-50)', padding: 16, borderRadius: 'var(--r-md)', marginTop: 16 }}>
                  <SummaryRow label={t('payment.subtotal')} value={money(group.subtotal)} />
                  {group.vipSurchargeAmount > 0 && (
                    <SummaryRow label={t('payment.vipSurcharge')} value={money(group.vipSurchargeAmount)} />
                  )}
                  <SummaryRow label={t('payment.grandTotal')} value={money(group.finalAmount || group.subtotal)} strong />
                </div>

                <div style={{ marginTop: 16, fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                  {t('payment.pendingCustomerAction')}
                </div>
              </Card.Content>

              <Card.Footer style={{ borderTop: 'none', paddingTop: 0 }}>
                <Button variant="secondary" size="large" style={{ width: '100%', justifyContent: 'center' }} onClick={handleCustomerAcknowledge}>
                  <CreditCard size={18} /> {t('payment.confirmPayment')}
                </Button>
              </Card.Footer>
            </Card>
          ))
        )}
      </div>
    </motion.div>
  );
};

const SummaryRow = ({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: strong ? 0 : 8,
      marginTop: strong ? 16 : 0,
      paddingTop: strong ? 16 : 0,
      borderTop: strong ? '1px solid var(--border-main)' : 'none',
      fontWeight: strong ? 800 : 500,
      fontSize: strong ? 20 : 14,
    }}
  >
    <span>{label}</span>
    <span>{value}</span>
  </div>
);
