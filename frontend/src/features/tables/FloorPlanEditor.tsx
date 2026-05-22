import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Konva from 'konva';
import { Stage } from 'react-konva';
import { DEFAULT_VIEWPORT_PADDING, EDITOR_LAYOUT_SIZE, MAX_SCALE, ZOOM_FACTOR } from './editor/config';
import { fitStageToScreen, getWorldBounds } from './editor/fitStageToScreen';
import { OverlayLayer } from './editor/OverlayLayer';
import { StructureLayer } from './editor/StructureLayer';
import { TableLayer } from './editor/TableLayer';
import { useElementSize } from './editor/useElementSize';
import type { TableDTO } from '../../services/types';
import type { CanvasPoint, EditorViewport, FloorPlanEditorProps, SceneBounds } from './editor/types';

Konva.pixelRatio = typeof window === 'undefined' ? 1 : Math.min(window.devicePixelRatio || 1, 2);

const FLOOR_BACKGROUND_BY_FLOOR: Record<number, string> = {
  1: '/floor-plans/floor1.png',
  2: '/floor-plans/floor2.png',
};

const resolveMinHeight = (value: number | string) => {
  if (typeof value === 'number') return value;

  const parsedValue = Number.parseInt(value, 10);
  return Number.isFinite(parsedValue) ? parsedValue : 520;
};

export const FloorPlanEditor = ({
  tables,
  structures,
  selectedId,
  onTableSelect,
  onTablePositionChange,
  onTablePositionCommit,
  minHeight = 520,
  showCapacity = true,
  draggableTables = true,
  showOverlay = true,
}: FloorPlanEditorProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const panAnchorRef = useRef<CanvasPoint | null>(null);
  const panMovedRef = useRef(false);
  const fittedViewportRef = useRef<EditorViewport | null>(null);

  const [containerElement, setContainerElement] = useState<HTMLDivElement | null>(null);
  const [viewport, setViewport] = useState<EditorViewport>({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);

  const size = useElementSize(containerElement);
  const worldBounds = useMemo<SceneBounds>(() => getWorldBounds(), []);
  const canvasMinHeight = useMemo(() => resolveMinHeight(minHeight), [minHeight]);

  const activeFloor = tables[0]?.floor ?? null;
  const backgroundImageSrc = activeFloor != null ? FLOOR_BACKGROUND_BY_FLOOR[activeFloor] : undefined;

  const stageHeight = useMemo(() => {
    const stageWidth = size.width || 1000;
    const ratio = EDITOR_LAYOUT_SIZE.height / EDITOR_LAYOUT_SIZE.width;
    return Math.max(canvasMinHeight, Math.round(stageWidth * ratio));
  }, [canvasMinHeight, size.width]);

  const handleContainerRef = useCallback((node: HTMLDivElement | null) => {
    containerRef.current = node;
    setContainerElement(node);
  }, []);

  const applyFittedViewport = useCallback(() => {
    if (!size.width || !size.height) return;

    const fittedViewport = fitStageToScreen({
      stageWidth: size.width,
      stageHeight: size.height,
      worldBounds,
      padding: DEFAULT_VIEWPORT_PADDING,
    });

    fittedViewportRef.current = fittedViewport;
    setViewport(fittedViewport);
  }, [size.width, size.height, worldBounds]);

  useEffect(() => {
    applyFittedViewport();
  }, [applyFittedViewport]);

  const endPan = () => {
    panAnchorRef.current = null;
    setIsPanning(false);
  };

  const handlePointerDown = (event: any) => {
    if (event.target !== event.target.getStage()) return;

    const pointer = event.target.getStage()?.getPointerPosition();
    if (!pointer) return;

    panAnchorRef.current = pointer;
    panMovedRef.current = false;
    setIsPanning(true);
  };

  const handlePointerMove = (event: any) => {
    if (!panAnchorRef.current) return;

    const pointer = event.target.getStage()?.getPointerPosition();
    if (!pointer) return;

    const deltaX = pointer.x - panAnchorRef.current.x;
    const deltaY = pointer.y - panAnchorRef.current.y;

    panMovedRef.current = true;
    panAnchorRef.current = pointer;

    setViewport((prev) => ({
      ...prev,
      x: prev.x + deltaX,
      y: prev.y + deltaY,
    }));
  };

  const handleWheel = (event: any) => {
    event.evt.preventDefault();

    const stage = event.target.getStage();
    const pointer = stage?.getPointerPosition();
    if (!stage || !pointer) return;

    setViewport((prev) => {
      const minScale = fittedViewportRef.current?.scale ?? prev.scale;
      const direction = event.evt.deltaY > 0 ? -1 : 1;

      const nextScale = Math.min(
        Math.max(
          direction > 0 ? prev.scale * ZOOM_FACTOR : prev.scale / ZOOM_FACTOR,
          minScale
        ),
        MAX_SCALE
      );

      const worldPoint = {
        x: (pointer.x - prev.x) / prev.scale,
        y: (pointer.y - prev.y) / prev.scale,
      };

      return {
        scale: nextScale,
        x: pointer.x - worldPoint.x * nextScale,
        y: pointer.y - worldPoint.y * nextScale,
      };
    });
  };

  return (
    <div
      style={{
        width: '100%',
        minWidth: 0,
        minHeight: canvasMinHeight,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 16,
        background: '#fff',
      }}
    >
      <div
        ref={handleContainerRef}
        style={{
          width: '100%',
          height: stageHeight,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {size.width > 0 && size.height > 0 && (
          <Stage
            width={size.width}
            height={size.height}
            x={viewport.x}
            y={viewport.y}
            scaleX={viewport.scale}
            scaleY={viewport.scale}
            onWheel={handleWheel}
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onMouseUp={endPan}
            onMouseLeave={endPan}
          >
            <StructureLayer
              worldBounds={worldBounds}
              structures={structures}
              backgroundImageSrc={backgroundImageSrc}
            />

            <TableLayer
              tables={tables}
              selectedId={selectedId}
              onTableSelect={onTableSelect}
              onTablePositionChange={onTablePositionChange}
              onTablePositionCommit={onTablePositionCommit}
              showCapacity={showCapacity}
              draggableTables={draggableTables}
            />

            {showOverlay && (
              <OverlayLayer
                tables={tables}
                selectedId={selectedId}
              />
            )}
          </Stage>
        )}

        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 10,
            maxWidth: 240,
            padding: '10px 12px',
            borderRadius: 12,
            background: 'rgba(255,255,255,0.95)',
            border: '1px solid #E5E7EB',
            boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700 }}>
            Zoom: {Math.round(viewport.scale * 100)}%
          </div>
          <div style={{ fontSize: 12, color: '#6B7280' }}>
            {isPanning ? 'Panning...' : 'Wheel zoom / drag to pan'}
          </div>
        </div>
      </div>
    </div>
  );
};