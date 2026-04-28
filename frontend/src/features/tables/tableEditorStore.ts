import { create } from 'zustand';
import api from '../../services/api';
import type { TableDTO, TableType } from '../../services/types';
import { normalizeTableToCanvasSpace } from './editor/layout';
import type { CanvasPoint } from './editor/types';

export type TableEditorTypeFilter = 'ALL' | TableType;

export type TableEditorFormState = {
  id?: string;
  name: string;
  capacity: string;
  floor: string;
  zone: string;
  type: TableType;
  positionX: string;
  positionY: string;
};

type TableUpsertPayload = {
  name: string;
  capacity: number;
  floor: number | null;
  zone: string | null;
  type: TableType;
  positionX: number | null;
  positionY: number | null;
};

type TableEditorState = {
  tables: TableDTO[];
  loading: boolean;
  saving: boolean;
  availableFloors: number[];
  selectedFloor: number | null;
  typeFilter: TableEditorTypeFilter;
  selectedTableId: string | null;
  isModalOpen: boolean;
  formState: TableEditorFormState;
  loadTables: (preferredSelectedId?: string | null) => Promise<void>;
  setSelectedFloor: (floor: number | null) => void;
  setTypeFilter: (typeFilter: TableEditorTypeFilter) => void;
  setSelectedTableId: (tableId: string | null) => void;
  openCreateModal: () => void;
  openEditModal: (tableId: string) => void;
  closeModal: () => void;
  updateForm: (patch: Partial<TableEditorFormState>) => void;
  updateTablePosition: (tableId: string, position: CanvasPoint) => void;
  commitTablePosition: (tableId: string) => Promise<void>;
  saveTable: () => Promise<string | null>;
  deleteTable: (tableId: string) => Promise<void>;
};

const buildEmptyForm = (defaultFloor: number): TableEditorFormState => ({
  name: '',
  capacity: '2',
  floor: String(defaultFloor),
  zone: '',
  type: 'NORMAL',
  positionX: '',
  positionY: '',
});

const toFormState = (table: TableDTO): TableEditorFormState => ({
  id: table.id,
  name: table.name,
  capacity: String(table.capacity),
  floor: table.floor != null ? String(table.floor) : '',
  zone: table.zone ?? '',
  type: table.type,
  positionX: table.positionX != null ? String(table.positionX) : '',
  positionY: table.positionY != null ? String(table.positionY) : '',
});

const normalizeTables = (tables: TableDTO[]) => tables.map((table, index) => normalizeTableToCanvasSpace(table, index));

const resolveAvailableFloors = (tables: TableDTO[], floors: Array<number | null | undefined>) => {
  const floorSet = new Set<number>(floors.filter((floor): floor is number => floor != null));
  tables.forEach((table) => {
    if (table.floor != null) {
      floorSet.add(table.floor);
    }
  });

  return Array.from(floorSet).sort((a, b) => a - b);
};

const toUpsertPayload = (formState: TableEditorFormState): TableUpsertPayload => ({
  name: formState.name.trim(),
  capacity: Number(formState.capacity),
  floor: formState.floor === '' ? null : Number(formState.floor),
  zone: formState.zone.trim() || null,
  type: formState.type,
  positionX: formState.positionX === '' ? null : Number(formState.positionX),
  positionY: formState.positionY === '' ? null : Number(formState.positionY),
});

const toUpdatePayload = (table: TableDTO): TableUpsertPayload => ({
  name: table.name,
  capacity: table.capacity,
  floor: table.floor,
  zone: table.zone,
  type: table.type,
  positionX: table.positionX,
  positionY: table.positionY,
});

export const useTableEditorStore = create<TableEditorState>((set, get) => ({
  tables: [],
  loading: true,
  saving: false,
  availableFloors: [],
  selectedFloor: null,
  typeFilter: 'ALL',
  selectedTableId: null,
  isModalOpen: false,
  formState: buildEmptyForm(1),

  loadTables: async (preferredSelectedId) => {
    set({ loading: true });

    try {
      const [tablesRes, floorsRes] = await Promise.all([
        api.get('/tables'),
        api.get('/tables/floors'),
      ]);

      const nextTables = normalizeTables(tablesRes.data.data || []);
      const nextFloors = resolveAvailableFloors(nextTables, floorsRes.data.data || []);

      set((state) => {
        const nextSelectedFloor = state.selectedFloor != null && nextFloors.includes(state.selectedFloor)
          ? state.selectedFloor
          : nextFloors[0] ?? null;
        const candidateId = preferredSelectedId ?? state.selectedTableId;
        const nextSelectedTableId = candidateId && nextTables.some((table) => table.id === candidateId)
          ? candidateId
          : null;
        const activeFormState = state.formState.id
          ? nextTables.find((table) => table.id === state.formState.id)
          : null;

        return {
          tables: nextTables,
          availableFloors: nextFloors,
          selectedFloor: nextSelectedFloor,
          selectedTableId: nextSelectedTableId,
          formState: activeFormState ? toFormState(activeFormState) : state.formState,
          loading: false,
        };
      });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  setSelectedFloor: (selectedFloor) => set({ selectedFloor }),
  setTypeFilter: (typeFilter) => set({ typeFilter }),
  setSelectedTableId: (selectedTableId) => set({ selectedTableId }),

  openCreateModal: () => set((state) => ({
    formState: buildEmptyForm(state.selectedFloor ?? state.availableFloors[0] ?? 1),
    isModalOpen: true,
  })),

  openEditModal: (tableId) => set((state) => {
    const table = state.tables.find((item) => item.id === tableId);
    if (!table) {
      return {};
    }

    return {
      selectedTableId: table.id,
      formState: toFormState(table),
      isModalOpen: true,
    };
  }),

  closeModal: () => set({ isModalOpen: false }),

  updateForm: (patch) => set((state) => ({
    formState: {
      ...state.formState,
      ...patch,
    },
  })),

  updateTablePosition: (tableId, position) => set((state) => ({
    tables: state.tables.map((table) => (
      table.id === tableId
        ? { ...table, positionX: position.x, positionY: position.y }
        : table
    )),
    formState: state.formState.id === tableId
      ? {
        ...state.formState,
        positionX: String(position.x),
        positionY: String(position.y),
      }
      : state.formState,
  })),

  commitTablePosition: async (tableId) => {
    const table = get().tables.find((item) => item.id === tableId);
    if (!table) {
      return;
    }

    try {
      const response = await api.put(`/tables/${tableId}`, toUpdatePayload(table));
      const updatedTable = response.data.data as TableDTO;

      set((state) => {
        const updatedIndex = state.tables.findIndex((item) => item.id === tableId);
        if (updatedIndex < 0) {
          return {};
        }

        const normalizedTable = normalizeTableToCanvasSpace(updatedTable, updatedIndex);

        return {
          tables: state.tables.map((item, index) => (
            index === updatedIndex ? normalizedTable : item
          )),
          formState: state.formState.id === tableId ? toFormState(normalizedTable) : state.formState,
        };
      });
    } catch (error) {
      await get().loadTables(tableId);
      throw error;
    }
  },

  saveTable: async () => {
    const { formState } = get();
    const payload = toUpsertPayload(formState);

    set({ saving: true });

    try {
      let selectedId: string | null;

      if (formState.id) {
        await api.put(`/tables/${formState.id}`, payload);
        selectedId = formState.id;
      } else {
        const response = await api.post('/tables', payload);
        selectedId = response.data.data?.id ?? null;
      }

      await get().loadTables(selectedId);
      set({ isModalOpen: false, saving: false });
      return selectedId;
    } catch (error) {
      set({ saving: false });
      throw error;
    }
  },

  deleteTable: async (tableId) => {
    await api.delete(`/tables/${tableId}`);

    set((state) => ({
      selectedTableId: state.selectedTableId === tableId ? null : state.selectedTableId,
      formState: state.formState.id === tableId ? buildEmptyForm(state.selectedFloor ?? state.availableFloors[0] ?? 1) : state.formState,
      isModalOpen: state.formState.id === tableId ? false : state.isModalOpen,
    }));

    await get().loadTables();
  },
}));

export const validateTableEditorForm = (formState: TableEditorFormState) => {
  const payload = toUpsertPayload(formState);

  if (!payload.name) {
    return 'Table name is required';
  }
  if (!Number.isFinite(payload.capacity) || payload.capacity < 1) {
    return 'Capacity must be at least 1';
  }
  if (payload.floor != null && (!Number.isInteger(payload.floor) || payload.floor < 1)) {
    return 'Floor must be a positive integer';
  }
  if (payload.positionX != null && !Number.isFinite(payload.positionX)) {
    return 'Position X must be a valid number';
  }
  if (payload.positionY != null && !Number.isFinite(payload.positionY)) {
    return 'Position Y must be a valid number';
  }

  return null;
};
