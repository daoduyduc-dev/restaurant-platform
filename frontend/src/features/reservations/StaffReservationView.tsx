import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import type { BookingWindowDTO, ReservationDTO, TableDTO } from '../../services/types';
import { useWebSocket } from '../../services/useWebSocket';
import { Calendar, Users, CheckCircle, XCircle, Search, MapPin, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, Badge, Button, Input, Modal } from '../../components/ui';
import { toast } from '../../store/toastStore';
import i18n from '../../i18n';
import { addDaysToLocalDateString, combineLocalDateAndTime, getLocalDateString } from '../../utils/dates';

const slotValue = (slot: { startTime: string }) => slot.startTime.slice(11, 16);

export const StaffReservationView = () => {
  const { t } = useTranslation();
  const [reservations, setReservations] = useState<ReservationDTO[]>([]);
  const [tables, setTables] = useState<TableDTO[]>([]);
  const [search, setSearch] = useState('');
  const [filterDate, setFilterDate] = useState(getLocalDateString());
  const [filterStatus, setFilterStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    numberOfGuests: 2,
    tableId: '',
  });
  const [bookingDate, setBookingDate] = useState(getLocalDateString());
  const [bookingWindow, setBookingWindow] = useState<BookingWindowDTO | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [timeSlotsLoading, setTimeSlotsLoading] = useState(false);
  const maxBookingDate = addDaysToLocalDateString(getLocalDateString(), 4);

  const fetchData = async () => {
    try {
      const [rRes, tRes] = await Promise.all([
        api.get('/reservations?size=100'),
        api.get('/tables'),
      ]);
      const resItems = rRes.data.data?.items || rRes.data.data || [];
      setReservations(Array.isArray(resItems) ? resItems : []);
      setTables(tRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch reservations or tables:', error);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  useWebSocket<any>('/topic/reservations', () => fetchData());

  useEffect(() => {
    if (!isModalOpen || !formData.tableId) {
      setSelectedTime('');
      setBookingWindow(null);
      return;
    }

    const loadSlots = async () => {
      setTimeSlotsLoading(true);

      try {
        const response = await api.get(`/reservations/table/${formData.tableId}/booking-window`, {
          params: {
            date: bookingDate,
            numberOfGuests: formData.numberOfGuests,
          },
        });

        const windowData = response.data.data as BookingWindowDTO;
        const slots = windowData?.availableSlots || [];

        setBookingWindow(windowData);
        setSelectedTime((current) => (
          slots.some((slot) => slot.available && slotValue(slot) === current)
            ? current
            : slots.find((slot) => slot.available)?.startTime.slice(11, 16) || ''
        ));
      } catch (error) {
        console.error('Failed to load available time slots:', error);
        setBookingWindow(null);
        setSelectedTime('');
      } finally {
        setTimeSlotsLoading(false);
      }
    };

    void loadSlots();
  }, [bookingDate, formData.numberOfGuests, formData.tableId, isModalOpen]);

  const handleCreate = async () => {
    if (!formData.tableId) {
      toast.error('Please select a table.');
      return;
    }

    if (!selectedTime) {
      toast.error('Please choose a booking time.');
      return;
    }

    const selectedSlot = (bookingWindow?.availableSlots || []).find((slot) => slotValue(slot) === selectedTime);
    if (!selectedSlot?.available) {
      toast.error('Selected time slot is not available.');
      return;
    }

    try {
      await api.post('/reservations', {
        customerName: formData.customerName,
        phone: formData.phone,
        startTime: combineLocalDateAndTime(bookingDate, selectedTime),
        numberOfGuests: formData.numberOfGuests,
        tableId: formData.tableId,
      });
      toast.success(t('reservations.created'));
      setIsModalOpen(false);
      setFormData({ customerName: '', phone: '', numberOfGuests: 2, tableId: '' });
      setSelectedTime('');
      setBookingDate(getLocalDateString());
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('reservations.createError'));
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      if (status === 'CHECKED_IN') {
        await api.post(`/reservations/${id}/check-in`);
      } else if (status === 'CANCELLED') {
        await api.post(`/reservations/${id}/cancel`);
      } else {
        await api.patch(`/reservations/${id}/status?status=${status}`);
      }
      toast.success(t('reservations.updatedTo', { status }));
      fetchData();
    } catch {
      toast.error(t('reservations.updateError'));
    }
  };

  const todayStr = getLocalDateString();

  const filtered = reservations
    .filter((r) => {
      const start = r.startTime || r.reservationTime;
      if (filterDate && !start.startsWith(filterDate)) return false;

      if (filterStatus && r.status !== filterStatus) return false;

      if (search) {
        const searchLower = search.toLowerCase();
        return r.customerName.toLowerCase().includes(searchLower) || r.phone.includes(search);
      }

      return true;
    })
    .sort((a, b) => new Date((a.startTime || a.reservationTime)).getTime() - new Date((b.startTime || b.reservationTime)).getTime());

  const todayRes = reservations.filter((r) => (r.startTime || r.reservationTime).startsWith(todayStr));
  const pendingCount = todayRes.filter((r) => r.status === 'PENDING').length;
  const checkedInCount = todayRes.filter((r) => r.status === 'CHECKED_IN').length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="page-header">
        <div>
          <h1 style={{ color: 'var(--orange-600)' }}><Calendar size={28} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} /> {t('reservations.title')}</h1>
          <p>{t('reservations.subtitle')}</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
          <Button variant="secondary" onClick={() => window.location.href = '/app/tables'}><MapPin size={16} /> {t('reservations.viewFloorPlan')}</Button>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}><Calendar size={16} /> {t('reservations.addBooking')}</Button>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 'var(--sp-6)' }}>
        <Card variant="elevated">
          <Card.Content style={{ padding: 'var(--sp-5)' }}>
            <div className="stat-card">
              <div className="stat-card-value">{todayRes.length}</div>
              <div className="stat-card-label">{t('reservations.totalToday')}</div>
            </div>
          </Card.Content>
        </Card>
        <Card variant="elevated">
          <Card.Content style={{ padding: 'var(--sp-5)' }}>
            <div className="stat-card">
              <div className="stat-card-value" style={{ color: 'var(--orange-500)' }}>{pendingCount}</div>
              <div className="stat-card-label">{t('reservations.pendingArrival')}</div>
            </div>
          </Card.Content>
        </Card>
        <Card variant="elevated">
          <Card.Content style={{ padding: 'var(--sp-5)' }}>
            <div className="stat-card">
              <div className="stat-card-value" style={{ color: 'var(--teal)' }}>{checkedInCount}</div>
              <div className="stat-card-label">{t('reservations.seatedCurrently')}</div>
            </div>
          </Card.Content>
        </Card>
      </div>

      <Card variant="elevated">
        <Card.Header>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: 'var(--sp-3)' }}>
            <Card.Title>{t('reservations.allReservations')}</Card.Title>
            <div style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'center' }}>
              <Input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                style={{ width: 160 }}
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{ padding: '8px 12px', border: '1px solid var(--border-main)', borderRadius: 'var(--r-sm)', fontSize: '14px' }}
              >
                <option value="">{t('reservations.allStatus')}</option>
                <option value="PENDING">PENDING</option>
                <option value="RESERVED">RESERVED</option>
                <option value="CHECKED_IN">CHECKED_IN</option>
                <option value="CANCELLED">CANCELLED</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
              <Input
                placeholder={t('reservations.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={<Search size={16} />}
                style={{ width: 220, paddingLeft: '36px' }}
              />
            </div>
          </div>
        </Card.Header>
        <Card.Content style={{ padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('reservations.guestName')}</th><th>{t('reservations.phone')}</th><th>{t('reservations.dateTime')}</th><th>{t('reservations.partySize')}</th><th>{t('reservations.table')}</th><th>{t('reservations.status')}</th><th>{t('reservations.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((res) => {
                const start = new Date(res.startTime || res.reservationTime);
                const end = new Date(res.endTime || res.startTime || res.reservationTime);
                return (
                  <tr key={res.id}>
                    <td style={{ fontWeight: 600 }}>{res.customerName}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{res.phone}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>
                        {start.toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{start.toLocaleDateString(i18n.language)}</div>
                    </td>
                    <td>{res.numberOfGuests} {t('reservations.guests')}</td>
                    <td>{res.tableName || '—'}</td>
                    <td>
                      <Badge variant={res.status === 'PENDING' ? 'warning' : res.status === 'CHECKED_IN' ? 'success' : res.status === 'CANCELLED' ? 'error' : 'neutral'}>{res.status}</Badge>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {res.status === 'PENDING' && (
                          <>
                            <Button variant="primary" size="small" onClick={() => updateStatus(res.id, 'CHECKED_IN')}><CheckCircle size={14} /> {t('reservations.checkIn')}</Button>
                            <Button variant="danger" size="small" onClick={() => updateStatus(res.id, 'CANCELLED')}><XCircle size={14} /> {t('common.cancel')}</Button>
                          </>
                        )}
                        {res.status === 'RESERVED' && (
                          <>
                            <Button variant="primary" size="small" onClick={() => updateStatus(res.id, 'CHECKED_IN')}><CheckCircle size={14} /> {t('reservations.checkIn')}</Button>
                            <Button variant="danger" size="small" onClick={() => updateStatus(res.id, 'CANCELLED')}><XCircle size={14} /> {t('common.cancel')}</Button>
                          </>
                        )}
                        {res.status === 'CHECKED_IN' && (
                          <Button variant="primary" size="small" onClick={() => updateStatus(res.id, 'COMPLETED')}>{t('reservations.closeReservation')}</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card.Content>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t('reservations.newReservation')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          <Input label={t('reservations.customerName')} value={formData.customerName} onChange={(e) => setFormData({ ...formData, customerName: e.target.value })} />
          <Input label={t('reservations.phoneNumber')} value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, display: 'block' }}>{t('reservations.reservationTime')}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: 'var(--text-muted)', fontSize: 13 }}>
              <Clock size={14} />
              <span>Date range: today to +4 days</span>
            </div>
            <Input
              type="date"
              label="Booking date"
              value={bookingDate}
              min={getLocalDateString()}
              max={maxBookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
            />
            {bookingWindow ? (
              <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 8 }}>
                Business hours {bookingWindow.businessHoursStart.slice(0, 5)} - {bookingWindow.businessHoursEnd.slice(0, 5)}.
                Default duration {bookingWindow.defaultDurationMinutes} minutes.
              </div>
            ) : null}
            <div className="input-container">
              <Clock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 10 }} />
              {timeSlotsLoading ? (
                <div style={{ padding: '12px 14px 12px 34px', color: 'var(--text-muted)', fontSize: 14 }}>
                  Loading time slots...
                </div>
              ) : (bookingWindow?.availableSlots || []).length > 0 ? (
                <select
                  className="input-field"
                  style={{ paddingLeft: 34 }}
                  value={selectedTime}
                  onChange={(event) => setSelectedTime(event.target.value)}
                >
                  <option value="">Select a time</option>
                  {(bookingWindow?.availableSlots || []).map((slot) => (
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
            {(bookingWindow?.availableSlots || []).length > 0 && !(bookingWindow?.availableSlots || []).some((slot) => slot.available) ? (
              <div style={{ marginTop: 8, color: 'var(--text-muted)', fontSize: 13 }}>
                No available booking time for this day.
              </div>
            ) : null}
          </div>

          <Input type="number" label={t('reservations.numberOfGuests')} value={String(formData.numberOfGuests)} onChange={(e) => setFormData({ ...formData, numberOfGuests: Number.parseInt(e.target.value, 10) || 1 })} />

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, display: 'block' }}>{t('reservations.assignTable')}</label>
            <select
              value={formData.tableId}
              onChange={(e) => setFormData({ ...formData, tableId: e.target.value })}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-main)', borderRadius: 'var(--r-sm)' }}
            >
              <option value="">{t('reservations.noTable')}</option>
              {tables.map((table) => (
                <option key={table.id} value={table.id}>
                  {table.name} ({table.capacity} seats) - {t(`status.${table.status}`)}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--sp-3)', marginTop: 'var(--sp-4)' }}>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>{t('common.cancel')}</Button>
            <Button variant="primary" onClick={handleCreate}>{t('reservations.saveBooking')}</Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};
