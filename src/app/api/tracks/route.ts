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

// GET: list user tracks
export async function GET(request: NextRequest) {
  const { supabase, withCookies } = createSupabaseAndCookies(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return withCookies(NextResponse.json({ error: 'Not authenticated' }, { status: 401 }));

  const { data: tracks, error } = await supabase
    .from('tracks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return withCookies(NextResponse.json({ error: error.message }, { status: 500 }));
  return withCookies(NextResponse.json({ tracks: tracks || [] }));
}

// POST: save a new track
export async function POST(request: NextRequest) {
  const { supabase, withCookies } = createSupabaseAndCookies(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { console.error('[tracks POST] Not authenticated'); return withCookies(NextResponse.json({ error: 'Not authenticated' }, { status: 401 })); }

  console.log('[tracks POST] User:', user.id);
  const formData = await request.formData();
  const audioFile = formData.get('audio') as File | null;
  const intention = (formData.get('intention') as string) || '';
  const frequency = Number(formData.get('frequency')) || 528;
  const ambient = (formData.get('ambient') as string) || 'none';
  const duration_minutes = Number(formData.get('duration_minutes')) || 5;
  const processed = formData.get('processed') === 'true';

  if (!audioFile) { console.error('[tracks POST] No audio file in FormData'); return withCookies(NextResponse.json({ error: 'No audio file' }, { status: 400 })); }

  console.log('[tracks POST] File size:', audioFile.size, '| frequency:', frequency, '| intention:', intention.slice(0, 30));

  // Upload to Supabase Storage
  const buffer = Buffer.from(await audioFile.arrayBuffer());
  const fileName = `${user.id}/${Date.now()}-${frequency}hz-${duration_minutes}min.mp3`;

  const { error: uploadError } = await supabase.storage
    .from('tracks')
    .upload(fileName, buffer, { contentType: 'audio/mpeg', upsert: false });

  if (uploadError) { console.error('[tracks POST] Storage upload failed:', uploadError); return withCookies(NextResponse.json({ error: 'Upload failed: ' + uploadError.message }, { status: 500 })); }

  console.log('[tracks POST] Uploaded to storage:', fileName);

  // Get public URL
  const { data: urlData } = supabase.storage.from('tracks').getPublicUrl(fileName);

  // Save metadata to tracks table
  const { data: track, error: dbError } = await supabase
    .from('tracks')
    .insert({
      user_id: user.id,
      intention,
      frequency,
      ambient,
      duration_minutes,
      file_url: urlData.publicUrl,
      file_size: buffer.length,
      processed,
    })
    .select()
    .single();

  if (dbError) { console.error('[tracks POST] DB insert failed:', dbError); return withCookies(NextResponse.json({ error: 'DB error: ' + dbError.message }, { status: 500 })); }

  console.log('[tracks POST] Track saved:', track.id);
  return withCookies(NextResponse.json({ success: true, track }));
}

// DELETE: remove a track
export async function DELETE(request: NextRequest) {
  const { supabase, withCookies } = createSupabaseAndCookies(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return withCookies(NextResponse.json({ error: 'Not authenticated' }, { status: 401 }));

  const { searchParams } = new URL(request.url);
  const trackId = searchParams.get('id');
  if (!trackId) return withCookies(NextResponse.json({ error: 'No track id' }, { status: 400 }));

  // Get track to find file path
  const { data: track } = await supabase.from('tracks').select('file_url').eq('id', trackId).eq('user_id', user.id).single();

  if (track?.file_url) {
    const path = track.file_url.split('/tracks/')[1];
    if (path) await supabase.storage.from('tracks').remove([path]);
  }

  await supabase.from('tracks').delete().eq('id', trackId).eq('user_id', user.id);
  return withCookies(NextResponse.json({ success: true }));
}
