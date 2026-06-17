import { useState, useMemo } from 'react';
import { RotateCcw, Sparkles } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { formatDate } from '@/utils/storage';
import { getEventsByDate } from '@/utils/calendar';
import MonthCalendar from '@/components/calendar/MonthCalendar';
import EventListPanel from '@/components/calendar/EventListPanel';

export default function PlantCalendar() {
  const scheme = useStore(s => s.getCurrentScheme());
  const regenerateEvents = useStore(s => s.regenerateEvents);
  const updateCalendarEvent = useStore(s => s.updateCalendarEvent);
  const removeCalendarEvent = useStore(s => s.removeCalendarEvent);

  const allEvents = scheme?.calendarEvents ?? [];
  const placedPlantsCount = scheme?.placedPlants.length ?? 0;

  const todayStr = useMemo(() => formatDate(new Date()), []);
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const selectedEvents = useMemo(
    () => getEventsByDate(allEvents, selectedDate),
    [allEvents, selectedDate]
  );

  const handleToggleComplete = (id: string) => {
    const event = allEvents.find(e => e.id === id);
    if (!event) return;
    updateCalendarEvent(id, { completed: !event.completed });
  };

  const handleDelete = (id: string) => {
    removeCalendarEvent(id);
  };

  const upcomingCount = useMemo(() => {
    const today = new Date(todayStr);
    const in7Days = new Date(today);
    in7Days.setDate(in7Days.getDate() + 7);
    return allEvents.filter(e => {
      if (e.completed) return false;
      const d = new Date(e.date);
      return d >= today && d <= in7Days;
    }).length;
  }, [allEvents, todayStr]);

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-brand-800 font-serif">种植日历</h2>
          <p className="text-sm text-brand-600/70 mt-1">
            {placedPlantsCount > 0
              ? `已规划 ${placedPlantsCount} 株植物 · 未来 7 天待办 ${upcomingCount} 项`
              : '在布局中添加植物以生成提醒任务'}
          </p>
        </div>
        <button
          onClick={() => regenerateEvents()}
          disabled={placedPlantsCount === 0}
          className="h-10 px-5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white text-sm font-medium hover:from-brand-600 hover:to-brand-700 shadow-soft flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-brand-500 disabled:hover:to-brand-600"
        >
          <Sparkles size={16} />
          <span>重新生成提醒</span>
          <RotateCcw size={14} className="opacity-80" />
        </button>
      </div>

      <div className="flex gap-4 min-h-[640px]">
        <div className="flex-[7] min-w-0">
          <MonthCalendar
            events={allEvents}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </div>
        <div className="flex-[3] min-w-[320px]">
          <EventListPanel
            selectedDate={selectedDate}
            events={selectedEvents}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
}
