import { PlacedPlant, Plant, LayoutWarning, POT_SIZE_VALUE } from '@/types';

export function detectLayoutWarnings(
  placedPlants: PlacedPlant[],
  plants: Plant[],
  balconyWidth: number,
  balconyHeight: number
): LayoutWarning[] {
  const warnings: LayoutWarning[] = [];
  const plantMap = new Map(plants.map(p => [p.id, p]));

  placedPlants.forEach((pp, i) => {
    const plant = plantMap.get(pp.plantId);
    if (!plant) return;

    const distanceToTop = pp.y;
    const distanceToLeft = pp.x;
    const potSize = POT_SIZE_VALUE[pp.potSize];

    if (plant.lightNeed === 'full-sun') {
      if (distanceToTop > balconyHeight * 0.5 && distanceToLeft > balconyWidth * 0.5) {
        warnings.push({
          type: 'light',
          severity: 'warning',
          message: `${plant.name} 需要充足阳光，建议移近窗户`,
          plantIds: [pp.id],
        });
      }
    }

    for (let j = i + 1; j < placedPlants.length; j++) {
      const otherPp = placedPlants[j];
      const otherPlant = plantMap.get(otherPp.plantId);
      if (!otherPlant) continue;

      const dx = pp.x - otherPp.x;
      const dy = pp.y - otherPp.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const avgSpread = (plant.spread + otherPlant.spread) / 2;
      const minDistance = avgSpread * 0.4;

      if (distance < POT_SIZE_VALUE[pp.potSize] / 2 + POT_SIZE_VALUE[otherPp.potSize] / 2) {
        const taller = plant.height >= otherPlant.height ? plant : otherPlant;
        const shorter = plant.height >= otherPlant.height ? otherPlant : plant;
        if (taller.height > shorter.height * 1.5 && shorter.lightNeed !== 'shade') {
          warnings.push({
            type: 'shade',
            severity: 'error',
            message: `${taller.name} 可能遮挡 ${shorter.name} 的光照，建议调整位置`,
            plantIds: [pp.id, otherPp.id],
          });
        }
      }

      if (distance < avgSpread * 0.6) {
        warnings.push({
          type: 'ventilation',
          severity: 'warning',
          message: `${plant.name} 与 ${otherPlant.name} 间距不足，通风不良易生病虫害`,
          plantIds: [pp.id, otherPp.id],
        });
      }
    }

    if (pp.x < potSize / 2 || pp.x > balconyWidth - potSize / 2 ||
        pp.y < potSize / 2 || pp.y > balconyHeight - potSize / 2) {
      warnings.push({
        type: 'ventilation',
        severity: 'warning',
        message: `${plant.name} 部分超出阳台边界，请调整位置`,
        plantIds: [pp.id],
      });
    }
  });

  return warnings;
}
