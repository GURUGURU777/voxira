import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export const maxDuration = 120;

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

export async function POST(request: NextRequest) {
  try {
    const fishApiKey = process.env.FISH_AUDIO_API_KEY;
    if (!fishApiKey) {
      return NextResponse.json({ error: 'Fish Audio API key not configured' }, { status: 500 });
    }

    const { supabase, withCookies } = createSupabaseAndCookies(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return withCookies(NextResponse.json({ error: 'Not authenticated' }, { status: 401 }));
    }

    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;

    if (!audioFile) {
      return withCookies(NextResponse.json({ error: 'No audio file provided' }, { status: 400 }));
    }

    // Validate file size (max 10MB)
    if (audioFile.size > 10 * 1024 * 1024) {
      return withCookies(NextResponse.json({ error: 'Audio file too large. Max 10MB.' }, { status: 400 }));
    }

    // Upload voice sample to Supabase Storage (backup)
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
    const storagePath = `${user.id}/voice-sample.webm`;

    const { error: uploadError } = await supabase.storage
      .from('voice-samples')
      .upload(storagePath, audioBuffer, {
        contentType: audioFile.type || 'audio/webm',
        upsert: true,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return withCookies(NextResponse.json({ error: 'Failed to save voice sample' }, { status: 500 }));
    }

    const { data: { publicUrl } } = supabase.storage
      .from('voice-samples')
      .getPublicUrl(storagePath);

    // Clone voice in Fish Audio
    const fishForm = new FormData();
    fishForm.append('voices', audioFile, audioFile.name || 'recording.webm');
    fishForm.append('title', `VOXIRA-${user.id}`);
    fishForm.append('visibility', 'private');
    fishForm.append('type', 'tts');
    fishForm.append('train_mode', 'fast');

    const response = await fetch('https://api.fish.audio/model', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${fishApiKey}`,
      },
      body: fishForm,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Fish Audio error:', response.status, errorData);
      return withCookies(NextResponse.json(
        { error: errorData?.message || 'Failed to clone voice' },
        { status: response.status }
      ));
    }

    const data = await response.json();
    const fishVoiceId = data.model_id || data._id;

    // Save fish_voice_id to profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        voice_audio_url: publicUrl,
        fish_voice_id: fishVoiceId,
        voice_cloned_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (profileError) {
      console.error('Profile update error:', profileError);
    }

    return withCookies(NextResponse.json({
      success: true,
      voice_id: fishVoiceId,
      voice_audio_url: publicUrl,
      message: 'Voice cloned successfully',
    }));

  } catch (error) {
    console.error('Clone voice error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
