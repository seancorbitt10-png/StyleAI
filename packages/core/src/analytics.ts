import { ValidationError } from './errors';

export const ANALYTICS_EVENTS = {
  landingSession: 'landing_session',
  signUp: 'sign_up',
  onboardingStarted: 'onboarding_started',
  onboardingCompleted: 'onboarding_completed',
  profilePhotoAdded: 'profile_photo_added',
  wardrobeItemAdded: 'wardrobe_item_added',
  wardrobeItemVerified: 'wardrobe_item_verified',
  firstOutfitGenerated: 'first_outfit_generated',
  outfitGenerated: 'outfit_generated',
  outfitSaved: 'outfit_saved',
  outfitLiked: 'outfit_liked',
  outfitDisliked: 'outfit_disliked',
  productViewed: 'product_viewed',
  productClicked: 'product_clicked',
  subscriptionStarted: 'subscription_started',
  subscriptionCancelled: 'subscription_cancelled',
} as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

const ALLOWED = new Set<string>(Object.values(ANALYTICS_EVENTS));

const FORBIDDEN_PROP = /email|password|token|image|photo_url|name|phone/i;

export type AnalyticsEventInput = {
  name: string;
  userId?: string | null;
  sessionId?: string | null;
  properties?: Record<string, unknown>;
};

export type AnalyticsEvent = {
  name: AnalyticsEventName;
  userId: string | null;
  sessionId: string | null;
  properties: Record<string, string | number | boolean | null>;
};

export interface AnalyticsStore {
  record(event: AnalyticsEvent): Promise<void>;
}

export class AnalyticsService {
  constructor(private readonly store: AnalyticsStore) {}

  async track(input: AnalyticsEventInput): Promise<AnalyticsEvent> {
    if (!ALLOWED.has(input.name)) {
      throw new ValidationError(`Unknown analytics event: ${input.name}`);
    }
    const properties: AnalyticsEvent['properties'] = {};
    for (const [key, value] of Object.entries(input.properties ?? {})) {
      if (FORBIDDEN_PROP.test(key)) continue;
      if (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean' ||
        value === null
      ) {
        properties[key] = value;
      }
    }
    const event: AnalyticsEvent = {
      name: input.name as AnalyticsEventName,
      userId: input.userId ?? null,
      sessionId: input.sessionId ?? null,
      properties,
    };
    await this.store.record(event);
    return event;
  }
}
