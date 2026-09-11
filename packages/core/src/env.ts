import { z } from 'zod';

export const appEnvSchema = z.enum(['development', 'staging', 'production', 'test']);

export const publicEnvSchema = z.object({
  EXPO_PUBLIC_APP_ENV: appEnvSchema.default('development'),
  EXPO_PUBLIC_APP_URL: z.string().optional().default('http://localhost:8081'),
  EXPO_PUBLIC_API_URL: z.string().optional().default('http://localhost:8081'),
  EXPO_PUBLIC_SUPABASE_URL: z.string().optional().default(''),
  EXPO_PUBLIC_SUPABASE_ANON_KEY: z.string().optional().default(''),
  EXPO_PUBLIC_GOOGLE_AUTH_ENABLED: z.string().optional(),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;

export function parsePublicEnv(source: Record<string, string | undefined>): PublicEnv {
  return publicEnvSchema.parse(source);
}

export function assertClientConfigured(env: PublicEnv): void {
  if (!env.EXPO_PUBLIC_SUPABASE_URL || !env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error(
      'StyleAI is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.',
    );
  }
}

/** Server env. Secrets must never be prefixed with EXPO_PUBLIC_. */
export const serverEnvSchema = publicEnvSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default(''),
  OPENAI_API_KEY: z.string().optional().default(''),
  OPENAI_VISION_MODEL: z.string().optional().default('gpt-4.1-mini'),
  OPENAI_REASONING_MODEL: z.string().optional().default('gpt-4.1-mini'),
  AI_REQUEST_TIMEOUT_MS: z.coerce.number().optional().default(30_000),
  AI_MAX_RETRIES: z.coerce.number().optional().default(1),
  AI_DEV_SPEND_CAP_USD: z.coerce.number().optional().default(20),
  PRODUCT_CACHE_TTL_HOURS: z.coerce.number().optional().default(24),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).optional().default('info'),
  ADMIN_USER_IDS: z.string().optional().default(''),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function parseServerEnv(source: Record<string, string | undefined>): ServerEnv {
  const parsed = serverEnvSchema.parse(source);
  if (parsed.EXPO_PUBLIC_APP_ENV === 'production') {
    if (!parsed.EXPO_PUBLIC_SUPABASE_URL || !parsed.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('Missing required production env: EXPO_PUBLIC_SUPABASE_URL / ANON_KEY');
    }
  }
  return parsed;
}

export function isSecretPublicName(name: string): boolean {
  if (!name.startsWith('EXPO_PUBLIC_')) return false;
  return /SERVICE_ROLE|SECRET|API_KEY|PRIVATE/i.test(name);
}
