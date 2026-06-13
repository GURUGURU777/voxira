import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) return NextResponse.json({ error: 'OpenAI key not configured' }, { status: 500 });

    const { area, pattern, emotions, lang } = await request.json();
    if (!area || !pattern) return NextResponse.json({ error: 'Missing area or pattern' }, { status: 400 });

    const isEs = lang === 'es';
    const emotionList = (emotions || []).join(', ') || (isEs ? 'no especificadas' : 'not specified');

    const systemPrompt = isEs
      ? 'Eres un experto en reprogramacion mental, neuroplasticidad y frecuencias Solfeggio. Responde SOLO en JSON valido, sin markdown.'
      : 'You are an expert in mental reprogramming, neuroplasticity and Solfeggio frequencies. Respond ONLY in valid JSON, no markdown.';

    const userPrompt = isEs
      ? `El usuario quiere transformar el area de "${area}". Su patron es: "${pattern}". Las emociones asociadas son: ${emotionList}. Genera: 1) Una intencion profunda y personalizada de maximo 2 oraciones EN ESPANOL que sirva como base para afirmaciones de reprogramacion mental. 2) Recomienda la frecuencia Solfeggio mas apropiada (396, 417, 432, 528, 639, 741, 852 o 963 Hz) con explicacion de 1 oracion EN ESPANOL. Responde SOLO en JSON asi: { "intention": "...", "frequency": 528, "frequency_reason": "..." }`
      : `The user wants to transform the area of "${area}". Their pattern is: "${pattern}". The associated emotions are: ${emotionList}. Generate: 1) A deep, personalized intention of maximum 2 sentences IN ENGLISH to serve as the base for mental reprogramming affirmations. 2) Recommend the most appropriate Solfeggio frequency (396, 417, 432, 528, 639, 741, 852 or 963 Hz) with a 1-sentence explanation IN ENGLISH. Respond ONLY in JSON like this: { "intention": "...", "frequency": 528, "frequency_reason": "..." }`;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 300,
      }),
    });

    if (!res.ok) return NextResponse.json({ error: 'OpenAI request failed' }, { status: 500 });

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || '';

    // Parse JSON from response (handle potential markdown wrapping)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Generate intention error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
