export const WARDROBE_CATEGORIES = ['top', 'bottom', 'outerwear', 'shoes', 'accessory'] as const;
export type WardrobeCategory = (typeof WARDROBE_CATEGORIES)[number];

export const FORMALITY_LEVELS = [
  'casual',
  'smart_casual',
  'business_casual',
  'business',
  'formal',
] as const;
export type Formality = (typeof FORMALITY_LEVELS)[number];

export const SEASONS = ['spring', 'summer', 'fall', 'winter'] as const;
export type Season = (typeof SEASONS)[number];

export type OutfitConstraints = {
  occasion: string;
  formality: Formality | null;
  budget: number | null;
  weather: string | null;
  preferredColors: string[];
  excludedItemIds: string[];
  keepItemIds: string[];
};

export type WardrobeItemSummary = {
  id: string;
  category: WardrobeCategory;
  subcategory: string | null;
  color: string | null;
  formality: Formality | null;
  seasonality: Season[];
  styleTags: string[];
  brand: string | null;
};

/**
 * Normalized catalog record. Retailer-specific IDs belong on `provider` +
 * `providerProductId` only. Domain code must not branch on a retailer name.
 */
export type Product = {
  id: string;
  provider: string;
  providerProductId: string;
  title: string;
  brand: string | null;
  category: WardrobeCategory;
  subcategory: string | null;
  description: string | null;
  price: number | null;
  currency: string | null;
  originalPrice: number | null;
  imageUrl: string | null;
  productUrl: string;
  affiliateUrl: string | null;
  colors: string[];
  sizes: string[];
  material: string | null;
  attributes: Record<string, string>;
  availability: 'in_stock' | 'out_of_stock' | 'unknown';
  retailer: string | null;
  condition: string | null;
  fetchedAt: string;
  expiresAt: string;
};

export type ProductSearchIntent = {
  category: WardrobeCategory;
  subcategory: string | null;
  query: string;
  colors: string[];
  brands: string[];
  maxPrice: number | null;
  currency: string | null;
};

export type PlanLimits = {
  maxWardrobeItems: number;
  maxOutfitGenerationsPerMonth: number;
  maxSavedOutfits: number;
  maxProductSearchesPerMonth: number;
};

export type Plan = {
  id: string;
  displayName: string;
  limits: PlanLimits;
};

export type Entitlement = {
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'expired' | 'grace';
  source: 'internal' | 'iap' | 'web';
  periodEnd: string | null;
};

export type MeteredOperation = 'wardrobe_analysis' | 'outfit_generation' | 'product_search';
