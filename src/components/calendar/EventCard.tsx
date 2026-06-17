import { Check, Trash2 } from 'lucide-react';
import { CalendarEvent } from '@/types';
import { PLANTS } from '@/data/plants';
import { EVENT_TYPE_META } from '@/utils/calendar';

interface EventCardProps {
  event: CalendarEvent;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function EventCard({ event, onToggleComplete, onDelete }: EventCardProps) {
  const plant = PLANTS.find(p => p.id === event.plantId);
  const meta = EVENT_TYPE_META[event.type];

  return (
    <div
      className={`group relative rounded-xl p-4 border transition-all ${
        event.completed
          ? 'bg-gray-50 border-gray-200'
          : 'bg-white border-brand-100 hover:border-brand-300 hover:shadow-card'
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggleComplete(event.id)}
          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all mt-0.5 ${
            event.completed
              ? 'bg-brand-500 border-brand-500 text-white'
              : 'border-gray-300 hover:border-brand-500 group-hover:border-brand-400'
          }`}
        >
          {event.completed && <Check size={14} strokeWidth={3} />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${
                event.completed ? 'bg-gray-200 text-gray-500' : `${meta.color} text-white`
              }`}
            >
              <span className={event.completed ? 'opacity-60' : ''}>{meta.emoji}</span>
              {meta.label}
            </span>
            {plant && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${
                  event.completed
                    ? 'bg-gray-100 text-gray-500 line-through'
                    : 'bg-cream-100 text-earth-600'
                }`}
              >
                <span className={event.completed ? 'opacity-60' : ''}>{plant.emoji}</span>
                {plant.name}
              </span>
            )}
          </div>

          <p
            className={`text-sm leading-relaxed ${
              event.completed ? 'text-gray-400 line-through' : 'text-gray-700'
            }`}
          >
            {event.description}
          </p>

          <p
            className={`text-xs mt-2 ${
              event.completed ? 'text-gray-400' : 'text-gray-400'
            }`}
          >
            {event.date}
          </p>
        </div>

        <button
          onClick={() => onDelete(event.id)}
          className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            event.completed
              ? 'text-gray-400 hover:text-red-500 hover:bg-red-50'
              : 'text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50'
          }`}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
