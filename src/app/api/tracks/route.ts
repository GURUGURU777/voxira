import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

function getSupabase(request: NextRequest) {
  const response = NextResponse.next();
  return { supabase: createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return request.cookies.getAll(); }, setAll(c) { c.forEach(({ name, value, options }) => { response.cookies.set(name, value, options); }); } } }
  ), response };
}

// GET: list user tracks
export async function GET(request: NextRequest) {
  const { supabase } = getSupabase(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { data: tracks, error } = await supabase
    .from('tracks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ tracks: tracks || [] });
}

// POST: save a new track
export async function POST(request: NextRequest) {
  const { supabase } = getSupabase(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const body = await request.json();
  const { audio_base64, intention, frequency, ambient, duration_minutes, processed } = body;

  if (!audio_base64) return NextResponse.json({ error: 'No audio data' }, { status: 400 });

  // Convert base64 to buffer and upload to Supabase Storage
  const buffer = Buffer.from(audio_base64, 'base64');
  const fileName = `${user.id}/${Date.now()}-${frequency}hz-${duration_minutes}min.mp3`;

  const { error: uploadError } = await supabase.storage
    .from('tracks')
    .upload(fileName, buffer, { contentType: 'audio/mpeg', upsert: false });

  if (uploadError) return NextResponse.json({ error: 'Upload failed: ' + uploadError.message }, { status: 500 });

  // Get public URL
  const { data: urlData } = supabase.storage.from('tracks').getPublicUrl(fileName);

  // Save metadata to tracks table
  const { data: track, error: dbError } = await supabase
    .from('tracks')
    .insert({
      user_id: user.id,
      intention: intention || '',
      frequency: frequency || 528,
      ambient: ambient || 'none',
      duration_minutes: duration_minutes || 5,
      file_url: urlData.publicUrl,
      file_size: buffer.length,
      processed: processed || false,
    })
    .select()
    .single();

  if (dbError) return NextResponse.json({ error: 'DB error: ' + dbError.message }, { status: 500 });

  // Update tracks count in profile
  // tracks count updated on client side

  return NextResponse.json({ success: true, track });
}

// DELETE: remove a track
export async function DELETE(request: NextRequest) {
  const { supabase } = getSupabase(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const trackId = searchParams.get('id');
  if (!trackId) return NextResponse.json({ error: 'No track id' }, { status: 400 });

  // Get track to find file path
  const { data: track } = await supabase.from('tracks').select('file_url').eq('id', trackId).eq('user_id', user.id).single();
  
  if (track?.file_url) {
    const path = track.file_url.split('/tracks/')[1];
    if (path) await supabase.storage.from('tracks').remove([path]);
  }

  await supabase.from('tracks').delete().eq('id', trackId).eq('user_id', user.id);
  return NextResponse.json({ success: true });
}
