import { Link } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Body, Button, Field, Screen, Title } from '@styleai/ui';
import { useAuth } from '@/client/session';

export default function ForgotPasswordScreen() {
  const { resetPassword, configured } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);

  async function onSubmit() {
    setBusy(true);
    setError(undefined);
    try {
      await resetPassword(email.trim());
      setMessage('If that account exists, we sent a reset email.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send reset email.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Title>Reset password</Title>
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
            error={error}
          />
          {message ? <Body>{message}</Body> : null}
          <View style={{ height: 20 }} />
          <Button label={busy ? 'Sending…' : 'Send reset email'} onPress={onSubmit} disabled={busy} />
        </>
      )}
      <View style={{ height: 16 }} />
      <Link href="/login">
        <Body muted>Back to login</Body>
      </Link>
    </Screen>
  );
}
