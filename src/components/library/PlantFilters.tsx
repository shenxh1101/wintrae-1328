import { Search, X } from 'lucide-react';
import {
  LightNeed,
  Season,
  PotSize,
  LIGHT_LABELS,
  SEASON_LABELS,
  POT_SIZE_LABELS,
} from '@/types';

interface PlantFiltersProps {
  search: string;
  setSearch: (v: string) => void;
  lightFilter: LightNeed | null;
  setLightFilter: (v: LightNeed | null) => void;
  seasonFilter: Season | null;
  setSeasonFilter: (v: Season | null) => void;
  potFilter: PotSize | null;
  setPotFilter: (v: PotSize | null) => void;
  clearFilters: () => void;
}

export function PlantFilters({
  search,
  setSearch,
  lightFilter,
  setLightFilter,
  seasonFilter,
  setSeasonFilter,
  potFilter,
  setPotFilter,
  clearFilters,
}: PlantFiltersProps) {
  const hasFilters = search || lightFilter || seasonFilter || potFilter;

  const lightOptions: LightNeed[] = ['full-sun', 'partial-sun', 'shade'];
  const seasonOptions: Season[] = ['spring', 'summer', 'autumn', 'winter', 'all'];
  const potOptions: PotSize[] = ['small', 'medium', 'large'];

  return (
    <div className="card p-4 sm:p-5 mb-6">
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="搜索植物名称..."
            className="input pl-10 pr-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <div className="text-xs font-medium text-gray-500 mb-2">光照需求</div>
            <div className="flex flex-wrap gap-2">
              {lightOptions.map((opt) => {
                const active = lightFilter === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => setLightFilter(active ? null : opt)}
                    className={`px-3 py-1.5 text-xs rounded-full transition-all border ${
                      active
                        ? 'bg-brand-500 text-white border-brand-500 shadow-soft'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-brand-300 hover:text-brand-600'
                    }`}
                  >
                    {LIGHT_LABELS[opt]}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-gray-500 mb-2">适宜季节</div>
            <div className="flex flex-wrap gap-2">
              {seasonOptions.map((opt) => {
                const active = seasonFilter === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => setSeasonFilter(active ? null : opt)}
                    className={`px-3 py-1.5 text-xs rounded-full transition-all border ${
                      active
                        ? 'bg-brand-500 text-white border-brand-500 shadow-soft'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-brand-300 hover:text-brand-600'
                    }`}
                  >
                    {SEASON_LABELS[opt]}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-gray-500 mb-2">花盆尺寸</div>
            <div className="flex flex-wrap gap-2">
              {potOptions.map((opt) => {
                const active = potFilter === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => setPotFilter(active ? null : opt)}
                    className={`px-3 py-1.5 text-xs rounded-full transition-all border ${
                      active
                        ? 'bg-brand-500 text-white border-brand-500 shadow-soft'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-brand-300 hover:text-brand-600'
                    }`}
                  >
                    {POT_SIZE_LABELS[opt]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {hasFilters && (
          <div className="flex justify-end">
            <button
              onClick={clearFilters}
              className="btn-ghost text-xs py-1.5 px-3"
            >
              <X size={14} />
              清除筛选
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
