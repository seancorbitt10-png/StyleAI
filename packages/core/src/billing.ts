import { QuotaExceededError } from './errors';
import type { Entitlement, MeteredOperation, Plan, PlanLimits } from './types';

export const DEFAULT_FREE_LIMITS: PlanLimits = {
  maxWardrobeItems: 40,
  maxOutfitGenerationsPerMonth: 8,
  maxSavedOutfits: 10,
  maxProductSearchesPerMonth: 20,
};

export const DEFAULT_PRO_LIMITS: PlanLimits = {
  maxWardrobeItems: 250,
  maxOutfitGenerationsPerMonth: 80,
  maxSavedOutfits: 100,
  maxProductSearchesPerMonth: 200,
};

export const DEFAULT_PLANS: Plan[] = [
  { id: 'free', displayName: 'Free', limits: DEFAULT_FREE_LIMITS },
  { id: 'pro', displayName: 'Pro', limits: DEFAULT_PRO_LIMITS },
];

export interface EntitlementStore {
  getByUserId(userId: string): Promise<Entitlement | null>;
  getPlan(planId: string): Promise<Plan | null>;
}

export interface UsageStore {
  countInPeriod(userId: string, operation: MeteredOperation, periodStart: Date): Promise<number>;
  record(input: {
    userId: string;
    operation: MeteredOperation;
    provider?: string;
    status: 'success' | 'error';
    estimatedCostUsd?: number | null;
  }): Promise<void>;
}

export class EntitlementService {
  constructor(private readonly store: EntitlementStore) {}

  async getActivePlan(userId: string): Promise<Plan> {
    const entitlement = await this.store.getByUserId(userId);
    const planId = isUsable(entitlement) ? entitlement!.planId : 'free';
    const plan = (await this.store.getPlan(planId)) ?? DEFAULT_PLANS.find((p) => p.id === 'free')!;
    return plan;
  }
}

export class UsageMeter {
  constructor(
    private readonly entitlements: EntitlementService,
    private readonly usage: UsageStore,
  ) {}

  async assertWithinQuota(userId: string, operation: MeteredOperation): Promise<void> {
    const plan = await this.entitlements.getActivePlan(userId);
    const limit = limitFor(plan.limits, operation);
    const used = await this.usage.countInPeriod(userId, operation, startOfUtcMonth(new Date()));
    if (used >= limit) {
      throw new QuotaExceededError(operation);
    }
  }

  async recordSuccess(
    userId: string,
    operation: MeteredOperation,
    extras?: { provider?: string; estimatedCostUsd?: number | null },
  ): Promise<void> {
    await this.usage.record({
      userId,
      operation,
      status: 'success',
      provider: extras?.provider,
      estimatedCostUsd: extras?.estimatedCostUsd ?? null,
    });
  }
}

export function limitFor(limits: PlanLimits, operation: MeteredOperation): number {
  switch (operation) {
    case 'wardrobe_analysis':
      return limits.maxWardrobeItems;
    case 'outfit_generation':
      return limits.maxOutfitGenerationsPerMonth;
    case 'product_search':
      return limits.maxProductSearchesPerMonth;
    default: {
      const _never: never = operation;
      return _never;
    }
  }
}

export function startOfUtcMonth(now: Date): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

function isUsable(entitlement: Entitlement | null): boolean {
  if (!entitlement) return false;
  if (entitlement.status !== 'active' && entitlement.status !== 'grace') return false;
  if (entitlement.periodEnd && new Date(entitlement.periodEnd).getTime() < Date.now()) return false;
  return true;
}

export class MemoryEntitlementStore implements EntitlementStore {
  constructor(
    private entitlements: Entitlement[] = [],
    private plans: Plan[] = DEFAULT_PLANS,
  ) {}

  async getByUserId(userId: string) {
    return this.entitlements.find((row) => row.userId === userId) ?? null;
  }

  async getPlan(planId: string) {
    return this.plans.find((plan) => plan.id === planId) ?? null;
  }
}

export class MemoryUsageStore implements UsageStore {
  readonly events: {
    userId: string;
    operation: MeteredOperation;
    createdAt: Date;
  }[] = [];

  async countInPeriod(userId: string, operation: MeteredOperation, periodStart: Date) {
    return this.events.filter(
      (event) =>
        event.userId === userId && event.operation === operation && event.createdAt >= periodStart,
    ).length;
  }

  async record(input: { userId: string; operation: MeteredOperation }) {
    this.events.push({ ...input, createdAt: new Date() });
  }
}
