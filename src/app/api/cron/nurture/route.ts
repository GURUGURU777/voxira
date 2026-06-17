import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'AFIRMIA <hello@afirmia.app>';
const APP = 'https://afirmia.app';

const esc = (x: any) => String(x || '').replace(/[<>&]/g, (c) => (({ '<': '&lt;', '>': '&gt;', '&': '&amp;' } as any)[c]));

function wrap(body: string, cta: string, url: string) {
  return `<div style="background:#0a0e1a;padding:32px 16px;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:480px;margin:0 auto;background:#0f1a2e;border:1px solid rgba(201,168,76,0.15);border-radius:16px;padding:32px">
    <div style="font-size:20px;letter-spacing:5px;color:#c9a84c;text-align:center;margin-bottom:24px">A F I R M I A</div>
    ${body}
    <div style="text-align:center;margin-top:28px">
      <a href="${url}" style="display:inline-block;background:#c9a84c;color:#0a0e1a;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:bold;font-size:15px">${cta}</a>
    </div>
    <p style="font-size:11px;color:#5a6b82;text-align:center;margin-top:28px">You're receiving this because you created an account at afirmia.app.<br><a href="mailto:hello@afirmia.app?subject=Unsubscribe" style="color:#5a6b82">unsubscribe</a></p>
  </div>
</div>`;
}

type Tpl = { subject: string; html: string };
const templates: Record<string, (name: string | null) => Tpl> = {
  no_voice: (name) => ({
    subject: 'Your voice is the missing piece',
    html: wrap(`<p style="font-size:17px;font-weight:bold;color:#fff;margin:0 0 12px">Hi ${esc(name) || 'there'},</p><p style="font-size:14px;line-height:1.6;color:#c4cdda;margin:0">You created your AFIRMIA account — but the magic only begins when the affirmations are in <b style="color:#fff">your own voice</b>. It takes just <b style="color:#fff">15 seconds</b> to record. Hear yourself say what you most need to believe.</p>`, 'Record my voice (15s)', `${APP}/dashboard`),
  }),
  no_cycle: (name) => ({
    subject: 'You heard your voice — now make it stick',
    html: wrap(`<p style="font-size:17px;font-weight:bold;color:#fff;margin:0 0 12px">Hi ${esc(name) || 'there'},</p><p style="font-size:14px;line-height:1.6;color:#c4cdda;margin:0">You already heard your own voice — the hard part is done. Now turn it into real change with your <b style="color:#fff">21-day self-esteem reset</b>. <b style="color:#fff">Day 1 is free</b> — just 5 minutes a day, in the one voice you can't ignore.</p>`, 'Start my 21-day reset', `${APP}/cycles`),
  }),
  has_cycle_free: (name) => ({
    subject: 'Day 2 of your reset is ready',
    html: wrap(`<p style="font-size:17px;font-weight:bold;color:#fff;margin:0 0 12px">Hi ${esc(name) || 'there'},</p><p style="font-size:14px;line-height:1.6;color:#c4cdda;margin:0">You started your 21-day reset — don't lose the momentum. Days 2 through 21 are where your mind locks in the new belief. Unlock your full journey with Pro and keep transforming, one day at a time.</p>`, 'Continue my reset', `${APP}/cycles`),
  }),
};

function admin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
}

async function run(dry: boolean) {
  const sb = admin();
  const resend = new Resend(process.env.RESEND_API_KEY);
  const since = new Date(Date.now() - 14 * 864e5).toISOString();
  const until = new Date(Date.now() - 24 * 36e5).toISOString();

  const { data: cData } = await sb.from('profiles')
    .select('id,email,full_name,voice_audio_url,created_at')
    .eq('plan', 'free').gte('created_at', since).lte('created_at', until)
    .not('email', 'ilike', '%test%');
  const cands = (cData || []) as any[];
  if (cands.length === 0) return { ok: true, dry, results: {}, total: 0 };

  const ids = cands.map((c) => c.id);
  const [{ data: cy }, { data: lg }] = await Promise.all([
    sb.from('cycles').select('user_id').in('user_id', ids),
    sb.from('nurture_log').select('user_id,email_type').in('user_id', ids),
  ]);
  const withCycle = new Set((cy || []).map((r: any) => r.user_id));
  const sent = new Set((lg || []).map((r: any) => `${r.user_id}:${r.email_type}`));

  const results: Record<string, number> = { no_voice: 0, no_cycle: 0, has_cycle_free: 0, skipped: 0, errors: 0 };
  for (const c of cands) {
    let type: string;
    if (!c.voice_audio_url) type = 'no_voice';
    else if (!withCycle.has(c.id)) type = 'no_cycle';
    else type = 'has_cycle_free';
    if (!c.email || sent.has(`${c.id}:${type}`)) { results.skipped++; continue; }
    const tpl = templates[type](c.full_name);
    if (dry) { results[type]++; continue; }
    try {
      await resend.emails.send({ from: FROM_EMAIL, to: c.email, subject: tpl.subject, html: tpl.html });
      await sb.from('nurture_log').insert({ user_id: c.id, email_type: type });
      results[type]++;
    } catch { results.errors++; }
  }
  return { ok: true, dry, results, total: cands.length };
}

export async function GET(req: Request) {
  const dry = new URL(req.url).searchParams.get('dry') === '1';
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  return NextResponse.json(await run(dry));
}
