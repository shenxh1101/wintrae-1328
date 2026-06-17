import { CareRecord, CARE_TYPE_LABELS, CARE_TYPE_EMOJI, CareRecordType } from '@/types';
import { PLANTS } from '@/data/plants';
import { Edit3, Trash2 } from 'lucide-react';

const TYPE_COLORS: Record<CareRecordType, string> = {
  water: 'bg-blue-500',
  fertilize: 'bg-amber-500',
  prune: 'bg-purple-500',
  pest: 'bg-rose-500',
  other: 'bg-gray-500',
};

interface RecordCardProps {
  record: CareRecord;
  onEdit: (record: CareRecord) => void;
  onDelete: (id: string) => void;
}

export function RecordCard({ record, onEdit, onDelete }: RecordCardProps) {
  const plant = PLANTS.find(p => p.id === record.plantId);
  const plantLabel = plant ? `${plant.emoji} ${plant.name}` : '未知植物';

  return (
    <div className="relative pl-8 pb-8 last:pb-0">
      <div
        className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-4 border-white shadow-md ${TYPE_COLORS[record.type]}`}
      />
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden hover:shadow-soft transition-shadow">
        <div className={`h-1.5 ${TYPE_COLORS[record.type]}`} />
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{CARE_TYPE_EMOJI[record.type]}</span>
              <div>
                <div className="font-semibold text-gray-800">
                  {CARE_TYPE_LABELS[record.type]}
                </div>
                <div className="text-xs text-gray-500">{record.date}</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onEdit(record)}
                className="p-2 rounded-lg hover:bg-brand-50 text-gray-400 hover:text-brand-600 transition-colors"
                title="编辑"
              >
                <Edit3 size={16} />
              </button>
              <button
                onClick={() => onDelete(record.id)}
                className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                title="删除"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <div className="inline-flex items-center px-2.5 py-1 rounded-lg bg-cream-100 text-sm text-earth-600">
            {plantLabel}
          </div>

          {record.photo && (
            <img
              src={record.photo}
              alt="养护照片"
              className="w-full object-cover rounded-xl border border-gray-100"
              style={{ maxHeight: '200px' }}
            />
          )}

          {record.notes && (
            <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
              {record.notes}
            </p>
          )}

          {record.result && (
            <div className="p-3 rounded-xl bg-green-50 border border-green-200">
              <div className="text-xs font-medium text-green-700 mb-1">处理结果</div>
              <p className="text-sm text-green-800 whitespace-pre-wrap leading-relaxed">
                {record.result}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
