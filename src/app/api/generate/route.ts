import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (!elevenLabsKey || !openaiKey) {
      return NextResponse.json({ error: 'API keys not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { voice_id, intention, frequency, lang } = body;

    if (!voice_id || !intention) {
      return NextResponse.json({ error: 'Missing voice_id or intention' }, { status: 400 });
    }

    const isSpanish = lang === 'es';

    // ─── Step 1: Generate personalized affirmations with OpenAI ───
    const affirmationPrompt = isSpanish
      ? `Genera 8 afirmaciones positivas en primera persona para alguien que quiere: "${intention}". 
         Las afirmaciones deben ser poderosas, en presente, y personales.
         Formato: una afirmación por línea, sin números ni guiones.
         Ejemplo: "Yo soy abundancia infinita" 
         Solo las afirmaciones, nada más.`
      : `Generate 8 positive first-person affirmations for someone who wants to: "${intention}".
         Affirmations should be powerful, in present tense, and personal.
         Format: one affirmation per line, no numbers or dashes.
         Example: "I am infinite abundance"
         Only the affirmations, nothing else.`;

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: isSpanish
            ? 'Eres un experto en programación neurolingüística y afirmaciones positivas.'
            : 'You are an expert in neuro-linguistic programming and positive affirmations.' },
          { role: 'user', content: affirmationPrompt },
        ],
        temperature: 0.8,
        max_tokens: 500,
      }),
    });

    if (!openaiResponse.ok) {
      const err = await openaiResponse.json().catch(() => ({}));
      console.error('OpenAI error:', err);
      return NextResponse.json({ error: 'Failed to generate affirmations' }, { status: 500 });
    }

    const openaiData = await openaiResponse.json();
    const affirmationsText = openaiData.choices?.[0]?.message?.content || '';
    const affirmations = affirmationsText
      .split('\n')
      .map((line: string) => line.replace(/^[""]|[""]$/g, '').trim())
      .filter((line: string) => line.length > 0);

    if (affirmations.length === 0) {
      return NextResponse.json({ error: 'No affirmations generated' }, { status: 500 });
    }

    // ─── Step 2: Convert affirmations to speech with ElevenLabs (cloned voice) ───
    // Combine all affirmations with pauses
    const fullScript = affirmations.join('. . . . ');

    const ttsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`, {
      method: 'POST',
      headers: {
        'xi-api-key': elevenLabsKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: fullScript,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.85,
          style: 0.4,
          use_speaker_boost: true,
        },
      }),
    });

    if (!ttsResponse.ok) {
      const err = await ttsResponse.json().catch(() => ({}));
      console.error('ElevenLabs TTS error:', err);
      return NextResponse.json({ error: 'Failed to generate speech' }, { status: 500 });
    }

    // Get audio as buffer
    const audioBuffer = await ttsResponse.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString('base64');

    return NextResponse.json({
      success: true,
      affirmations,
      audio: audioBase64,
      audio_format: 'mp3',
      frequency: frequency || 528,
      message: isSpanish ? 'Audio generado exitosamente' : 'Audio generated successfully',
    });

  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
