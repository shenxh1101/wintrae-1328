import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, CalendarDays } from 'lucide-react';
import { CalendarEvent, CalendarEventType } from '@/types';
import { getMonthDays, getEventsByDate, EVENT_TYPE_META } from '@/utils/calendar';
import { formatDate } from '@/utils/storage';

interface MonthCalendarProps {
  events: CalendarEvent[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

export default function MonthCalendar({ events, selectedDate, onSelectDate }: MonthCalendarProps) {
  const today = useMemo(() => new Date(), []);
  const [current, setCurrent] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year = current.getFullYear();
  const month = current.getMonth();
  const monthDays = getMonthDays(year, month);
  const todayStr = formatDate(today);

  const goPrev = () => setCurrent(new Date(year, month - 1, 1));
  const goNext = () => setCurrent(new Date(year, month + 1, 1));
  const goToday = () => {
    setCurrent(new Date(today.getFullYear(), today.getMonth(), 1));
    onSelectDate(todayStr);
  };

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-brand-100 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-brand-50 to-cream-50 border-b border-brand-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center shadow-sm">
            <CalendarDays size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-brand-700">
              {year} 年 {month + 1} 月
            </h3>
            <p className="text-xs text-brand-500/70">种植日历</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goPrev}
            className="w-9 h-9 rounded-lg hover:bg-brand-100 text-brand-600 flex items-center justify-center transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={goToday}
            className="h-9 px-4 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <RotateCcw size={15} />
            今天
          </button>
          <button
            onClick={goNext}
            className="w-9 h-9 rounded-lg hover:bg-brand-100 text-brand-600 flex items-center justify-center transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 px-4 pt-4 pb-2">
        {WEEKDAYS.map((w, i) => (
          <div
            key={w}
            className={`text-center text-xs font-semibold py-2 ${
              i === 0 || i === 6 ? 'text-rose-500' : 'text-brand-600'
            }`}
          >
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 px-4 pb-5">
        {monthDays.map((date, idx) => {
          if (!date) {
            return <div key={`empty-${idx}`} className="aspect-square" />;
          }

          const dateStr = formatDate(date);
          const dayEvents = getEventsByDate(events, dateStr);
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          const weekday = date.getDay();
          const isWeekend = weekday === 0 || weekday === 6;

          const uniqueTypes = Array.from(
            new Set(dayEvents.map(e => e.type))
          ) as CalendarEventType[];
          const showMore = uniqueTypes.length > 3;
          const displayTypes = uniqueTypes.slice(0, 3);

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className={`aspect-square rounded-xl p-1.5 flex flex-col items-center justify-start gap-1 transition-all relative
                ${isSelected ? 'ring-2 ring-brand-500 ring-offset-2 bg-brand-50' : 'hover:bg-cream-50'}
                ${isToday && !isSelected ? 'bg-brand-500 text-white shadow-md' : ''}
              `}
            >
              <span
                className={`text-sm font-medium ${
                  isToday
                    ? 'text-white'
                    : isWeekend
                    ? 'text-rose-500'
                    : 'text-gray-700'
                } ${isSelected && !isToday ? 'text-brand-700' : ''}`}
              >
                {date.getDate()}
              </span>
              {dayEvents.length > 0 && (
                <div className="flex items-center gap-0.5 flex-wrap justify-center">
                  {displayTypes.map((type, i) => (
                    <span
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full ${EVENT_TYPE_META[type].color} ${
                        isToday ? 'ring-1 ring-white' : ''
                      }`}
                    />
                  ))}
                  {showMore && (
                    <span
                      className={`text-[10px] font-medium leading-none ${
                        isToday ? 'text-white/90' : 'text-gray-500'
                      }`}
                    >
                      +{uniqueTypes.length - 3}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
