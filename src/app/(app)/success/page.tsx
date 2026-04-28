'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { t, type Lang } from '@/lib/i18n';

const PLAN_FEATURES: Record<string, { en: string; es: string }[]> = {
  pro: [
    { en: '50 tracks per month', es: '50 audios por mes' },
    { en: 'Up to 30 minutes per track', es: 'Hasta 30 minutos por audio' },
    { en: 'All 8 Solfeggio frequencies', es: 'Las 8 frecuencias Solfeggio' },
    { en: 'All 5 ambient sounds', es: 'Los 5 sonidos ambientales' },
    { en: '1 active 21-day cycle', es: '1 ciclo de 21 dias activo' },
  ],
  premium: [
    { en: '200 tracks per month', es: '200 audios por mes' },
    { en: 'Up to 30 minutes per track', es: 'Hasta 30 minutos por audio' },
    { en: 'All 8 Solfeggio frequencies', es: 'Las 8 frecuencias Solfeggio' },
    { en: 'All 5 ambient sounds', es: 'Los 5 sonidos ambientales' },
    { en: 'Unlimited active 21-day cycles', es: 'Ciclos de 21 dias activos ilimitados' },
  ],
};

export default function SuccessPage() {
  return <Suspense fallback={null}><SuccessContent /></Suspense>;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const paramLang = searchParams?.get('lang');
  const lang: Lang = paramLang === 'es' ? 'es' : 'en';

  const [plan, setPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [retries, setRetries] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const sb = createClient();
        const { data: { user } } = await sb.auth.getUser();
        if (!user) { setLoading(false); return; }
        const { data } = await sb.from('profiles').select('plan').eq('id', user.id).single();
        if (data?.plan && data.plan !== 'free') {
          if (!cancelled) { setPlan(data.plan); setLoading(false); }
        } else if (retries < 5) {
          // Webhook may not have fired yet — retry
          setTimeout(() => { if (!cancelled) setRetries(r => r + 1); }, 2000);
        } else {
          if (!cancelled) { setPlan('confirmed'); setLoading(false); }
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    };
    check();
    return () => { cancelled = true; };
  }, [retries]);

  const planName = plan === 'premium' ? 'Premium' : plan === 'pro' ? 'Pro' : '';
  const features = PLAN_FEATURES[plan || ''] || [];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>

        {loading ? (
          <div style={{ padding: '60px 0' }}>
            <div style={{ width: 48, height: 48, border: '3px solid rgba(201,168,76,0.15)', borderTopColor: '#c9a84c', borderRadius: '50%', margin: '0 auto 20px', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
              {t(lang, 'Confirming your payment...', 'Confirmando tu pago...')}
            </p>
          </div>
        ) : (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 20, padding: '48px 36px' }}>

            {/* Check icon */}
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>

            {/* Heading */}
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 400, color: '#fff', margin: '0 0 8px' }}>
              {planName
                ? t(lang, `Welcome to ${planName}!`, `Bienvenido a ${planName}!`)
                : t(lang, 'Payment confirmed!', 'Pago confirmado!')}
            </h1>

            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, margin: '0 0 28px', lineHeight: 1.6 }}>
              {planName
                ? t(lang, `Your ${planName} subscription is now active. Here's what you unlocked:`, `Tu suscripcion ${planName} esta activa. Esto es lo que desbloqueaste:`)
                : t(lang, 'Your subscription is being activated. It may take a moment.', 'Tu suscripcion se esta activando. Puede tomar un momento.')}
            </p>

            {/* Features */}
            {features.length > 0 && (
              <div style={{ textAlign: 'left', background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.08)', borderRadius: 14, padding: '18px 22px', marginBottom: 28 }}>
                {features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0' }}>
                    <span style={{ color: '#22c55e', fontSize: 13, flexShrink: 0 }}>&#10003;</span>
                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>{t(lang, f.en, f.es)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* CTAs */}
            <a href="/dashboard" style={{
              display: 'block', width: '100%', padding: '14px', borderRadius: 12, border: 'none',
              background: '#c9a84c', color: '#0a0e1a', fontSize: 14, fontWeight: 700,
              letterSpacing: 0.5, textDecoration: 'none', textAlign: 'center', marginBottom: 12,
              boxSizing: 'border-box',
            }}>
              {t(lang, 'Go to Dashboard', 'Ir al Dashboard')}
            </a>

            <a href="/home" style={{
              display: 'block', width: '100%', padding: '12px', borderRadius: 12,
              border: '1px solid rgba(201,168,76,0.3)', background: 'transparent',
              color: '#c9a84c', fontSize: 13, fontWeight: 500, textDecoration: 'none',
              textAlign: 'center', boxSizing: 'border-box',
            }}>
              {t(lang, `Create my first ${planName} track`, `Crear mi primer track ${planName}`)}
            </a>
          </div>
        )}
      </div>

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
