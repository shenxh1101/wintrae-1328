import { LayoutWarning, Plant, PlacedPlant } from '@/types';
import { AlertTriangle, AlertCircle, Sun, Wind } from 'lucide-react';

interface LayoutWarningsProps {
  warnings: LayoutWarning[];
  plants: Plant[];
  placedPlants: PlacedPlant[];
  placedPlantMap: Map<string, { plant: Plant; placedId: string }>;
  onSelectPlant: (id: string | null) => void;
  selectedId: string | null;
}

export function LayoutWarnings({
  warnings,
  placedPlants,
  placedPlantMap,
  onSelectPlant,
  selectedId,
}: LayoutWarningsProps) {
  const getIcon = (type: LayoutWarning['type']) => {
    switch (type) {
      case 'shade':
        return <AlertCircle size={18} className="shrink-0" />;
      case 'light':
        return <Sun size={18} className="shrink-0" />;
      case 'ventilation':
        return <Wind size={18} className="shrink-0" />;
    }
  };

  const getSeverityStyles = (severity: LayoutWarning['severity']) => {
    if (severity === 'error') {
      return 'bg-red-50 border-red-200 hover:bg-red-100 text-red-700';
    }
    return 'bg-amber-50 border-amber-200 hover:bg-amber-100 text-amber-700';
  };

  const getSeverityIcon = (severity: LayoutWarning['severity']) => {
    if (severity === 'error') {
      return <AlertTriangle size={14} className="text-red-500 shrink-0" />;
    }
    return <AlertTriangle size={14} className="text-amber-500 shrink-0" />;
  };

  const getPlantName = (placedId: string) => {
    const pp = placedPlants.find(p => p.id === placedId);
    if (pp?.nickname) return pp.nickname;
    const entry = placedPlantMap.get(placedId);
    return entry?.plant.name ?? '未知';
  };

  const getPlantEmoji = (placedId: string) => {
    const entry = placedPlantMap.get(placedId);
    return entry?.plant.emoji ?? '🌱';
  };

  if (warnings.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
        <div className="text-3xl mb-2">🎉</div>
        <div className="text-sm font-medium text-green-700">布局状态良好</div>
        <div className="text-xs text-green-600/80 mt-1">暂未检测到遮挡、通风或光照问题</div>
      </div>
    );
  }

  const errors = warnings.filter(w => w.severity === 'error');
  const warns = warnings.filter(w => w.severity === 'warning');

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3 text-xs">
          {errors.length > 0 && (
            <span className="flex items-center gap-1 text-red-600 font-medium">
              <AlertTriangle size={12} />
              {errors.length} 个严重
            </span>
          )}
          {warns.length > 0 && (
            <span className="flex items-center gap-1 text-amber-600 font-medium">
              <AlertTriangle size={12} />
              {warns.length} 个提醒
            </span>
          )}
        </div>
        <span className="text-xs text-gray-400">点击涉及植物可快速定位</span>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {warnings.map((warning, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${getSeverityStyles(
              warning.severity
            )}`}
            onClick={() => onSelectPlant(warning.plantIds[0] ?? null)}
          >
            <div className="flex items-center gap-1 pt-0.5">
              {getSeverityIcon(warning.severity)}
              {getIcon(warning.type)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium leading-snug">{warning.message}</div>

              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                {warning.plantIds.map(pid => (
                  <span
                    key={pid}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                      selectedId === pid
                        ? 'bg-brand-500 text-white'
                        : 'bg-white/70 hover:bg-white'
                    }`}
                    onClick={e => {
                      e.stopPropagation();
                      onSelectPlant(pid);
                    }}
                  >
                    {getPlantEmoji(pid)} {getPlantName(pid)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
