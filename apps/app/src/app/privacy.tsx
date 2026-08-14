import { Link } from 'expo-router';
import { View } from 'react-native';
import { Body, Screen, Title } from '@styleai/ui';

export default function PrivacyScreen() {
  return (
    <Screen>
      <Title>Privacy</Title>
      <View style={{ height: 16 }} />
      <Body>
        StyleAI stores the photos and wardrobe data you upload so we can style you. Images are kept
        in private storage. We do not sell your data. We do not use your photos to train our own
        models. Third-party AI providers process images only to classify clothing you submit, and
        only when that provider is configured.
      </Body>
      <View style={{ height: 12 }} />
      <Body muted>
        You can delete your account and associated wardrobe, photos, outfits, and preferences. We
        may retain the minimum billing and audit records required by law.
      </Body>
      <View style={{ height: 24 }} />
      <Link href="/">
        <Body muted>Back</Body>
      </Link>
    </Screen>
  );
}
