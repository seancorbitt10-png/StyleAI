import { NotConfiguredError } from '../errors';
import type { Product, ProductSearchIntent } from '../types';

export interface ProductProvider {
  readonly name: string;
  searchProducts(intent: ProductSearchIntent): Promise<Product[]>;
  getProduct(providerProductId: string): Promise<Product | null>;
  normalizeProduct(raw: unknown): Product;
}

/**
 * Registry used by the outfit engine. The engine must not name a retailer.
 * Additional retailers are added by registering another ProductProvider.
 */
export class ProductProviderRegistry {
  constructor(private readonly providers: readonly ProductProvider[]) {}

  list(): readonly ProductProvider[] {
    return this.providers;
  }

  get(name: string): ProductProvider | undefined {
    return this.providers.find((provider) => provider.name === name);
  }

  async searchProducts(intent: ProductSearchIntent): Promise<Product[]> {
    if (this.providers.length === 0) {
      throw new NotConfiguredError('ProductProvider');
    }
    const settled = await Promise.allSettled(
      this.providers.map((provider) => provider.searchProducts(intent)),
    );
    const products: Product[] = [];
    let lastError: unknown;
    for (const result of settled) {
      if (result.status === 'fulfilled') {
        products.push(...result.value);
      } else {
        lastError = result.reason;
      }
    }
    if (products.length === 0 && lastError) {
      throw lastError;
    }
    return products;
  }
}

export class UnconfiguredProductProvider implements ProductProvider {
  readonly name = 'unconfigured';
  async searchProducts(): Promise<Product[]> {
    throw new NotConfiguredError('ProductProvider');
  }
  async getProduct(): Promise<Product | null> {
    throw new NotConfiguredError('ProductProvider');
  }
  normalizeProduct(): Product {
    throw new NotConfiguredError('ProductProvider');
  }
}
