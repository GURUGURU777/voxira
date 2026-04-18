import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

function createSupabaseAndCookies(request: NextRequest) {
  const cookieResponse = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) { cookiesToSet.forEach(({ name, value, options }) => { cookieResponse.cookies.set(name, value, options); }); },
      },
    }
  );
  return { supabase };
}

export async function POST(req: NextRequest) {
  try {
    const { email, interested_plan, billing_cycle } = await req.json();

    if (!email || !interested_plan || !billing_cycle) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }
    if (!['pro', 'premium'].includes(interested_plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }
    if (!['monthly', 'yearly'].includes(billing_cycle)) {
      return NextResponse.json({ error: 'Invalid billing cycle' }, { status: 400 });
    }

    const { supabase } = createSupabaseAndCookies(req);
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('waitlist').insert({
      email: email.toLowerCase().trim(),
      interested_plan,
      billing_cycle,
      user_id: user?.id || null,
    });

    if (error) {
      console.error('waitlist insert error:', error);
      return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 });
  }
}
