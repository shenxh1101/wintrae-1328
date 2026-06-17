import { Plus, Info } from 'lucide-react';
import { Plant, LIGHT_LABELS, SEASON_LABELS } from '@/types';

interface PlantCardProps {
  plant: Plant;
  onAdd: (plant: Plant) => void;
  onShowDetail: (plant: Plant) => void;
}

export function PlantCard({ plant, onAdd, onShowDetail }: PlantCardProps) {
  return (
    <div className="card-hover group flex flex-col h-full">
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-50 to-cream-100 flex items-center justify-center text-3xl shadow-sm">
            {plant.emoji}
          </div>
          <button
            onClick={() => onShowDetail(plant)}
            className="p-2 rounded-full text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-all opacity-0 group-hover:opacity-100"
            title="查看详情"
          >
            <Info size={16} />
          </button>
        </div>

        <h3 className="font-serif font-bold text-gray-800 mb-2 text-base">
          {plant.name}
        </h3>

        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className="tag-amber">
            ☀️ {LIGHT_LABELS[plant.lightNeed]}
          </span>
          <span className="tag-green">
            🌱 {plant.season.map((s) => SEASON_LABELS[s]).join('/')}
          </span>
          <span className="tag-blue">💧 {plant.waterDays}天/次</span>
        </div>

        <div className="mt-auto pt-3 border-t border-gray-100">
          <button
            onClick={() => onAdd(plant)}
            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-brand-500 text-white hover:bg-brand-600 hover:shadow-soft active:scale-95 transition-all"
          >
            <Plus size={16} />
            添加到布局
          </button>
        </div>
      </div>
    </div>
  );
}
