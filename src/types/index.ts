export type LightNeed = 'full-sun' | 'partial-sun' | 'shade';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter' | 'all';
export type PotSize = 'small' | 'medium' | 'large';
export type ModuleKey = 'library' | 'layout' | 'calendar' | 'records' | 'shopping';

export interface Plant {
  id: string;
  name: string;
  emoji: string;
  lightNeed: LightNeed;
  season: Season[];
  potSize: PotSize;
  height: number;
  spread: number;
  waterDays: number;
  growCycle: string;
  careTips: string;
  pestControl: string;
  fertilizerNeed: string;
  supportNeed: boolean;
  soilType: string;
  harvestDays?: number;
}

export interface PlacedPlant {
  id: string;
  plantId: string;
  x: number;
  y: number;
  potSize: PotSize;
  notes?: string;
  createdAt?: string;
}

export type CalendarEventType = 'sow' | 'repot' | 'fertilize' | 'prune' | 'harvest' | 'water';

export interface CalendarEvent {
  id: string;
  type: CalendarEventType;
  plantId: string;
  date: string;
  completed: boolean;
  description: string;
}

export type CareRecordType = 'water' | 'fertilize' | 'prune' | 'pest' | 'other';

export interface CareRecord {
  id: string;
  type: CareRecordType;
  plantId: string;
  date: string;
  photo?: string;
  notes: string;
  result?: string;
}

export type ShoppingCategory = 'soil' | 'fertilizer' | 'seed' | 'tool' | 'support' | 'other';
export type ShoppingStatus = 'pending' | 'bought' | 'out-of-stock';

export interface ShoppingItem {
  id: string;
  category: ShoppingCategory;
  name: string;
  quantity: number;
  unit: string;
  status: ShoppingStatus;
  alternative?: string;
  generated?: boolean;
}

export interface Scheme {
  id: string;
  name: string;
  balconyWidth: number;
  balconyHeight: number;
  placedPlants: PlacedPlant[];
  calendarEvents: CalendarEvent[];
  careRecords: CareRecord[];
  shoppingItems: ShoppingItem[];
  createdAt: string;
  updatedAt: string;
}

export interface LayoutWarning {
  type: 'shade' | 'ventilation' | 'light';
  severity: 'warning' | 'error';
  message: string;
  plantIds: string[];
}

export const EVENT_TYPE_LABELS: Record<CalendarEventType, string> = {
  sow: '播种',
  repot: '换盆',
  fertilize: '施肥',
  prune: '修剪',
  harvest: '收获',
  water: '浇水',
};

export const EVENT_TYPE_COLORS: Record<CalendarEventType, string> = {
  sow: 'bg-green-500',
  repot: 'bg-amber-500',
  fertilize: 'bg-yellow-500',
  prune: 'bg-purple-500',
  harvest: 'bg-rose-500',
  water: 'bg-blue-500',
};

export const CARE_TYPE_LABELS: Record<CareRecordType, string> = {
  water: '浇水',
  fertilize: '施肥',
  prune: '修剪',
  pest: '病虫害',
  other: '其他',
};

export const CARE_TYPE_EMOJI: Record<CareRecordType, string> = {
  water: '💧',
  fertilize: '🌱',
  prune: '✂️',
  pest: '🐛',
  other: '📝',
};

export const SHOPPING_CATEGORY_LABELS: Record<ShoppingCategory, string> = {
  soil: '土壤基质',
  fertilizer: '肥料',
  seed: '种子/种苗',
  tool: '园艺工具',
  support: '支架/辅助',
  other: '其他',
};

export const SHOPPING_STATUS_LABELS: Record<ShoppingStatus, string> = {
  pending: '待采购',
  bought: '已购买',
  'out-of-stock': '缺货',
};

export const LIGHT_LABELS: Record<LightNeed, string> = {
  'full-sun': '全日照',
  'partial-sun': '半日照',
  shade: '耐阴',
};

export const SEASON_LABELS: Record<Season, string> = {
  spring: '春',
  summer: '夏',
  autumn: '秋',
  winter: '冬',
  all: '四季',
};

export const POT_SIZE_LABELS: Record<PotSize, string> = {
  small: '小盆 (10-15cm)',
  medium: '中盆 (15-25cm)',
  large: '大盆 (25-40cm)',
};

export const POT_SIZE_VALUE: Record<PotSize, number> = {
  small: 15,
  medium: 25,
  large: 40,
};
