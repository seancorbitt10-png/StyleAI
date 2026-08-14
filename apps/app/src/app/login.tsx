import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Body, Button, Field, Screen, Title } from '@styleai/ui';
import { useAuth } from '@/client/session';

export default function LoginScreen() {
  const { signIn, signInWithGoogle, configured } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);

  async function onSubmit() {
    setBusy(true);
    setError(undefined);
    try {
      await signIn(email.trim(), password);
      router.replace('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in.');
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle() {
    setBusy(true);
    setError(undefined);
    try {
      await signInWithGoogle();
      router.replace('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Title>Welcome back</Title>
      <View style={{ height: 24 }} />
      {!configured ? (
        <Body>Authentication is not configured yet.</Body>
      ) : (
        <>
          <Field
            label="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <View style={{ height: 12 }} />
          <Field
            label="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            error={error}
          />
          <View style={{ height: 20 }} />
          <Button label={busy ? 'Signing in…' : 'Log in'} onPress={onSubmit} disabled={busy} />
          <View style={{ height: 12 }} />
          <Button
            label="Continue with Google"
            variant="secondary"
            onPress={onGoogle}
            disabled={busy}
          />
          <View style={{ height: 16 }} />
          <Link href="/forgot-password">
            <Body muted>Forgot password</Body>
          </Link>
          <Link href="/signup">
            <Body muted>Need an account? Sign up</Body>
          </Link>
        </>
      )}
    </Screen>
  );
}
