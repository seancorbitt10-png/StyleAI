import type { Formality, OutfitConstraints, WardrobeCategory, WardrobeItemSummary } from '../types';

const BASE_REQUIRED: WardrobeCategory[] = ['top', 'bottom', 'shoes'];

export function requiredCategoriesFor(constraints: OutfitConstraints): WardrobeCategory[] {
  const required = new Set<WardrobeCategory>(BASE_REQUIRED);
  const weather = (constraints.weather ?? '').toLowerCase();
  if (
    weather.includes('cold') ||
    weather.includes('rain') ||
    weather.includes('snow') ||
    weather.includes('winter')
  ) {
    required.add('outerwear');
  }
  return [...required];
}

/**
 * Recommend purchases only for missing *required* categories.
 * A complete wardrobe must not generate shopping gaps just because a
 * bought item might score slightly higher.
 */
export function identifyRequiredGaps(
  required: readonly WardrobeCategory[],
  owned: readonly Pick<WardrobeItemSummary, 'category' | 'id'>[],
  excludedItemIds: readonly string[] = [],
): WardrobeCategory[] {
  const usable = owned.filter((item) => !excludedItemIds.includes(item.id));
  const present = new Set(usable.map((item) => item.category));
  return required.filter((category) => !present.has(category));
}

export function filterWardrobe(
  items: readonly WardrobeItemSummary[],
  constraints: OutfitConstraints,
): WardrobeItemSummary[] {
  return items.filter((item) => {
    if (constraints.excludedItemIds.includes(item.id)) return false;
    if (constraints.formality && item.formality) {
      return formalityCompatible(item.formality, constraints.formality);
    }
    return true;
  });
}

const FORMALITY_RANK: Record<Formality, number> = {
  casual: 0,
  smart_casual: 1,
  business_casual: 2,
  business: 3,
  formal: 4,
};

export function formalityCompatible(item: Formality, target: Formality): boolean {
  return Math.abs(FORMALITY_RANK[item] - FORMALITY_RANK[target]) <= 1;
}
