import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'ElevenLabs API key not configured' }, { status: 500 });
    }

    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;
    const voiceName = (formData.get('name') as string) || 'VOXIRA User Voice';

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Validate file size (max 10MB)
    if (audioFile.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Audio file too large. Max 10MB.' }, { status: 400 });
    }

    // Create form data for ElevenLabs API
    const elevenLabsForm = new FormData();
    elevenLabsForm.append('name', voiceName);
    elevenLabsForm.append('description', 'Voice cloned via VOXIRA for personalized affirmations');
    elevenLabsForm.append('files', audioFile, audioFile.name || 'recording.webm');

    // Call ElevenLabs "Add Voice" API (Instant Voice Cloning)
    const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
      },
      body: elevenLabsForm,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('ElevenLabs error:', response.status, errorData);
      return NextResponse.json(
        { error: errorData?.detail?.message || 'Failed to clone voice' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      voice_id: data.voice_id,
      message: 'Voice cloned successfully',
    });

  } catch (error) {
    console.error('Clone voice error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
