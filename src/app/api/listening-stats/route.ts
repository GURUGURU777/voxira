import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

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
  const withCookies = (json: NextResponse) => {
    cookieResponse.cookies.getAll().forEach(cookie => json.cookies.set(cookie));
    return json;
  };
  return { supabase, withCookies };
}

// POST: log a listening session
export async function POST(request: NextRequest) {
  const { supabase, withCookies } = createSupabaseAndCookies(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return withCookies(NextResponse.json({ error: 'Not authenticated' }, { status: 401 }));

  const body = await request.json();
  const { track_id, listened_seconds, completed } = body;

  if (!track_id || listened_seconds == null) return withCookies(NextResponse.json({ error: 'Missing track_id or listened_seconds' }, { status: 400 }));

  // Insert listening stat
  const { error } = await supabase
    .from('listening_stats')
    .insert({ user_id: user.id, track_id, listened_seconds, completed: completed || false });

  if (error) return withCookies(NextResponse.json({ error: error.message }, { status: 500 }));

  // Update profile totals
  const addedMinutes = Math.floor(listened_seconds / 60);
  if (addedMinutes > 0) {
    const { data: profile } = await supabase.from('profiles').select('total_listening_minutes').eq('id', user.id).single();
    if (profile) {
      await supabase.from('profiles').update({
        total_listening_minutes: (profile.total_listening_minutes || 0) + addedMinutes,
        last_listened_at: new Date().toISOString(),
      }).eq('id', user.id);
    }
  }

  return withCookies(NextResponse.json({ success: true }));
}
