import { PlacedPlant, Plant, PotSize, POT_SIZE_VALUE, POT_SIZE_LABELS, LIGHT_LABELS } from '@/types';
import { Move, Trash2, Ruler, Maximize2 } from 'lucide-react';

interface PlantPropertyPanelProps {
  selectedPlant: PlacedPlant | null;
  plant: Plant | null;
  onUpdate: (data: Partial<PlacedPlant>) => void;
  onDelete: () => void;
  balconyWidth: number;
  balconyHeight: number;
}

const POT_SIZES: PotSize[] = ['small', 'medium', 'large'];

export function PlantPropertyPanel({
  selectedPlant,
  plant,
  onUpdate,
  onDelete,
  balconyWidth,
  balconyHeight,
}: PlantPropertyPanelProps) {
  if (!selectedPlant || !plant) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-gray-400 p-6">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Move size={36} className="text-gray-300" />
        </div>
        <div className="text-sm font-medium text-gray-500 mb-1">从画布中选择一株植物</div>
        <div className="text-xs text-gray-400 text-center">
          点击画布上的植物查看详情<br />或从左侧拖拽新植物到画布
        </div>
      </div>
    );
  }

  const potRadius = POT_SIZE_VALUE[selectedPlant.potSize] / 2;
  const minX = potRadius;
  const maxX = balconyWidth - potRadius;
  const minY = potRadius;
  const maxY = balconyHeight - potRadius;

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-brand-50 to-transparent">
        <div className="flex items-center gap-3">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-md"
            style={{
              background: `radial-gradient(circle at 30% 30%, #e8d5b7 0%, #d4a373 50%, #bc6c25 100%)`,
            }}
          >
            {plant.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-lg font-bold text-gray-800 truncate">{selectedPlant.nickname}</div>
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
              <span className="tag-green">{LIGHT_LABELS[plant.lightNeed]}</span>
              <span>{plant.name}</span>
              <span>{POT_SIZE_LABELS[selectedPlant.potSize].split(' ')[0]}</span>
            </div>
          </div>
          <button
            onClick={onDelete}
            className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors shrink-0"
            title="删除"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <span className="text-brand-500">🏷️</span>
            植物昵称
          </div>
          <input
            type="text"
            className="input"
            value={selectedPlant.nickname}
            onChange={e => onUpdate({ nickname: e.target.value })}
            placeholder="给这株植物起个名字"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Maximize2 size={16} className="text-brand-500" />
            花盆尺寸
          </div>
          <div className="grid grid-cols-3 gap-2">
            {POT_SIZES.map(size => {
              const isActive = selectedPlant.potSize === size;
              return (
                <button
                  key={size}
                  onClick={() => onUpdate({ potSize: size })}
                  className={`py-2 px-1 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-brand-500 text-white shadow-soft'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <div>{POT_SIZE_LABELS[size].split(' ')[0]}</div>
                  <div className={`mt-0.5 ${isActive ? 'text-brand-100' : 'text-gray-400'}`}>
                    {POT_SIZE_VALUE[size]}cm
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Move size={16} className="text-brand-500" />
            位置微调
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-gray-500 flex items-center gap-1">
                <Ruler size={12} />
                X 坐标 (cm)
              </label>
              <input
                type="number"
                className="input text-center"
                value={Math.round(selectedPlant.x)}
                min={Math.round(minX)}
                max={Math.round(maxX)}
                onChange={e => {
                  const val = Math.max(
                    minX,
                    Math.min(maxX, Number(e.target.value) || minX)
                  );
                  onUpdate({ x: val });
                }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500 flex items-center gap-1">
                <Ruler size={12} />
                Y 坐标 (cm)
              </label>
              <input
                type="number"
                className="input text-center"
                value={Math.round(selectedPlant.y)}
                min={Math.round(minY)}
                max={Math.round(maxY)}
                onChange={e => {
                  const val = Math.max(
                    minY,
                    Math.min(maxY, Number(e.target.value) || minY)
                  );
                  onUpdate({ y: val });
                }}
              />
            </div>
          </div>
          <div className="text-[11px] text-gray-400 flex justify-between">
            <span>范围: X {Math.round(minX)}-{Math.round(maxX)}cm</span>
            <span>Y {Math.round(minY)}-{Math.round(maxY)}cm</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">备注</div>
          <textarea
            className="input min-h-[100px] resize-none"
            placeholder="添加关于这株植物的备注信息..."
            value={selectedPlant.notes ?? ''}
            onChange={e => onUpdate({ notes: e.target.value })}
          />
        </div>

        <div className="space-y-2 pt-2 border-t border-gray-100">
          <div className="text-sm font-medium text-gray-700">植物信息</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-50 rounded-xl p-2.5">
              <div className="text-gray-400">成株高度</div>
              <div className="font-semibold text-gray-700 mt-0.5">{plant.height} cm</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-2.5">
              <div className="text-gray-400">冠幅</div>
              <div className="font-semibold text-gray-700 mt-0.5">{plant.spread} cm</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-2.5">
              <div className="text-gray-400">浇水周期</div>
              <div className="font-semibold text-gray-700 mt-0.5">{plant.waterDays} 天/次</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-2.5">
              <div className="text-gray-400">需要支架</div>
              <div className="font-semibold text-gray-700 mt-0.5">
                {plant.supportNeed ? '是' : '否'}
              </div>
            </div>
          </div>
          {plant.harvestDays && (
            <div className="bg-amber-50 rounded-xl p-2.5 text-xs">
              <div className="text-amber-600 font-medium">
                🗓️ 预计收获: 播种后 {plant.harvestDays} 天
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
