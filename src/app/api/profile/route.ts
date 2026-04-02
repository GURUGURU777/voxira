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
  const withCookies = (json: NextResponse) => {
    cookieResponse.cookies.getAll().forEach(cookie => json.cookies.set(cookie));
    return json;
  };
  return { supabase, withCookies };
}

// GET: fetch user profile
export async function GET(request: NextRequest) {
  const { supabase, withCookies } = createSupabaseAndCookies(request);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return withCookies(NextResponse.json({ error: 'Not authenticated' }, { status: 401 }));

  const { data: profile } = await supabase
    .from('profiles')
    .select('voice_audio_url, voice_cloned_at, plan, credits, tracks_count')
    .eq('id', user.id)
    .single();

  return withCookies(NextResponse.json({ user: { id: user.id, email: user.email, name: user.user_metadata?.full_name, avatar: user.user_metadata?.avatar_url }, profile: profile || {} }));
}

// POST: update profile fields
export async function POST(request: NextRequest) {
  const { supabase, withCookies } = createSupabaseAndCookies(request);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return withCookies(NextResponse.json({ error: 'Not authenticated' }, { status: 401 }));

  const body = await request.json();

  if (body.voice_audio_url) {
    const { error } = await supabase
      .from('profiles')
      .update({ voice_audio_url: body.voice_audio_url, voice_cloned_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (error) return withCookies(NextResponse.json({ error: error.message }, { status: 500 }));
    return withCookies(NextResponse.json({ success: true }));
  }

  return withCookies(NextResponse.json({ error: 'No updates provided' }, { status: 400 }));
}
