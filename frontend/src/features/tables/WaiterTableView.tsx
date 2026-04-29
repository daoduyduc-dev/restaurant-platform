import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import type { OrderDTO, TableDTO } from '../../services/types';
import { Badge, Button, Card } from '../../components/ui';
import { Building2, CheckCircle, Layers3, PlusCircle, QrCode } from 'lucide-react';
import { FloorPlanEditor } from './FloorPlanEditor';
import { useWebSocket } from '../../services/useWebSocket';
import { translateStatus } from '../../utils/translations';

const STATUS_VARIANTS: Record<TableDTO['status'], 'success' | 'warning' | 'error' | 'neutral'> = {
  AVAILABLE: 'success',
  RESERVED: 'warning',
  OCCUPIED: 'error',
  DIRTY: 'neutral',
};

export const WaiterTableView = () => {
  const navigate = useNavigate();
  const [tables, setTables] = useState<TableDTO[]>([]);
  const [activeOrders, setActiveOrders] = useState<Record<string, OrderDTO>>({});
  const [selectedTable, setSelectedTable] = useState<TableDTO | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const [tablesResponse, ordersResponse] = await Promise.all([
        api.get('/tables'),
        api.get('/orders'),
      ]);

      const nextTables = tablesResponse.data.data || [];
      const orders: OrderDTO[] = ordersResponse.data.data?.items || ordersResponse.data.data || [];
      const activeMap = orders
        .filter((order) => !['PAID', 'CANCELED'].includes(order.status))
        .reduce((result, order) => {
          if (order.tableId) {
            result[order.tableId] = order;
          }

          return result;
        }, {} as Record<string, OrderDTO>);

      setTables(nextTables);
      setActiveOrders(activeMap);
    } catch {
      // Keep the current UI state if the refresh fails.
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  useWebSocket<any>(['/topic/tables', '/topic/orders'], () => {
    void fetchData();
  });

  const availableFloors = useMemo(() => (
    Array.from(
      new Set(
        tables
          .map((table) => table.floor)
          .filter((floor): floor is number => floor != null)
      )
    ).sort((a, b) => a - b)
  ), [tables]);

  useEffect(() => {
    if (availableFloors.length === 0) {
      if (selectedFloor != null) {
        setSelectedFloor(null);
      }
      return;
    }

    if (selectedFloor == null || !availableFloors.includes(selectedFloor)) {
      setSelectedFloor(availableFloors[0]);
    }
  }, [availableFloors, selectedFloor]);

  useEffect(() => {
    if (selectedFloor == null || !selectedTable || selectedTable.floor === selectedFloor) {
      return;
    }

    setSelectedTable(null);
  }, [selectedFloor, selectedTable]);

  const tablesOnSelectedFloor = selectedFloor == null
    ? tables
    : tables.filter((table) => table.floor === selectedFloor);

  const activeOrdersOnFloor = tablesOnSelectedFloor.filter((table) => activeOrders[table.id]).length;
  const dirtyTablesOnFloor = tablesOnSelectedFloor.filter((table) => table.status === 'DIRTY').length;
  const readyOrdersCount = Object.values(activeOrders).filter((order) => order.status === 'READY').length;
  const cookingOrdersCount = Object.values(activeOrders).filter((order) => order.status === 'COOKING').length;
  const selectedOrder = selectedTable ? activeOrders[selectedTable.id] : undefined;

  return (
    <div style={{ display: 'flex', gap: 'var(--sp-6)', alignItems: 'stretch' }}>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--sp-4)', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ color: 'var(--orange-600)', margin: 0 }}>Table Operations</h1>
            <p style={{ margin: '6px 0 0 0', color: 'var(--text-muted)' }}>
              Monitor floor status and open each table to manage active orders.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
            <Badge variant="warning">{cookingOrdersCount} cooking</Badge>
            <Badge variant="success">{readyOrdersCount} ready</Badge>
          </div>
        </div>

        <Card variant="elevated">
          <Card.Content style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginRight: 'var(--sp-2)' }}>
              <Building2 size={18} color="var(--text-muted)" />
              <span style={{ fontWeight: 700, color: 'var(--text-heading)' }}>Floor Tabs</span>
            </div>
            {availableFloors.map((floor) => (
              <Button
                key={floor}
                variant={selectedFloor === floor ? 'primary' : 'ghost'}
                size="small"
                onClick={() => setSelectedFloor(floor)}
              >
                Floor {floor}
              </Button>
            ))}
          </Card.Content>
        </Card>

        <Card variant="elevated" style={{ overflow: 'hidden' }}>
          <Card.Header style={{ borderBottom: '1px solid var(--border-main)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--sp-3)', alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <Card.Title>Floor Layout</Card.Title>
                <p style={{ margin: '4px 0 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
                  {selectedFloor != null ? `Showing Floor ${selectedFloor}` : 'No floor selected'} with {tablesOnSelectedFloor.length} table(s). Select a table to open order actions.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
                <Badge variant="info">{activeOrdersOnFloor} active orders</Badge>
                <Badge variant="neutral">{dirtyTablesOnFloor} dirty</Badge>
              </div>
            </div>
          </Card.Header>
          <Card.Content style={{ padding: 0 }}>
            {tablesOnSelectedFloor.length > 0 ? (
              <FloorPlanEditor
                tables={tablesOnSelectedFloor}
                selectedId={selectedTable?.id}
                onTableSelect={setSelectedTable}
                minHeight="520px"
                draggableTables={false}
                showOverlay={false}
              />
            ) : (
              <div style={{ padding: 'var(--sp-8)', textAlign: 'center', color: 'var(--text-muted)' }}>
                No tables are available on the selected floor.
              </div>
            )}
          </Card.Content>
        </Card>
      </div>

      <div style={{ width: 360, display: 'flex', flexDirection: 'column' }}>
        <Card variant="elevated" style={{ height: '100%' }}>
          <Card.Header style={{ borderBottom: '1px solid var(--border-main)' }}>
            <Card.Title style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Layers3 size={18} color="var(--orange-500)" />
              Table Details
            </Card.Title>
          </Card.Header>
          <Card.Content style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', height: '100%' }}>
            {selectedTable ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--sp-2)', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 22, color: 'var(--text-heading)' }}>{selectedTable.name}</h3>
                    <div style={{ display: 'flex', gap: 'var(--sp-2)', marginTop: 8, flexWrap: 'wrap' }}>
                      <Badge variant={STATUS_VARIANTS[selectedTable.status]}>{translateStatus(selectedTable.status)}</Badge>
                      <Badge variant="info">Floor {selectedTable.floor ?? '-'}</Badge>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{selectedTable.capacity} seats</div>
                </div>

                {selectedTable.status === 'DIRTY' ? (
                  <div style={{ textAlign: 'center', padding: 'var(--sp-8) var(--sp-4)' }}>
                    <div style={{ fontSize: 40, marginBottom: 16 }}>Clean-up</div>
                    <h3 style={{ marginBottom: 8 }}>This table needs cleaning</h3>
                    <Button variant="outline" style={{ width: '100%' }}>Mark as cleaned</Button>
                  </div>
                ) : selectedOrder ? (
                  <>
                    <div style={{ background: 'var(--gray-50)', padding: 'var(--sp-4)', borderRadius: 'var(--r-md)', border: '1px solid var(--border-main)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, gap: 'var(--sp-2)' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-heading)' }}>Active order</span>
                        <Badge variant="info">{translateStatus(selectedOrder.status)}</Badge>
                      </div>
                      <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>
                        {selectedOrder.items?.length || 0} item(s) | ${(selectedOrder.totalAmount || 0).toFixed(2)}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {selectedOrder.status === 'READY' ? (
                          <Button variant="primary" style={{ background: 'var(--teal)', borderColor: 'var(--teal)' }}>
                            <CheckCircle size={16} />
                            Mark as served
                          </Button>
                        ) : null}
                        <Button variant="secondary" onClick={() => navigate('/menu')}>
                          <PlusCircle size={16} />
                          Add items
                        </Button>
                        <Button variant="outline" onClick={() => navigate('/orders')}>
                          <QrCode size={16} />
                          View order
                        </Button>
                      </div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto' }}>
                      <h4 style={{ fontSize: 13, textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 8px 0' }}>
                        Items
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {selectedOrder.items?.map((item) => (
                          <div
                            key={item.id}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              fontSize: 14,
                              padding: '8px 0',
                              borderBottom: '1px dashed var(--gray-200)',
                              gap: 'var(--sp-3)',
                            }}
                          >
                            <span>{item.quantity}x {item.menuItemName}</span>
                            <span style={{ fontWeight: 600 }}>${item.total?.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', marginTop: 'var(--sp-2)' }}>
                    <Button variant="primary" size="large" style={{ justifyContent: 'center', padding: '16px' }} onClick={() => navigate('/menu')}>
                      <PlusCircle size={18} />
                      New order
                    </Button>
                    {selectedTable.status !== 'OCCUPIED' ? (
                      <Button variant="secondary" size="large" style={{ justifyContent: 'center' }}>
                        Mark as occupied
                      </Button>
                    ) : null}
                  </div>
                )}

                <div style={{ marginTop: 'auto', paddingTop: 'var(--sp-4)', borderTop: '1px solid var(--border-main)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, marginBottom: 10 }}>
                    <QrCode size={16} />
                    Table QR Code
                  </div>
                  <img
                    alt={`QR for ${selectedTable.name}`}
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`${window.location.origin}/menu?tableId=${selectedTable.id}&tableName=${selectedTable.name}`)}`}
                    style={{ width: 120, height: 120, borderRadius: 8, border: '1px solid var(--border-main)' }}
                  />
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: 'var(--sp-8)', color: 'var(--text-muted)', margin: 'auto 0' }}>
                <SelectIndicator />
                <p style={{ margin: 0 }}>Select a table to review its status and order actions.</p>
              </div>
            )}
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

const SelectIndicator = () => (
  <div style={{
    width: 64,
    height: 64,
    border: '2px dashed var(--gray-400)',
    borderRadius: '50%',
    margin: '0 auto 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}>
    <div style={{ width: 8, height: 8, background: 'var(--gray-400)', borderRadius: '50%' }} />
  </div>
);
