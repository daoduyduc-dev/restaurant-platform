import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import type { BookingWindowDTO, TableDTO, TimeSlotAvailabilityDTO } from '../../services/types';
import { FloorPlanEditor } from './FloorPlanEditor';
import { useWebSocket } from '../../services/useWebSocket';
import { Button, Card, Input, Badge } from '../../components/ui';
import { Building2, Calendar, CheckCircle, Clock, Layers3, Users } from 'lucide-react';
import { toast } from '../../store/toastStore';
import { useAuthStore } from '../../store/authStore';
import { motion } from 'framer-motion';
import { addDaysToLocalDateString, combineLocalDateAndTime, getLocalDateString } from '../../utils/dates';

const STATUS_VARIANTS: Record<TableDTO['status'], 'success' | 'warning' | 'error' | 'neutral'> = {
  AVAILABLE: 'success',
  RESERVED: 'warning',
  OCCUPIED: 'error',
};

const slotValue = (slot: TimeSlotAvailabilityDTO) => slot.startTime.slice(11, 16);

export const CustomerTableView = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [tables, setTables] = useState<TableDTO[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableDTO | null>(null);
  const [availableTables, setAvailableTables] = useState<Set<string>>(new Set());
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const [selectedTime, setSelectedTime] = useState('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlotAvailabilityDTO[]>([]);
  const [bookingWindow, setBookingWindow] = useState<BookingWindowDTO | null>(null);
  const [timeSlotsLoading, setTimeSlotsLoading] = useState(false);
  const [guests, setGuests] = useState(2);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState('');
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const maxBookingDate = useMemo(() => addDaysToLocalDateString(getLocalDateString(), 4), []);

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
      setSelectedFloor(null);
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

  useEffect(() => {
    if (!selectedTable) {
      setAvailableTimeSlots([]);
      setBookingWindow(null);
      setSelectedTime('');
      return;
    }

    const loadTimeSlots = async () => {
      setTimeSlotsLoading(true);

      try {
        const response = await api.get(`/reservations/table/${selectedTable.id}/booking-window`, {
          params: {
            date: selectedDate,
            numberOfGuests: guests,
          },
        });

        const windowData = response.data.data as BookingWindowDTO;
        const slots = windowData?.availableSlots || [];

        setBookingWindow(windowData);
        setAvailableTimeSlots(slots);
        setSelectedTime((current) => (
          slots.some((slot) => slot.available && slotValue(slot) === current)
            ? current
            : slots.find((slot) => slot.available)?.startTime.slice(11, 16) || ''
        ));
      } catch (error) {
        console.error('Failed to load time slots:', error);
        setBookingWindow(null);
        setAvailableTimeSlots([]);
        setSelectedTime('');
      } finally {
        setTimeSlotsLoading(false);
      }
    };

    void loadTimeSlots();
  }, [guests, selectedDate, selectedTable]);

  useEffect(() => {
    const checkAvailability = async () => {
      if (!selectedTime) {
        setAvailableTables(new Set());
        return;
      }

      setCheckingAvailability(true);

      try {
        const reservationTime = combineLocalDateAndTime(selectedDate, selectedTime);
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
  }, [guests, selectedDate, selectedTime]);

  const tablesOnSelectedFloor = selectedFloor == null
    ? tables
    : tables.filter((table) => table.floor === selectedFloor);

  const availableCountOnFloor = tablesOnSelectedFloor.filter((table) => availableTables.has(table.id)).length;

  const handleTableSelect = (table: TableDTO | null) => {
    if (!table) {
      setSelectedTable(null);
      return;
    }

    if (!checkingAvailability && selectedTime && availableTables.size > 0 && !availableTables.has(table.id)) {
      toast.error('This table is not available for the selected time slot.');
      return;
    }

    setSelectedTable(tables.find((item) => item.id === table.id) ?? table);
  };

  const submitBooking = async () => {
    if (!selectedTable || !name || !phone || !selectedTime) {
      toast.error('Please complete all booking details.');
      return;
    }

    const selectedSlot = availableTimeSlots.find((slot) => slotValue(slot) === selectedTime);
    if (!selectedSlot?.available) {
      toast.error('This table is not available for the selected time slot.');
      return;
    }

    const reservationDateTime = new Date(`${selectedDate}T${selectedTime}:00`);
    if (reservationDateTime < new Date()) {
      toast.error('Cannot book in the past.');
      return;
    }

    try {
      const response = await api.post('/reservations', {
        tableId: selectedTable.id,
        customerName: name,
        phone,
        startTime: combineLocalDateAndTime(selectedDate, selectedTime),
        numberOfGuests: guests,
      });

      const reservation = response.data.data;
      toast.success('Booking created successfully.');
      setSelectedTable(null);
      await fetchTables();

      const destination = user ? '/app/menu' : '/menu';
      navigate(`${destination}?reservationId=${reservation.id}&tableId=${reservation.tableId}&tableName=${encodeURIComponent(reservation.tableName || selectedTable.name)}`);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message;
      toast.error(errorMessage || 'Could not create booking. Please try again.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        display: 'grid',
        gridTemplateColumns: window.innerWidth < 1024 ? '1fr' : 'minmax(0, 1fr) 420px',
        gap: 'var(--sp-6)',
        alignItems: 'start',
        width: '100%',
      }}
    >
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--sp-4)', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ color: 'var(--orange-600)', margin: 0 }}>Book a table</h1>
            <p style={{ margin: '6px 0 0 0', color: 'var(--text-muted)' }}>
              Pick a floor, choose a table, then choose an available date and time slot.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
            <Badge variant="success">{availableCountOnFloor} available</Badge>
            <Badge variant="info">{guests} guests</Badge>
          </div>
        </div>

        <Card variant="elevated">
          <Card.Content style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginRight: 'var(--sp-2)' }}>
              <Building2 size={18} color="var(--text-muted)" />
              <span style={{ fontWeight: 700, color: 'var(--text-heading)' }}>Choose floor</span>
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

        <Card variant="elevated" style={{ overflow: 'hidden', position: 'relative' }}>
          <Card.Header style={{ borderBottom: '1px solid var(--border-main)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--sp-3)', alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <Card.Title>Table map</Card.Title>
                <p style={{ margin: '4px 0 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
                  {selectedFloor != null ? `Viewing floor ${selectedFloor}` : 'No floor selected'} with {tablesOnSelectedFloor.length} tables.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
                <Badge variant="info">{tablesOnSelectedFloor.length} total</Badge>
                <Badge variant="success">{availableCountOnFloor} selectable</Badge>
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
                No tables on this floor.
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
                Checking table availability...
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
        <Card variant="elevated" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Card.Header style={{ borderBottom: '1px solid var(--border-main)' }}>
            <Card.Title style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Layers3 size={18} color="var(--orange-500)" />
              Booking details
            </Card.Title>
          </Card.Header>
          <Card.Content style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', flex: 1, overflowY: 'auto' }}>
            {selectedTable ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', minHeight: '100%' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--sp-2)', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 22, color: 'var(--text-heading)' }}>{selectedTable.name}</h3>
                    <div style={{ display: 'flex', gap: 'var(--sp-2)', marginTop: 8, flexWrap: 'wrap' }}>
                      <Badge variant={STATUS_VARIANTS[selectedTable.status]}>
                        {selectedTable.status}
                      </Badge>
                      <Badge variant="info">Floor {selectedTable.floor ?? '-'}</Badge>
                      {selectedTable.type === 'VIP' ? <Badge variant="warning">VIP</Badge> : null}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Max {selectedTable.capacity} guests</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--sp-3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 13, fontWeight: 600 }}>
                    <Calendar size={16} />
                    <span>Date window: today to +4 days</span>
                  </div>

                  <Input
                    type="date"
                    label="Booking date"
                    value={selectedDate}
                    min={getLocalDateString()}
                    max={maxBookingDate}
                    onChange={(event) => setSelectedDate(event.target.value)}
                  />

                  {bookingWindow ? (
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      Business hours {bookingWindow.businessHoursStart.slice(0, 5)} - {bookingWindow.businessHoursEnd.slice(0, 5)}.
                      Default duration {bookingWindow.defaultDurationMinutes} minutes.
                    </div>
                  ) : null}

                  <div>
                    <label className="input-label" style={{ marginBottom: 4, display: 'block' }}>Time</label>
                    <div className="input-container">
                      <Clock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 10 }} />
                      {timeSlotsLoading ? (
                        <div style={{ padding: '12px 14px 12px 34px', color: 'var(--text-muted)', fontSize: 14 }}>
                          Loading time slots...
                        </div>
                      ) : availableTimeSlots.length > 0 ? (
                        <select
                          className="input-field"
                          style={{ paddingLeft: 34 }}
                          value={selectedTime}
                          onChange={(event) => setSelectedTime(event.target.value)}
                        >
                          <option value="">Select a time</option>
                          {availableTimeSlots.map((slot) => (
                          <option key={slot.startTime} value={slotValue(slot)} disabled={!slot.available}>
                              {slotValue(slot)} - {slot.endTime.slice(11, 16)} {!slot.available ? `(${slot.reason})` : ''}
                          </option>
                          ))}
                        </select>
                      ) : (
                        <div style={{ padding: '12px 14px 12px 34px', color: 'var(--text-muted)', fontSize: 14 }}>
                          No available booking time for this day.
                        </div>
                      )}
                    </div>
                    {availableTimeSlots.length > 0 && !availableTimeSlots.some((slot) => slot.available) ? (
                      <div style={{ marginTop: 8, color: 'var(--text-muted)', fontSize: 13 }}>
                        No available booking time for this day.
                      </div>
                    ) : null}
                  </div>
                </div>

                <div>
                  <label className="input-label" style={{ marginBottom: 4, display: 'block' }}>Guests</label>
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

                <Input label="Name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Nguyen Van A" />
                <Input label="Phone" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="0901234567" />

                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                  {!user && (
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      You can book a table without signing in. Logging in helps save history and manage orders.
                    </div>
                  )}
                  <Button variant="primary" size="large" style={{ width: '100%', justifyContent: 'center' }} onClick={() => void submitBooking()}>
                    <CheckCircle size={18} />
                    Confirm booking
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ textAlign: 'center', padding: 'var(--sp-8)', color: 'var(--text-muted)', margin: 'auto 0' }}
              >
                <SelectIndicator />
                <p style={{ margin: 0 }}>Choose a table to continue with booking.</p>
              </motion.div>
            )}
          </Card.Content>
        </Card>
      </div>
    </motion.div>
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
