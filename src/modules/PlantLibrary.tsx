import { useState, useMemo } from 'react';
import { PlantFilters } from '@/components/library/PlantFilters';
import { PlantCard } from '@/components/library/PlantCard';
import { PlantDetailModal } from '@/components/library/PlantDetailModal';
import { Plant, LightNeed, Season, PotSize } from '@/types';
import { PLANTS } from '@/data/plants';
import { useStore } from '@/store/useStore';
import Empty from '@/components/Empty';

export function PlantLibrary() {
  const [search, setSearch] = useState('');
  const [lightFilter, setLightFilter] = useState<LightNeed | null>(null);
  const [seasonFilter, setSeasonFilter] = useState<Season | null>(null);
  const [potFilter, setPotFilter] = useState<PotSize | null>(null);
  const [detailPlant, setDetailPlant] = useState<Plant | null>(null);

  const addPlacedPlant = useStore((s) => s.addPlacedPlant);

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

  const clearFilters = () => {
    setSearch('');
    setLightFilter(null);
    setSeasonFilter(null);
    setPotFilter(null);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-serif font-bold text-brand-700 mb-1 flex items-center gap-2">
          <span className="text-3xl">🌿</span> 植物库
        </h2>
        <p className="text-sm text-gray-500">
          浏览 {PLANTS.length} 种精选阳台植物，找到最适合你家阳台的绿植伙伴
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
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredPlants.map((plant) => (
                <PlantCard
                  key={plant.id}
                  plant={plant}
                  onAdd={handleAdd}
                  onShowDetail={setDetailPlant}
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

      <PlantDetailModal
        open={detailPlant !== null}
        onClose={() => setDetailPlant(null)}
        plant={detailPlant}
        onAdd={handleAdd}
      />
    </div>
  );
}
