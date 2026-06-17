import { useState, useEffect, useRef } from 'react';
import { Modal } from '@/components/common/Modal';
import { CareRecord, CareRecordType, CARE_TYPE_LABELS, CARE_TYPE_EMOJI } from '@/types';
import { PLANTS } from '@/data/plants';
import { useStore } from '@/store/useStore';
import { formatDate } from '@/utils/storage';
import { Camera, X } from 'lucide-react';

const TYPES: CareRecordType[] = ['water', 'fertilize', 'prune', 'pest', 'other'];

interface AddRecordModalProps {
  open: boolean;
  onClose: () => void;
  editRecord?: CareRecord | null;
}

export function AddRecordModal({ open, onClose, editRecord }: AddRecordModalProps) {
  const getCurrentScheme = useStore(s => s.getCurrentScheme);
  const addCareRecord = useStore(s => s.addCareRecord);
  const updateCareRecord = useStore(s => s.updateCareRecord);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scheme = getCurrentScheme();
  const placedPlantIds = scheme?.placedPlants.map(p => p.plantId) || [];
  const availablePlants = PLANTS.filter(p => placedPlantIds.includes(p.id));

  const [type, setType] = useState<CareRecordType>('water');
  const [plantId, setPlantId] = useState('');
  const [date, setDate] = useState(formatDate(new Date()));
  const [photo, setPhoto] = useState<string | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [result, setResult] = useState('');

  useEffect(() => {
    if (open) {
      if (editRecord) {
        setType(editRecord.type);
        setPlantId(editRecord.plantId);
        setDate(editRecord.date);
        setPhoto(editRecord.photo);
        setNotes(editRecord.notes);
        setResult(editRecord.result || '');
      } else {
        setType('water');
        setPlantId(availablePlants[0]?.id || '');
        setDate(formatDate(new Date()));
        setPhoto(undefined);
        setNotes('');
        setResult('');
      }
    }
  }, [open, editRecord, availablePlants]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhoto(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!plantId) {
      alert('请选择关联植物');
      return;
    }
    const payload = { type, plantId, date, photo, notes, result };
    if (editRecord) {
      updateCareRecord(editRecord.id, payload);
    } else {
      addCareRecord(payload);
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editRecord ? '编辑养护记录' : '新增养护记录'}
      maxWidth="max-w-xl"
    >
      <div className="p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">养护类型</label>
          <div className="grid grid-cols-5 gap-2">
            {TYPES.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`p-3 rounded-xl border-2 transition-all text-center ${
                  type === t
                    ? 'border-brand-500 bg-brand-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="text-2xl mb-1">{CARE_TYPE_EMOJI[t]}</div>
                <div className={`text-xs font-medium ${
                  type === t ? 'text-brand-700' : 'text-gray-600'
                }`}>
                  {CARE_TYPE_LABELS[t]}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">关联植物</label>
            <select
              value={plantId}
              onChange={e => setPlantId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm"
            >
              <option value="">请选择植物</option>
              {availablePlants.map(p => (
                <option key={p.id} value={p.id}>
                  {p.emoji} {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">日期</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">照片</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          {photo ? (
            <div className="relative rounded-xl overflow-hidden border border-gray-200">
              <img src={photo} alt="预览" className="w-full h-40 object-cover" />
              <button
                type="button"
                onClick={() => setPhoto(undefined)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-32 rounded-xl border-2 border-dashed border-gray-300 hover:border-brand-400 hover:bg-brand-50/50 transition-all flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-brand-600"
            >
              <Camera size={28} />
              <span className="text-sm">点击上传照片</span>
            </button>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">备注</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            placeholder="记录养护过程、观察到的情况等..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            处理结果 <span className="text-gray-400 font-normal">(可选)</span>
          </label>
          <textarea
            value={result}
            onChange={e => setResult(e.target.value)}
            rows={2}
            placeholder="处理结果、后续观察等..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm resize-none"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
        >
          取消
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="px-6 py-2 rounded-xl text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-colors"
        >
          {editRecord ? '保存修改' : '添加记录'}
        </button>
      </div>
    </Modal>
  );
}
