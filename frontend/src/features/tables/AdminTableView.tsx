import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { TableDTO, TableType } from '../../services/types';
import { Card, Button, Input, Badge, Modal, Select } from '../../components/ui';
import { Building2, Crown, Layers3, MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from '../../store/toastStore';
import { FloorPlanEditor } from './FloorPlanEditor';
import { getTableCanvasRect } from './editor/layout';
import { useTableEditorStore, validateTableEditorForm } from './tableEditorStore';
import { QrCode } from 'lucide-react';

const STATUS_VARIANTS: Record<TableDTO['status'], 'success' | 'warning' | 'error' | 'neutral'> = {
  AVAILABLE: 'success',
  RESERVED: 'warning',
  OCCUPIED: 'error',
  DIRTY: 'neutral',
};

const vipBadgeStyle = {
  background: 'linear-gradient(135deg, #FEF3C7, #FCD34D)',
  color: '#7C5A00',
  border: '1px solid rgba(180, 140, 40, 0.8)',
};

export const AdminTableView = () => {
  const { t } = useTranslation();
  const tables = useTableEditorStore((state) => state.tables);
  const loading = useTableEditorStore((state) => state.loading);
  const saving = useTableEditorStore((state) => state.saving);
  const availableFloors = useTableEditorStore((state) => state.availableFloors);
  const selectedFloor = useTableEditorStore((state) => state.selectedFloor);
  const typeFilter = useTableEditorStore((state) => state.typeFilter);
  const selectedTableId = useTableEditorStore((state) => state.selectedTableId);
  const isModalOpen = useTableEditorStore((state) => state.isModalOpen);
  const formState = useTableEditorStore((state) => state.formState);
  const loadTables = useTableEditorStore((state) => state.loadTables);
  const setSelectedFloor = useTableEditorStore((state) => state.setSelectedFloor);
  const setTypeFilter = useTableEditorStore((state) => state.setTypeFilter);
  const setSelectedTableId = useTableEditorStore((state) => state.setSelectedTableId);
  const openCreateModal = useTableEditorStore((state) => state.openCreateModal);
  const openEditModal = useTableEditorStore((state) => state.openEditModal);
  const closeModal = useTableEditorStore((state) => state.closeModal);
  const updateForm = useTableEditorStore((state) => state.updateForm);
  const updateTablePosition = useTableEditorStore((state) => state.updateTablePosition);
  const commitTablePosition = useTableEditorStore((state) => state.commitTablePosition);
  const saveTable = useTableEditorStore((state) => state.saveTable);
  const deleteTable = useTableEditorStore((state) => state.deleteTable);
  const tableTypeOptions = [
    { label: t('adminTable.allTypes'), value: 'ALL' },
    { label: t('adminTable.normal'), value: 'NORMAL' },
    { label: t('adminTable.vip'), value: 'VIP' },
  ];
  const tableEditTypeOptions = [
    { label: t('adminTable.normal'), value: 'NORMAL' },
    { label: t('adminTable.vip'), value: 'VIP' },
  ];

  useEffect(() => {
    loadTables().catch((error) => {
      console.error('Failed to fetch tables', error);
      toast.error(t('adminTable.loadError'));
    });
  }, [loadTables]);

  const filteredTables = tables.filter((table) => typeFilter === 'ALL' || table.type === typeFilter);
  const tablesOnSelectedFloor = selectedFloor == null
    ? filteredTables
    : filteredTables.filter((table) => table.floor === selectedFloor);
  const selectedTable = tables.find((table) => table.id === selectedTableId) ?? null;
  const selectedTableIndex = selectedTable
    ? tables.findIndex((table) => table.id === selectedTable.id)
    : -1;
  const selectedTableCanvasRect = selectedTable && selectedTableIndex >= 0
    ? getTableCanvasRect(selectedTable, selectedTableIndex)
    : null;
  const groupedTables = availableFloors
    .map((floor) => ({
      floor,
      tables: filteredTables.filter((table) => table.floor === floor),
    }))
    .filter((group) => group.tables.length > 0);

  const handleTablePositionCommit = async (tableId: string) => {
    try {
      await commitTablePosition(tableId);
    } catch (error) {
      console.error('Failed to persist table position', error);
      toast.error(t('adminTable.savePositionError'));
    }
  };

  const handleSaveTable = async () => {
    const validationError = validateTableEditorForm(formState);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const isEditing = !!formState.id;

    try {
      await saveTable();
      toast.success(isEditing ? t('adminTable.updated') : t('adminTable.created'));
    } catch (error) {
      console.error('Failed to save table', error);
      toast.error(t('adminTable.saveError'));
    }
  };

  const handleDeleteTable = async (table: TableDTO) => {
    if (!window.confirm(t('adminTable.confirmDelete', { name: table.name }))) {
      return;
    }

    try {
      await deleteTable(table.id);
      toast.success(t('adminTable.deleted'));
    } catch (error) {
      console.error('Failed to delete table', error);
      toast.error(t('adminTable.deleteError'));
    }
  };

  const vipCount = tables.filter((table) => table.type === 'VIP').length;
  const normalCount = tables.filter((table) => table.type === 'NORMAL').length;

  return (
    <div style={{ display: 'flex', gap: 'var(--sp-6)', alignItems: 'stretch' }}>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--sp-4)', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ color: 'var(--orange-600)', margin: 0 }}>{t('adminTable.title')}</h1>
            <p style={{ margin: '6px 0 0 0', color: 'var(--text-muted)' }}>
              {t('adminTable.subtitle')}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'center', flexWrap: 'wrap' }}>
            <Select
              label={t('adminTable.tableType')}
              options={tableTypeOptions}
              value={typeFilter}
              onChange={(value) => setTypeFilter(value as 'ALL' | TableType)}
            />
            <Button variant="primary" onClick={openCreateModal}>
              <Plus size={16} />
              {t('adminTable.addTable')}
            </Button>
          </div>
        </div>

        <Card variant="elevated">
          <Card.Content style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginRight: 'var(--sp-2)' }}>
              <Building2 size={18} color="var(--text-muted)" />
              <span style={{ fontWeight: 700, color: 'var(--text-heading)' }}>{t('adminTable.floorTabs')}</span>
            </div>
            {availableFloors.map((floor) => (
              <Button
                key={floor}
                variant={selectedFloor === floor ? 'primary' : 'ghost'}
                size="small"
                onClick={() => setSelectedFloor(floor)}
              >
                {t('adminTable.floor')} {floor}
              </Button>
            ))}
          </Card.Content>
        </Card>

        <Card variant="elevated" style={{ overflow: 'hidden' }}>
          <Card.Header style={{ borderBottom: '1px solid var(--border-main)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--sp-3)', alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <Card.Title>{t('adminTable.floorLayout')}</Card.Title>
                <p style={{ margin: '4px 0 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
                  {selectedFloor != null ? t('adminTable.showingFloor', { floor: selectedFloor }) : t('adminTable.noFloor')} {t('adminTable.withTables', { count: tablesOnSelectedFloor.length })}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
                <Badge variant="info">{tables.length} {t('adminTable.total')}</Badge>
                <Badge variant="neutral">{normalCount} {t('adminTable.normal')}</Badge>
                <Badge variant="warning" style={vipBadgeStyle}>{vipCount} {t('adminTable.vip')}</Badge>
              </div>
            </div>
          </Card.Header>
          <Card.Content style={{ padding: 0 }}>
            {loading ? (
              <div style={{ padding: 'var(--sp-8)', textAlign: 'center', color: 'var(--text-muted)' }}>{t('adminTable.loading')}</div>
            ) : tablesOnSelectedFloor.length > 0 ? (
              <FloorPlanEditor
                tables={tablesOnSelectedFloor}
                selectedId={selectedTableId}
                onTableSelect={(table) => setSelectedTableId(table?.id ?? null)}
                onTablePositionChange={updateTablePosition}
                onTablePositionCommit={(tableId) => void handleTablePositionCommit(tableId)}
                minHeight="520px"
              />
            ) : (
              <div style={{ padding: 'var(--sp-8)', textAlign: 'center', color: 'var(--text-muted)' }}>
                {t('adminTable.noMatchingTables')}
              </div>
            )}
          </Card.Content>
        </Card>

        <Card variant="elevated">
          <Card.Header style={{ borderBottom: '1px solid var(--border-main)' }}>
            <Card.Title style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Layers3 size={18} color="var(--orange-500)" />
              {t('adminTable.groupedList')}
            </Card.Title>
          </Card.Header>
          <Card.Content style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
            {groupedTables.length === 0 ? (
              <div style={{ color: 'var(--text-muted)' }}>{t('adminTable.noGroupedTables')}</div>
            ) : (
              groupedTables.map((group) => (
                <section key={group.floor} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--sp-2)' }}>
                    <h3 style={{ margin: 0, fontSize: 16, color: 'var(--text-heading)' }}>{t('adminTable.floor')} {group.floor}</h3>
                    <Badge variant="info">{group.tables.length} {t('adminTable.tables')}</Badge>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--sp-3)' }}>
                    {group.tables.map((table) => (
                      <div
                        key={table.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          setSelectedFloor(table.floor ?? selectedFloor);
                          setSelectedTableId(table.id);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            setSelectedFloor(table.floor ?? selectedFloor);
                            setSelectedTableId(table.id);
                          }
                        }}
                        style={{
                          textAlign: 'left',
                          padding: 'var(--sp-4)',
                          borderRadius: 'var(--r-lg)',
                          border: selectedTableId === table.id ? '2px solid var(--orange-500)' : '1px solid var(--border-main)',
                          background: '#fff',
                          cursor: 'pointer',
                          boxShadow: selectedTableId === table.id ? 'var(--shadow-glow-orange)' : 'var(--shadow-sm)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--sp-2)', alignItems: 'flex-start', marginBottom: 'var(--sp-3)' }}>
                          <div>
                            <div style={{ fontWeight: 800, color: 'var(--text-heading)' }}>{table.name}</div>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                              {table.capacity} {t('adminTable.seats')}
                              {table.zone ? ` | ${table.zone}` : ''}
                            </div>
                          </div>
                          {table.type === 'VIP' && (
                            <Badge variant="warning" size="small" style={vipBadgeStyle}>
                              <Crown size={12} />
                              {t('adminTable.vip')}
                            </Badge>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap', marginBottom: 'var(--sp-3)' }}>
                          <Badge variant={STATUS_VARIANTS[table.status]} size="small">{table.status}</Badge>
                          <Badge variant="info" size="small">{t('adminTable.floor')} {table.floor ?? '-'}</Badge>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--sp-2)' }}>
                          <Button
                            variant="ghost"
                            size="small"
                            onClick={(event) => {
                              event.stopPropagation();
                              openEditModal(table.id);
                            }}
                          >
                            <Pencil size={14} />
                          {t('adminTable.edit')}
                          </Button>
                          <Button
                            variant="ghost"
                            size="small"
                            style={{ color: 'var(--red-500)' }}
                            onClick={(event) => {
                              event.stopPropagation();
                              void handleDeleteTable(table);
                            }}
                          >
                            <Trash2 size={14} />
                            {t('adminTable.delete')}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))
            )}
          </Card.Content>
        </Card>
      </div>

      <div style={{ width: 360, display: 'flex', flexDirection: 'column' }}>
        <Card variant="elevated" style={{ height: '100%' }}>
          <Card.Header style={{ borderBottom: '1px solid var(--border-main)' }}>
            <Card.Title>{t('adminTable.details')}</Card.Title>
          </Card.Header>
          <Card.Content
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--sp-4)',
              height: '100%',
              overflowY: 'auto',
            }}
          >
            {selectedTable ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--sp-2)', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 22, color: 'var(--text-heading)' }}>{selectedTable.name}</h3>
                    <div style={{ display: 'flex', gap: 'var(--sp-2)', marginTop: 8, flexWrap: 'wrap' }}>
                      <Badge variant={STATUS_VARIANTS[selectedTable.status]}>{selectedTable.status}</Badge>
                      <Badge variant="info">{t('adminTable.floor')} {selectedTable.floor ?? '-'}</Badge>
                      {selectedTable.type === 'VIP' ? (
                        <Badge variant="warning" style={vipBadgeStyle}>
                          <Crown size={12} />
                          {t('adminTable.vip')}
                        </Badge>
                      ) : (
                        <Badge variant="neutral">{t('adminTable.normal')}</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <Input label={t('adminTable.capacity')} value={String(selectedTable.capacity)} readOnly />
                <Input label={t('adminTable.zone')} value={selectedTable.zone ?? '-'} readOnly />
                <Input label={t('adminTable.positionX')} value={selectedTableCanvasRect ? String(selectedTableCanvasRect.x) : '-'} readOnly />
                <Input label={t('adminTable.positionY')} value={selectedTableCanvasRect ? String(selectedTableCanvasRect.y) : '-'} readOnly />

                <div style={{ padding: 'var(--sp-4)', borderRadius: 'var(--r-md)', background: 'var(--gray-50)', border: '1px solid var(--border-main)' }}>
                <div
                  style={{
                    padding: 'var(--sp-4)',
                    borderRadius: 'var(--r-md)',
                    border: '1px solid var(--border-main)',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      fontWeight: 700,
                      marginBottom: 12,
                    }}
                  >
                    <QrCode size={16} />
                    {t('adminTable.qrCode')}
                  </div>

                  <img
                    alt={`QR for ${selectedTable.name}`}
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                      `${window.location.origin}/menu?tableId=${selectedTable.id}&tableName=${selectedTable.name}`
                    )}`}
                    style={{
                      width: 180,
                      height: 180,
                      borderRadius: 8,
                      border: '1px solid var(--border-main)',
                    }}
                  />
                </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: 'var(--text-heading)', marginBottom: 8 }}>
                    <MapPin size={16} color="var(--orange-500)" />
                    {t('adminTable.layoutCoordinates')}
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
                    {t('adminTable.layoutHelp')}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 'var(--sp-3)', marginTop: 'auto' }}>
                  <Button variant="primary" style={{ flex: 1 }} onClick={() => openEditModal(selectedTable.id)}>
                    <Pencil size={16} />
                    {t('adminTable.edit')}
                  </Button>
                  <Button
                    variant="ghost"
                    style={{ flex: 1, color: 'var(--red-500)' }}
                    onClick={() => void handleDeleteTable(selectedTable)}
                  >
                    <Trash2 size={16} />
                    {t('adminTable.delete')}
                  </Button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: 'var(--sp-8)', color: 'var(--text-muted)' }}>
                <SelectIndicator />
                <p style={{ margin: 0 }}>{t('adminTable.selectTableHint')}</p>
              </div>
            )}
          </Card.Content>
        </Card>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => !saving && closeModal()}
        title={formState.id ? t('adminTable.editTitle') : t('adminTable.addTitle')}
        size="medium"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          <Input
            label={t('adminTable.tableName')}
            value={formState.name}
            onChange={(event) => updateForm({ name: event.target.value })}
            placeholder="F1-13"
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-3)' }}>
            <Input
              type="number"
              label={t('adminTable.capacity')}
              value={formState.capacity}
              min="1"
              onChange={(event) => updateForm({ capacity: event.target.value })}
            />
            <Input
              type="number"
              label={t('adminTable.floor')}
              value={formState.floor}
              min="1"
              onChange={(event) => updateForm({ floor: event.target.value })}
            />
          </div>

          <Select
            label={t('adminTable.type')}
            options={tableEditTypeOptions}
            value={formState.type}
            onChange={(value) => updateForm({ type: value as TableType })}
          />

          <Input
            label={t('adminTable.zone')}
            value={formState.zone}
            onChange={(event) => updateForm({ zone: event.target.value })}
            placeholder="Window / Center / Private"
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-3)' }}>
            <Input
              type="number"
              label={t('adminTable.positionX')}
              value={formState.positionX}
              step="1"
              onChange={(event) => updateForm({ positionX: event.target.value })}
            />
            <Input
              type="number"
              label={t('adminTable.positionY')}
              value={formState.positionY}
              step="1"
              onChange={(event) => updateForm({ positionY: event.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--sp-3)', marginTop: 'var(--sp-2)' }}>
            <Button variant="ghost" onClick={closeModal} disabled={saving}>{t('common.cancel')}</Button>
            <Button variant="primary" onClick={() => void handleSaveTable()} disabled={saving}>
              {saving ? t('common.saving') : formState.id ? t('adminTable.saveChanges') : t('adminTable.create')}
            </Button>
          </div>
        </div>
      </Modal>
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
