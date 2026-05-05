import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export const maxDuration = 300; // 5 min timeout for full pipeline

export async function POST(request: NextRequest) {
  try {
    const fishApiKey = process.env.FISH_AUDIO_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    const ffmpegServiceUrl = process.env.FFMPEG_SERVICE_URL;

    if (!fishApiKey || !openaiKey) {
      return NextResponse.json({ error: 'API keys not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { voice_id, intention, frequency, ambient, duration, lang, affirmations: providedAffirmations } = body;

    if (!voice_id || !intention) {
      return NextResponse.json({ error: 'Missing voice_id or intention' }, { status: 400 });
    }

    const isSpanish = lang === 'es';
    const durationMin = duration || 5;

    // ═══ GATE DE PLANES ═══
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll(); },
          setAll() {},
        },
      }
    );

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('plan, tracks_this_month, tracks_month_reset_at')
      .eq('id', authUser.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Reset mensual de contador si pasaron 30+ dias
    let currentMonthCount = profile.tracks_this_month || 0;
    const resetAt = new Date(profile.tracks_month_reset_at || new Date());
    const nowDate = new Date();
    const daysSinceReset = (nowDate.getTime() - resetAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceReset >= 30) {
      currentMonthCount = 0;
      await supabase
        .from('profiles')
        .update({ tracks_this_month: 0, tracks_month_reset_at: nowDate.toISOString() })
        .eq('id', authUser.id);
    }

    // Limites por plan
    const planLimits: Record<string, { maxTracks: number; maxDuration: number }> = {
      free: { maxTracks: 3, maxDuration: 5 },
      pro: { maxTracks: 50, maxDuration: 30 },
      premium: { maxTracks: 200, maxDuration: 30 },
    };
    const userPlan = profile.plan || 'free';
    const limits = planLimits[userPlan] || planLimits.free;

    // Validar limite de audios/mes
    if (currentMonthCount >= limits.maxTracks) {
      return NextResponse.json({
        error: 'monthly_limit_reached',
        message: `Has usado tus ${limits.maxTracks} audios de este mes. Upgrade para generar mas.`,
        plan: userPlan,
        limit: limits.maxTracks,
        used: currentMonthCount,
      }, { status: 403 });
    }

    // Validar duracion maxima
    if (durationMin > limits.maxDuration) {
      return NextResponse.json({
        error: 'duration_exceeded',
        message: `Tu plan ${userPlan} permite maximo ${limits.maxDuration} minutos por audio.`,
        plan: userPlan,
        max_duration: limits.maxDuration,
        requested: durationMin,
      }, { status: 403 });
    }
    // ═══ FIN GATE DE PLANES ═══

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

    // ─── Step 2: Convert each affirmation to speech individually ───
    const cleanedAffirmations = affirmations.map((a: string) => a.trim().endsWith('.') ? a : a + '.');
    console.log(`[generate] Synthesizing ${cleanedAffirmations.length} affirmations individually...`);
    cleanedAffirmations.forEach((aff: string, i: number) => {
      console.log(`[generate] Sending affirmation ${i}: "${aff.substring(0, 60)}..."`);
    });

    const ttsResults = await Promise.allSettled(
      cleanedAffirmations.map((text: string) =>
        fetch('https://api.fish.audio/v1/tts', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${fishApiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, reference_id: voice_id, format: 'mp3', prosody: { speed: 0.90 } }),
        }).then(async (res) => {
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            if (res.status === 404) throw new Error('voice_not_found');
            throw new Error(err?.message || err?.detail || `TTS failed: ${res.status}`);
          }
          return Buffer.from(await res.arrayBuffer());
        })
      )
    );

    ttsResults.forEach((r, i) => {
      if (r.status === 'fulfilled') {
        console.log(`[generate] Result ${i}: SUCCESS, ${r.value.byteLength} bytes`);
      } else {
        console.log(`[generate] Result ${i}: FAILED - ${r.reason?.message || r.reason}`);
      }
    });

    const successSegments: Buffer[] = [];
    let voiceNotFound = false;
    for (const r of ttsResults) {
      if (r.status === 'fulfilled') {
        successSegments.push(r.value);
      } else {
        console.warn('[generate] TTS segment failed:', r.reason?.message);
        if (r.reason?.message === 'voice_not_found') voiceNotFound = true;
      }
    }

    console.log(`[generate] TTS results: ${successSegments.length}/${cleanedAffirmations.length} succeeded`);

    if (successSegments.length === 0) {
      if (voiceNotFound) {
        return NextResponse.json({ error: 'Voice not found - please record again', voice_not_found: true }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to generate speech' }, { status: 500 });
    }

    const audioSegmentsBase64 = successSegments.map(buf => buf.toString('base64'));
    const totalSize = successSegments.reduce((s, b) => s + b.length, 0);
    console.log(`[generate] Total TTS audio: ${totalSize} bytes across ${audioSegmentsBase64.length} segments`);

    // ─── Step 3: Send segments to FFmpeg service for concatenation + processing ───
    console.log(`[generate] Sending ${audioSegmentsBase64.length} segments to FFmpeg server`);
    audioSegmentsBase64.forEach((seg, i) => {
      console.log(`[generate]   audioSegments[${i}]: ${seg.length} chars base64`);
    });

    if (ffmpegServiceUrl) {
      try {
        console.log('[generate] Sending segments to FFmpeg service:', ffmpegServiceUrl);

        const ffmpegResponse = await fetch(`${ffmpegServiceUrl}/process`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            audio_segments_base64: audioSegmentsBase64,
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

          // Incrementar contador de audios del mes
          await supabase
            .from('profiles')
            .update({ tracks_this_month: currentMonthCount + 1 })
            .eq('id', authUser.id);

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

    // ─── Fallback: Return first segment as voice-only audio ───
    const audioBase64 = audioSegmentsBase64[0];

    // Incrementar contador de audios del mes (fallback)
    await supabase
      .from('profiles')
      .update({ tracks_this_month: currentMonthCount + 1 })
      .eq('id', authUser.id);

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
