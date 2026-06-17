import { ShoppingItem, ShoppingCategory, ShoppingStatus, SHOPPING_STATUS_LABELS } from '@/types';
import { useStore } from '@/store/useStore';
import { Trash2, Check, AlertTriangle } from 'lucide-react';

const CATEGORY_EMOJI: Record<ShoppingCategory, string> = {
  soil: '🪴',
  fertilizer: '🌱',
  seed: '🌰',
  tool: '🧰',
  support: '🪜',
  other: '📦',
};

const STATUS_STYLES: Record<ShoppingStatus, string> = {
  pending: 'bg-gray-100 text-gray-600',
  bought: 'bg-green-100 text-green-700',
  'out-of-stock': 'bg-red-100 text-red-700',
};

interface ShoppingItemRowProps {
  item: ShoppingItem;
}

export function ShoppingItemRow({ item }: ShoppingItemRowProps) {
  const updateShoppingItem = useStore(s => s.updateShoppingItem);
  const removeShoppingItem = useStore(s => s.removeShoppingItem);

  const handleToggleBought = () => {
    const newStatus: ShoppingStatus = item.status === 'bought' ? 'pending' : 'bought';
    updateShoppingItem(item.id, { status: newStatus });
  };

  const handleCycleStatus = () => {
    const order: ShoppingStatus[] = ['pending', 'bought', 'out-of-stock'];
    const idx = order.indexOf(item.status);
    const nextStatus = order[(idx + 1) % order.length];
    updateShoppingItem(item.id, { status: nextStatus });
  };

  return (
    <div className="group bg-white rounded-xl border border-gray-100 p-3 hover:shadow-card hover:border-gray-200 transition-all">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-cream-100 shrink-0">
          <span className="text-lg">{CATEGORY_EMOJI[item.category]}</span>
        </div>

        <label className="flex items-center cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={item.status === 'bought'}
            onChange={handleToggleBought}
            className="sr-only"
          />
          <div
            onClick={handleToggleBought}
            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer ${
              item.status === 'bought'
                ? 'bg-brand-500 border-brand-500'
                : 'border-gray-300 hover:border-brand-400'
            }`}
          >
            {item.status === 'bought' && <Check size={12} className="text-white" />}
          </div>
        </label>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-sm font-medium truncate ${
                item.status === 'bought' ? 'text-gray-400 line-through' : 'text-gray-800'
              }`}
            >
              {item.name}
            </span>
            {item.generated && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-600 border border-blue-100">
                自动生成
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <input
            type="number"
            min={0}
            value={item.quantity}
            onChange={e =>
              updateShoppingItem(item.id, { quantity: Number(e.target.value) || 0 })
            }
            className="w-16 px-2 py-1.5 text-sm text-center rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none bg-white"
          />
          <input
            type="text"
            value={item.unit}
            onChange={e => updateShoppingItem(item.id, { unit: e.target.value })}
            className="w-14 px-2 py-1.5 text-sm text-center rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none bg-white"
          />
        </div>

        <button
          onClick={handleCycleStatus}
          className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${STATUS_STYLES[item.status]}`}
          title="点击切换状态"
        >
          {item.status === 'bought' && <Check size={12} />}
          {item.status === 'out-of-stock' && <AlertTriangle size={12} />}
          {SHOPPING_STATUS_LABELS[item.status]}
        </button>

        <button
          onClick={() => {
            if (confirm('确定要删除此项吗？')) removeShoppingItem(item.id);
          }}
          className="shrink-0 p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
          title="删除"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {item.status === 'out-of-stock' && (
        <div className="mt-3 pl-12">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-red-500 shrink-0" />
            <span className="text-xs text-red-600 font-medium shrink-0">替代品:</span>
            <input
              type="text"
              value={item.alternative || ''}
              onChange={e => updateShoppingItem(item.id, { alternative: e.target.value })}
              placeholder="可填写替代方案或备注..."
              className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-red-200 bg-red-50/50 focus:ring-2 focus:ring-red-400 focus:border-red-400 outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
