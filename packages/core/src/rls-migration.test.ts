import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const sql = readFileSync(
  resolve(dirname(fileURLToPath(import.meta.url)), '../../../supabase/migrations/20260814193000_init.sql'),
  'utf8',
);

const userTables = [
  'profiles',
  'user_preferences',
  'media_assets',
  'wardrobe_items',
  'outfits',
  'outfit_items',
  'outfit_feedback',
  'product_searches',
  'entitlements',
  'usage_events',
  'ai_requests',
  'analytics_events',
  'affiliate_clicks',
];

describe('RLS migration', () => {
  it('enables RLS on every user-owned table', () => {
    for (const table of userTables) {
      expect(sql).toMatch(new RegExp(`alter table public\\.${table} enable row level security;`));
    }
  });

  it('does not make profiles world-readable', () => {
    expect(sql).not.toMatch(/Public profiles are viewable by everyone/i);
    expect(sql).toMatch(/Users can select own profile/);
  });

  it('keeps the media bucket private', () => {
    expect(sql).toMatch(/values \('media', 'media', false\)/);
  });

  it('does not add retailer-specific product columns', () => {
    expect(sql).not.toMatch(/ebay_/i);
  });
});
