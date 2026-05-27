import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import type { TableDTO } from '../../services/types';
import { FloorPlanEditor } from './FloorPlanEditor';
import { useWebSocket } from '../../services/useWebSocket';
import { Button, Card, Input, Badge } from '../../components/ui';
import { Building2, Calendar, CheckCircle, Clock, Layers3, Users } from 'lucide-react';
import { toast } from '../../store/toastStore';
import { useAuthStore } from '../../store/authStore';

const STATUS_VARIANTS: Record<TableDTO['status'], 'success' | 'warning' | 'error' | 'neutral'> = {
  AVAILABLE: 'success',
  RESERVED: 'warning',
  OCCUPIED: 'error',
  DIRTY: 'neutral',
};

export const CustomerTableView = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [tables, setTables] = useState<TableDTO[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableDTO | null>(null);
  const [availableTables, setAvailableTables] = useState<Set<string>>(new Set());
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);

  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('19:00');
  const [guests, setGuests] = useState(2);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState('');
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [bookedTimeSlots, setBookedTimeSlots] = useState<Set<string>>(new Set());

  const fetchTables = async () => {
    try {
      const response = await api.get('/tables');
      setTables(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch tables:', error);
    }
  };

  useEffect(() => {
    void fetchTables();
  }, []);

  useEffect(() => {
    if (user?.name) {
      setName((current) => current || user.name);
    }
  }, [user?.name]);

  useWebSocket<any>('/topic/tables', () => {
    void fetchTables();
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
    const checkAvailability = async () => {
      if (!date || !time) {
        return;
      }

      setCheckingAvailability(true);

      try {
        const reservationTime = `${date}T${time}:00`;
        const response = await api.get('/reservations/available-tables', {
          params: {
            reservationTime,
            numberOfGuests: guests,
          },
        });

        const availableIds = new Set<string>((response.data.data || []).map((table: TableDTO) => table.id));
        setAvailableTables(availableIds);
      } catch (error) {
        console.error('Failed to check availability:', error);
        setAvailableTables(new Set());
      } finally {
        setCheckingAvailability(false);
      }
    };

    void checkAvailability();
  }, [date, guests, time]);

  useEffect(() => {
    if (!date || !selectedTable) {
      setBookedTimeSlots(new Set());
      return;
    }

    const checkBookedSlots = async () => {
      try {
        const response = await api.get('/reservations', {
          params: {
            tableId: selectedTable.id,
            date,
            page: 0,
            size: 100,
          },
        });

        const reservations = response.data.data?.items || response.data.data || [];
        const bookedSlots = new Set<string>();

        reservations.forEach((reservation: any) => {
          if (['PENDING', 'RESERVED', 'CHECKED_IN'].includes(reservation.status)) {
            const reservationDate = new Date(reservation.reservationTime);
            bookedSlots.add(reservationDate.toTimeString().substring(0, 5));
          }
        });

        setBookedTimeSlots(bookedSlots);
      } catch (error) {
        console.error('Failed to check booked slots:', error);
        setBookedTimeSlots(new Set());
      }
    };

    void checkBookedSlots();
  }, [date, selectedTable]);

  useEffect(() => {
    if (selectedFloor == null || !selectedTable || selectedTable.floor === selectedFloor) {
      return;
    }

    setSelectedTable(null);
  }, [selectedFloor, selectedTable]);

  const tablesOnSelectedFloor = selectedFloor == null
    ? tables
    : tables.filter((table) => table.floor === selectedFloor);

  const availableCountOnFloor = tablesOnSelectedFloor.filter((table) => availableTables.has(table.id)).length;

  const handleTableSelect = (table: TableDTO | null) => {
    if (!table) {
      setSelectedTable(null);
      return;
    }

    // chỉ chặn nếu bàn đang thật sự bận vật lý
    if (table.status === 'OCCUPIED') {
      toast.error('Bàn này hiện đang có khách.');
      return;
    }

    if (table.status === 'DIRTY') {
      toast.error('Bàn này đang được dọn dẹp.');
      return;
    }

    const sourceTable = tables.find((item) => item.id === table.id) ?? table;
    setSelectedTable(sourceTable);
  };

  const submitBooking = async () => {
    if (!selectedTable || !name || !phone) {
      toast.error('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    const reservationDateTime = new Date(`${date}T${time}:00`);
    const now = new Date();

    if (reservationDateTime < now) {
      toast.error('Không thể đặt bàn trong quá khứ.');
      return;
    }

    try {
      const availabilityResponse = await api.get('/reservations/available-tables', {
        params: {
          reservationTime: `${date}T${time}:00`,
          numberOfGuests: guests,
        },
      });

      const availableIds = new Set<string>(
        (availabilityResponse.data.data || []).map((table: TableDTO) => table.id)
      );

      if (!availableIds.has(selectedTable.id)) {
        toast.error('Bàn này không còn trống trong khung giờ đã chọn.');
        return;
      }

      const response = await api.post('/reservations', {
        tableId: selectedTable.id,
        customerName: name,
        phone,
        reservationTime: `${date}T${time}:00`,
        numberOfGuests: guests,
      });

      const reservation = response.data.data;
      toast.success('Đặt bàn thành công. Mời bạn chọn món tiếp theo.');
      setSelectedTable(null);
      await fetchTables();

      const destination = user ? '/app/menu' : '/menu';
      navigate(`${destination}?reservationId=${reservation.id}&tableId=${reservation.tableId}&tableName=${encodeURIComponent(reservation.tableName || selectedTable.name)}`);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message;
      toast.error(errorMessage || 'Không thể đặt bàn. Vui lòng thử lại.');
    }
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns:
          window.innerWidth < 1600
            ? '1fr'
            : 'minmax(0, 1fr) 420px',
        gap: 'var(--sp-6)',
        alignItems: 'start',
        width: '100%',
      }}
    >
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--sp-4)', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ color: 'var(--orange-600)', margin: 0 }}>Đặt bàn</h1>
            <p style={{ margin: '6px 0 0 0', color: 'var(--text-muted)' }}>
              Chọn tầng, chọn bàn, sau đó chuyển sang màn hình chọn món để hoàn tất trải nghiệm.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
            <Badge variant="success">{availableCountOnFloor} bàn trống</Badge>
            <Badge variant="info">{guests} khách</Badge>
          </div>
        </div>

        <Card variant="elevated">
          <Card.Content style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginRight: 'var(--sp-2)' }}>
              <Building2 size={18} color="var(--text-muted)" />
              <span style={{ fontWeight: 700, color: 'var(--text-heading)' }}>Chọn tầng</span>
            </div>
            {availableFloors.map((floor) => (
              <Button
                key={floor}
                variant={selectedFloor === floor ? 'primary' : 'ghost'}
                size="small"
                onClick={() => setSelectedFloor(floor)}
              >
                Tầng {floor}
              </Button>
            ))}
          </Card.Content>
        </Card>

        <Card variant="elevated" style={{ overflow: 'hidden', position: 'relative' }}>
          <Card.Header style={{ borderBottom: '1px solid var(--border-main)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--sp-3)', alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <Card.Title>Sơ đồ bàn</Card.Title>
                <p style={{ margin: '4px 0 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
                  {selectedFloor != null ? `Đang xem tầng ${selectedFloor}` : 'Chưa chọn tầng'} với {tablesOnSelectedFloor.length} bàn. Màu bàn là cố định, trạng thái nằm ở phần thông tin và khả năng chọn bàn.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
                <Badge variant="info">{tablesOnSelectedFloor.length} tổng số bàn</Badge>
                <Badge variant="success">{availableCountOnFloor} chọn được</Badge>
              </div>
            </div>
          </Card.Header>
          <Card.Content style={{ padding: 0 }}>
            {tablesOnSelectedFloor.length > 0 ? (
              <FloorPlanEditor
                tables={tablesOnSelectedFloor}
                selectedId={selectedTable?.id}
                onTableSelect={handleTableSelect}
                minHeight="520px"
                draggableTables={false}
                showOverlay={false}
              />
            ) : (
              <div style={{ padding: 'var(--sp-8)', textAlign: 'center', color: 'var(--text-muted)' }}>
                Không có bàn ở tầng này.
              </div>
            )}
          </Card.Content>

          {checkingAvailability ? (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(255,255,255,0.92)',
              padding: 'var(--sp-4)',
              borderRadius: 'var(--r-lg)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 10,
              textAlign: 'center',
            }}>
              <div className="spinner" />
              <p style={{ margin: 'var(--sp-2) 0 0 0', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                Đang kiểm tra bàn trống...
              </p>
            </div>
          ) : null}
        </Card>
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: 420,
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 24,
          alignSelf: 'start',
          maxHeight: 'calc(100vh - 120px)',
        }}
      >
        <Card variant="elevated" style={{ height: '100%' }}>
          <Card.Header style={{ borderBottom: '1px solid var(--border-main)' }}>
            <Card.Title style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Layers3 size={18} color="var(--orange-500)" />
              Thông tin đặt bàn
            </Card.Title>
          </Card.Header>
          <Card.Content style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', height: '100%' }}>
            {selectedTable ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--sp-2)', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 22, color: 'var(--text-heading)' }}>{selectedTable.name}</h3>
                    <div style={{ display: 'flex', gap: 'var(--sp-2)', marginTop: 8, flexWrap: 'wrap' }}>
                      <Badge variant={STATUS_VARIANTS[selectedTable.status]}>
                        {selectedTable.status}
                      </Badge>
                      <Badge variant="info">Tầng {selectedTable.floor ?? '-'}</Badge>
                      {selectedTable.type === 'VIP' ? <Badge variant="warning">VIP</Badge> : null}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Tối đa {selectedTable.capacity} khách</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-3)' }}>
                  <div>
                    <label className="input-label" style={{ marginBottom: 4, display: 'block' }}>Ngày</label>
                    <div className="input-container">
                      <Calendar size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 10 }} />
                      <input
                        type="date"
                        className="input-field"
                        style={{ paddingLeft: 34 }}
                        value={date}
                        onChange={(event) => setDate(event.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="input-label" style={{ marginBottom: 4, display: 'block' }}>Giờ</label>
                    <div className="input-container">
                      <Clock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 10 }} />
                      <select
                        className="input-field"
                        style={{ paddingLeft: 34 }}
                        value={time}
                        onChange={(event) => setTime(event.target.value)}
                      >
                        {Array.from({ length: 24 }, (_, hourIndex) => {
                          const hour = hourIndex.toString().padStart(2, '0');
                          return ['00', '30'].map((minute) => {
                            const slot = `${hour}:${minute}`;
                            const isBooked = bookedTimeSlots.has(slot);

                            return (
                              <option key={slot} value={slot} disabled={isBooked}>
                                {slot} {isBooked ? '(Đã kín)' : ''}
                              </option>
                            );
                          });
                        }).flat()}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="input-label" style={{ marginBottom: 4, display: 'block' }}>Số khách</label>
                  <div className="input-container">
                    <Users size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 10 }} />
                    <input
                      type="number"
                      min="1"
                      max={selectedTable.capacity}
                      className="input-field"
                      style={{ paddingLeft: 34 }}
                      value={guests}
                      onChange={(event) => setGuests(Number.parseInt(event.target.value, 10) || 1)}
                    />
                  </div>
                </div>

                <Input label="Tên người đặt" value={name} onChange={(event) => setName(event.target.value)} placeholder="Nguyễn Văn A" />
                <Input label="Số điện thoại" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="0901234567" />

                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                  {!user && (
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      Bạn vẫn có thể đặt bàn và xem menu khi chưa đăng nhập. Đăng nhập sẽ giúp lưu lịch sử, quản lý đơn và tích điểm đổi thưởng.
                    </div>
                  )}
                  <Button variant="primary" size="large" style={{ width: '100%', justifyContent: 'center' }} onClick={() => void submitBooking()}>
                    <CheckCircle size={18} />
                    Xác nhận đặt bàn và chọn món
                  </Button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: 'var(--sp-8)', color: 'var(--text-muted)', margin: 'auto 0' }}>
                <SelectIndicator />
                <p style={{ margin: 0 }}>Chọn một bàn đang trống để tiếp tục đặt bàn và sang màn hình chọn món.</p>
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
