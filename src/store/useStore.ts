import { create } from 'zustand';
import {
  Scheme,
  PlacedPlant,
  CalendarEvent,
  CareRecord,
  ShoppingItem,
  ModuleKey,
  PotSize,
  CareRecordType,
  ShoppingCategory,
  ShoppingStatus,
  POT_SIZE_VALUE,
} from '@/types';
import {
  loadSchemes,
  saveSchemes,
  loadCurrentSchemeId,
  saveCurrentSchemeId,
  generateId,
  formatDate,
} from '@/utils/storage';
import { generateEventsForPlants } from '@/utils/calendar';
import { generateShoppingList } from '@/utils/shopping';
import { PLANTS } from '@/data/plants';

interface AppState {
  schemes: Scheme[];
  currentSchemeId: string | null;
  activeModule: ModuleKey;
  lastAddedPlacedPlantId: string | null;

  init: () => void;
  getCurrentScheme: () => Scheme | undefined;
  setActiveModule: (m: ModuleKey) => void;

  createScheme: (name?: string) => string;
  switchScheme: (id: string) => void;
  renameScheme: (id: string, name: string) => void;
  deleteScheme: (id: string) => void;
  updateBalconySize: (width: number, height: number) => void;

  addPlacedPlant: (plantId: string, x?: number, y?: number) => string | null;
  updatePlacedPlant: (id: string, data: Partial<PlacedPlant>) => void;
  removePlacedPlant: (id: string) => void;
  setLastAddedPlacedPlantId: (id: string | null) => void;

  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  updateCalendarEvent: (id: string, data: Partial<CalendarEvent>) => void;
  removeCalendarEvent: (id: string) => void;
  regenerateEvents: (refreshPlacedPlantIds?: string[]) => void;

  addCareRecord: (record: Omit<CareRecord, 'id'>) => void;
  updateCareRecord: (id: string, data: Partial<CareRecord>) => void;
  removeCareRecord: (id: string) => void;

  addShoppingItem: (item: Omit<ShoppingItem, 'id'>) => void;
  updateShoppingItem: (id: string, data: Partial<ShoppingItem>) => void;
  removeShoppingItem: (id: string) => void;
  regenerateShoppingList: () => void;

  persist: () => void;
}

function createDefaultScheme(name: string): Scheme {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    name,
    balconyWidth: 300,
    balconyHeight: 150,
    placedPlants: [],
    calendarEvents: [],
    careRecords: [],
    shoppingItems: [],
    createdAt: now,
    updatedAt: now,
  };
}

export const useStore = create<AppState>((set, get) => ({
  schemes: [],
  currentSchemeId: null,
  activeModule: 'library',
  lastAddedPlacedPlantId: null,

  init: () => {
    const saved = loadSchemes();
    const currentId = loadCurrentSchemeId();
    let schemes = saved;
    let activeId: string | null = currentId;

    if (schemes.length === 0) {
      const defaultScheme = createDefaultScheme('我的阳台方案');
      schemes = [defaultScheme];
      activeId = defaultScheme.id;
    }

    if (!activeId || !schemes.find(s => s.id === activeId)) {
      activeId = schemes[0].id;
    }

    // 迁移老数据：给没有 nickname 的植物补充默认昵称
    const plantMap = new Map(PLANTS.map(p => [p.id, p]));
    schemes = schemes.map(s => {
      let changed = false;
      const placed = s.placedPlants.map(pp => {
        if (!pp.nickname) {
          changed = true;
          const plant = plantMap.get(pp.plantId);
          const name = plant?.name || '植物';
          // 给同种植物按顺序编号
          const sameInScheme = s.placedPlants.filter(
            (p, idx) => p.plantId === pp.plantId && idx < s.placedPlants.indexOf(pp)
          ).length;
          return { ...pp, nickname: `${name}${sameInScheme + 1}` };
        }
        return pp;
      });
      return changed ? { ...s, placedPlants: placed } : s;
    });

    set({ schemes, currentSchemeId: activeId, activeModule: 'library', lastAddedPlacedPlantId: null });
    get().persist();
  },

  getCurrentScheme: () => {
    const { schemes, currentSchemeId } = get();
    return schemes.find(s => s.id === currentSchemeId);
  },

  setActiveModule: (m) => set({ activeModule: m }),

  createScheme: (name) => {
    const scheme = createDefaultScheme(name || `方案 ${get().schemes.length + 1}`);
    const schemes = [...get().schemes, scheme];
    set({ schemes, currentSchemeId: scheme.id });
    get().persist();
    return scheme.id;
  },

  switchScheme: (id) => {
    set({ currentSchemeId: id });
    get().persist();
  },

  renameScheme: (id, name) => {
    const schemes = get().schemes.map(s =>
      s.id === id ? { ...s, name, updatedAt: new Date().toISOString() } : s
    );
    set({ schemes });
    get().persist();
  },

  deleteScheme: (id) => {
    let schemes = get().schemes.filter(s => s.id !== id);
    let currentSchemeId = get().currentSchemeId;
    if (schemes.length === 0) {
      const defaultScheme = createDefaultScheme('我的阳台方案');
      schemes = [defaultScheme];
      currentSchemeId = defaultScheme.id;
    } else if (currentSchemeId === id) {
      currentSchemeId = schemes[0].id;
    }
    set({ schemes, currentSchemeId });
    get().persist();
  },

  updateBalconySize: (width, height) => {
    const { currentSchemeId, schemes } = get();
    set({
      schemes: schemes.map(s =>
        s.id === currentSchemeId
          ? { ...s, balconyWidth: width, balconyHeight: height, updatedAt: new Date().toISOString() }
          : s
      ),
    });
    get().persist();
  },

  addPlacedPlant: (plantId, x, y) => {
    const { currentSchemeId, schemes, getCurrentScheme } = get();
    const scheme = getCurrentScheme();
    if (!scheme) return null;

    const plant = PLANTS.find(p => p.id === plantId);
    if (!plant) return null;

    const sameSpeciesCount = scheme.placedPlants.filter(p => p.plantId === plantId).length;
    const nickname = `${plant.name}${sameSpeciesCount + 1}`;

    let finalX: number;
    let finalY: number;
    const potSize = POT_SIZE_VALUE[plant.potSize];
    const halfPot = potSize / 2;

    if (typeof x === 'number' && typeof y === 'number') {
      finalX = Math.max(halfPot, Math.min(scheme.balconyWidth - halfPot, x));
      finalY = Math.max(halfPot, Math.min(scheme.balconyHeight - halfPot, y));
    } else {
      const placedCount = scheme.placedPlants.length;
      const cols = Math.ceil(Math.sqrt(placedCount + 1));
      const row = Math.floor(placedCount / cols);
      const col = placedCount % cols;
      const padding = 60;
      const usableW = scheme.balconyWidth - padding * 2;
      const usableH = scheme.balconyHeight - padding * 2;
      finalX = padding + (usableW / Math.max(cols, 1)) * (col + 0.5);
      finalY = padding + (usableH / Math.max(Math.ceil((placedCount + 1) / cols), 1)) * (row + 0.5);
    }

    const newPlant: PlacedPlant = {
      id: generateId(),
      plantId,
      nickname,
      x: finalX,
      y: finalY,
      potSize: plant.potSize as PotSize,
      createdAt: new Date().toISOString(),
    };

    const newSchemes = schemes.map(s =>
      s.id === currentSchemeId
        ? { ...s, placedPlants: [...s.placedPlants, newPlant], updatedAt: new Date().toISOString() }
        : s
    );
    set({ schemes: newSchemes, lastAddedPlacedPlantId: newPlant.id });
    get().regenerateEvents();
    get().regenerateShoppingList();
    get().persist();
    return newPlant.id;
  },

  updatePlacedPlant: (id, data) => {
    const { currentSchemeId, schemes, lastAddedPlacedPlantId } = get();
    set({
      schemes: schemes.map(s =>
        s.id === currentSchemeId
          ? {
              ...s,
              placedPlants: s.placedPlants.map(p => (p.id === id ? { ...p, ...data } : p)),
              updatedAt: new Date().toISOString(),
            }
          : s
      ),
    });
    if (data.nickname) {
      get().regenerateEvents([id]);
      get().regenerateShoppingList();
    }
    get().persist();
  },

  removePlacedPlant: (id) => {
    const { currentSchemeId, schemes, lastAddedPlacedPlantId } = get();
    set({
      schemes: schemes.map(s =>
        s.id === currentSchemeId
          ? {
              ...s,
              placedPlants: s.placedPlants.filter(p => p.id !== id),
              updatedAt: new Date().toISOString(),
            }
          : s
      ),
      lastAddedPlacedPlantId: lastAddedPlacedPlantId === id ? null : lastAddedPlacedPlantId,
    });
    get().regenerateEvents();
    get().regenerateShoppingList();
    get().persist();
  },

  setLastAddedPlacedPlantId: (id) => set({ lastAddedPlacedPlantId: id }),

  addCalendarEvent: (event) => {
    const { currentSchemeId, schemes } = get();
    const newEvent: CalendarEvent = { ...event, id: generateId() };
    set({
      schemes: schemes.map(s =>
        s.id === currentSchemeId
          ? { ...s, calendarEvents: [...s.calendarEvents, newEvent], updatedAt: new Date().toISOString() }
          : s
      ),
    });
    get().persist();
  },

  updateCalendarEvent: (id, data) => {
    const { currentSchemeId, schemes } = get();
    set({
      schemes: schemes.map(s =>
        s.id === currentSchemeId
          ? {
              ...s,
              calendarEvents: s.calendarEvents.map(e => (e.id === id ? { ...e, ...data } : e)),
              updatedAt: new Date().toISOString(),
            }
          : s
      ),
    });
    get().persist();
  },

  removeCalendarEvent: (id) => {
    const { currentSchemeId, schemes } = get();
    set({
      schemes: schemes.map(s =>
        s.id === currentSchemeId
          ? {
              ...s,
              calendarEvents: s.calendarEvents.filter(e => e.id !== id),
              updatedAt: new Date().toISOString(),
            }
          : s
      ),
    });
    get().persist();
  },

  regenerateEvents: (refreshPlacedPlantIds) => {
    const { currentSchemeId, schemes, getCurrentScheme } = get();
    const scheme = getCurrentScheme();
    if (!scheme) return;

    const events = generateEventsForPlants(scheme.placedPlants, PLANTS, scheme.calendarEvents, refreshPlacedPlantIds);
    set({
      schemes: schemes.map(s =>
        s.id === currentSchemeId
          ? { ...s, calendarEvents: events, updatedAt: new Date().toISOString() }
          : s
      ),
    });
    get().persist();
  },

  addCareRecord: (record) => {
    const { currentSchemeId, schemes } = get();
    const newRecord: CareRecord = { ...record, id: generateId() };
    set({
      schemes: schemes.map(s =>
        s.id === currentSchemeId
          ? { ...s, careRecords: [newRecord, ...s.careRecords], updatedAt: new Date().toISOString() }
          : s
      ),
    });
    get().persist();
  },

  updateCareRecord: (id, data) => {
    const { currentSchemeId, schemes } = get();
    set({
      schemes: schemes.map(s =>
        s.id === currentSchemeId
          ? {
              ...s,
              careRecords: s.careRecords.map(r => (r.id === id ? { ...r, ...data } : r)),
              updatedAt: new Date().toISOString(),
            }
          : s
      ),
    });
    get().persist();
  },

  removeCareRecord: (id) => {
    const { currentSchemeId, schemes } = get();
    set({
      schemes: schemes.map(s =>
        s.id === currentSchemeId
          ? {
              ...s,
              careRecords: s.careRecords.filter(r => r.id !== id),
              updatedAt: new Date().toISOString(),
            }
          : s
      ),
    });
    get().persist();
  },

  addShoppingItem: (item) => {
    const { currentSchemeId, schemes } = get();
    const newItem: ShoppingItem = { ...item, id: generateId() };
    set({
      schemes: schemes.map(s =>
        s.id === currentSchemeId
          ? { ...s, shoppingItems: [...s.shoppingItems, newItem], updatedAt: new Date().toISOString() }
          : s
      ),
    });
    get().persist();
  },

  updateShoppingItem: (id, data) => {
    const { currentSchemeId, schemes } = get();
    set({
      schemes: schemes.map(s =>
        s.id === currentSchemeId
          ? {
              ...s,
              shoppingItems: s.shoppingItems.map(i => (i.id === id ? { ...i, ...data } : i)),
              updatedAt: new Date().toISOString(),
            }
          : s
      ),
    });
    get().persist();
  },

  removeShoppingItem: (id) => {
    const { currentSchemeId, schemes } = get();
    set({
      schemes: schemes.map(s =>
        s.id === currentSchemeId
          ? {
              ...s,
              shoppingItems: s.shoppingItems.filter(i => i.id !== id),
              updatedAt: new Date().toISOString(),
            }
          : s
      ),
    });
    get().persist();
  },

  regenerateShoppingList: () => {
    const { currentSchemeId, schemes, getCurrentScheme } = get();
    const scheme = getCurrentScheme();
    if (!scheme) return;

    const items = generateShoppingList(scheme.placedPlants, PLANTS, scheme.shoppingItems);
    set({
      schemes: schemes.map(s =>
        s.id === currentSchemeId
          ? { ...s, shoppingItems: items, updatedAt: new Date().toISOString() }
          : s
      ),
    });
    get().persist();
  },

  persist: () => {
    const { schemes, currentSchemeId } = get();
    saveSchemes(schemes);
    saveCurrentSchemeId(currentSchemeId);
  },
}));
