import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) return NextResponse.json({ error: 'OpenAI key not configured' }, { status: 500 });

    const { area, pattern, emotions } = await request.json();
    if (!area || !pattern) return NextResponse.json({ error: 'Missing area or pattern' }, { status: 400 });

    const emotionList = (emotions || []).join(', ') || 'no especificadas';

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Eres un experto en reprogramacion mental, neuroplasticidad y frecuencias Solfeggio. Responde SOLO en JSON valido, sin markdown.' },
          { role: 'user', content: `El usuario quiere transformar el area de "${area}". Su patron es: "${pattern}". Las emociones asociadas son: ${emotionList}. Genera: 1) Una intencion profunda y personalizada de maximo 2 oraciones en espanol que sirva como base para afirmaciones de reprogramacion mental. 2) Recomienda la frecuencia Solfeggio mas apropiada (396, 417, 432, 528, 639, 741, 852 o 963 Hz) con una explicacion de 1 oracion de por que esa frecuencia. Responde SOLO en JSON asi: { "intention": "...", "frequency": 528, "frequency_reason": "..." }` },
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
