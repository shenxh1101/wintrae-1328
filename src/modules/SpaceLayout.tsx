import { useState, useEffect, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { PLANTS } from '@/data/plants';
import { detectLayoutWarnings } from '@/utils/layout';
import { PlacedPlant, POT_SIZE_VALUE, POT_SIZE_LABELS, LIGHT_LABELS, Plant } from '@/types';
import { BalconyCanvas } from '@/components/layout-editor/BalconyCanvas';
import { LayoutWarnings } from '@/components/layout-editor/LayoutWarnings';
import { PlantPropertyPanel } from '@/components/layout-editor/PlantPropertyPanel';
import { Ruler, Maximize2, Trash2, AlertTriangle, Grid3X3, ChevronDown, Plus } from 'lucide-react';

export default function SpaceLayout() {
  const schemes = useStore(s => s.schemes);
  const currentSchemeId = useStore(s => s.currentSchemeId);
  const activeModule = useStore(s => s.activeModule);
  const lastAddedPlacedPlantId = useStore(s => s.lastAddedPlacedPlantId);
  const setLastAddedPlacedPlantId = useStore(s => s.setLastAddedPlacedPlantId);
  const addPlacedPlant = useStore(s => s.addPlacedPlant);
  const updatePlacedPlant = useStore(s => s.updatePlacedPlant);
  const removePlacedPlant = useStore(s => s.removePlacedPlant);
  const updateBalconySize = useStore(s => s.updateBalconySize);
  const scheme = schemes.find(s => s.id === currentSchemeId);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggingPlantId, setDraggingPlantId] = useState<string | null>(null);
  const [expandedSpecies, setExpandedSpecies] = useState<string | null>(null);
  const [batchCount, setBatchCount] = useState<Record<string, number>>({});

  useEffect(() => {
    if (activeModule === 'layout' && lastAddedPlacedPlantId) {
      const exists = scheme?.placedPlants.some(p => p.id === lastAddedPlacedPlantId);
      if (exists) {
        setSelectedId(lastAddedPlacedPlantId);
      }
      setLastAddedPlacedPlantId(null);
    }
  }, [activeModule, lastAddedPlacedPlantId, scheme?.placedPlants, setLastAddedPlacedPlantId]);

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

  const generateBatchPositions = (
    plant: Plant,
    count: number,
    mode: 'horizontal' | 'vertical' | 'grid',
    startX?: number,
    startY?: number
  ): { x: number; y: number }[] => {
    const potSize = POT_SIZE_VALUE[plant.potSize];
    const gap = Math.max(potSize * 0.3, 10);
    const step = potSize + gap;
    const halfPot = potSize / 2;
    const padding = 30;

    const usableW = balconyWidth - padding * 2;
    const usableH = balconyHeight - padding * 2;

    const positions: { x: number; y: number }[] = [];

    let cols: number;
    let rows: number;

    if (mode === 'horizontal') {
      cols = count;
      rows = 1;
    } else if (mode === 'vertical') {
      cols = 1;
      rows = count;
    } else {
      cols = Math.ceil(Math.sqrt(count));
      rows = Math.ceil(count / cols);
    }

    const totalW = cols * step - gap;
    const totalH = rows * step - gap;

    const offsetX = startX ?? padding + totalW / 2;
    const offsetY = startY ?? padding + totalH / 2;

    for (let i = 0; i < count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);

      let x = offsetX - totalW / 2 + col * step + halfPot;
      let y = offsetY - totalH / 2 + row * step + halfPot;

      x = Math.max(halfPot, Math.min(balconyWidth - halfPot, x));
      y = Math.max(halfPot, Math.min(balconyHeight - halfPot, y));

      positions.push({ x, y });
    }

    return positions;
  };

  const handleBatchAdd = (plantId: string, mode: 'horizontal' | 'vertical' | 'grid') => {
    const count = batchCount[plantId] ?? 3;
    const plant = PLANTS.find(p => p.id === plantId);
    if (!plant) return;

    const positions = generateBatchPositions(plant, count, mode);
    let firstId: string | null = null;

    for (let i = 0; i < count; i++) {
      const newId = addPlacedPlant(plantId, positions[i].x, positions[i].y);
      if (i === 0 && newId) firstId = newId;
    }

    if (firstId) setSelectedId(firstId);
    setExpandedSpecies(null);
  };

  const handleRearrangeSpecies = (plantId: string, mode: 'horizontal' | 'vertical' | 'grid') => {
    const plant = PLANTS.find(p => p.id === plantId);
    if (!plant) return;

    const speciesPlants = placedPlants.filter(p => p.plantId === plantId).sort((a, b) => {
      if (a.y !== b.y) return a.y - b.y;
      return a.x - b.x;
    });
    if (speciesPlants.length === 0) return;

    const positions = generateBatchPositions(plant, speciesPlants.length, mode);

    speciesPlants.forEach((pp, idx) => {
      if (positions[idx]) {
        updatePlacedPlant(pp.id, { x: positions[idx].x, y: positions[idx].y });
      }
    });

    setExpandedSpecies(null);
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
                {placedPlants.length} 株 · {plantsInLayout.length} 种
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
              const speciesPlants = placedPlants.filter(pp => pp.plantId === plant.id);
              const placedCount = speciesPlants.length;
              const isDragging = draggingPlantId === plant.id;
              const isExpanded = expandedSpecies === plant.id;

              return (
                <div
                  key={plant.id}
                  className={`rounded-xl border bg-white border-gray-100 hover:border-brand-300 hover:bg-brand-50/30 transition-all ${isDragging ? 'dragging' : ''}`}
                >
                  <div
                    draggable
                    onDragStart={e => handleDragStart(e, plant.id)}
                    onDragEnd={handleDragEnd}
                    className="p-3 cursor-grab active:cursor-grabbing"
                    onClick={() => setExpandedSpecies(isExpanded ? null : plant.id)}
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
                      <ChevronDown
                        size={16}
                        className={`text-gray-400 transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-3 pb-3 space-y-3 border-t border-gray-100 pt-3">
                      {speciesPlants.length > 0 && (
                        <div className="space-y-1">
                          <div className="text-[11px] font-medium text-gray-500">已摆放植株</div>
                          <div className="space-y-1 max-h-28 overflow-y-auto">
                            {speciesPlants.map(pp => (
                              <button
                                key={pp.id}
                                onClick={e => {
                                  e.stopPropagation();
                                  setSelectedId(pp.id);
                                }}
                                className={`w-full text-left text-xs px-2 py-1.5 rounded-lg transition-colors ${
                                  selectedId === pp.id
                                    ? 'bg-brand-500 text-white'
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                }`}
                              >
                                🏷️ {pp.nickname}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-medium text-gray-500">批量添加</span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                setBatchCount({ ...batchCount, [plant.id]: Math.max(1, (batchCount[plant.id] ?? 3) - 1) });
                              }}
                              className="w-5 h-5 rounded bg-gray-100 text-gray-600 text-xs flex items-center justify-center hover:bg-gray-200"
                            >
                              -
                            </button>
                            <span className="text-xs w-6 text-center font-medium">
                              {batchCount[plant.id] ?? 3}
                            </span>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                setBatchCount({ ...batchCount, [plant.id]: Math.min(20, (batchCount[plant.id] ?? 3) + 1) });
                              }}
                              className="w-5 h-5 rounded bg-gray-100 text-gray-600 text-xs flex items-center justify-center hover:bg-gray-200"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5">
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleBatchAdd(plant.id, 'horizontal');
                            }}
                            className="py-1.5 px-2 text-[10px] bg-brand-50 text-brand-600 rounded-lg hover:bg-brand-100 transition-colors font-medium"
                          >
                            ↔ 横排
                          </button>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleBatchAdd(plant.id, 'vertical');
                            }}
                            className="py-1.5 px-2 text-[10px] bg-brand-50 text-brand-600 rounded-lg hover:bg-brand-100 transition-colors font-medium"
                          >
                            ↕ 竖排
                          </button>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleBatchAdd(plant.id, 'grid');
                            }}
                            className="py-1.5 px-2 text-[10px] bg-brand-50 text-brand-600 rounded-lg hover:bg-brand-100 transition-colors font-medium flex items-center justify-center gap-0.5"
                          >
                            <Grid3X3 size={10} />
                            网格
                          </button>
                        </div>
                      </div>

                      {speciesPlants.length > 1 && (
                        <div className="space-y-2">
                          <div className="text-[11px] font-medium text-gray-500">重新排列</div>
                          <div className="grid grid-cols-3 gap-1.5">
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                handleRearrangeSpecies(plant.id, 'horizontal');
                              }}
                              className="py-1.5 px-2 text-[10px] bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors font-medium"
                            >
                              ↔ 横排
                            </button>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                handleRearrangeSpecies(plant.id, 'vertical');
                              }}
                              className="py-1.5 px-2 text-[10px] bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors font-medium"
                            >
                              ↕ 竖排
                            </button>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                handleRearrangeSpecies(plant.id, 'grid');
                              }}
                              className="py-1.5 px-2 text-[10px] bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors font-medium flex items-center justify-center gap-0.5"
                            >
                              <Grid3X3 size={10} />
                              网格
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
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
              placedPlants={placedPlants}
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
