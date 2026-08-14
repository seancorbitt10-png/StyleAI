export async function GET() {
  const configured = Boolean(
    process.env.EXPO_PUBLIC_SUPABASE_URL && process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  );
  return Response.json({
    ok: true,
    service: 'styleai',
    configured,
    env: process.env.EXPO_PUBLIC_APP_ENV ?? 'development',
  });
}
