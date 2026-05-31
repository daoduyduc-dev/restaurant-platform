import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ClipboardList, CreditCard, RefreshCw, Timer } from 'lucide-react';
import api from '../../services/api';
import type { OrderDTO } from '../../services/types';
import { Badge, Button, Card } from '../../components/ui';
import { toast } from '../../store/toastStore';
import { useWebSocket } from '../../services/useWebSocket';
import { translateStatus } from '../../utils/translations';

const columns: Array<{ status: OrderDTO['status']; tone: 'info' | 'warning' | 'success' | 'neutral' }> = [
  { status: 'OPEN', tone: 'info' },
  { status: 'COOKING', tone: 'warning' },
  { status: 'READY', tone: 'success' },
  { status: 'SERVED', tone: 'neutral' },
];

const nextStatus: Partial<Record<OrderDTO['status'], OrderDTO['status']>> = {
  OPEN: 'COOKING',
  COOKING: 'READY',
  READY: 'SERVED',
};

const actionLabel: Partial<Record<OrderDTO['status'], string>> = {
  OPEN: 'Gửi bếp',
  COOKING: 'Bắt đầu nấu',
  READY: 'Báo sẵn sàng',
  SERVED: 'Đã phục vụ',
};

function unpackOrders(payload: unknown): OrderDTO[] {
  const response = payload as { data?: { data?: unknown } | unknown };
  const data = (response.data as { data?: unknown } | undefined)?.data ?? response.data ?? payload;
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && 'items' in data && Array.isArray((data as { items?: unknown }).items)) {
    return (data as { items: OrderDTO[] }).items;
  }
  return [];
}

function getOrderItemCount(order: OrderDTO) {
  return order.items?.length || 0;
}

function getOrderUpdatedAt(order: OrderDTO) {
  const rawDate = order.createdAt || order.createdDate;
  return rawDate ? new Date(rawDate).getTime() : 0;
}

function preferVisibleOrder(candidate: OrderDTO, current: OrderDTO) {
  const candidateItems = getOrderItemCount(candidate);
  const currentItems = getOrderItemCount(current);
  if (candidateItems !== currentItems) {
    return candidateItems > currentItems;
  }

  const candidateUpdatedAt = getOrderUpdatedAt(candidate);
  const currentUpdatedAt = getOrderUpdatedAt(current);
  if (candidateUpdatedAt !== currentUpdatedAt) {
    return candidateUpdatedAt > currentUpdatedAt;
  }

  return candidate.id > current.id;
}

function timeSince(date?: string) {
  if (!date) return '';
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 60000));
  if (minutes < 1) return 'vua tao';
  if (minutes < 60) return `${minutes} phut`;
  return `${Math.floor(minutes / 60)} gio ${minutes % 60} phut`;
}

export const StaffOrderView = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [addOnTableLabels, setAddOnTableLabels] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders/active');
      setOrders(unpackOrders(res).filter(order => !['PAID', 'CANCELED'].includes(order.status)));
    } catch {
      toast.error('Khong tai duoc danh sach order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useWebSocket<OrderDTO>(['/topic/orders', '/topic/orders/role/STAFF'], fetchOrders);
  useWebSocket<{ type?: string; orderId?: string; tableName?: string }>('/topic/notifications/role/STAFF', (payload) => {
    if (payload?.type === 'ORDER_ITEM_ADDED_TO_COOKING' && payload.orderId && payload.tableName) {
      setAddOnTableLabels((prev) => ({ ...prev, [payload.orderId as string]: payload.tableName as string }));
      fetchOrders();
    }
  });

  const visibleOrders = useMemo(() => {
    const byTable = new Map<string, OrderDTO>();

    orders
      .filter((order) => !['PAID', 'CANCELED'].includes(order.status))
      .forEach((order) => {
        const tableKey = order.tableId || order.id;
        const current = byTable.get(tableKey);
        if (!current || preferVisibleOrder(order, current)) {
          byTable.set(tableKey, order);
        }
      });

    return Array.from(byTable.values());
  }, [orders]);

  useEffect(() => {
    const activeCookingOrderIds = new Set(
      visibleOrders.filter((order) => order.status === 'COOKING').map((order) => order.id),
    );

    setAddOnTableLabels((prev) => {
      const next: Record<string, string> = {};
      Object.entries(prev).forEach(([orderId, label]) => {
        if (activeCookingOrderIds.has(orderId)) {
          next[orderId] = label;
        }
      });
      return next;
    });
  }, [visibleOrders]);

  const grouped = useMemo(() => columns.map(col => ({
    ...col,
    orders: visibleOrders.filter(order => order.status === col.status),
  })), [visibleOrders]);

  const moveOrder = async (order: OrderDTO) => {
    const status = nextStatus[order.status];
    if (!status) return;
    try {
      await api.patch(`/orders/${order.id}/status?status=${status}`);
      toast.success('Đã cập nhật order');
      fetchOrders();
    } catch {
      toast.error('Không thể cập nhật order');
    }
  };

  const cancelOrder = async (order: OrderDTO) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy order này?')) return;
    try {
      await api.patch(`/orders/${order.id}/status?status=CANCELED`);
      toast.success('Đã hủy order');
      fetchOrders();
    } catch {
      toast.error('Không thể hủy order');
    }
  };

  const payOrder = async (order: OrderDTO) => {
    try {
      await api.post(`/orders/${order.id}/pay`);
      toast.success('Đã thanh toán order');
      fetchOrders();
    } catch {
      toast.error('Không thể thanh toán order');
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--sp-16)' }}><div className="spinner" /></div>;
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
      <div className="page-header">
        <div>
          <h1>Quản lý Order</h1>
          <p>Quản lý trạng thái order theo đúng lưu lượng vận hành của nhà hàng.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
          <Button variant="secondary" onClick={fetchOrders}>
            <RefreshCw size={16} /> Làm mới
          </Button>
          <Button variant="primary" onClick={() => navigate('/app/tables')}>
            <ClipboardList size={16} /> Tạo order từ bàn
          </Button>
        </div>
      </div>

      <div className="kanban-grid ops-kanban">
        {grouped.map(group => (
          <section className="kanban-col" key={group.status}>
            <div className="kanban-col-header">
              <strong>{translateStatus(group.status)}</strong>
              <Badge variant="neutral" size="small">{group.orders.length}</Badge>
            </div>
            <div className="kanban-col-body" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 300px)', paddingRight: 'var(--sp-2)' }}>
              {group.orders.length === 0 ? (
                <div className="empty-state">Khong co order</div>
              ) : group.orders.map(order => (
                <Card key={order.id} hover>
                  <Card.Content style={{ padding: 'var(--sp-4)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                      <strong>{addOnTableLabels[order.id] || order.tableName || 'Order'}</strong>
                      <Badge variant={group.tone} size="small">{translateStatus(order.status)}</Badge>
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginTop: 8 }}>
                      {order.items?.length || 0} mon - {(order.totalAmount || 0).toLocaleString('vi-VN')} VND
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginTop: 8 }}>
                      <Timer size={12} /> {timeSince(order.createdAt || order.createdDate)}
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                      {nextStatus[order.status] && (
                        <Button variant="primary" size="small" onClick={() => moveOrder(order)}>
                          <CheckCircle size={14} /> {actionLabel[order.status]}
                        </Button>
                      )}
                      {order.status === 'OPEN' && (
                        <Button variant="outline" size="small" onClick={() => cancelOrder(order)} style={{ color: 'var(--rose)' }}>
                          ✕ Hủy
                        </Button>
                      )}
                      {order.status === 'SERVED' && (
                        <Button variant="secondary" size="small" onClick={() => payOrder(order)}>
                          <CreditCard size={14} /> Thanh toán
                        </Button>
                      )}
                    </div>
                  </Card.Content>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};
