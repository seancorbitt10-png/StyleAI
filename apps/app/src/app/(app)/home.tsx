import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Body, Button, Screen, Title } from '@styleai/ui';
import { useAuth } from '@/client/session';
import { getPublicEnv } from '@/client/env';

type EntitlementPayload = {
  planId: string;
  displayName: string;
  limits: {
    maxWardrobeItems: number;
    maxOutfitGenerationsPerMonth: number;
    maxSavedOutfits: number;
    maxProductSearchesPerMonth: number;
  };
};

export default function HomeScreen() {
  const { session, signOut } = useAuth();
  const router = useRouter();
  const [plan, setPlan] = useState<EntitlementPayload | null>(null);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    const token = session?.access_token;
    if (!token) return;
    const env = getPublicEnv();
    fetch(`${env.EXPO_PUBLIC_API_URL}/api/me/entitlement`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const body = (await res.json()) as EntitlementPayload & { error?: string };
        if (!res.ok) throw new Error(body.error ?? 'Could not load plan.');
        setPlan(body);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Could not load plan.');
      });
  }, [session?.access_token]);

  return (
    <Screen>
      <Title>Home</Title>
      <View style={{ height: 12 }} />
      <Body muted>
        You are signed in. Wardrobe upload and outfit generation come next. This screen does not invent
        outfits or products.
      </Body>
      <View style={{ height: 16 }} />
      {plan ? (
        <Body>
          Plan: {plan.displayName}. {plan.limits.maxOutfitGenerationsPerMonth} outfit generations /
          month on this plan.
        </Body>
      ) : (
        <Body muted>{error ?? 'Loading your plan…'}</Body>
      )}
      <View style={{ height: 28 }} />
      <Button label="Settings" variant="secondary" onPress={() => router.push('/settings')} />
      <View style={{ height: 12 }} />
      <Button
        label="Sign out"
        variant="ghost"
        onPress={async () => {
          await signOut();
          router.replace('/');
        }}
      />
    </Screen>
  );
}
