import { PlacedPlant, Plant, ShoppingItem, ShoppingCategory, PotSize, POT_SIZE_VALUE } from '@/types';
import { generateId } from './storage';

export function generateShoppingList(
  placedPlants: PlacedPlant[],
  plants: Plant[],
  existingItems: ShoppingItem[]
): ShoppingItem[] {
  const existingMap = new Map(existingItems.filter(i => !i.generated).map(i => [i.id, i]));
  const generated: ShoppingItem[] = [];
  const plantMap = new Map(plants.map(p => [p.id, p]));

  const soilVolume: Record<string, { vol: number; type: string }> = {};
  const fertilizerAgg: Record<string, { count: number; plants: string[] }> = {};
  const seedItems: { name: string; nickname: string }[] = [];
  const supportItems: { nickname: string }[] = [];

  placedPlants.forEach(pp => {
    const plant = plantMap.get(pp.plantId);
    if (!plant) return;

    const potSizeCm = POT_SIZE_VALUE[pp.potSize];
    const vol = Math.PI * Math.pow(potSizeCm / 2, 2) * potSizeCm * 0.7 * 1.2 / 1000;
    const key = plant.soilType;
    if (!soilVolume[key]) soilVolume[key] = { vol: 0, type: key };
    soilVolume[key].vol += vol;

    const fert = plant.fertilizerNeed.split('，')[0].split('：')[0];
    if (!fertilizerAgg[fert]) fertilizerAgg[fert] = { count: 0, plants: [] };
    fertilizerAgg[fert].count += 1;
    fertilizerAgg[fert].plants.push(pp.nickname);

    seedItems.push({ name: `${pp.nickname} 种子`, nickname: pp.nickname });

    if (plant.supportNeed) supportItems.push({ nickname: pp.nickname });
  });

  Object.values(soilVolume).forEach(({ vol, type }) => {
    if (vol > 0.1) {
      generated.push({
        id: generateId(),
        category: 'soil' as ShoppingCategory,
        name: type,
        quantity: Math.ceil(vol),
        unit: 'L',
        status: 'pending',
        generated: true,
      });
    }
  });

  Object.entries(fertilizerAgg).forEach(([name, data]) => {
    generated.push({
      id: generateId(),
      category: 'fertilizer' as ShoppingCategory,
      name: `${name}（${data.plants.join('、')}）`,
      quantity: Math.max(1, Math.ceil(data.count / 3)),
      unit: '袋',
      status: 'pending',
      generated: true,
    });
  });

  seedItems.forEach(item => {
    generated.push({
      id: generateId(),
      category: 'seed' as ShoppingCategory,
      name: item.name,
      quantity: 1,
      unit: '包',
      status: 'pending',
      generated: true,
    });
  });

  supportItems.forEach(item => {
    generated.push({
      id: generateId(),
      category: 'support' as ShoppingCategory,
      name: `${item.nickname} 支架/竹竿`,
      quantity: 1,
      unit: '根',
      status: 'pending',
      generated: true,
    });
  });

  generated.push({
    id: generateId(),
    category: 'tool' as ShoppingCategory,
    name: '园艺小铲子',
    quantity: 1,
    unit: '把',
    status: 'pending',
    generated: true,
  });
  generated.push({
    id: generateId(),
    category: 'tool' as ShoppingCategory,
    name: '喷壶/洒水壶',
    quantity: 1,
    unit: '个',
    status: 'pending',
    generated: true,
  });
  generated.push({
    id: generateId(),
    category: 'tool' as ShoppingCategory,
    name: '园艺手套',
    quantity: 1,
    unit: '双',
    status: 'pending',
    generated: true,
  });

  const manualItems = existingItems.filter(i => !i.generated);
  return [...manualItems, ...generated];
}
