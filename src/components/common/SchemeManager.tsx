import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Modal } from './Modal';
import { FolderPlus, Pencil, Trash2, Check, X, FileText } from 'lucide-react';

export function SchemeManager() {
  const [open, setOpen] = useState(false);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [newName, setNewName] = useState('');

  const schemes = useStore(s => s.schemes);
  const currentSchemeId = useStore(s => s.currentSchemeId);
  const createScheme = useStore(s => s.createScheme);
  const switchScheme = useStore(s => s.switchScheme);
  const renameScheme = useStore(s => s.renameScheme);
  const deleteScheme = useStore(s => s.deleteScheme);

  const handleCreate = () => {
    if (newName.trim()) {
      createScheme(newName.trim());
      setNewName('');
    }
  };

  const startRename = (id: string, name: string) => {
    setRenameId(id);
    setRenameValue(name);
  };

  const confirmRename = () => {
    if (renameId && renameValue.trim()) {
      renameScheme(renameId, renameValue.trim());
    }
    setRenameId(null);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-brand-700 hover:bg-brand-50 rounded-full transition-colors"
      >
        <FileText size={16} />
        <span className="hidden sm:inline">方案管理</span>
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="📋 方案管理" maxWidth="max-w-lg">
        <div className="p-6 space-y-5">
          <div className="flex gap-2">
            <input
              type="text"
              className="input"
              placeholder="输入新方案名称..."
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
            />
            <button onClick={handleCreate} className="btn-primary whitespace-nowrap">
              <FolderPlus size={16} />
              新建
            </button>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {schemes.map(scheme => (
              <div
                key={scheme.id}
                className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${
                  scheme.id === currentSchemeId
                    ? 'border-brand-300 bg-brand-50'
                    : 'border-gray-100 bg-gray-50/50 hover:border-gray-200'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    scheme.id === currentSchemeId ? 'bg-brand-500 text-white' : 'bg-white text-brand-500'
                  }`}
                >
                  🌱
                </div>

                <div className="flex-1 min-w-0">
                  {renameId === scheme.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        className="input py-1 text-sm"
                        value={renameValue}
                        onChange={e => setRenameValue(e.target.value)}
                        autoFocus
                      />
                      <button
                        onClick={confirmRename}
                        className="p-1.5 rounded-lg text-green-600 hover:bg-green-50"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => setRenameId(null)}
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="font-medium text-gray-800 truncate">{scheme.name}</div>
                      <div className="text-xs text-gray-400">
                        {scheme.placedPlants.length} 种植物 ·{' '}
                        {new Date(scheme.updatedAt).toLocaleDateString('zh-CN')}
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {scheme.id !== currentSchemeId && (
                    <button
                      onClick={() => {
                        switchScheme(scheme.id);
                      }}
                      className="btn-secondary px-3 py-1 text-xs"
                    >
                      切换
                    </button>
                  )}
                  {scheme.id === currentSchemeId && (
                    <span className="tag-green">当前</span>
                  )}
                  <button
                    onClick={() => startRename(scheme.id, scheme.name)}
                    className="p-2 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50"
                    title="重命名"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`确定删除方案「${scheme.name}」吗？`)) {
                        deleteScheme(scheme.id);
                      }
                    }}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                    title="删除"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </>
  );
}
