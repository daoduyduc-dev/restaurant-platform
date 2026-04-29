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

const TARGET_STAGE_WIDTH = 1000;

const FLOOR_BACKGROUND_BY_FLOOR: Record<number, string> = {
  1: '/floor-plans/floor1.png',
  2: '/floor-plans/floor2.png',
};

const resolveMinHeight = (value: number | string) => {
  if (typeof value === 'number') {
    return value;
  }

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
    const stageWidth = size.width > 0 ? size.width : TARGET_STAGE_WIDTH;
    const layoutAspectRatio = EDITOR_LAYOUT_SIZE.height / EDITOR_LAYOUT_SIZE.width;
    return Math.max(canvasMinHeight, Math.round(stageWidth * layoutAspectRatio));
  }, [canvasMinHeight, size.width]);

  const handleContainerRef = useCallback((node: HTMLDivElement | null) => {
    containerRef.current = node;
    setContainerElement(node);
  }, []);

  const applyFittedViewport = useCallback(() => {
    if (size.width === 0 || size.height === 0) {
      return;
    }

    const fittedViewport = fitStageToScreen({
      stageWidth: size.width,
      stageHeight: size.height,
      worldBounds,
      padding: DEFAULT_VIEWPORT_PADDING,
    });

    fittedViewportRef.current = fittedViewport;
    setViewport(fittedViewport);
  }, [size.height, size.width, worldBounds]);

  const handleTableSelect = useCallback((table: TableDTO) => {
    onTableSelect?.(table);
  }, [onTableSelect]);

  useEffect(() => {
    if (size.width === 0 || size.height === 0) {
      return;
    }

    applyFittedViewport();
  }, [applyFittedViewport, size.height, size.width]);

  const endPan = useCallback(() => {
    panAnchorRef.current = null;
    setIsPanning(false);
    if (containerRef.current) {
      containerRef.current.style.cursor = 'default';
    }
  }, []);

  const handlePointerDown = useCallback((event: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (event.target !== event.target.getStage()) {
      return;
    }

    const stage = event.target.getStage();
    const pointer = stage?.getPointerPosition();
    if (!pointer) {
      return;
    }

    panAnchorRef.current = pointer;
    panMovedRef.current = false;
    setIsPanning(true);

    if (containerRef.current) {
      containerRef.current.style.cursor = 'grabbing';
    }
  }, []);

  const handlePointerMove = useCallback((event: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (!panAnchorRef.current) {
      return;
    }

    const stage = event.target.getStage();
    const pointer = stage?.getPointerPosition();
    if (!pointer) {
      return;
    }

    const deltaX = pointer.x - panAnchorRef.current.x;
    const deltaY = pointer.y - panAnchorRef.current.y;

    if (Math.abs(deltaX) > 0 || Math.abs(deltaY) > 0) {
      panMovedRef.current = true;
    }

    panAnchorRef.current = pointer;
    setViewport((currentViewport) => ({
      ...currentViewport,
      x: currentViewport.x + deltaX,
      y: currentViewport.y + deltaY,
    }));
  }, []);

  const handleWheel = useCallback((event: Konva.KonvaEventObject<WheelEvent>) => {
    event.evt.preventDefault();

    const stage = event.target.getStage();
    const pointer = stage?.getPointerPosition();
    if (!stage || !pointer) {
      return;
    }

    setViewport((currentViewport) => {
      const minScale = fittedViewportRef.current?.scale ?? currentViewport.scale;
      const direction = event.evt.deltaY > 0 ? -1 : 1;
      const nextScale = Math.min(
        Math.max(
          direction > 0 ? currentViewport.scale * ZOOM_FACTOR : currentViewport.scale / ZOOM_FACTOR,
          minScale
        ),
        MAX_SCALE
      );
      const worldPoint = {
        x: (pointer.x - currentViewport.x) / currentViewport.scale,
        y: (pointer.y - currentViewport.y) / currentViewport.scale,
      };

      return {
        scale: nextScale,
        x: pointer.x - (worldPoint.x * nextScale),
        y: pointer.y - (worldPoint.y * nextScale),
      };
    });
  }, []);

  const handleStageClick = useCallback((event: Konva.KonvaEventObject<MouseEvent>) => {
    if (panMovedRef.current) {
      panMovedRef.current = false;
      return;
    }

    if (event.target === event.target.getStage()) {
      onTableSelect?.(null);
    }
  }, [onTableSelect]);

  return (
    <div
      className="floor-plan"
      style={{
        minHeight: canvasMinHeight,
        position: 'relative',
        width: '100%',
        maxWidth: TARGET_STAGE_WIDTH,
        margin: '0 auto',
        background: 'linear-gradient(180deg, #FFFCF6 0%, #FFF8EB 100%)',
      }}
    >
      <div
        ref={handleContainerRef}
        style={{
          position: 'relative',
          width: '100%',
          height: stageHeight,
          minHeight: canvasMinHeight,
          overflow: 'hidden',
        }}
      >
        {size.width > 0 && size.height > 0 ? (
          <Stage
            width={size.width}
            height={size.height}
            x={viewport.x}
            y={viewport.y}
            scaleX={viewport.scale}
            scaleY={viewport.scale}
            onWheel={handleWheel}
            onMouseDown={handlePointerDown}
            onTouchStart={handlePointerDown}
            onMouseMove={handlePointerMove}
            onTouchMove={handlePointerMove}
            onMouseUp={endPan}
            onTouchEnd={endPan}
            onMouseLeave={endPan}
            onClick={handleStageClick}
            style={{ background: 'transparent' }}
          >
            <StructureLayer
              worldBounds={worldBounds}
              structures={structures}
              backgroundImageSrc={backgroundImageSrc}
            />
            <TableLayer
              tables={tables}
              selectedId={selectedId}
              onTableSelect={handleTableSelect}
              onTablePositionChange={onTablePositionChange}
              onTablePositionCommit={onTablePositionCommit}
              showCapacity={showCapacity}
              draggableTables={draggableTables}
            />
            {showOverlay ? (
              <OverlayLayer
                tables={tables}
                selectedId={selectedId}
              />
            ) : null}
          </Stage>
        ) : null}

        <div
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            padding: '12px 14px',
            borderRadius: 16,
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(212, 175, 55, 0.22)',
            boxShadow: '0 12px 32px rgba(15, 23, 42, 0.08)',
            pointerEvents: 'none',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.06em', color: 'var(--orange-600)', textTransform: 'uppercase' }}>
            Floor Plan Editor
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Zoom: {Math.round(viewport.scale * 100)}%
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {isPanning ? 'Panning canvas...' : 'Wheel to zoom, drag empty space to pan'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Fixed 1000px-wide stage with camera fit to the existing world bounds.
          </div>
        </div>
      </div>
    </div>
  );
};
