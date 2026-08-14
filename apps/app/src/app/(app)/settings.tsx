import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { Body, Button, Screen, Title } from '@styleai/ui';
import { useAuth } from '@/client/session';

export default function SettingsScreen() {
  const { session, signOut } = useAuth();
  const router = useRouter();

  return (
    <Screen>
      <Title>Settings</Title>
      <View style={{ height: 12 }} />
      <Body muted>{session?.user.email}</Body>
      <View style={{ height: 16 }} />
      <Body>
        Account deletion will remove your profile, wardrobe, photos, outfits, and preferences. It
        ships with the deletion API in a later hardening pass. Billing records required by law are
        retained.
      </Body>
      <View style={{ height: 28 }} />
      <Button
        label="Sign out"
        onPress={async () => {
          await signOut();
          router.replace('/');
        }}
      />
      <View style={{ height: 12 }} />
      <Button label="Back" variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
}
