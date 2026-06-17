import { useState, useMemo } from 'react';
import { ShoppingItemRow } from '@/components/shopping/ShoppingItemRow';
import { Modal } from '@/components/common/Modal';
import {
  ShoppingCategory,
  SHOPPING_CATEGORY_LABELS,
} from '@/types';
import { useStore } from '@/store/useStore';
import { Plus, RefreshCw, Check, AlertTriangle } from 'lucide-react';

const CATEGORY_ORDER: ShoppingCategory[] = [
  'soil',
  'fertilizer',
  'seed',
  'tool',
  'support',
  'other',
];

const CATEGORY_EMOJI: Record<ShoppingCategory, string> = {
  soil: '🪴',
  fertilizer: '🌱',
  seed: '🌰',
  tool: '🧰',
  support: '🪜',
  other: '📦',
};

export default function ShoppingList() {
  const getCurrentScheme = useStore(s => s.getCurrentScheme);
  const addShoppingItem = useStore(s => s.addShoppingItem);
  const regenerateShoppingList = useStore(s => s.regenerateShoppingList);

  const scheme = getCurrentScheme();
  const items = scheme?.shoppingItems || [];

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState<ShoppingCategory>('other');
  const [newName, setNewName] = useState('');
  const [newQuantity, setNewQuantity] = useState(1);
  const [newUnit, setNewUnit] = useState('个');

  const groupedItems = useMemo(() => {
    const groups: Record<ShoppingCategory, typeof items> = {
      soil: [],
      fertilizer: [],
      seed: [],
      tool: [],
      support: [],
      other: [],
    };
    items.forEach(i => {
      groups[i.category].push(i);
    });
    return groups;
  }, [items]);

  const stats = useMemo(() => {
    const total = items.length;
    const bought = items.filter(i => i.status === 'bought').length;
    const outOfStock = items.filter(i => i.status === 'out-of-stock').length;
    const progress = total === 0 ? 0 : Math.round((bought / total) * 100);
    return { total, bought, outOfStock, progress };
  }, [items]);

  const handleAddItem = () => {
    if (!newName.trim()) {
      alert('请输入物品名称');
      return;
    }
    addShoppingItem({
      category: newCategory,
      name: newName.trim(),
      quantity: newQuantity,
      unit: newUnit.trim() || '个',
      status: 'pending',
      generated: false,
    });
    setNewName('');
    setNewQuantity(1);
    setNewUnit('个');
    setAddModalOpen(false);
  };

  const handleRegenerate = () => {
    if (confirm('重新计算将重置自动生成的项目，手动添加的项会保留。确定继续吗？')) {
      regenerateShoppingList();
    }
  };

  const isEmpty = items.length === 0;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <button
            onClick={handleRegenerate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={16} />
            重新计算
          </button>
          <button
            onClick={() => setAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 text-white font-medium text-sm hover:bg-brand-700 shadow-sm transition-colors"
          >
            <Plus size={18} />
            手动添加项
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pr-2">
        {isEmpty ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 py-20">
            <div className="text-6xl mb-4">🛒</div>
            <div className="text-lg font-medium text-gray-500 mb-1">采购清单为空</div>
            <div className="text-sm mb-4">添加植物后点击"重新计算"自动生成清单</div>
            <button
              onClick={handleRegenerate}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white font-medium text-sm hover:bg-brand-700 shadow-sm transition-colors"
            >
              <RefreshCw size={16} />
              生成采购清单
            </button>
          </div>
        ) : (
          CATEGORY_ORDER.map(cat => {
            const catItems = groupedItems[cat];
            if (catItems.length === 0) return null;
            return (
              <div key={cat}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{CATEGORY_EMOJI[cat]}</span>
                  <h3 className="text-sm font-bold text-gray-800">
                    {SHOPPING_CATEGORY_LABELS[cat]}
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                    {catItems.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {catItems.map(item => (
                    <ShoppingItemRow key={item.id} item={item} />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {!isEmpty && (
        <div className="mt-5 pt-5 border-t border-gray-100 shrink-0">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-gray-600">
                <span className="font-semibold text-gray-800">{stats.total}</span>
                <span>总项</span>
              </div>
              <div className="flex items-center gap-1.5 text-green-600">
                <Check size={14} />
                <span className="font-semibold">{stats.bought}</span>
                <span>已购买</span>
              </div>
              {stats.outOfStock > 0 && (
                <div className="flex items-center gap-1.5 text-red-600">
                  <AlertTriangle size={14} />
                  <span className="font-semibold">{stats.outOfStock}</span>
                  <span>缺货</span>
                </div>
              )}
            </div>
            <div className="text-sm font-bold text-brand-700">
              进度 {stats.progress}%
            </div>
          </div>
          <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full transition-all duration-500"
              style={{ width: `${stats.progress}%` }}
            />
          </div>
        </div>
      )}

      <Modal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="手动添加采购项"
        maxWidth="max-w-md"
      >
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">分类</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORY_ORDER.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setNewCategory(cat)}
                  className={`p-2.5 rounded-xl border-2 transition-all text-center ${
                    newCategory === cat
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="text-lg mb-0.5">{CATEGORY_EMOJI[cat]}</div>
                  <div
                    className={`text-xs font-medium ${
                      newCategory === cat ? 'text-brand-700' : 'text-gray-600'
                    }`}
                  >
                    {SHOPPING_CATEGORY_LABELS[cat]}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">物品名称</label>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="例如：有机肥料"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">数量</label>
              <input
                type="number"
                min={0}
                value={newQuantity}
                onChange={e => setNewQuantity(Number(e.target.value) || 0)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">单位</label>
              <input
                type="text"
                value={newUnit}
                onChange={e => setNewUnit(e.target.value)}
                placeholder="个/袋/把..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <button
            type="button"
            onClick={() => setAddModalOpen(false)}
            className="px-5 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleAddItem}
            className="px-6 py-2 rounded-xl text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-colors"
          >
            添加
          </button>
        </div>
      </Modal>
    </div>
  );
}
