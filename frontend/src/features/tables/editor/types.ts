import type { TableDTO } from '../../../services/types';

export type CanvasPoint = {
  x: number;
  y: number;
};

export type EditorViewport = CanvasPoint & {
  scale: number;
};

type BaseStructure = {
  id: string;
  x: number;
  y: number;
  rotation?: number;
};

export type WallStructure = BaseStructure & {
  kind: 'wall';
  width: number;
  height: number;
};

export type DoorStructure = BaseStructure & {
  kind: 'door';
  width: number;
  height: number;
  label?: string;
};

export type WindowStructure = BaseStructure & {
  kind: 'window';
  width: number;
  height: number;
};

export type StairStructure = BaseStructure & {
  kind: 'stair';
  width: number;
  height: number;
  steps?: number;
  label?: string;
};

export type StructureElement =
  | WallStructure
  | DoorStructure
  | WindowStructure
  | StairStructure;

export type TableCanvasRect = {
  x: number;
  y: number;
  width: number;
  height: number;
  isVip: boolean;
};

export type SceneBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export interface FloorPlanEditorProps {
  tables: TableDTO[];
  structures?: StructureElement[];
  selectedId?: string | null;
  onTableSelect?: (table: TableDTO | null) => void;
  onTablePositionChange?: (tableId: string, position: CanvasPoint) => void;
  onTablePositionCommit?: (tableId: string, position: CanvasPoint) => void;
  minHeight?: number | string;
  showCapacity?: boolean;
}
