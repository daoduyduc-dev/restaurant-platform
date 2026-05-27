import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarCheck, CreditCard, RefreshCw, Table2, UtensilsCrossed } from 'lucide-react';
import api from '../../services/api';
import type { OrderDTO, ReservationDTO, TableDTO } from '../../services/types';
import { Badge, Button, Card } from '../../components/ui';
import { toast } from '../../store/toastStore';
import { useWebSocket } from '../../services/useWebSocket';
import { translateStatus } from '../../utils/translations';

const ORDER_FLOW = ['OPEN', 'PENDING', 'COOKING', 'READY', 'SERVED'] as const;

const nextStatus: Partial<Record<OrderDTO['status'], OrderDTO['status']>> = {
  OPEN: 'PENDING',
  PENDING: 'COOKING',
  COOKING: 'READY',
  READY: 'SERVED',
};

const actionLabel: Partial<Record<OrderDTO['status'], string>> = {
  OPEN: 'Gui bep',
  PENDING: 'Bep nhan',
  COOKING: 'Mon da xong',
  READY: 'Da phuc vu',
};

function unpack<T>(payload: unknown): T[] {
  const response = payload as { data?: { data?: unknown } | unknown };
  const data = (response.data as { data?: unknown } | undefined)?.data ?? response.data ?? payload;
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && 'items' in data && Array.isArray((data as { items?: unknown }).items)) {
    return (data as { items: T[] }).items;
  }
  return [];
}

export const WaiterDashboard = () => {
  const navigate = useNavigate();
  const [tables, setTables] = useState<TableDTO[]>([]);
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [reservations, setReservations] = useState<ReservationDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const [tableRes, orderRes, reservationRes] = await Promise.all([
        api.get('/tables'),
        api.get('/orders'),
        api.get('/reservations?status=PENDING,RESERVED'),
      ]);
      setTables(unpack<TableDTO>(tableRes));
      setOrders(unpack<OrderDTO>(orderRes).filter(order => !['PAID', 'CANCELED'].includes(order.status)));
      setReservations(unpack<ReservationDTO>(reservationRes));
    } catch {
      toast.error('Khong tai duoc du lieu ca lam');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  useWebSocket<OrderDTO>(['/topic/orders', '/topic/orders/role/STAFF'], () => {
    refresh();
  });

  const counts = useMemo(() => {
    return {
      occupied: tables.filter(table => table.status === 'OCCUPIED').length,
      dirty: tables.filter(table => table.status === 'DIRTY').length,
      ready: orders.filter(order => order.status === 'READY').length,
      unpaid: orders.filter(order => order.status === 'SERVED').length,
    };
  }, [orders, tables]);

  const groupedOrders = ORDER_FLOW.map(status => ({
    status,
    orders: orders.filter(order => order.status === status),
  }));

  const moveOrder = async (order: OrderDTO) => {
    const status = nextStatus[order.status];
    if (!status) return;
    try {
      await api.patch(`/orders/${order.id}/status?status=${status}`);
      toast.success('Da cap nhat trang thai order');
      refresh();
    } catch {
      toast.error('Khong the cap nhat order');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
      <div className="page-header">
        <div>
          <h1>Ca lam hom nay</h1>
          <p>Theo luong: dat ban, check-in, order, bep, phuc vu, thanh toan.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
          <Button variant="secondary" onClick={refresh} disabled={loading}>
            <RefreshCw size={16} /> Lam moi
          </Button>
          <Button variant="primary" onClick={() => navigate('/app/tables')}>
            <Table2 size={16} /> Mo so do ban
          </Button>
        </div>
      </div>

      <div className="stats-grid">
        <Card><Card.Content><Metric icon={<Table2 size={20} />} label="Ban dang dung" value={counts.occupied} /></Card.Content></Card>
        <Card><Card.Content><Metric icon={<CalendarCheck size={20} />} label="Dat ban can xu ly" value={reservations.length} /></Card.Content></Card>
        <Card><Card.Content><Metric icon={<UtensilsCrossed size={20} />} label="Mon san sang" value={counts.ready} /></Card.Content></Card>
        <Card><Card.Content><Metric icon={<CreditCard size={20} />} label="Cho thanh toan" value={counts.unpaid} /></Card.Content></Card>
      </div>

      <div className="workflow-strip">
        {['Dat ban', 'Check-in', 'Goi mon', 'Bep xu ly', 'Phuc vu', 'Thanh toan'].map((step, index) => (
          <div className="workflow-step" key={step}>
            <span>{index + 1}</span>
            {step}
          </div>
        ))}
      </div>

      <div className="kanban-grid ops-kanban">
        {groupedOrders.map(group => (
          <section className="kanban-col" key={group.status}>
            <div className="kanban-col-header">
              <strong>{translateStatus(group.status)}</strong>
              <Badge variant="neutral" size="small">{group.orders.length}</Badge>
            </div>
            <div className="kanban-col-body">
              {group.orders.length === 0 ? (
                <div className="empty-state">Khong co order</div>
              ) : group.orders.map(order => (
                <article className="kanban-ticket" key={order.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <strong>{order.tableName || 'Mang di'}</strong>
                    <Badge variant={order.status === 'READY' ? 'success' : 'warning'} size="small">
                      {translateStatus(order.status)}
                    </Badge>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginTop: 8 }}>
                    {order.items?.length || 0} mon - {(order.totalAmount || 0).toLocaleString('vi-VN')} VND
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <Button variant="secondary" size="small" onClick={() => navigate('/app/orders')}>
                      Chi tiet
                    </Button>
                    {nextStatus[order.status] && (
                      <Button variant="primary" size="small" onClick={() => moveOrder(order)}>
                        {actionLabel[order.status]}
                      </Button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
      <div className="stat-card-icon" style={{ marginBottom: 0, color: 'var(--orange-600)', background: 'var(--orange-100)' }}>
        {icon}
      </div>
      <div>
        <div className="stat-card-value">{value}</div>
        <div className="stat-card-label">{label}</div>
      </div>
    </div>
  );
}
