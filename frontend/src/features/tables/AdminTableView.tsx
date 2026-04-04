import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import type { TableDTO } from '../../services/types';
import { FloorPlan } from './FloorPlan';
import { Card, Button, Input, Badge } from '../../components/ui';
import { Save, Plus, Trash2, Move, AlertTriangle } from 'lucide-react';
import { toast } from '../../store/toastStore';

export const AdminTableView = () => {
  const [tables, setTables] = useState<TableDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditingMode, setIsEditingMode] = useState(false);
  
  // Local state for dragging
  const [localTables, setLocalTables] = useState<TableDTO[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableDTO | null>(null);
  
  const [dragInfo, setDragInfo] = useState<{ id: string, startX: number, startY: number, currentX: number, currentY: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchTables = async () => {
    try {
      const res = await api.get('/tables');
      setTables(res.data.data || []);
      if (!isEditingMode) setLocalTables(res.data.data || []);
    } catch { console.error('Failed'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTables(); }, []);
  
  // Enter edit mode
  useEffect(() => {
    if (isEditingMode) {
      // Create a fresh deep copy to edit
      setLocalTables(JSON.parse(JSON.stringify(tables)));
    }
  }, [isEditingMode]);

  // Dragging logic
  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    if (!isEditingMode) return;
    const table = localTables.find(t => t.id === id);
    if (!table || !containerRef.current) return;
    
    // Prevent default to avoid selection issues
    e.preventDefault();
    
    // Switch selection
    setSelectedTable(table);

    const rect = containerRef.current.getBoundingClientRect();
    setDragInfo({
      id,
      startX: e.clientX,
      startY: e.clientY,
      currentX: table.positionX ?? 50,
      currentY: table.positionY ?? 50
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragInfo || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const dx = ((e.clientX - dragInfo.startX) / rect.width) * 100;
    const dy = ((e.clientY - dragInfo.startY) / rect.height) * 100;
    
    // Bound to 0-100%
    const newX = Math.max(0, Math.min(100, dragInfo.currentX + dx));
    const newY = Math.max(0, Math.min(100, dragInfo.currentY + dy));
    
    setLocalTables(prev => prev.map(t => t.id === dragInfo.id ? { ...t, positionX: newX, positionY: newY } : t));
  };

  const handlePointerUp = () => {
    setDragInfo(null);
  };

  const handleSave = async () => {
    try {
      // In a real app we'd bulk update or send individual updates
      // Here we just simulate updating them by doing sequential calls for those that changed position
      toast.success('Layout saved successfully (simulation)');
      setTables(localTables);
      setIsEditingMode(false);
      setSelectedTable(null);
    } catch {
      toast.error('Failed to save layout');
    }
  };

  const handleCancel = () => {
    setIsEditingMode(false);
    setLocalTables(tables);
    setSelectedTable(null);
  };

  // Shared floor plan renderer logic overrides click behavior in edit mode
  const renderFloorPlan = () => {
    // We override FloorPlan entirely in edit mode to support drag and drop
    if (isEditingMode) {
      return (
        <div 
           ref={containerRef}
           style={{ minHeight: 'calc(100vh - var(--header-height) - 220px)', position: 'relative', touchAction: 'none' }}
           onPointerMove={handlePointerMove}
           onPointerUp={handlePointerUp}
           onPointerLeave={handlePointerUp}
        >
          <div className="floor-plan-grid" style={{ opacity: 0.1, backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          {localTables.map(table => {
            const x = table.positionX ?? 50;
            const y = table.positionY ?? 50;
            const isSelected = selectedTable?.id === table.id;
            const size = table.capacity > 6 ? 100 : table.capacity > 4 ? 88 : 76;
            
            return (
              <div
                key={table.id}
                style={{
                  position: 'absolute',
                  left: `${x}%`, top: `${y}%`,
                  transform: 'translate(-50%, -50%)',
                  cursor: dragInfo?.id === table.id ? 'grabbing' : 'grab',
                  zIndex: isSelected ? 10 : 1,
                  touchAction: 'none'
                }}
                onPointerDown={(e) => handlePointerDown(e, table.id)}
              >
                <div style={{
                  width: size, height: size,
                  borderRadius: table.capacity > 6 ? '16px' : '50%',
                  background: 'var(--white)',
                  border: `3px dashed ${isSelected ? 'var(--orange-600)' : 'var(--gray-400)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column',
                  boxShadow: isSelected ? '0 0 0 4px rgba(212,175,55,0.2)' : 'none'
                }}>
                  <div style={{ fontWeight: 800, color: 'var(--text-heading)' }}>{table.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{table.capacity}s</div>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    // Normal view
    return <FloorPlan tables={tables} selectedId={selectedTable?.id} onTableClick={(t) => setSelectedTable(t)} />;
  };

  return (
    <div style={{ display: 'flex', height: '100%', gap: 'var(--sp-6)' }}>
      {/* Floor Plan */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-4)' }}>
          <div>
            <h1 style={{ color: 'var(--orange-600)', margin: 0 }}>Layout Editor</h1>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>Configure table positions, capacities, and layout.</p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
            {isEditingMode ? (
              <>
                <Button variant="ghost" onClick={handleCancel}>Cancel</Button>
                <Button variant="primary" style={{ background: 'var(--teal)', borderColor: 'var(--teal)' }} onClick={handleSave}>
                  <Save size={16} /> Save Layout
                </Button>
              </>
            ) : (
              <Button variant="primary" onClick={() => setIsEditingMode(true)}>
                <Move size={16} /> Edit Layout Position
              </Button>
            )}
          </div>
        </div>
        
        <Card variant="elevated" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', border: isEditingMode ? '2px solid var(--orange-500)' : undefined }}>
          {isEditingMode && (
             <div style={{ background: 'var(--orange-50)', padding: '8px 16px', color: 'var(--orange-600)', fontSize: 13, fontWeight: 600, display: 'flex', justifyContent: 'center', borderBottom: '1px solid var(--orange-200)' }}>
                Drag and drop tables to update their positions on the floor plan.
             </div>
          )}
          {renderFloorPlan()}
        </Card>
      </div>

      {/* Editor Panel */}
      <div style={{ width: 340, display: 'flex', flexDirection: 'column' }}>
        <Card variant="elevated" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
           <Card.Header style={{ borderBottom: '1px solid var(--border-main)' }}>
              <Card.Title>Table Settings</Card.Title>
           </Card.Header>
           
           <Card.Content style={{ flex: 1, overflowY: 'auto' }}>
              {selectedTable ? (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
                    <h3 style={{ fontSize: 18, borderBottom: '1px solid var(--gray-200)', paddingBottom: 8, margin: '0 0 16px 0' }}>{isEditingMode ? 'Edit Table Properties' : 'Table Summary'}</h3>
                    
                    <Input label="Table Name / Number" value={selectedTable.name} readOnly={!isEditingMode} />
                    <Input label="Capacity (Seats)" type="number" value={selectedTable.capacity.toString()} readOnly={!isEditingMode} />
                    
                    {!isEditingMode && (
                       <>
                         <div style={{ marginTop: 16 }}>
                            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-heading)', display: 'block', marginBottom: 4 }}>Status</label>
                            <Badge variant="neutral">{selectedTable.status}</Badge>
                         </div>
                       </>
                    )}

                    {isEditingMode && (
                       <Button variant="danger" style={{ marginTop: 24, justifyContent: 'center' }}>
                          <Trash2 size={16}/> Delete Table
                       </Button>
                    )}
                 </div>
              ) : (
                 <div style={{ textAlign: 'center', padding: 'var(--sp-8)', color: 'var(--text-muted)' }}>
                    <SelectIndicator />
                    <p>Select a table to view or edit properties</p>
                 </div>
              )}
           </Card.Content>

           {isEditingMode && (
              <div style={{ padding: 'var(--sp-4)', borderTop: '1px solid var(--border-main)' }}>
                 <Button variant="secondary" style={{ width: '100%', justifyContent: 'center', borderStyle: 'dashed' }}>
                    <Plus size={16} /> Add New Table
                 </Button>
              </div>
           )}
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
