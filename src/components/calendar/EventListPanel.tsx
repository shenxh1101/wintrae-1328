import { PlusCircle } from 'lucide-react';
import { CalendarEvent, CalendarEventType, EVENT_TYPE_LABELS } from '@/types';
import { EVENT_TYPE_META } from '@/utils/calendar';
import EventCard from './EventCard';

interface EventListPanelProps {
  selectedDate: string;
  events: CalendarEvent[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

const EVENT_TYPE_ORDER: CalendarEventType[] = [
  'water',
  'fertilize',
  'prune',
  'sow',
  'repot',
  'harvest',
];

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
    today.getDate()
  ).padStart(2, '0')}`;

  let prefix = '';
  if (dateStr === todayStr) {
    prefix = '今天 · ';
  } else {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(tomorrow.getDate()).padStart(2, '0')}`;
    if (dateStr === tomorrowStr) {
      prefix = '明天 · ';
    }
  }

  return `${prefix}${date.getMonth() + 1}月${date.getDate()}日 ${weekdays[date.getDay()]}`;
}

export default function EventListPanel({
  selectedDate,
  events,
  onToggleComplete,
  onDelete,
}: EventListPanelProps) {
  const sortedEvents = [...events].sort((a, b) => {
    const idxA = EVENT_TYPE_ORDER.indexOf(a.type);
    const idxB = EVENT_TYPE_ORDER.indexOf(b.type);
    if (idxA !== idxB) return idxA - idxB;
    return a.plantId.localeCompare(b.plantId);
  });

  const grouped = sortedEvents.reduce((acc, event) => {
    const type = event.type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(event);
    return acc;
  }, {} as Record<CalendarEventType, CalendarEvent[]>);

  const completedCount = events.filter(e => e.completed).length;
  const totalCount = events.length;

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-brand-100 h-full flex flex-col overflow-hidden">
      <div className="px-5 py-4 bg-gradient-to-r from-cream-50 to-brand-50 border-b border-brand-100">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-bold text-brand-700">{formatDateLabel(selectedDate)}</h3>
          {totalCount > 0 && (
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-brand-100 text-brand-700">
              {completedCount}/{totalCount} 已完成
            </span>
          )}
        </div>
        <p className="text-xs text-brand-500/70">
          {totalCount === 0
            ? '今日暂无安排'
            : `共 ${totalCount} 项种植任务`}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {totalCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-20 h-20 rounded-full bg-cream-100 flex items-center justify-center mb-4">
              <PlusCircle size={36} className="text-brand-400" />
            </div>
            <h4 className="text-base font-semibold text-brand-700 mb-1">暂无待办事项</h4>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              在阳台布局中添加植物后，系统会自动生成浇水、施肥等提醒任务
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {(Object.keys(EVENT_TYPE_META) as CalendarEventType[]).map(type => (
                <span
                  key={type}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-50 text-xs text-gray-500"
                >
                  <span>{EVENT_TYPE_META[type].emoji}</span>
                  {EVENT_TYPE_LABELS[type]}
                </span>
              ))}
            </div>
          </div>
        ) : (
          EVENT_TYPE_ORDER.map(type => {
            const typeEvents = grouped[type];
            if (!typeEvents || typeEvents.length === 0) return null;
            const meta = EVENT_TYPE_META[type];
            return (
              <div key={type} className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <span className={`w-2 h-2 rounded-full ${meta.color}`} />
                  <span className="text-xs font-semibold text-gray-600">
                    {meta.emoji} {EVENT_TYPE_LABELS[type]}
                  </span>
                  <span className="text-xs text-gray-400">({typeEvents.length})</span>
                </div>
                <div className="space-y-2">
                  {typeEvents.map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onToggleComplete={onToggleComplete}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
