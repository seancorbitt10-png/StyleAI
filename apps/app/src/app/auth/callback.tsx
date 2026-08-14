import { Redirect } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { getSupabase } from '@/client/supabase';
import { tokens } from '@styleai/ui';

export default function AuthCallbackScreen() {
  useEffect(() => {
    getSupabase().auth.getSession();
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: tokens.color.bg }}>
      <ActivityIndicator />
      <Redirect href="/home" />
    </View>
  );
}
