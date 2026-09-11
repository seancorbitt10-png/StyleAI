import {
  AnalyticsService,
  EntitlementService,
  createLogger,
  parseServerEnv,
  publicErrorMessage,
  type AnalyticsEvent,
  type Entitlement,
  type Plan,
} from '@styleai/core';
import { userIdFromRequest, userScopedClient, bearerToken } from './http';

const log = createLogger({ operation: 'api' });

export function json(data: unknown, status = 200): Response {
  return Response.json(data, { status });
}

export function errorResponse(error: unknown, status = 400): Response {
  log.warn('request_failed', { errorClass: error instanceof Error ? error.name : 'unknown' });
  return json({ error: publicErrorMessage(error) }, status);
}

export function servicesForUser(accessToken: string) {
  const client = userScopedClient(accessToken);
  const entitlementStore = {
    async getByUserId(userId: string): Promise<Entitlement | null> {
      const { data, error } = await client
        .from('entitlements')
        .select('user_id, plan_id, status, source, period_end')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        userId: data.user_id,
        planId: data.plan_id,
        status: data.status,
        source: data.source,
        periodEnd: data.period_end,
      };
    },
    async getPlan(planId: string): Promise<Plan | null> {
      const { data, error } = await client
        .from('plan_catalog')
        .select('id, display_name, limits')
        .eq('id', planId)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return { id: data.id, displayName: data.display_name, limits: data.limits };
    },
  };
  const analyticsStore = {
    async record(event: AnalyticsEvent) {
      const { error } = await client.from('analytics_events').insert({
        name: event.name,
        user_id: event.userId,
        session_id: event.sessionId,
        properties: event.properties,
      });
      if (error) throw error;
    },
  };
  return {
    entitlements: new EntitlementService(entitlementStore),
    analytics: new AnalyticsService(analyticsStore),
    env: parseServerEnv(process.env as Record<string, string | undefined>),
    log,
  };
}

export { userIdFromRequest, bearerToken };
