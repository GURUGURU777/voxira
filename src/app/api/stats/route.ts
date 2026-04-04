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

// GET: aggregate stats for user
export async function GET(request: NextRequest) {
  const { supabase, withCookies } = createSupabaseAndCookies(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return withCookies(NextResponse.json({ error: 'Not authenticated' }, { status: 401 }));

  // Profile stats
  const { data: profile } = await supabase
    .from('profiles')
    .select('total_listening_minutes, current_streak, longest_streak, last_listened_at, tracks_count')
    .eq('id', user.id)
    .single();

  // Total tracks
  const { count: totalTracks } = await supabase
    .from('tracks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  // Active cycles
  const { data: activeCycles } = await supabase
    .from('cycles')
    .select('id, intention, frequency, current_day, completed')
    .eq('user_id', user.id)
    .eq('completed', false);

  // Completed cycles
  const { count: completedCycles } = await supabase
    .from('cycles')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('completed', true);

  // Listening history (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: listeningHistory } = await supabase
    .from('listening_stats')
    .select('listened_seconds, completed, listened_at')
    .eq('user_id', user.id)
    .gte('listened_at', thirtyDaysAgo.toISOString())
    .order('listened_at', { ascending: false });

  // Frequency breakdown
  const { data: frequencyBreakdown } = await supabase
    .from('tracks')
    .select('frequency')
    .eq('user_id', user.id);

  const freqCounts: Record<number, number> = {};
  (frequencyBreakdown || []).forEach(t => { freqCounts[t.frequency] = (freqCounts[t.frequency] || 0) + 1; });

  return withCookies(NextResponse.json({
    profile: {
      total_listening_minutes: profile?.total_listening_minutes || 0,
      current_streak: profile?.current_streak || 0,
      longest_streak: profile?.longest_streak || 0,
      last_listened_at: profile?.last_listened_at,
    },
    total_tracks: totalTracks || 0,
    active_cycles: activeCycles || [],
    completed_cycles: completedCycles || 0,
    listening_history: listeningHistory || [],
    frequency_breakdown: freqCounts,
  }));
}
