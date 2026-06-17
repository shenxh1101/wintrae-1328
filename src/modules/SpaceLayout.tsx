import { useState, useEffect, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { PLANTS } from '@/data/plants';
import { detectLayoutWarnings } from '@/utils/layout';
import { PlacedPlant, POT_SIZE_VALUE, POT_SIZE_LABELS, LIGHT_LABELS } from '@/types';
import { BalconyCanvas } from '@/components/layout-editor/BalconyCanvas';
import { LayoutWarnings } from '@/components/layout-editor/LayoutWarnings';
import { PlantPropertyPanel } from '@/components/layout-editor/PlantPropertyPanel';
import { Ruler, Maximize2, Trash2, AlertTriangle } from 'lucide-react';

export default function SpaceLayout() {
  const schemes = useStore(s => s.schemes);
  const currentSchemeId = useStore(s => s.currentSchemeId);
  const addPlacedPlant = useStore(s => s.addPlacedPlant);
  const updatePlacedPlant = useStore(s => s.updatePlacedPlant);
  const removePlacedPlant = useStore(s => s.removePlacedPlant);
  const updateBalconySize = useStore(s => s.updateBalconySize);
  const scheme = schemes.find(s => s.id === currentSchemeId);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggingPlantId, setDraggingPlantId] = useState<string | null>(null);

  const placedPlants = scheme?.placedPlants ?? [];
  const balconyWidth = scheme?.balconyWidth ?? 300;
  const balconyHeight = scheme?.balconyHeight ?? 150;

  const placedPlantMap = useMemo(() => {
    const map = new Map<string, { plant: typeof PLANTS[number]; placedId: string }>();
    placedPlants.forEach(pp => {
      const plant = PLANTS.find(p => p.id === pp.plantId);
      if (plant) {
        map.set(pp.id, { plant, placedId: pp.id });
      }
    });
    return map;
  }, [placedPlants]);

  const warnings = useMemo(() => {
    return detectLayoutWarnings(placedPlants, PLANTS, balconyWidth, balconyHeight);
  }, [placedPlants, balconyWidth, balconyHeight]);

  const selectedPlant = selectedId ? placedPlants.find(p => p.id === selectedId) ?? null : null;
  const selectedPlantInfo = selectedPlant ? PLANTS.find(p => p.id === selectedPlant.plantId) ?? null : null;

  const placedPlantIds = useMemo(() => new Set(placedPlants.map(p => p.plantId)),
    [placedPlants]
  );

  useEffect(() => {
    const handleAddPlant = (e: Event) => {
      const customEvent = e as CustomEvent<{ plantId: string; x: number; y: number }>;
      const { plantId, x, y } = customEvent.detail;
      if (plantId) {
        const newId = addPlacedPlant(plantId, x, y);
        if (newId) setSelectedId(newId);
      }
    };
    window.addEventListener('add-plant', handleAddPlant);
    return () => window.removeEventListener('add-plant', handleAddPlant);
  }, [addPlacedPlant]);

  const handleDragStart = (e: React.DragEvent, plantId: string) => {
    e.dataTransfer.setData('plantId', plantId);
    e.dataTransfer.effectAllowed = 'copy';
    setDraggingPlantId(plantId);
  };

  const handleDragEnd = () => {
    setDraggingPlantId(null);
  };

  const handleUpdatePlant = (id: string, data: Partial<PlacedPlant>) => {
    updatePlacedPlant(id, data);
  };

  const handleDeletePlant = () => {
    if (selectedId) {
      removePlacedPlant(selectedId);
      setSelectedId(null);
    }
  };

  const handleWidthChange = (val: number) => {
    const clamped = Math.max(200, Math.min(600, val || 200));
    updateBalconySize(clamped, balconyHeight);
  };

  const handleHeightChange = (val: number) => {
    const clamped = Math.max(100, Math.min(300, val || 100));
    updateBalconySize(balconyWidth, clamped);
  };

  const plantsInLayout = PLANTS.filter(p => placedPlantIds.has(p.id));

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="card p-4 no-print">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="section-title">
              <Maximize2 size={20} />
              空间布局
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Ruler size={16} className="text-brand-500" />
                <span className="text-sm text-gray-600">阳台尺寸</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    className="input w-24 text-center"
                    value={balconyWidth}
                    min={200}
                    max={600}
                    step={10}
                    onChange={e => handleWidthChange(Number(e.target.value))}
                  />
                  <span className="text-xs text-gray-500">cm</span>
                </div>
                <span className="text-gray-400">×</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    className="input w-24 text-center"
                    value={balconyHeight}
                    min={100}
                    max={300}
                    step={10}
                    onChange={e => handleHeightChange(Number(e.target.value))}
                  />
                  <span className="text-xs text-gray-500">cm</span>
                </div>
              </div>

              <div className="text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                缩放比例 1cm = 2px
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-xs text-gray-500 bg-brand-50 px-3 py-1.5 rounded-full">
              {placedPlants.length} 种植物
              </div>
              {warnings.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">
                  <AlertTriangle size={14} />
                  {warnings.length} 个提示
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        <div className="card w-64 flex flex-col no-print">
          <div className="p-4 border-b border-gray-100">
            <div className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <span>🌱</span>
              植物列表
            </div>
            <div className="text-xs text-gray-400 mt-1">拖拽植物到画布上
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {plantsInLayout.length === 0 && (
              <div className="text-center text-gray-400 text-xs py-8">
                <div className="text-3xl mb-2">🌿</div>
                请先从植物库<br />添加植物到方案
              </div>
            )}

            {plantsInLayout.map(plant => {
              const placedCount = placedPlants.filter(pp => pp.plantId === plant.id).length;
              const isDragging = draggingPlantId === plant.id;

              return (
                <div
                  key={plant.id}
                  draggable
                  onDragStart={e => handleDragStart(e, plant.id)}
                  onDragEnd={handleDragEnd}
                  className={`p-3 rounded-xl border bg-white border-gray-100 cursor-grab active:cursor-grabbing hover:border-brand-300 hover:bg-brand-50 transition-all ${isDragging ? 'dragging' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-2xl bg-cream-100 shrink-0"
                    >
                      {plant.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800 truncate">
                        {plant.name}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5 text-[10px] text-gray-500">
                        <span className="tag-green px-1.5 py-px rounded">
                          {LIGHT_LABELS[plant.lightNeed]}
                        </span>
                      </div>
                    </div>
                    {placedCount > 0 && (
                      <span className="text-xs bg-brand-500 text-white px-2 py-0.5 rounded-full shrink-0">
                        ×{placedCount}
                      </span>
                    )}
                  </div>

                  <div className="mt-2 text-[10px] text-gray-400 flex items-center justify-between">
                    <span>{POT_SIZE_LABELS[plant.potSize].split(' ')[0]} {POT_SIZE_VALUE[plant.potSize]}cm
                    </span>
                    <span>{plant.height}cm高</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <BalconyCanvas
            placedPlants={placedPlants}
            plants={PLANTS}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            onUpdatePlant={handleUpdatePlant}
            balconyWidth={balconyWidth}
            balconyHeight={balconyHeight}
          />

          <div className="card p-4 no-print">
            <div className="flex items-center justify-between mb-3">
              <div className="section-title">
                <AlertTriangle size={18} />
                布局检测
              </div>
            </div>
            <LayoutWarnings
              warnings={warnings}
              plants={PLANTS}
              placedPlantMap={placedPlantMap}
              onSelectPlant={setSelectedId}
              selectedId={selectedId}
            />
          </div>
        </div>

        <div className="card w-80 flex flex-col no-print">
          <PlantPropertyPanel
            selectedPlant={selectedPlant}
            plant={selectedPlantInfo}
            onUpdate={data => selectedId && handleUpdatePlant(selectedId, data)}
            onDelete={handleDeletePlant}
            balconyWidth={balconyWidth}
            balconyHeight={balconyHeight}
          />
        </div>
      </div>
    </div>
  );
}
