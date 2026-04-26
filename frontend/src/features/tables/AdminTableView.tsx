import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import type { TableDTO } from '../../services/types';
import { FloorPlan } from './FloorPlan';
import { Card, Button, Input, Badge, Select } from '../../components/ui';
import { Save, Plus, Trash2, Move, AlertTriangle, Building2 } from 'lucide-react';
import { toast } from '../../store/toastStore';

export const AdminTableView = () => {
  const [tables, setTables] = useState<TableDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [availableFloors, setAvailableFloors] = useState<number[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableDTO | null>(null);

  const fetchTables = async (floor?: number) => {
    try {
      const url = floor !== null && floor !== undefined ? `/tables?floor=${floor}` : '/tables';
      const res = await api.get(url);
      setTables(res.data.data || []);
    } catch { console.error('Failed'); }
    finally { setLoading(false); }
  };

  const fetchFloors = async () => {
    try {
      const res = await api.get('/tables/floors');
      const floors = res.data.data || [1, 2];
      setAvailableFloors(floors);
      if (floors.length > 0 && selectedFloor === null) {
        setSelectedFloor(floors[0]);
      }
    } catch {
      console.error('Failed to fetch floors');
      setAvailableFloors([1, 2]);
      setSelectedFloor(1);
    }
  };

  useEffect(() => {
    fetchFloors();
    fetchTables();
  }, []);

  useEffect(() => {
    if (selectedFloor !== null) {
      fetchTables(selectedFloor);
    }
  }, [selectedFloor]);

  const renderFloorPlan = () => {
    return <FloorPlan tables={tables} selectedId={selectedTable?.id} onTableClick={(t) => setSelectedTable(t)} />;
  };

  return (
    <div style={{ display: 'flex', height: '100%', gap: 'var(--sp-6)' }}>
      {/* Floor Plan */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
            <div>
              <h1 style={{ color: 'var(--orange-600)', margin: 0 }}>Table Layout (View Only)</h1>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>Tables are fixed and cannot be modified.</p>
            </div>
            {/* Floor Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginLeft: 'var(--sp-4)' }}>
              <Building2 size={18} color="var(--text-muted)" />
              <select
                value={selectedFloor ?? ''}
                onChange={(e) => setSelectedFloor(e.target.value ? Number(e.target.value) : null)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--r-md)',
                  border: '1px solid var(--border-main)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <option value="">All Floors</option>
                {availableFloors.map(floor => (
                  <option key={floor} value={floor}>Floor {floor}</option>
                ))}
                <option value="vip">VIP Room</option>
              </select>
            </div>
          </div>
        </div>

        <Card variant="elevated" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ background: 'var(--blue-50)', padding: '8px 16px', color: 'var(--blue-600)', fontSize: 13, fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--sp-2)', borderBottom: '1px solid var(--blue-200)' }}>
            <AlertTriangle size={16} />
            Tables are fixed and cannot be added, removed, or modified.
          </div>
          {renderFloorPlan()}
        </Card>
      </div>

      {/* Info Panel */}
      <div style={{ width: 340, display: 'flex', flexDirection: 'column' }}>
        <Card variant="elevated" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
           <Card.Header style={{ borderBottom: '1px solid var(--border-main)' }}>
              <Card.Title>Table Information</Card.Title>
           </Card.Header>

           <Card.Content style={{ flex: 1, overflowY: 'auto' }}>
              {selectedTable ? (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
                    <h3 style={{ fontSize: 18, borderBottom: '1px solid var(--gray-200)', paddingBottom: 8, margin: '0 0 16px 0' }}>Table Details</h3>

                    <Input label="Table Name / Number" value={selectedTable.name} readOnly />
                    <Input label="Capacity (Seats)" type="number" value={selectedTable.capacity.toString()} readOnly />

                    <div style={{ marginTop: 16 }}>
                       <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-heading)', display: 'block', marginBottom: 4 }}>Status</label>
                       <Badge variant="neutral">{selectedTable.status}</Badge>
                    </div>
                    {selectedTable.floor && (
                      <div style={{ marginTop: 8 }}>
                         <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-heading)', display: 'block', marginBottom: 4 }}>Floor</label>
                         <Badge variant="info">Floor {selectedTable.floor}{selectedTable.floorName ? ` - ${selectedTable.floorName}` : ''}</Badge>
                      </div>
                    )}
                    {selectedTable.zone && (
                      <div style={{ marginTop: 8 }}>
                         <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-heading)', display: 'block', marginBottom: 4 }}>Zone</label>
                         <Badge variant="info">{selectedTable.zone}</Badge>
                      </div>
                    )}
                    {selectedTable.isVipRoom && (
                      <div style={{ marginTop: 8 }}>
                         <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-heading)', display: 'block', marginBottom: 4 }}>Type</label>
                         <Badge variant="success">VIP Room</Badge>
                      </div>
                    )}
                 </div>
              ) : (
                 <div style={{ textAlign: 'center', padding: 'var(--sp-8)', color: 'var(--text-muted)' }}>
                    <SelectIndicator />
                    <p>Select a table to view details</p>
                 </div>
              )}
           </Card.Content>
        </Card>
      </div>
    </div>
  );
};

const SelectIndicator = () => (
  <div style={{ width: 64, height: 64, border: '2px dashed var(--gray-400)', borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
     <div style={{ width: 8, height: 8, background: 'var(--gray-400)', borderRadius: '50%' }} />
  </div>
);
