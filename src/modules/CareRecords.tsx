import { useState, useMemo } from 'react';
import { RecordCard } from '@/components/records/RecordCard';
import { AddRecordModal } from '@/components/records/AddRecordModal';
import { Modal } from '@/components/common/Modal';
import { CareRecord, CareRecordType, CARE_TYPE_LABELS, CARE_TYPE_EMOJI } from '@/types';
import { PLANTS } from '@/data/plants';
import { useStore } from '@/store/useStore';
import { printElement } from '@/utils/export';
import { Plus, Filter, Printer, ChevronDown } from 'lucide-react';

type FilterType = CareRecordType | 'all';

function getDateGroup(dateStr: string): { key: string; label: string } {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  if (target.getTime() === today.getTime()) {
    return { key: 'today', label: '今天' };
  }
  if (target.getTime() === yesterday.getTime()) {
    return { key: 'yesterday', label: '昨天' };
  }
  return { key: dateStr, label: dateStr };
}

export default function CareRecords() {
  const getCurrentScheme = useStore(s => s.getCurrentScheme);
  const removeCareRecord = useStore(s => s.removeCareRecord);

  const scheme = getCurrentScheme();
  const records = scheme?.careRecords || [];
  const placedPlantIds = scheme?.placedPlants.map(p => p.plantId) || [];
  const availablePlants = PLANTS.filter(p => placedPlantIds.includes(p.id));

  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<CareRecord | null>(null);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterPlant, setFilterPlant] = useState<string>('all');
  const [showFilter, setShowFilter] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (filterType !== 'all' && r.type !== filterType) return false;
      if (filterPlant !== 'all' && r.plantId !== filterPlant) return false;
      return true;
    });
  }, [records, filterType, filterPlant]);

  const groupedRecords = useMemo(() => {
    const groups: Record<string, { label: string; records: CareRecord[] }> = {};
    const sorted = [...filteredRecords].sort((a, b) => b.date.localeCompare(a.date));
    sorted.forEach(r => {
      const { key, label } = getDateGroup(r.date);
      if (!groups[key]) {
        groups[key] = { label, records: [] };
      }
      groups[key].records.push(r);
    });
    return groups;
  }, [filteredRecords]);

  const photoRecords = useMemo(() => {
    return records.filter(r => r.photo);
  }, [records]);

  const handleEdit = (record: CareRecord) => {
    setEditRecord(record);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditRecord(null);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条养护记录吗？')) {
      removeCareRecord(id);
    }
  };

  const handlePrint = () => {
    printElement('print-area', '养护记录');
  };

  const isEmpty = Object.keys(groupedRecords).length === 0;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 text-white font-medium text-sm hover:bg-brand-700 shadow-sm transition-colors"
          >
            <Plus size={18} />
            新增记录
          </button>
          <div className="relative">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                showFilter || filterType !== 'all' || filterPlant !== 'all'
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Filter size={16} />
              筛选
              <ChevronDown size={14} className={`transition-transform ${showFilter ? 'rotate-180' : ''}`} />
            </button>
            {showFilter && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-soft border border-gray-100 p-4 z-20 space-y-4">
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-2">按类型</div>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setFilterType('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        filterType === 'all'
                          ? 'bg-brand-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      全部
                    </button>
                    {(Object.keys(CARE_TYPE_LABELS) as CareRecordType[]).map(t => (
                      <button
                        key={t}
                        onClick={() => setFilterType(t)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors inline-flex items-center gap-1 ${
                          filterType === t
                            ? 'bg-brand-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {CARE_TYPE_EMOJI[t]} {CARE_TYPE_LABELS[t]}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-2">按植物</div>
                  <select
                    value={filterPlant}
                    onChange={e => setFilterPlant(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="all">全部植物</option>
                    {availablePlants.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.emoji} {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <Printer size={16} />
          打印
        </button>
      </div>

      <div id="print-area" className="flex-1 overflow-y-auto space-y-8 pr-2">
        {isEmpty ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 py-20">
            <div className="text-6xl mb-4">🌿</div>
            <div className="text-lg font-medium text-gray-500 mb-1">暂无养护记录</div>
            <div className="text-sm">点击上方"新增记录"开始记录吧</div>
          </div>
        ) : (
          <div className="relative pl-6">
            <div className="absolute left-1.5 top-0 bottom-0 w-1 rounded-full bg-gradient-to-b from-brand-400 via-brand-500 to-brand-300" />
            {Object.entries(groupedRecords).map(([key, group]) => (
              <div key={key} className="mb-8 last:mb-0">
                <div className="sticky top-0 z-10 -ml-6 pl-6 py-2 mb-4 bg-gradient-to-b from-cream-100 via-cream-100/95 to-transparent">
                  <h3 className="text-sm font-bold text-brand-700 inline-flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-500" />
                    {group.label}
                    <span className="text-xs text-gray-400 font-normal">
                      ({group.records.length} 条)
                    </span>
                  </h3>
                </div>
                <div className="space-y-0">
                  {group.records.map(r => (
                    <RecordCard
                      key={r.id}
                      record={r}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {photoRecords.length > 0 && (
          <div className="mt-10 pt-8 border-t border-gray-100">
            <h3 className="text-sm font-bold text-brand-700 mb-4 inline-flex items-center gap-2">
              📸 照片墙
              <span className="text-xs text-gray-400 font-normal">
                ({photoRecords.length} 张)
              </span>
            </h3>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
              {photoRecords.map(r => (
                <button
                  key={r.id}
                  onClick={() => setPreviewPhoto(r.photo!)}
                  className="aspect-square rounded-xl overflow-hidden border border-gray-100 hover:ring-2 hover:ring-brand-400 transition-all group"
                >
                  <img
                    src={r.photo}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <AddRecordModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editRecord={editRecord}
      />

      <Modal open={!!previewPhoto} onClose={() => setPreviewPhoto(null)} maxWidth="max-w-4xl">
        {previewPhoto && (
          <div className="p-2">
            <img src={previewPhoto} alt="照片预览" className="w-full rounded-xl" />
          </div>
        )}
      </Modal>
    </div>
  );
}
