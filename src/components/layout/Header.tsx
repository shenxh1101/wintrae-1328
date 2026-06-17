import { useStore } from '@/store/useStore';
import { SchemeManager } from '@/components/common/SchemeManager';
import { exportElementAsImage, printElement } from '@/utils/export';
import { Download, Printer, Leaf } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const currentScheme = useStore(s => s.getCurrentScheme());
  const renameScheme = useStore(s => s.renameScheme);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');

  const handleStartEdit = () => {
    if (currentScheme) {
      setName(currentScheme.name);
      setEditing(true);
    }
  };

  const handleSaveName = () => {
    if (currentScheme && name.trim()) {
      renameScheme(currentScheme.id, name.trim());
    }
    setEditing(false);
  };

  return (
    <header className="no-print h-16 bg-white/80 backdrop-blur-md border-b border-brand-100 sticky top-0 z-40">
      <div className="h-full max-w-[1600px] mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-soft shrink-0">
            <Leaf className="text-white" size={22} />
          </div>
          <div className="min-w-0">
            <div className="font-serif font-bold text-brand-700 text-base sm:text-lg leading-none">
              阳台种植规划
            </div>
            {editing ? (
              <div className="flex items-center gap-1 mt-1">
                <input
                  className="text-xs px-2 py-0.5 rounded-lg border border-brand-300 w-40"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoFocus
                  onBlur={handleSaveName}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSaveName();
                    if (e.key === 'Escape') setEditing(false);
                  }}
                />
              </div>
            ) : (
              <div
                onClick={handleStartEdit}
                className="text-xs text-gray-500 cursor-pointer hover:text-brand-600 truncate"
                title="点击重命名方案"
              >
                {currentScheme?.name || '未命名方案'}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <SchemeManager />
          <button
            onClick={() => exportElementAsImage('print-area', `${currentScheme?.name || '阳台布局'}.png`)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-brand-700 hover:bg-brand-50 rounded-full transition-colors"
            title="导出布局图片"
          >
            <Download size={16} />
            <span className="hidden sm:inline">导出图片</span>
          </button>
          <button
            onClick={() => printElement('print-area', `${currentScheme?.name || '养护表'}`)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-brand-700 hover:bg-brand-50 rounded-full transition-colors"
            title="打印养护表"
          >
            <Printer size={16} />
            <span className="hidden sm:inline">打印</span>
          </button>
        </div>
      </div>
    </header>
  );
}
