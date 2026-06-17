import { useState, useRef, useCallback } from 'react';
import { PlacedPlant, Plant, POT_SIZE_VALUE } from '@/types';

const SCALE = 2;
const GRID_SIZE_CM = 10;
const WINDOW_HEIGHT_CM = 30;

interface BalconyCanvasProps {
  placedPlants: PlacedPlant[];
  plants: Plant[];
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  onUpdatePlant: (id: string, data: Partial<PlacedPlant>) => void;
  balconyWidth: number;
  balconyHeight: number;
}

export function BalconyCanvas({
  placedPlants,
  plants,
  selectedId,
  setSelectedId,
  onUpdatePlant,
  balconyWidth,
  balconyHeight,
}: BalconyCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showCoords, setShowCoords] = useState<{ id: string; x: number; y: number } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const canvasWidth = balconyWidth * SCALE;
  const canvasHeight = balconyHeight * SCALE;

  const getPlantById = (id: string) => plants.find(p => p.id === id);

  const cmToPx = (cm: number) => cm * SCALE;

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleCanvasDragLeave = () => {
    setIsDragOver(false);
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const plantId = e.dataTransfer.getData('plantId');
    const xCm = (e.clientX - rect.left) / SCALE;
    const yCm = (e.clientY - rect.top) / SCALE;

    if (plantId) {
      const event = new CustomEvent('add-plant', {
        detail: { plantId, x: xCm, y: yCm },
      });
      window.dispatchEvent(event);
    }
  };

  const handlePlantMouseDown = useCallback(
    (e: React.MouseEvent, plant: PlacedPlant) => {
      e.stopPropagation();
      setSelectedId(plant.id);

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const mouseX = (e.clientX - rect.left) / SCALE;
      const mouseY = (e.clientY - rect.top) / SCALE;

      setDragOffset({
        x: mouseX - plant.x,
        y: mouseY - plant.y,
      });
      setDraggingId(plant.id);
    },
    [setSelectedId]
  );

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!draggingId) return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      let xCm = (e.clientX - rect.left) / SCALE - dragOffset.x;
      let yCm = (e.clientY - rect.top) / SCALE - dragOffset.y;

      const placed = placedPlants.find(p => p.id === draggingId);
      if (!placed) return;

      const potRadius = POT_SIZE_VALUE[placed.potSize] / 2;
      xCm = Math.max(potRadius, Math.min(balconyWidth - potRadius, xCm));
      yCm = Math.max(potRadius, Math.min(balconyHeight - potRadius, yCm));

      setShowCoords({ id: draggingId, x: Math.round(xCm), y: Math.round(yCm) });

      onUpdatePlant(draggingId, { x: xCm, y: yCm });
    },
    [draggingId, dragOffset, placedPlants, balconyWidth, balconyHeight, onUpdatePlant]
  );

  const handleCanvasMouseUp = useCallback(() => {
    if (draggingId) {
      setDraggingId(null);
      setShowCoords(null);
    }
  }, [draggingId]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedId(null);
    }
  };

  const renderGrid = () => {
    const lines = [];
    const gridPx = cmToPx(GRID_SIZE_CM);

    for (let x = 0; x <= canvasWidth; x += gridPx) {
      lines.push(
        <line
          key={`v-${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={canvasHeight}
          stroke="#d1d5db"
          strokeWidth={x === 0 ? 2 : 0.5}
          strokeDasharray={x === 0 ? 'none' : '4 4'}
        />
      );
    }

    for (let y = 0; y <= canvasHeight; y += gridPx) {
      lines.push(
        <line
          key={`h-${y}`}
          x1={0}
          y1={y}
          x2={canvasWidth}
          y2={y}
          stroke="#d1d5db"
          strokeWidth={y === 0 ? 2 : 0.5}
          strokeDasharray={y === 0 ? 'none' : '4 4'}
        />
      );
    }

    return <svg className="absolute inset-0 pointer-events-none" width={canvasWidth} height={canvasHeight}>{lines}</svg>;
  };

  return (
    <div className="flex items-center justify-center p-6 overflow-auto bg-gray-50/50 rounded-2xl min-h-[400px]">
      <div
        id="print-area"
        ref={canvasRef}
        className={`relative bg-cream-50 rounded-xl shadow-inner border-2 border-earth-400/30 ${
          isDragOver ? 'drag-over' : ''
        }`}
        style={{ width: canvasWidth, height: canvasHeight }}
        onDragOver={handleCanvasDragOver}
        onDragLeave={handleCanvasDragLeave}
        onDrop={handleCanvasDrop}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        onClick={handleCanvasClick}
      >
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-center text-xs text-blue-600/80 font-medium bg-gradient-to-b from-blue-100/60 to-transparent border-b border-blue-200/50"
          style={{ height: cmToPx(WINDOW_HEIGHT_CM) }}
        >
          <span className="bg-white/80 px-3 py-1 rounded-full shadow-sm">🪟 窗户区域</span>
        </div>

        {renderGrid()}

        <div className="absolute bottom-1 right-2 text-[10px] text-gray-400 bg-white/70 px-1.5 py-0.5 rounded">
          {balconyWidth}cm × {balconyHeight}cm
        </div>

        {placedPlants.map(placed => {
          const plant = getPlantById(placed.plantId);
          if (!plant) return null;

          const potSizeCm = POT_SIZE_VALUE[placed.potSize];
          const potSizePx = cmToPx(potSizeCm);
          const left = cmToPx(placed.x) - potSizePx / 2;
          const top = cmToPx(placed.y) - potSizePx / 2;
          const isSelected = selectedId === placed.id;
          const isDragging = draggingId === placed.id;
          const coords = showCoords?.id === placed.id ? showCoords : null;

          return (
            <div key={placed.id}>
              <div
                className={`absolute rounded-full flex items-center justify-center cursor-grab select-none transition-shadow ${
                  isDragging ? 'cursor-grabbing z-30 shadow-xl' : 'hover:shadow-lg z-10'
                } ${
                  isSelected
                    ? 'ring-4 ring-brand-500 ring-offset-2 animate-pulse-ring'
                    : 'ring-2 ring-earth-400/40'
                }`}
                style={{
                  width: potSizePx,
                  height: potSizePx,
                  left,
                  top,
                  background: `radial-gradient(circle at 30% 30%, #e8d5b7 0%, #d4a373 50%, #bc6c25 100%)`,
                  fontSize: Math.max(12, potSizePx * 0.4),
                }}
                onMouseDown={e => handlePlantMouseDown(e, placed)}
                title={`${plant.name} ${potSizeCm}cm`}
              >
                <span className="drop-shadow-sm">{plant.emoji}</span>
              </div>

              {isSelected && !isDragging && (
                <div
                  className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] bg-brand-500 text-white px-2 py-0.5 rounded-full whitespace-nowrap z-20"
                >
                  {plant.name}
                </div>
              )}

              {coords && (
                <div
                  className="absolute text-[10px] bg-gray-800 text-white px-2 py-0.5 rounded whitespace-nowrap z-40 pointer-events-none"
                  style={{
                    left: cmToPx(placed.x) + 20,
                    top: cmToPx(placed.y) - 10,
                  }}
                >
                  X:{coords.x}cm Y:{coords.y}cm
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
