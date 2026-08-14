import { AnalyticsService, ANALYTICS_EVENTS, ValidationError } from '@styleai/core';
import { createClient } from '@supabase/supabase-js';
import { bearerToken, errorResponse, json, userIdFromRequest } from '@/server/compose';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      properties?: Record<string, unknown>;
      sessionId?: string;
    };
    let userId: string | null = null;
    const token = bearerToken(request);
    if (token) {
      try {
        userId = await userIdFromRequest(request);
      } catch {
        userId = null;
      }
    }
    const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anon) {
      throw new ValidationError('Analytics storage is not configured.');
    }
    const client = createClient(url, anon, {
      global: token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const analytics = new AnalyticsService({
      async record(event) {
        const { error } = await client.from('analytics_events').insert({
          name: event.name,
          user_id: event.userId,
          session_id: event.sessionId,
          properties: event.properties,
        });
        if (error) throw error;
      },
    });
    const event = await analytics.track({
      name: body.name ?? ANALYTICS_EVENTS.landingSession,
      userId,
      sessionId: body.sessionId,
      properties: body.properties,
    });
    return json({ ok: true, name: event.name });
  } catch (error) {
    return errorResponse(error, 400);
  }
}
