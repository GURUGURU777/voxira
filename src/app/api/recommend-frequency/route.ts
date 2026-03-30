import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return NextResponse.json({ error: 'OpenAI key not configured' }, { status: 500 });
    }

    const { intention, frequencies, lang } = await request.json();

    if (!intention || intention.trim().length < 3) {
      return NextResponse.json({ error: 'Intention too short' }, { status: 400 });
    }

    const isSpanish = lang === 'es';

    const systemPrompt = `You are a Solfeggio frequency expert. Given a user's intention/goal, recommend the single best Solfeggio frequency from the list below.

Available frequencies:
${frequencies}

Respond with ONLY a JSON object: {"hz": NUMBER, "reason": "brief explanation in ${isSpanish ? 'Spanish' : 'English'}"}
No markdown, no backticks, just the JSON.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `User's intention: "${intention}"` },
        ],
        temperature: 0.3,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'OpenAI request failed' }, { status: 500 });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';

    // Parse the JSON response
    const cleaned = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json({
      hz: parsed.hz,
      reason: parsed.reason,
    });
  } catch (error) {
    console.error('Recommend frequency error:', error);
    // Return 528Hz as safe fallback
    return NextResponse.json({ hz: 528, reason: 'Default recommendation' });
  }
}
