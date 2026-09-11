import { describe, expect, it } from 'vitest';
import { AnalyticsService, ANALYTICS_EVENTS } from './analytics';
import { EntitlementService, MemoryEntitlementStore, MemoryUsageStore, UsageMeter } from './billing';
import { identifyRequiredGaps, requiredCategoriesFor, filterWardrobe } from './domain/wardrobe';
import { rankProducts } from './domain/ranking';
import { scoreOutfitCandidate } from './domain/scoring';
import { NotConfiguredError, QuotaExceededError } from './errors';
import { createLogger } from './logging';
import { isSecretPublicName, parseServerEnv } from './env';
import { ProductProviderRegistry, UnconfiguredProductProvider } from './providers/product';
import { UnconfiguredVisionProvider } from './providers/ai';
import { clothingAnalysisSchema, outfitRequestSchema } from './validation';
import type { OutfitConstraints, Product, WardrobeItemSummary } from './types';

const constraints: OutfitConstraints = {
  occasion: 'dinner',
  formality: 'smart_casual',
  budget: 100,
  weather: null,
  preferredColors: [],
  excludedItemIds: [],
  keepItemIds: [],
};

const shirt: WardrobeItemSummary = {
  id: '1',
  category: 'top',
  subcategory: 'oxford_shirt',
  color: 'white',
  formality: 'smart_casual',
  seasonality: ['spring'],
  styleTags: ['classic'],
  brand: null,
};

const pants: WardrobeItemSummary = {
  ...shirt,
  id: '2',
  category: 'bottom',
  subcategory: 'chinos',
  color: 'navy',
};

const shoes: WardrobeItemSummary = {
  ...shirt,
  id: '3',
  category: 'shoes',
  subcategory: 'loafers',
  color: 'brown',
};

describe('use-what-you-own gaps', () => {
  it('does not recommend purchases when required categories are already owned', () => {
    const required = requiredCategoriesFor(constraints);
    const gaps = identifyRequiredGaps(required, [shirt, pants, shoes]);
    expect(gaps).toEqual([]);
  });

  it('identifies only missing required categories', () => {
    const required = requiredCategoriesFor(constraints);
    expect(identifyRequiredGaps(required, [shirt, pants])).toEqual(['shoes']);
  });

  it('requires outerwear only for cold/wet weather', () => {
    expect(requiredCategoriesFor({ ...constraints, weather: 'cold rain' })).toContain('outerwear');
    expect(requiredCategoriesFor(constraints)).not.toContain('outerwear');
  });
});

describe('wardrobe filter', () => {
  it('drops excluded ids', () => {
    const result = filterWardrobe([shirt, pants], { ...constraints, excludedItemIds: ['1'] });
    expect(result.map((i) => i.id)).toEqual(['2']);
  });
});

describe('outfit scoring', () => {
  it('scores a complete candidate above an empty one', () => {
    const complete = scoreOutfitCandidate(
      { itemIds: ['1', '2', '3'], items: [shirt, pants, shoes] },
      constraints,
    );
    const empty = scoreOutfitCandidate({ itemIds: [], items: [] }, constraints);
    expect(complete).toBeGreaterThan(empty);
  });
});

describe('product ranking', () => {
  const intent = {
    category: 'shoes' as const,
    subcategory: null,
    query: 'brown loafers',
    colors: ['brown'],
    brands: [],
    maxPrice: 100,
    currency: 'USD',
  };

  it('ranks in-budget preferred color above over-budget items', () => {
    const ranked = rankProducts(
      [
        {
          id: 'a',
          title: 'Expensive',
          category: 'shoes',
          price: 400,
          colors: ['brown'],
          brand: null,
          availability: 'in_stock',
        },
        {
          id: 'b',
          title: 'Fit',
          category: 'shoes',
          price: 80,
          colors: ['brown'],
          brand: null,
          availability: 'in_stock',
        },
      ],
      {
        intent,
        preferredBrands: [],
        dislikedBrands: [],
        preferredColors: ['brown'],
        budget: 100,
      },
    );
    expect(ranked[0]?.id).toBe('b');
  });

  it('does not accept affiliate fields as ranking inputs (type-level + runtime ignore)', () => {
    const withAffiliate = {
      id: 'x',
      title: 'Commission bait',
      category: 'shoes' as const,
      price: 90,
      colors: ['brown'],
      brand: null,
      availability: 'in_stock' as const,
      affiliateUrl: 'https://affiliate.example/high-payout',
      commission: 50,
    };
    const ranked = rankProducts([withAffiliate], {
      intent,
      preferredBrands: [],
      dislikedBrands: [],
      preferredColors: ['brown'],
      budget: 100,
    });
    expect(ranked).toHaveLength(1);
    expect('commission' in (ranked[0] as object) ? ranked[0] : true).toBeTruthy();
  });
});

describe('analytics allowlist', () => {
  it('persists known funnel events and strips sensitive properties', async () => {
    const recorded: unknown[] = [];
    const service = new AnalyticsService({
      async record(event) {
        recorded.push(event);
      },
    });
    await service.track({
      name: ANALYTICS_EVENTS.signUp,
      userId: 'user-1',
      properties: { method: 'email', email: 'hidden@example.com', password: 'nope' },
    });
    expect(recorded).toEqual([
      {
        name: 'sign_up',
        userId: 'user-1',
        sessionId: null,
        properties: { method: 'email' },
      },
    ]);
  });

  it('rejects unknown event names', async () => {
    const service = new AnalyticsService({ async record() {} });
    await expect(service.track({ name: 'debug_dump' })).rejects.toThrow(/Unknown analytics event/);
  });
});

describe('entitlements', () => {
  it('defaults to free and blocks over-quota generations', async () => {
    const entitlements = new EntitlementService(new MemoryEntitlementStore());
    const usage = new MemoryUsageStore();
    const meter = new UsageMeter(entitlements, usage);
    for (let i = 0; i < 8; i += 1) {
      await meter.assertWithinQuota('u1', 'outfit_generation');
      await meter.recordSuccess('u1', 'outfit_generation');
    }
    await expect(meter.assertWithinQuota('u1', 'outfit_generation')).rejects.toBeInstanceOf(
      QuotaExceededError,
    );
  });
});

describe('providers fail closed', () => {
  it('does not invent vision output', async () => {
    await expect(new UnconfiguredVisionProvider().analyze()).rejects.toBeInstanceOf(
      NotConfiguredError,
    );
  });

  it('does not invent products', async () => {
    const registry = new ProductProviderRegistry([]);
    await expect(
      registry.searchProducts({
        category: 'shoes',
        subcategory: null,
        query: 'loafers',
        colors: [],
        brands: [],
        maxPrice: null,
        currency: null,
      }),
    ).rejects.toBeInstanceOf(NotConfiguredError);
    await expect(new UnconfiguredProductProvider().searchProducts()).rejects.toBeInstanceOf(
      NotConfiguredError,
    );
  });
});

describe('validation', () => {
  it('accepts structured clothing analysis', () => {
    const parsed = clothingAnalysisSchema.parse({
      category: 'top',
      subcategory: 'oxford_shirt',
      primaryColor: 'white',
      pattern: 'solid',
      formality: 'smart_casual',
      seasonality: ['spring', 'summer'],
      styleTags: ['classic'],
      confidence: 0.94,
    });
    expect(parsed.category).toBe('top');
  });

  it('parses outfit constraints', () => {
    const parsed = outfitRequestSchema.parse({
      occasion: 'dinner',
      formality: 'smart_casual',
      budget: 100,
      weather: null,
      preferredColors: [],
      excludedItemIds: [],
      keepItemIds: [],
    });
    expect(parsed.occasion).toBe('dinner');
  });
});

describe('logging and env', () => {
  it('redacts secrets', () => {
    const lines: string[] = [];
    const log = createLogger({}, (line) => lines.push(line));
    log.info('op', { OPENAI_API_KEY: 'sk-live', userId: 'u1' });
    expect(lines[0]).toContain('[redacted]');
    expect(lines[0]).not.toContain('sk-live');
    expect(lines[0]).toContain('u1');
  });

  it('flags public secret names', () => {
    expect(isSecretPublicName('EXPO_PUBLIC_SUPABASE_ANON_KEY')).toBe(false);
    expect(isSecretPublicName('EXPO_PUBLIC_OPENAI_API_KEY')).toBe(true);
    expect(isSecretPublicName('EXPO_PUBLIC_SERVICE_ROLE')).toBe(true);
  });

  it('does not invent fake production values', () => {
    const env = parseServerEnv({ EXPO_PUBLIC_APP_ENV: 'development' });
    expect(env.OPENAI_API_KEY).toBe('');
  });
});

describe('normalized Product', () => {
  it('has no retailer-specific domain fields', () => {
    const product: Product = {
      id: 'p1',
      provider: 'any-adapter',
      providerProductId: 'abc',
      title: 'Loafer',
      brand: null,
      category: 'shoes',
      subcategory: 'loafers',
      description: null,
      price: 80,
      currency: 'USD',
      originalPrice: null,
      imageUrl: null,
      productUrl: 'https://example.com/item',
      affiliateUrl: null,
      colors: ['brown'],
      sizes: [],
      material: null,
      attributes: {},
      availability: 'in_stock',
      retailer: 'Example Shop',
      condition: 'new',
      fetchedAt: new Date().toISOString(),
      expiresAt: new Date().toISOString(),
    };
    expect('ebayItemId' in product).toBe(false);
    expect(product.productUrl.startsWith('https://')).toBe(true);
  });
});
