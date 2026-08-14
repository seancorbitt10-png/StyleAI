import { z } from 'zod';
import { FORMALITY_LEVELS, WARDROBE_CATEGORIES, SEASONS } from './types';

export const clothingAnalysisSchema = z.object({
  category: z.enum(WARDROBE_CATEGORIES),
  subcategory: z.string().min(1),
  primaryColor: z.string().min(1),
  secondaryColors: z.array(z.string()).default([]),
  pattern: z.string().min(1),
  material: z.string().nullable().default(null),
  fit: z.string().nullable().default(null),
  formality: z.enum(FORMALITY_LEVELS),
  seasonality: z.array(z.enum(SEASONS)).min(1),
  weatherSuitability: z.array(z.string()).default([]),
  styleTags: z.array(z.string()).default([]),
  brand: z.string().nullable().default(null),
  estimatedPrice: z.number().nullable().default(null),
  confidence: z.number().min(0).max(1),
});

export type ClothingAnalysis = z.infer<typeof clothingAnalysisSchema>;

export const closetDetectionSchema = z.object({
  items: z.array(
    z.object({
      boundingHint: z.string().nullable().default(null),
      analysis: clothingAnalysisSchema,
    }),
  ),
});

export const outfitRequestSchema = z.object({
  occasion: z.string().min(1),
  formality: z.enum(FORMALITY_LEVELS).nullable(),
  budget: z.number().positive().nullable(),
  weather: z.string().nullable(),
  preferredColors: z.array(z.string()).default([]),
  excludedItemIds: z.array(z.string()).default([]),
  keepItemIds: z.array(z.string()).default([]),
});

export const productSearchIntentSchema = z.object({
  category: z.enum(WARDROBE_CATEGORIES),
  subcategory: z.string().nullable(),
  query: z.string().min(1),
  colors: z.array(z.string()).default([]),
  brands: z.array(z.string()).default([]),
  maxPrice: z.number().positive().nullable(),
  currency: z.string().nullable(),
});
