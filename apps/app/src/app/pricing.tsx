import { Link } from 'expo-router';
import { View } from 'react-native';
import { Body, Screen, Title } from '@styleai/ui';

export default function PricingScreen() {
  return (
    <Screen>
      <Title>Pricing</Title>
      <View style={{ height: 16 }} />
      <Body>
        StyleAI is a subscription product. Dollar prices are not finalized until we measure real AI
        cost per outfit.
      </Body>
      <View style={{ height: 12 }} />
      <Body>
        Free includes a limited wardrobe, a small number of outfit generations each month, and
        limited product searches.
      </Body>
      <View style={{ height: 12 }} />
      <Body>
        Pro raises those limits. Access is checked on the server. We are not collecting payments in
        this build.
      </Body>
      <View style={{ height: 24 }} />
      <Link href="/">
        <Body muted>Back</Body>
      </Link>
    </Screen>
  );
}
