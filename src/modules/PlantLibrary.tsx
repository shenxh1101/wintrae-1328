import { useState, useMemo, useRef, useEffect } from 'react';
import { PlantFilters } from '@/components/library/PlantFilters';
import { PlantCard } from '@/components/library/PlantCard';
import { PlantDetailModal } from '@/components/library/PlantDetailModal';
import { Plant, LightNeed, Season, PotSize, POT_SIZE_VALUE, PlacedPlant } from '@/types';
import { PLANTS } from '@/data/plants';
import { useStore } from '@/store/useStore';
import Empty from '@/components/Empty';

const SCALE = 2;

export function PlantLibrary() {
  const [search, setSearch] = useState('');
  const [lightFilter, setLightFilter] = useState<LightNeed | null>(null);
  const [seasonFilter, setSeasonFilter] = useState<Season | null>(null);
  const [potFilter, setPotFilter] = useState<PotSize | null>(null);
  const [detailPlant, setDetailPlant] = useState<Plant | null>(null);
  const [draggingPlantId, setDraggingPlantId] = useState<string | null>(null);
  const [dropOverActive, setDropOverActive] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const schemes = useStore(s => s.schemes);
  const currentSchemeId = useStore(s => s.currentSchemeId);
  const addPlacedPlant = useStore(s => s.addPlacedPlant);
  const setActiveModule = useStore(s => s.setActiveModule);

  const scheme = schemes.find(s => s.id === currentSchemeId);
  const placedPlants = scheme?.placedPlants ?? [];
  const balconyWidth = scheme?.balconyWidth ?? 300;
  const balconyHeight = scheme?.balconyHeight ?? 150;
  const canvasWidth = balconyWidth * SCALE;
  const canvasHeight = balconyHeight * SCALE;

  const cmToPx = (cm: number) => cm * SCALE;

  const filteredPlants = useMemo(() => {
    return PLANTS.filter((plant) => {
      if (search && !plant.name.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (lightFilter && plant.lightNeed !== lightFilter) {
        return false;
      }
      if (seasonFilter && !plant.season.includes(seasonFilter)) {
        return false;
      }
      if (potFilter && plant.potSize !== potFilter) {
        return false;
      }
      return true;
    });
  }, [search, lightFilter, seasonFilter, potFilter]);

  const handleAdd = (plant: Plant) => {
    addPlacedPlant(plant.id);
  };

  const handleDragStart = (e: React.DragEvent, plantId: string) => {
    e.dataTransfer.setData('plantId', plantId);
    e.dataTransfer.effectAllowed = 'copy';
    setDraggingPlantId(plantId);
  };

  const handleDragEnd = () => {
    setDraggingPlantId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDropOverActive(true);
  };

  const handleDragLeave = () => {
    setDropOverActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDropOverActive(false);
    const plantId = e.dataTransfer.getData('plantId');
    if (!plantId) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const xCm = (e.clientX - rect.left) / SCALE;
    const yCm = (e.clientY - rect.top) / SCALE;
    addPlacedPlant(plantId, xCm, yCm);
  };

  const clearFilters = () => {
    setSearch('');
    setLightFilter(null);
    setSeasonFilter(null);
    setPotFilter(null);
  };

  return (
    <div className="h-full flex gap-4 min-h-0">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="mb-4">
          <h2 className="text-2xl font-serif font-bold text-brand-700 mb-1 flex items-center gap-2">
            <span className="text-3xl">🌿</span> 植物库
          </h2>
          <p className="text-sm text-gray-500">
            浏览 {PLANTS.length} 种精选阳台植物，直接拖拽卡片到右侧画布即可摆放
          </p>
        </div>

        <PlantFilters
          search={search}
          setSearch={setSearch}
          lightFilter={lightFilter}
          setLightFilter={setLightFilter}
          seasonFilter={seasonFilter}
          setSeasonFilter={setSeasonFilter}
          potFilter={potFilter}
          setPotFilter={setPotFilter}
          clearFilters={clearFilters}
        />

        <div className="flex-1 overflow-y-auto pr-1 -mr-1 pb-4">
          {filteredPlants.length > 0 ? (
            <>
              <div className="mb-3 text-sm text-gray-500">
                找到 <span className="font-semibold text-brand-600">{filteredPlants.length}</span> 种植物
                <span className="ml-3 text-xs text-brand-500">
                  💡 提示：按住卡片直接拖到右侧画布摆放
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredPlants.map((plant) => (
                  <PlantCard
                    key={plant.id}
                    plant={plant}
                    onAdd={handleAdd}
                    onShowDetail={setDetailPlant}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  />
                ))}
              </div>
            </>
          ) : (
            <Empty
              emoji="🔍"
              title="没有找到匹配的植物"
              description="试试调整筛选条件或清除筛选"
              actionLabel="清除筛选"
              onAction={clearFilters}
            />
          )}
        </div>
      </div>

      <div className="w-[420px] shrink-0 flex flex-col gap-3">
        <div className="card p-3 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-brand-700 flex items-center gap-1.5">
              <span>🪴</span> 快速摆放画布
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              {placedPlants.length} 株植物 · {balconyWidth}×{balconyHeight}cm
            </div>
          </div>
          <button
            onClick={() => setActiveModule('layout')}
            className="text-xs px-3 py-1.5 rounded-full bg-brand-50 text-brand-600 hover:bg-brand-100 transition-colors"
          >
            完整布局 →
          </button>
        </div>

        <div className="card p-3 flex-1 min-h-0 overflow-auto">
          <div className="flex items-center justify-center h-full">
            <div
              ref={canvasRef}
              className={`relative bg-cream-50 rounded-xl shadow-inner border-2 transition-all ${
                dropOverActive ? 'border-brand-500 ring-4 ring-brand-200/60 scale-[1.01]' : 'border-earth-400/30'
              }`}
              style={{ width: canvasWidth, height: canvasHeight }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div
                className="absolute top-0 left-0 right-0 flex items-center justify-center text-[10px] text-blue-600/80 font-medium bg-gradient-to-b from-blue-100/60 to-transparent border-b border-blue-200/50"
                style={{ height: cmToPx(30) }}
              >
                <span className="bg-white/80 px-2 py-0.5 rounded-full shadow-sm">🪟 窗户</span>
              </div>

              <svg className="absolute inset-0 pointer-events-none" width={canvasWidth} height={canvasHeight}>
                {Array.from({ length: Math.floor(balconyWidth / 10) + 1 }).map((_, i) => (
                  <line
                    key={`v-${i}`}
                    x1={i * cmToPx(10)}
                    y1={0}
                    x2={i * cmToPx(10)}
                    y2={canvasHeight}
                    stroke="#d1d5db"
                    strokeWidth={0.5}
                    strokeDasharray="3 3"
                  />
                ))}
                {Array.from({ length: Math.floor(balconyHeight / 10) + 1 }).map((_, i) => (
                  <line
                    key={`h-${i}`}
                    x1={0}
                    y1={i * cmToPx(10)}
                    x2={canvasWidth}
                    y2={i * cmToPx(10)}
                    stroke="#d1d5db"
                    strokeWidth={0.5}
                    strokeDasharray="3 3"
                  />
                ))}
              </svg>

              {placedPlants.map(placed => {
                const plant = PLANTS.find(p => p.id === placed.plantId);
                if (!plant) return null;
                const potSizeCm = POT_SIZE_VALUE[placed.potSize];
                const potSizePx = cmToPx(potSizeCm);
                const left = cmToPx(placed.x) - potSizePx / 2;
                const top = cmToPx(placed.y) - potSizePx / 2;
                return (
                  <div
                    key={placed.id}
                    className="absolute rounded-full flex items-center justify-center ring-2 ring-earth-400/40 shadow-sm pointer-events-none"
                    style={{
                      width: potSizePx,
                      height: potSizePx,
                      left,
                      top,
                      background: `radial-gradient(circle at 30% 30%, #e8d5b7 0%, #d4a373 50%, #bc6c25 100%)`,
                      fontSize: Math.max(10, potSizePx * 0.38),
                    }}
                    title={plant.name}
                  >
                    <span className="drop-shadow-sm">{plant.emoji}</span>
                  </div>
                );
              })}

              {placedPlants.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 pointer-events-none">
                  <div className="text-4xl mb-2 opacity-40">🌱</div>
                  <div className="text-xs text-gray-400 leading-relaxed">
                    从左侧拖拽植物卡片<br />到这里开始布局
                  </div>
                </div>
              )}

              {dropOverActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-brand-500/10 rounded-lg pointer-events-none">
                  <div className="bg-brand-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                    🎯 松手即可放置
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <PlantDetailModal
        open={detailPlant !== null}
        onClose={() => setDetailPlant(null)}
        plant={detailPlant}
        onAdd={handleAdd}
      />
    </div>
  );
}
