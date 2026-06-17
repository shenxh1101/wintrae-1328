import { useStore } from '@/store/useStore';
import { ModuleKey } from '@/types';
import { Leaf, Grid3x3, Calendar, ClipboardList, ShoppingBasket } from 'lucide-react';

const TABS: { key: ModuleKey; label: string; icon: React.ReactNode }[] = [
  { key: 'library', label: '植物库', icon: <Leaf size={20} /> },
  { key: 'layout', label: '空间布局', icon: <Grid3x3 size={20} /> },
  { key: 'calendar', label: '种植日历', icon: <Calendar size={20} /> },
  { key: 'records', label: '养护记录', icon: <ClipboardList size={20} /> },
  { key: 'shopping', label: '采购清单', icon: <ShoppingBasket size={20} /> },
];

export function Sidebar() {
  const activeModule = useStore(s => s.activeModule);
  const setActiveModule = useStore(s => s.setActiveModule);

  return (
    <aside className="no-print w-full md:w-52 lg:w-56 shrink-0">
      <nav className="p-2 md:p-4">
        <ul className="flex md:flex-col gap-1 md:gap-2 overflow-x-auto md:overflow-visible">
          {TABS.map(tab => {
            const active = activeModule === tab.key;
            return (
              <li key={tab.key} className="shrink-0">
                <button
                  onClick={() => setActiveModule(tab.key)}
                  className={`w-full flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-2xl text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-brand-500 text-white shadow-soft shadow-brand-500/30'
                      : 'text-gray-600 hover:bg-white hover:text-brand-700 hover:shadow-card'
                  }`}
                >
                  <span className={active ? 'text-white' : 'text-brand-500'}>{tab.icon}</span>
                  <span className="whitespace-nowrap">{tab.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
