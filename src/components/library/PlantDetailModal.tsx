import { Plus } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import {
  Plant,
  LIGHT_LABELS,
  SEASON_LABELS,
  POT_SIZE_LABELS,
} from '@/types';

interface PlantDetailModalProps {
  open: boolean;
  onClose: () => void;
  plant: Plant | null;
  onAdd: (plant: Plant) => void;
}

export function PlantDetailModal({
  open,
  onClose,
  plant,
  onAdd,
}: PlantDetailModalProps) {
  if (!plant) return null;

  const infoRows: { label: string; value: React.ReactNode }[] = [
    {
      label: '光照需求',
      value: (
        <span className="tag-amber">☀️ {LIGHT_LABELS[plant.lightNeed]}</span>
      ),
    },
    {
      label: '适宜季节',
      value: (
        <div className="flex flex-wrap gap-1.5">
          {plant.season.map((s) => (
            <span key={s} className="tag-green">
              🌱 {SEASON_LABELS[s]}
            </span>
          ))}
        </div>
      ),
    },
    {
      label: '浇水频率',
      value: <span className="tag-blue">💧 每 {plant.waterDays} 天一次</span>,
    },
    {
      label: '成熟尺寸',
      value: (
        <span className="text-gray-700">
          高 {plant.height}cm × 冠幅 {plant.spread}cm
        </span>
      ),
    },
    {
      label: '推荐花盆',
      value: (
        <span className="tag-rose">🪴 {POT_SIZE_LABELS[plant.potSize]}</span>
      ),
    },
    {
      label: '土壤类型',
      value: <span className="text-gray-700">{plant.soilType}</span>,
    },
    {
      label: '肥料需求',
      value: <span className="text-gray-700">{plant.fertilizerNeed}</span>,
    },
    {
      label: '是否需支架',
      value: (
        <span
          className={`tag ${
            plant.supportNeed
              ? 'bg-amber-50 text-amber-600'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {plant.supportNeed ? '✅ 需要' : '❌ 不需要'}
        </span>
      ),
    },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${plant.emoji} ${plant.name}`}
      maxWidth="max-w-2xl"
    >
      <div className="p-6">
        <div className="mb-6 p-5 bg-gradient-to-br from-brand-50 to-cream-100 rounded-2xl">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center text-5xl shadow-sm shrink-0">
              {plant.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-serif font-bold text-brand-700 mb-1">
                {plant.name}
              </h2>
              <div className="flex flex-wrap gap-2">
                <span className="tag-amber">
                  ☀️ {LIGHT_LABELS[plant.lightNeed]}
                </span>
                <span className="tag-blue">💧 {plant.waterDays}天/次</span>
                {plant.harvestDays && (
                  <span className="tag-green">
                    🌾 约{plant.harvestDays}天可采收
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="section-title mb-3 text-base">
              <span>📅</span> 生长周期
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed bg-cream-50 p-4 rounded-xl">
              {plant.growCycle}
            </p>
          </div>

          <div>
            <h4 className="section-title mb-3 text-base">
              <span>💚</span> 养护要点
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed bg-brand-50 p-4 rounded-xl">
              {plant.careTips}
            </p>
          </div>

          <div>
            <h4 className="section-title mb-3 text-base">
              <span>🛡️</span> 病虫害防治
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed bg-rose-50 p-4 rounded-xl">
              {plant.pestControl}
            </p>
          </div>

          <div>
            <h4 className="section-title mb-3 text-base">
              <span>📋</span> 详细信息
            </h4>
            <div className="overflow-hidden rounded-xl border border-gray-100">
              <table className="w-full text-sm">
                <tbody>
                  {infoRows.map((row, idx) => (
                    <tr
                      key={row.label}
                      className={idx % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}
                    >
                      <td className="px-4 py-3 font-medium text-gray-500 w-28 align-top">
                        {row.label}
                      </td>
                      <td className="px-4 py-3 text-gray-700 align-top">
                        {row.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-5 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary">
            关闭
          </button>
          <button
            onClick={() => {
              onAdd(plant);
              onClose();
            }}
            className="btn-primary"
          >
            <Plus size={16} />
            添加到布局
          </button>
        </div>
      </div>
    </Modal>
  );
}
