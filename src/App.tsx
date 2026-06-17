import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { PlantLibrary } from '@/modules/PlantLibrary';
import SpaceLayout from '@/modules/SpaceLayout';
import PlantCalendar from '@/modules/PlantCalendar';
import CareRecords from '@/modules/CareRecords';
import ShoppingList from '@/modules/ShoppingList';

export default function App() {
  const init = useStore(s => s.init);
  const activeModule = useStore(s => s.activeModule);

  useEffect(() => {
    init();
  }, [init]);

  const renderModule = () => {
    switch (activeModule) {
      case 'library':
        return <PlantLibrary />;
      case 'layout':
        return <SpaceLayout />;
      case 'calendar':
        return <PlantCalendar />;
      case 'records':
        return <CareRecords />;
      case 'shopping':
        return <ShoppingList />;
      default:
        return <PlantLibrary />;
    }
  };

  return (
    <div className="min-h-screen bg-cream-100 bg-leaf-pattern flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col md:flex-row max-w-[1600px] w-full mx-auto">
        <Sidebar />
        <main className="flex-1 p-2 md:p-4 lg:p-6 min-w-0 overflow-hidden">
          <div
            key={activeModule}
            className="animate-fade-in-up h-full"
          >
            {renderModule()}
          </div>
        </main>
      </div>
    </div>
  );
}
