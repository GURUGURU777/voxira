import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { sendWelcomeEmail } from '@/lib/email';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const cookieStore = request.cookies;
    let allCookies: { name: string; value: string; options: any }[] = [];

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) { allCookies = cookiesToSet; },
        },
      }
    );
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Welcome email — fire-and-forget on first signup. Never block the redirect.
      try {
        const user = data?.user;
        if (user?.email) {
          const created = user.created_at ? new Date(user.created_at).getTime() : 0;
          const lastSignIn = user.last_sign_in_at ? new Date(user.last_sign_in_at).getTime() : 0;
          const isNewSignup = created > 0 && lastSignIn > 0 && Math.abs(lastSignIn - created) < 60_000;
          if (isNewSignup) {
            const fullName = (user.user_metadata?.full_name as string | undefined) || undefined;
            sendWelcomeEmail(user.email, fullName).catch((err) => {
              console.error('[auth-callback] sendWelcomeEmail failed:', err);
            });
          }
        }
      } catch (e) {
        console.error('[auth-callback] welcome email setup error:', e);
      }

      const response = NextResponse.redirect(`${origin}${next}`);
      allCookies.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options);
      });
      return response;
    }
  }
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
