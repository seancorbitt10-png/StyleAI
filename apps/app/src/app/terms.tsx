import { Link } from 'expo-router';
import { View } from 'react-native';
import { Body, Screen, Title } from '@styleai/ui';

export default function TermsScreen() {
  return (
    <Screen>
      <Title>Terms</Title>
      <View style={{ height: 16 }} />
      <Body>
        StyleAI is a personal styling and shopping assistant. Outfit suggestions are informational.
        Product links go to third-party retailers. We may earn a commission when you use an
        affiliate link; that never changes whether we recommend a piece.
      </Body>
      <View style={{ height: 12 }} />
      <Body muted>
        You are responsible for the photos you upload. Do not upload images you do not have the
        right to use. We may suspend accounts that abuse the service or attempt to access another
        user&apos;s data.
      </Body>
      <View style={{ height: 24 }} />
      <Link href="/">
        <Body muted>Back</Body>
      </Link>
    </Screen>
  );
}
