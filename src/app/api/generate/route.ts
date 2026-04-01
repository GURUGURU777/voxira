import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 300; // 5 min timeout for full pipeline

export async function POST(request: NextRequest) {
  try {
    const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    const ffmpegServiceUrl = process.env.FFMPEG_SERVICE_URL;

    if (!elevenLabsKey || !openaiKey) {
      return NextResponse.json({ error: 'API keys not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { voice_id, intention, frequency, ambient, duration, lang, affirmations: providedAffirmations } = body;

    if (!voice_id || !intention) {
      return NextResponse.json({ error: 'Missing voice_id or intention' }, { status: 400 });
    }

    const isSpanish = lang === 'es';
    const durationMin = duration || 5;

    // ─── Step 1: Generate affirmations (if not provided) ───
    let affirmations = providedAffirmations;

    if (!affirmations || affirmations.length === 0) {
      const affirmationPrompt = isSpanish
        ? `Genera 15 afirmaciones positivas en primera persona para alguien que quiere: "${intention}". 
           Las afirmaciones deben ser poderosas, en presente, personales, y variadas en longitud.
           Incluye algunas cortas (5-8 palabras) y otras más detalladas (15-20 palabras).
           Formato: una afirmación por línea, sin números ni guiones.
           Solo las afirmaciones, nada más.`
        : `Generate 15 positive first-person affirmations for someone who wants to: "${intention}".
           Affirmations should be powerful, present tense, personal, and varied in length.
           Include some short (5-8 words) and some more detailed (15-20 words).
           Format: one affirmation per line, no numbers or dashes.
           Only the affirmations, nothing else.`;

      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: isSpanish
              ? 'Eres un experto en programación neurolingüística y afirmaciones positivas de alto impacto.'
              : 'You are an expert in neuro-linguistic programming and high-impact positive affirmations.' },
            { role: 'user', content: affirmationPrompt },
          ],
          temperature: 0.8,
          max_tokens: 800,
        }),
      });

      if (!openaiResponse.ok) {
        return NextResponse.json({ error: 'Failed to generate affirmations' }, { status: 500 });
      }

      const openaiData = await openaiResponse.json();
      const text = openaiData.choices?.[0]?.message?.content || '';
      affirmations = text
        .split('\n')
        .map((line: string) => line.replace(/^[""\d.\-•*]+\s*/g, '').trim())
        .filter((line: string) => line.length > 5);
    }

    if (affirmations.length === 0) {
      return NextResponse.json({ error: 'No affirmations generated' }, { status: 500 });
    }

    // ─── Step 2: Convert affirmations to speech with ElevenLabs ───
    // Use SSML-style pauses with "..." for longer pauses between affirmations
    // This creates a meditative, slow-paced delivery
    const fullScript = affirmations.join(' .......... .......... .......... ');

    const ttsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`, {
      method: 'POST',
      headers: { 'xi-api-key': elevenLabsKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: fullScript,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.95,        // Higher = more consistent, calmer delivery
          similarity_boost: 0.75,  // Good voice match
          style: 0.05,            // Lower = less expressive = slower, more monotone/meditative
          use_speaker_boost: true,
        },
      }),
    });

    if (!ttsResponse.ok) {
      const err = await ttsResponse.json().catch(() => ({}));
    const errorMsg = err?.detail?.message || err?.detail?.status || '';
    // If voice was deleted/not found, tell frontend to re-clone
    if (errorMsg.includes('not found') || errorMsg.includes('not_found') || ttsResponse.status === 404) {
      return NextResponse.json({ error: errorMsg || 'Voice not found - please record again', voice_not_found: true }, { status: 404 });
    }
      // Delete the cloned voice even on TTS failure
      await deleteVoice(voice_id, elevenLabsKey);
      return NextResponse.json({ error: err?.detail?.message || 'Failed to generate speech' }, { status: 500 });
    }

    const voiceAudioBuffer = Buffer.from(await ttsResponse.arrayBuffer());

    // ─── Step 2.5: Delete the cloned voice from ElevenLabs (free up slot) ───
    await deleteVoice(voice_id, elevenLabsKey);
    console.log('[generate] Deleted cloned voice:', voice_id);

    // ─── Step 3: Send to FFmpeg service for processing ───
    if (ffmpegServiceUrl) {
      try {
        console.log('[generate] Sending to FFmpeg service:', ffmpegServiceUrl);
        console.log('[generate] Audio buffer size:', voiceAudioBuffer.length, 'bytes');

        const ffmpegResponse = await fetch(`${ffmpegServiceUrl}/process`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            audio_base64: voiceAudioBuffer.toString('base64'),
            frequency: frequency || 528,
            ambient: ambient || 'none',
            duration: durationMin,
          }),
        });

        console.log('[generate] FFmpeg response status:', ffmpegResponse.status);

        if (ffmpegResponse.ok) {
          const processedBuffer = Buffer.from(await ffmpegResponse.arrayBuffer());
          console.log('[generate] Processed audio size:', processedBuffer.length, 'bytes');
          const processedBase64 = processedBuffer.toString('base64');

          return NextResponse.json({
            success: true,
            affirmations,
            audio: processedBase64,
            audio_format: 'mp3',
            frequency: frequency || 528,
            duration_minutes: durationMin,
            processed: true,
            message: isSpanish ? 'Audio procesado con frecuencias binaurales' : 'Audio processed with binaural frequencies',
          });
        }

        const errorBody = await ffmpegResponse.text().catch(() => 'unknown');
        console.error('[generate] FFmpeg service error:', ffmpegResponse.status, errorBody);
      } catch (ffmpegErr) {
        console.error('[generate] FFmpeg service unavailable:', ffmpegErr instanceof Error ? ffmpegErr.message : ffmpegErr);
      }
    } else {
      console.warn('[generate] FFMPEG_SERVICE_URL not set!');
    }

    // ─── Fallback: Return voice-only audio ───
    const audioBase64 = voiceAudioBuffer.toString('base64');

    return NextResponse.json({
      success: true,
      affirmations,
      audio: audioBase64,
      audio_format: 'mp3',
      frequency: frequency || 528,
      duration_minutes: durationMin,
      processed: false,
      message: isSpanish ? 'Audio generado (sin procesamiento de frecuencias)' : 'Audio generated (without frequency processing)',
    });

  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ─── Helper: Delete a cloned voice from ElevenLabs ───
async function deleteVoice(voiceId: string, apiKey: string) {
  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/voices/${voiceId}`, {
      method: 'DELETE',
      headers: { 'xi-api-key': apiKey },
    });
    console.log('[generate] Delete voice response:', res.status);
  } catch (err) {
    console.error('[generate] Failed to delete voice:', err);
  }
}
