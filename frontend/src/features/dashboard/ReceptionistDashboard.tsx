import { useState, useEffect } from 'react';
import api from '../../services/api';
import type { ReservationDTO, TableDTO } from '../../services/types';
import { Calendar, Users, Clock, CheckCircle, XCircle, Search, Plus, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Button, Card, Badge, Input } from '../../components/ui';

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemAnim: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const TABLE_COLORS: Record<string, string> = {
  AVAILABLE: 'var(--green-500)',
  RESERVED: 'var(--yellow-500)',
  OCCUPIED: 'var(--red-500)',
  DIRTY: 'var(--gray-500)',
};

export const ReceptionistDashboard = () => {
  const [todayReservations, setTodayReservations] = useState<ReservationDTO[]>([]);
  const [tables, setTables] = useState<TableDTO[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReservation, setSelectedReservation] = useState<ReservationDTO | null>(null);

  useEffect(() => {
    fetchTodayReservations();
    fetchTables();
  }, []);

  const fetchTodayReservations = async () => {
    try {
      const res = await api.get('/reservations');
      if (res.data.data?.items) {
        const today = new Date().toDateString();
        const todayRes = res.data.data.items.filter((r: ReservationDTO) =>
          new Date(r.reservationTime).toDateString() === today
        );
        setTodayReservations(todayRes);
      }
    } catch (error) {
      console.error('Failed to fetch reservations:', error);
    }
  };

  const fetchTables = async () => {
    try {
      const res = await api.get('/tables');
      if (res.data.data?.items) {
        setTables(res.data.data.items);
      }
    } catch (error) {
      console.error('Failed to fetch tables:', error);
    }
  };

  const handleCheckIn = async (reservationId: string) => {
    try {
      await api.post(`/reservations/${reservationId}/check-in`);
      fetchTodayReservations();
      fetchTables();
    } catch (error) {
      console.error('Failed to check-in:', error);
    }
  };

  const handleCancel = async (reservationId: string) => {
    try {
      await api.post(`/reservations/${reservationId}/cancel`);
      fetchTodayReservations();
    } catch (error) {
      console.error('Failed to cancel:', error);
    }
  };

  const filteredReservations = todayReservations.filter(r =>
    r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.phone.includes(searchQuery)
  );

  const availableTables = tables.filter(t => t.status === 'AVAILABLE');
  const occupiedTables = tables.filter(t => t.status === 'OCCUPIED');
  const reservedTables = tables.filter(t => t.status === 'RESERVED');

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={itemAnim} className="page-header">
        <div>
          <h1 style={{ color: 'var(--orange-400)' }}>Reception Desk</h1>
          <p>Manage reservations and welcome guests</p>
        </div>
        <Button variant="primary" size="medium">
          <Plus size={16} /> Walk-in Reservation
        </Button>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={itemAnim} className="stats-grid">
        <Card variant="elevated">
          <Card.Content style={{ padding: 'var(--sp-5)' }}>
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(45, 212, 191, 0.15)' }}>
                <Calendar size={20} color="var(--teal)" />
              </div>
              <div className="stat-card-value">{todayReservations.length}</div>
              <div className="stat-card-label">Today's Reservations</div>
            </div>
          </Card.Content>
        </Card>
        <Card variant="elevated">
          <Card.Content style={{ padding: 'var(--sp-5)' }}>
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(34, 197, 94, 0.15)' }}>
                <MapPin size={20} color="var(--green-500)" />
              </div>
              <div className="stat-card-value">{availableTables.length}</div>
              <div className="stat-card-label">Available Tables</div>
            </div>
          </Card.Content>
        </Card>
        <Card variant="elevated">
          <Card.Content style={{ padding: 'var(--sp-5)' }}>
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(239, 68, 68, 0.15)' }}>
                <Users size={20} color="var(--red-500)" />
              </div>
              <div className="stat-card-value">{occupiedTables.length}</div>
              <div className="stat-card-label">Occupied Tables</div>
            </div>
          </Card.Content>
        </Card>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--sp-6)', marginTop: 'var(--sp-6)' }}>
        {/* Today's Reservations */}
        <motion.div variants={itemAnim}>
          <Card variant="elevated">
            <Card.Header>
              <div>
                <Card.Title>Today's Reservations</Card.Title>
                <Card.Description>Manage check-ins and cancellations</Card.Description>
              </div>
            </Card.Header>
            <Card.Content style={{ padding: 'var(--sp-4)' }}>
              <div style={{ marginBottom: 'var(--sp-4)' }}>
                <Input
                  placeholder="Search by name or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  icon={<Search size={18} />}
                />
              </div>

              {filteredReservations.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--sp-8)', color: 'var(--text-muted)' }}>
                  <Calendar size={48} style={{ marginBottom: 'var(--sp-3)', opacity: 0.3 }} />
                  <p>No reservations for today</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: 'var(--sp-3)' }}>
                  {filteredReservations.map(res => (
                    <div key={res.id} style={{
                      padding: 'var(--sp-4)',
                      borderRadius: 'var(--r-md)',
                      background: selectedReservation?.id === res.id ? 'rgba(212, 175, 55, 0.1)' : 'var(--bg-secondary)',
                      border: selectedReservation?.id === res.id ? '1px solid var(--orange-500)' : '1px solid transparent',
                      cursor: 'pointer'
                    }} onClick={() => setSelectedReservation(res)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-3)' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-heading)', marginBottom: '4px', fontSize: 'var(--text-base)' }}>
                            {res.customerName}
                          </div>
                          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', display: 'flex', gap: 'var(--sp-3)', alignItems: 'center' }}>
                            <span><Clock size={12} /> {new Date(res.reservationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span><Users size={12} /> {res.numberOfGuests} guests</span>
                          </div>
                        </div>
                        <Badge variant={res.status === 'RESERVED' ? 'success' : res.status === 'PENDING' ? 'warning' : 'info'} size="small">
                          {res.status}
                        </Badge>
                      </div>
                      {res.status === 'RESERVED' && (
                        <div style={{ display: 'flex', gap: 'var(--sp-2)', marginTop: 'var(--sp-3)' }}>
                          <Button variant="primary" size="small" onClick={() => handleCheckIn(res.id)}>
                            <CheckCircle size={14} /> Check In
                          </Button>
                          <Button variant="ghost" size="small" onClick={() => handleCancel(res.id)}>
                            <XCircle size={14} /> Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card.Content>
          </Card>
        </motion.div>

        {/* Table Map Overview */}
        <motion.div variants={itemAnim}>
          <Card variant="elevated">
            <Card.Header>
              <Card.Title>Table Map</Card.Title>
              <Card.Description>Real-time table status</Card.Description>
            </Card.Header>
            <Card.Content style={{ padding: 'var(--sp-4)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--sp-3)' }}>
                {tables.slice(0, 12).map(table => (
                  <div key={table.id} style={{
                    padding: 'var(--sp-3)',
                    borderRadius: 'var(--r-md)',
                    background: `${TABLE_COLORS[table.status]}15`,
                    border: `2px solid ${TABLE_COLORS[table.status]}`,
                    textAlign: 'center'
                  }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-heading)', fontSize: 'var(--text-sm)', marginBottom: '4px' }}>
                      {table.name}
                    </div>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: TABLE_COLORS[table.status], margin: '0 auto' }} />
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 'var(--sp-4)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', fontSize: 'var(--text-sm)' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--green-500)' }} />
                  <span>Available ({availableTables.length})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', fontSize: 'var(--text-sm)' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--yellow-500)' }} />
                  <span>Reserved ({reservedTables.length})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', fontSize: 'var(--text-sm)' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--red-500)' }} />
                  <span>Occupied ({occupiedTables.length})</span>
                </div>
              </div>
            </Card.Content>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};
