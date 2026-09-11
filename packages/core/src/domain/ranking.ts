import type { Product, ProductSearchIntent } from '../types';

/**
 * Ranking input intentionally omits affiliateUrl / commission.
 * Affiliate economics must never override relevance.
 */
export type RankableProduct = Pick<
  Product,
  'id' | 'title' | 'category' | 'price' | 'colors' | 'brand' | 'availability'
>;

export type RankContext = {
  intent: ProductSearchIntent;
  preferredBrands: string[];
  dislikedBrands: string[];
  preferredColors: string[];
  budget: number | null;
};

export function rankProducts(products: RankableProduct[], context: RankContext): RankableProduct[] {
  return [...products].sort((a, b) => score(b, context) - score(a, context));
}

function score(product: RankableProduct, context: RankContext): number {
  let value = 0;
  if (product.category === context.intent.category) value += 40;
  if (product.availability === 'in_stock') value += 15;
  if (product.availability === 'out_of_stock') value -= 40;

  const brand = product.brand?.toLowerCase() ?? '';
  if (brand && context.preferredBrands.some((b) => b.toLowerCase() === brand)) value += 12;
  if (brand && context.dislikedBrands.some((b) => b.toLowerCase() === brand)) value -= 20;

  if (context.preferredColors.length > 0) {
    const hit = product.colors.some((color) =>
      context.preferredColors.some((preferred) => preferred.toLowerCase() === color.toLowerCase()),
    );
    if (hit) value += 10;
  }

  if (context.budget != null && product.price != null) {
    if (product.price <= context.budget) value += 10;
    else value -= 25;
  }

  return value;
}

export function withinBudget(price: number | null, budget: number | null): boolean {
  if (budget == null || price == null) return true;
  return price <= budget;
}
