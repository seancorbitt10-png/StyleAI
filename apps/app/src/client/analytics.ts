import { ANALYTICS_EVENTS, type AnalyticsEventName } from '@styleai/core';
import { getPublicEnv, isSupabaseConfigured } from './env';
import { getSupabase } from './supabase';

export async function trackEvent(input: {
  name: AnalyticsEventName;
  userId?: string;
  properties?: Record<string, string | number | boolean | null>;
}): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const supabase = getSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from('analytics_events').insert({
      name: input.name,
      user_id: user?.id ?? input.userId ?? null,
      session_id: null,
      properties: input.properties ?? {},
    });
  } catch {
    const env = getPublicEnv();
    await fetch(`${env.EXPO_PUBLIC_API_URL}/api/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }).catch(() => undefined);
  }
}

export { ANALYTICS_EVENTS };
