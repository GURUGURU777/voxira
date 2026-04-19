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

// GET: list user cycles with their days
export async function GET(request: NextRequest) {
  const { supabase, withCookies } = createSupabaseAndCookies(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return withCookies(NextResponse.json({ error: 'Not authenticated' }, { status: 401 }));

  const { data: cycles, error } = await supabase
    .from('cycles')
    .select('*, cycle_days(*, tracks(file_url))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return withCookies(NextResponse.json({ error: error.message }, { status: 500 }));

  // Also support ?id= for single cycle fetch
  const { searchParams } = new URL(request.url);
  const singleId = searchParams.get('id');
  if (singleId) {
    const cycle = (cycles || []).find(c => c.id === singleId);
    return withCookies(NextResponse.json({ cycle: cycle || null }));
  }

  return withCookies(NextResponse.json({ cycles: cycles || [] }));
}

// POST: create a new 21-day cycle
export async function POST(request: NextRequest) {
  const { supabase, withCookies } = createSupabaseAndCookies(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return withCookies(NextResponse.json({ error: 'Not authenticated' }, { status: 401 }));

  const body = await request.json();
  const { intention, frequency, preferred_time } = body;

  if (!intention || !frequency) return withCookies(NextResponse.json({ error: 'Missing intention or frequency' }, { status: 400 }));

  // ═══ GATE: Free solo puede tener 1 ciclo en toda la vida de la cuenta ═══
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, has_used_free_cycle')
    .eq('id', user.id)
    .single();

  if (profile?.plan === 'free' && profile?.has_used_free_cycle) {
    return withCookies(NextResponse.json({
      error: 'free_cycle_used',
      message: 'Ya usaste tu ciclo gratis. Upgrade a Pro para ciclos ilimitados.',
    }, { status: 403 }));
  }
  // ═══ FIN GATE ═══

  // Create cycle
  const { data: cycle, error: cycleError } = await supabase
    .from('cycles')
    .insert({ user_id: user.id, intention, frequency, ...(preferred_time ? { preferred_time } : {}) })
    .select()
    .single();

  if (cycleError) return withCookies(NextResponse.json({ error: cycleError.message }, { status: 500 }));

  // Create 21 day entries
  const days = Array.from({ length: 21 }, (_, i) => ({
    cycle_id: cycle.id,
    user_id: user.id,
    day_number: i + 1,
  }));

  const { error: daysError } = await supabase.from('cycle_days').insert(days);
  if (daysError) return withCookies(NextResponse.json({ error: daysError.message }, { status: 500 }));

  // Re-fetch with days
  const { data: fullCycle } = await supabase
    .from('cycles')
    .select('*, cycle_days(*, tracks(file_url))')
    .eq('id', cycle.id)
    .single();

  return withCookies(NextResponse.json({ success: true, cycle: fullCycle }));
}

// PATCH: update cycle (complete a day, mark cycle complete)
export async function PATCH(request: NextRequest) {
  const { supabase, withCookies } = createSupabaseAndCookies(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return withCookies(NextResponse.json({ error: 'Not authenticated' }, { status: 401 }));

  const body = await request.json();
  const { cycle_id, day_number, track_id, emotional_score } = body;

  if (!cycle_id || !day_number) return withCookies(NextResponse.json({ error: 'Missing cycle_id or day_number' }, { status: 400 }));

  // Fetch cycle to validate date
  const { data: cycleData } = await supabase.from('cycles').select('started_at').eq('id', cycle_id).eq('user_id', user.id).single();
  if (!cycleData) return withCookies(NextResponse.json({ error: 'Cycle not found' }, { status: 404 }));

  // Validate that day_number corresponds to today's date
  const dayDate = new Date(cycleData.started_at);
  dayDate.setDate(dayDate.getDate() + day_number - 1);
  const now = new Date();
  const isSameDay = dayDate.getFullYear() === now.getFullYear() && dayDate.getMonth() === now.getMonth() && dayDate.getDate() === now.getDate();
  if (!isSameDay) return withCookies(NextResponse.json({ error: 'Este dia no corresponde a la fecha de hoy' }, { status: 400 }));

  // If only saving emotional score (no completion)
  if (emotional_score && !track_id) {
    const { error } = await supabase.from('cycle_days').update({ emotional_score }).eq('cycle_id', cycle_id).eq('user_id', user.id).eq('day_number', day_number);
    if (error) return withCookies(NextResponse.json({ error: error.message }, { status: 500 }));
    return withCookies(NextResponse.json({ success: true, saved: 'emotional_score' }));
  }

  // Check if already completed
  const { data: existingDay } = await supabase.from('cycle_days').select('completed').eq('cycle_id', cycle_id).eq('user_id', user.id).eq('day_number', day_number).single();
  if (existingDay?.completed) return withCookies(NextResponse.json({ error: 'Este dia ya fue completado' }, { status: 400 }));

  // Mark day as completed
  const { error: dayError } = await supabase
    .from('cycle_days')
    .update({ completed: true, completed_at: new Date().toISOString(), track_id: track_id || null, ...(emotional_score ? { emotional_score } : {}) })
    .eq('cycle_id', cycle_id)
    .eq('user_id', user.id)
    .eq('day_number', day_number);

  if (dayError) return withCookies(NextResponse.json({ error: dayError.message }, { status: 500 }));

  // ═══ Quemar ticket de ciclo gratis al completar día 1 ═══
  if (day_number === 1) {
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('plan, has_used_free_cycle')
      .eq('id', user.id)
      .single();

    if (userProfile?.plan === 'free' && !userProfile?.has_used_free_cycle) {
      await supabase
        .from('profiles')
        .update({ has_used_free_cycle: true })
        .eq('id', user.id);
    }
  }
  // ═══ FIN ═══

  // Update current_day on cycle
  const nextDay = Math.min(day_number + 1, 21);
  const isComplete = day_number >= 21;

  const { error: cycleError } = await supabase
    .from('cycles')
    .update({
      current_day: nextDay,
      completed: isComplete,
      completed_at: isComplete ? new Date().toISOString() : null,
    })
    .eq('id', cycle_id)
    .eq('user_id', user.id);

  if (cycleError) return withCookies(NextResponse.json({ error: cycleError.message }, { status: 500 }));

  return withCookies(NextResponse.json({ success: true, completed: isComplete }));
}

// DELETE: remove a cycle
export async function DELETE(request: NextRequest) {
  const { supabase, withCookies } = createSupabaseAndCookies(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return withCookies(NextResponse.json({ error: 'Not authenticated' }, { status: 401 }));

  const { searchParams } = new URL(request.url);
  const cycleId = searchParams.get('id');
  if (!cycleId) return withCookies(NextResponse.json({ error: 'No cycle id' }, { status: 400 }));

  await supabase.from('cycles').delete().eq('id', cycleId).eq('user_id', user.id);
  return withCookies(NextResponse.json({ success: true }));
}
