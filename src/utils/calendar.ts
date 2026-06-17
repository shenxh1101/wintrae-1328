import { CalendarEvent, CalendarEventType, Plant, PlacedPlant } from '@/types';
import { generateId, formatDate, addDays } from './storage';

const CURRENT_MONTH = new Date();

export function generateEventsForPlants(
  placedPlants: PlacedPlant[],
  plants: Plant[],
  existingEvents: CalendarEvent[]
): CalendarEvent[] {
  const events: CalendarEvent[] = [...existingEvents];
  const plantMap = new Map(plants.map(p => [p.id, p]));
  const existingKeys = new Set(existingEvents.map(e => `${e.plantId}-${e.type}-${e.date}`));

  placedPlants.forEach(pp => {
    const plant = plantMap.get(pp.plantId);
    if (!plant) return;

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const waterInterval = plant.waterDays;
    for (let d = new Date(startOfMonth); d <= endOfMonth; d = addDays(d, 1)) {
      const dayNum = Math.floor((d.getTime() - startOfMonth.getTime()) / (1000 * 60 * 60 * 24));
      if (dayNum % waterInterval === 0) {
        const dateStr = formatDate(d);
        const key = `${pp.plantId}-water-${dateStr}`;
        if (!existingKeys.has(key)) {
          events.push({
            id: generateId(),
            type: 'water',
            plantId: pp.plantId,
            date: dateStr,
            completed: d < today,
            description: `给 ${plant.name} 浇水（每${waterInterval}天一次）`,
          });
          existingKeys.add(key);
        }
      }
    }

    const fertilizeInterval = 14;
    for (let w = 0; w < 2; w++) {
      const d = addDays(startOfMonth, w * fertilizeInterval + 3);
      if (d <= endOfMonth && plant.season.includes(getCurrentSeason())) {
        const dateStr = formatDate(d);
        const key = `${pp.plantId}-fertilize-${dateStr}`;
        if (!existingKeys.has(key)) {
          events.push({
            id: generateId(),
            type: 'fertilize',
            plantId: pp.plantId,
            date: dateStr,
            completed: d < today,
            description: `给 ${plant.name} 施肥：${plant.fertilizerNeed}`,
          });
          existingKeys.add(key);
        }
      }
    }

    if (plant.harvestDays) {
      const seasonStart = getSeasonStart();
      if (seasonStart) {
        const harvestDate = addDays(seasonStart, plant.harvestDays);
        if (harvestDate.getMonth() === today.getMonth()) {
          const dateStr = formatDate(harvestDate);
          const key = `${pp.plantId}-harvest-${dateStr}`;
          if (!existingKeys.has(key)) {
            events.push({
              id: generateId(),
              type: 'harvest',
              plantId: pp.plantId,
              date: dateStr,
              completed: harvestDate < today,
              description: `${plant.name} 预计收获期`,
            });
            existingKeys.add(key);
          }
        }
      }
    }

    const pruneDate = addDays(startOfMonth, 15);
    if (pruneDate <= endOfMonth) {
      const dateStr = formatDate(pruneDate);
      const key = `${pp.plantId}-prune-${dateStr}`;
      if (!existingKeys.has(key) && needsPruning(plant)) {
        events.push({
          id: generateId(),
          type: 'prune',
          plantId: pp.plantId,
          date: dateStr,
          completed: pruneDate < today,
          description: `修剪 ${plant.name}：打顶促进分枝，摘除黄叶`,
        });
        existingKeys.add(key);
      }
    }
  });

  return events;
}

function getCurrentSeason(): 'spring' | 'summer' | 'autumn' | 'winter' {
  const month = CURRENT_MONTH.getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

function getSeasonStart(): Date | null {
  const season = getCurrentSeason();
  const year = CURRENT_MONTH.getFullYear();
  const starts: Record<string, [number, number]> = {
    spring: [year, 2],
    summer: [year, 5],
    autumn: [year, 8],
    winter: [year, 11],
  };
  const [y, m] = starts[season];
  return new Date(y, m, 1);
}

function needsPruning(plant: Plant): boolean {
  const pruningPlants = ['tomato', 'basil', 'mint', 'rosemary', 'lavender', 'geranium', 'oregano', 'thyme'];
  return pruningPlants.includes(plant.id) || plant.supportNeed;
}

export function getMonthDays(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startWeekday = first.getDay();
  const days: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) days.push(null);
  for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d));
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

export function getEventsByDate(events: CalendarEvent[], date: string): CalendarEvent[] {
  return events.filter(e => e.date === date);
}

export const EVENT_TYPE_META: Record<CalendarEventType, { label: string; color: string; emoji: string }> = {
  sow: { label: '播种', color: 'bg-emerald-500', emoji: '🌱' },
  repot: { label: '换盆', color: 'bg-amber-500', emoji: '🪴' },
  fertilize: { label: '施肥', color: 'bg-yellow-500', emoji: '💛' },
  prune: { label: '修剪', color: 'bg-purple-500', emoji: '✂️' },
  harvest: { label: '收获', color: 'bg-rose-500', emoji: '🧺' },
  water: { label: '浇水', color: 'bg-blue-500', emoji: '💧' },
};
