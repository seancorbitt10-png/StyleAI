import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Body, Button, Field, Screen, Title } from '@styleai/ui';
import { useAuth } from '@/client/session';

export default function SignUpScreen() {
  const { signUp, signInWithGoogle, configured } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);

  async function onSubmit() {
    setBusy(true);
    setError(undefined);
    setMessage(undefined);
    try {
      const result = await signUp(email.trim(), password);
      if (result.needsEmailVerification) {
        setMessage('Check your email to verify your account, then log in.');
      } else {
        router.replace('/home');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create account.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Title>Create your account</Title>
      <View style={{ height: 8 }} />
      <Body muted>Email and password. Google works once it is enabled on your Supabase project.</Body>
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
          {message ? <Body>{message}</Body> : null}
          <View style={{ height: 20 }} />
          <Button label={busy ? 'Creating…' : 'Sign up'} onPress={onSubmit} disabled={busy} />
          <View style={{ height: 12 }} />
          <Button
            label="Continue with Google"
            variant="secondary"
            onPress={async () => {
              try {
                await signInWithGoogle();
                router.replace('/home');
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Google sign-in failed.');
              }
            }}
            disabled={busy}
          />
          <View style={{ height: 16 }} />
          <Link href="/login">
            <Body muted>Already have an account? Log in</Body>
          </Link>
        </>
      )}
    </Screen>
  );
}
