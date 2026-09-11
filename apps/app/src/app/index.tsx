import { Redirect, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { ANALYTICS_EVENTS } from '@styleai/core';
import { Body, Button, Display, Screen, tokens } from '@styleai/ui';
import { trackEvent } from '@/client/analytics';
import { useAuth } from '@/client/session';

export default function LandingScreen() {
  const { session, loading, configured } = useAuth();
  const router = useRouter();

  useEffect(() => {
    trackEvent({ name: ANALYTICS_EVENTS.landingSession, properties: { path: '/' } });
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: tokens.color.bg }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (session) {
    return <Redirect href="/home" />;
  }

  return (
    <Screen>
      <Display>Dress from what you already own.</Display>
      <View style={{ height: 16 }} />
      <Body muted>
        StyleAI builds outfits from your wardrobe, fills only the gaps that matter, and finds real
        pieces to buy — never invented products.
      </Body>
      <View style={{ height: 32 }} />
      {!configured ? (
        <Body>
          StyleAI is not configured. Create a free Supabase project, run the SQL migration, and set
          EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.
        </Body>
      ) : (
        <>
          <Button label="Create account" onPress={() => router.push('/signup')} />
          <View style={{ height: 12 }} />
          <Button label="Log in" variant="secondary" onPress={() => router.push('/login')} />
        </>
      )}
      <View style={{ height: 32 }} />
      <Button label="How pricing works" variant="ghost" onPress={() => router.push('/pricing')} />
      <Button label="Privacy" variant="ghost" onPress={() => router.push('/privacy')} />
      <Button label="Terms" variant="ghost" onPress={() => router.push('/terms')} />
    </Screen>
  );
}
