import { Fragment, memo, useEffect, useMemo, useState } from 'react';
import { Image as KonvaImage, Layer, Line, Rect, Text } from 'react-konva';
import { DEFAULT_STRUCTURE_SHELL, GRID_SIZE, MAJOR_GRID_INTERVAL } from './config';
import type { SceneBounds, StructureElement } from './types';

interface StructureLayerProps {
  worldBounds: SceneBounds;
  structures?: StructureElement[];
  backgroundImageSrc?: string;
}

type GridLine = {
  key: string;
  points: number[];
  isMajor: boolean;
  label?: {
    x: number;
    y: number;
    text: string;
  };
};

const GRID_PADDING = GRID_SIZE * 2;

const snapDownToGrid = (value: number) => Math.floor(value / GRID_SIZE) * GRID_SIZE;
const snapUpToGrid = (value: number) => Math.ceil(value / GRID_SIZE) * GRID_SIZE;

const useBackgroundImage = (backgroundImageSrc?: string) => {
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!backgroundImageSrc || typeof window === 'undefined') {
      setBackgroundImage(null);
      return undefined;
    }

    let isActive = true;
    const image = new window.Image();

    setBackgroundImage(null);
    image.decoding = 'async';
    image.src = backgroundImageSrc;

    const handleLoad = () => {
      if (isActive) {
        setBackgroundImage(image);
      }
    };

    image.addEventListener('load', handleLoad);

    if (image.complete) {
      handleLoad();
    }

    return () => {
      isActive = false;
      image.removeEventListener('load', handleLoad);
    };
  }, [backgroundImageSrc]);

  return backgroundImage;
};

const renderStructure = (structure: StructureElement) => {
  switch (structure.kind) {
    case 'wall':
      return (
        <Rect
          key={structure.id}
          x={structure.x}
          y={structure.y}
          width={structure.width}
          height={structure.height}
          fill="#8B7355"
          cornerRadius={4}
          shadowColor="rgba(72, 52, 32, 0.2)"
          shadowBlur={10}
          perfectDrawEnabled={false}
        />
      );
    case 'door':
      return (
        <Fragment key={structure.id}>
          <Rect
            x={structure.x}
            y={structure.y}
            width={structure.width}
            height={structure.height}
            fill="#B45309"
            cornerRadius={6}
            perfectDrawEnabled={false}
          />
          {structure.label ? (
            <Text
              x={structure.x}
              y={structure.y - 24}
              width={structure.width}
              align="center"
              text={structure.label}
              fontSize={16}
              fontStyle="bold"
              fill="#92400E"
              perfectDrawEnabled={false}
            />
          ) : null}
        </Fragment>
      );
    case 'window':
      return (
        <Fragment key={structure.id}>
          <Rect
            x={structure.x}
            y={structure.y}
            width={structure.width}
            height={structure.height}
            fill="#DBEAFE"
            stroke="#60A5FA"
            strokeWidth={2}
            cornerRadius={8}
            perfectDrawEnabled={false}
          />
          <Line
            points={[
              structure.x + (structure.width / 2),
              structure.y,
              structure.x + (structure.width / 2),
              structure.y + structure.height,
            ]}
            stroke="#93C5FD"
            strokeWidth={2}
            perfectDrawEnabled={false}
          />
        </Fragment>
      );
    case 'stair': {
      const steps = Math.max(structure.steps ?? 5, 2);
      const stepHeight = structure.height / steps;

      return (
        <Fragment key={structure.id}>
          <Rect
            x={structure.x}
            y={structure.y}
            width={structure.width}
            height={structure.height}
            fill="#F3F4F6"
            stroke="#CBD5E1"
            strokeWidth={2}
            cornerRadius={12}
            perfectDrawEnabled={false}
          />
          {Array.from({ length: steps }).map((_, index) => (
            <Line
              key={`${structure.id}-step-${index}`}
              points={[
                structure.x + 12,
                structure.y + ((index + 1) * stepHeight),
                structure.x + structure.width - 12,
                structure.y + ((index + 1) * stepHeight),
              ]}
              stroke="#94A3B8"
              strokeWidth={2}
              perfectDrawEnabled={false}
            />
          ))}
          {structure.label ? (
            <Text
              x={structure.x}
              y={structure.y + structure.height + 10}
              width={structure.width}
              align="center"
              text={structure.label}
              fontSize={16}
              fontStyle="bold"
              fill="#475569"
              perfectDrawEnabled={false}
            />
          ) : null}
        </Fragment>
      );
    }
    default:
      return null;
  }
};

export const StructureLayer = memo(({
  worldBounds,
  structures,
  backgroundImageSrc,
}: StructureLayerProps) => {
  const resolvedStructures = structures?.length ? structures : DEFAULT_STRUCTURE_SHELL;
  const backgroundImage = useBackgroundImage(backgroundImageSrc);
  const gridViewport = useMemo(() => {
    const minX = snapDownToGrid(worldBounds.x - GRID_PADDING);
    const minY = snapDownToGrid(worldBounds.y - GRID_PADDING);
    const maxX = snapUpToGrid(worldBounds.x + worldBounds.width + GRID_PADDING);
    const maxY = snapUpToGrid(worldBounds.y + worldBounds.height + GRID_PADDING);
    const verticalLines: GridLine[] = [];
    const horizontalLines: GridLine[] = [];

    for (let x = minX; x <= maxX; x += GRID_SIZE) {
      const isMajor = Math.round(x / GRID_SIZE) % MAJOR_GRID_INTERVAL === 0;
      verticalLines.push({
        key: `grid-v-${x}`,
        points: [x, minY, x, maxY],
        isMajor,
        label: isMajor
          ? {
            x: x + 6,
            y: minY + 10,
            text: String(x),
          }
          : undefined,
      });
    }

    for (let y = minY; y <= maxY; y += GRID_SIZE) {
      const isMajor = Math.round(y / GRID_SIZE) % MAJOR_GRID_INTERVAL === 0;
      horizontalLines.push({
        key: `grid-h-${y}`,
        points: [minX, y, maxX, y],
        isMajor,
        label: isMajor && y !== minY
          ? {
            x: minX + 10,
            y: y + 6,
            text: String(y),
          }
          : undefined,
      });
    }

    return {
      minX,
      minY,
      maxX,
      maxY,
      verticalLines,
      horizontalLines,
    };
  }, [worldBounds]);

  return (
    <Layer listening={false}>
      {backgroundImage ? (
        <KonvaImage
          image={backgroundImage}
          x={worldBounds.x}
          y={worldBounds.y}
          width={worldBounds.width}
          height={worldBounds.height}
          perfectDrawEnabled={false}
        />
      ) : (
        <>
          <Rect
            x={gridViewport.minX}
            y={gridViewport.minY}
            width={gridViewport.maxX - gridViewport.minX}
            height={gridViewport.maxY - gridViewport.minY}
            fill="#FCFAF7"
            perfectDrawEnabled={false}
          />

          {gridViewport.verticalLines.map((line) => (
            <Line
              key={line.key}
              points={line.points}
              stroke={line.isMajor ? '#E2DDD4' : '#F1EDE6'}
              strokeWidth={line.isMajor ? 1.4 : 1}
              perfectDrawEnabled={false}
            />
          ))}

          {gridViewport.horizontalLines.map((line) => (
            <Line
              key={line.key}
              points={line.points}
              stroke={line.isMajor ? '#E2DDD4' : '#F1EDE6'}
              strokeWidth={line.isMajor ? 1.4 : 1}
              perfectDrawEnabled={false}
            />
          ))}

          {gridViewport.verticalLines.map((line) => (
            line.label ? (
              <Text
                key={`${line.key}-label`}
                x={line.label.x}
                y={line.label.y}
                text={line.label.text}
                fontSize={14}
                fill="#A8A29E"
                perfectDrawEnabled={false}
              />
            ) : null
          ))}

          {gridViewport.horizontalLines.map((line) => (
            line.label ? (
              <Text
                key={`${line.key}-label`}
                x={line.label.x}
                y={line.label.y}
                text={line.label.text}
                fontSize={14}
                fill="#A8A29E"
                perfectDrawEnabled={false}
              />
            ) : null
          ))}

          {resolvedStructures.map(renderStructure)}
        </>
      )}
    </Layer>
  );
});

StructureLayer.displayName = 'StructureLayer';
