import type { OutfitConstraints, WardrobeItemSummary } from '../types';
import { formalityCompatible } from './wardrobe';

export type OutfitCandidate = {
  itemIds: string[];
  items: WardrobeItemSummary[];
};

export function scoreOutfitCandidate(
  candidate: OutfitCandidate,
  constraints: OutfitConstraints,
  preferredColors: string[] = [],
): number {
  if (candidate.items.length === 0) return 0;
  let score = 40;

  const categories = new Set(candidate.items.map((item) => item.category));
  score += categories.size * 8;

  if (constraints.formality) {
    const matches = candidate.items.filter(
      (item) => item.formality && formalityCompatible(item.formality, constraints.formality!),
    ).length;
    score += (matches / candidate.items.length) * 20;
  }

  if (preferredColors.length > 0) {
    const colorHits = candidate.items.filter((item) =>
      item.color ? preferredColors.some((c) => c.toLowerCase() === item.color!.toLowerCase()) : false,
    ).length;
    score += (colorHits / candidate.items.length) * 15;
  }

  const uniqueIds = new Set(candidate.itemIds);
  if (uniqueIds.size !== candidate.itemIds.length) score -= 30;

  return Math.max(0, Math.min(100, Math.round(score)));
}
