import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, CreditCard } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import api from '../../services/api';
import type { OrderDTO } from '../../services/types';
import { Card, Button, Badge } from '../../components/ui';
import { toast } from '../../store/toastStore';
import { translateStatus } from '../../utils/translations';

const money = (value: number | undefined) =>
  new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);

export const CustomerPaymentView = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
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

  const unpaidOrders = orders.filter((order) => !['PAID', 'CANCELED'].includes(order.status));

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
        {unpaidOrders.length === 0 ? (
          <Card variant="elevated" style={{ textAlign: 'center', padding: 'var(--sp-8)' }}>
            <CheckCircle size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
            <h3>{t('payment.noActiveGuests')}</h3>
            <p style={{ color: 'var(--text-muted)' }}>{t('payment.thankYou')}</p>
          </Card>
        ) : (
          unpaidOrders.map((order) => (
            <Card key={order.id} variant="elevated" style={{ borderTop: '4px solid var(--orange-500)' }}>
              <Card.Header>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Card.Title>{t('payment.table')}: {order.tableName}</Card.Title>
                    <Card.Description>Order #{order.id.substring(0, 8)}</Card.Description>
                  </div>
                  <Badge variant="warning">{translateStatus(order.status)}</Badge>
                </div>
              </Card.Header>

              <Card.Content>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                  {(order.items || []).map((item) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px dashed var(--gray-200)' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{item.quantity}x {item.menuItemName}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>${money(item.price)} / item</div>
                      </div>
                      <div style={{ fontWeight: 600 }}>${money(item.total)}</div>
                    </div>
                  ))}
                </div>

                <div style={{ background: 'var(--gray-50)', padding: 16, borderRadius: 'var(--r-md)', marginTop: 16 }}>
                  <SummaryRow label={t('payment.subtotal')} value={`$${money(order.totalAmount)}`} />
                  {(order.vipSurchargeAmount || 0) > 0 && (
                    <SummaryRow label={t('payment.vipSurcharge')} value={`$${money(order.vipSurchargeAmount)}`} />
                  )}
                  <SummaryRow label={t('payment.grandTotal')} value={`$${money(order.finalAmount ?? order.totalAmount)}`} strong />
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
