'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { t, type Lang } from '@/lib/i18n';

type BillingCycle = 'monthly' | 'yearly';
type PlanId = 'free' | 'pro' | 'premium';

interface Plan {
  id: PlanId;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  tagline: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
}

export default function PricingPage() {
  return <Suspense fallback={null}><PricingContent /></Suspense>;
}

function PricingContent() {
  const searchParams = useSearchParams();
  const paramLang = searchParams?.get('lang');
  const lang: Lang = paramLang === 'es' ? 'es' : 'en';

  const PLANS: Plan[] = [
    {
      id: 'free',
      name: 'Free',
      priceMonthly: 0,
      priceYearly: 0,
      tagline: t(lang, 'Try mental reprogramming', 'Prueba la reprogramacion mental'),
      features: [
        t(lang, '3 audios per month', '3 audios por mes'),
        t(lang, 'Max duration: 5 minutes', 'Duracion maxima: 5 minutos'),
        t(lang, '2 Solfeggio frequencies (528, 396)', '2 frecuencias Solfeggio (528, 396)'),
        t(lang, 'No ambient sounds', 'Sin sonidos ambientales'),
        t(lang, 'No 21-day cycles', 'Sin ciclos de 21 dias'),
      ],
      cta: t(lang, 'Your current plan', 'Tu plan actual'),
    },
    {
      id: 'pro',
      name: 'Pro',
      priceMonthly: 9.99,
      priceYearly: 7.99,
      tagline: t(lang, 'For deep transformations', 'Para transformaciones profundas'),
      features: [
        t(lang, '20 audios per month', '20 audios por mes'),
        t(lang, 'Max duration: 15 minutes', 'Duracion maxima: 15 minutos'),
        t(lang, 'All 7 Solfeggio frequencies', 'Las 7 frecuencias Solfeggio'),
        t(lang, 'All 5 ambient sounds', 'Los 5 sonidos ambientales'),
        t(lang, '1 active 21-day cycle', '1 ciclo de 21 dias activo'),
        t(lang, 'Unlimited downloads', 'Descargas ilimitadas'),
      ],
      cta: t(lang, 'Upgrade to Pro', 'Upgrade a Pro'),
      highlighted: true,
    },
    {
      id: 'premium',
      name: 'Premium',
      priceMonthly: 19.99,
      priceYearly: 15.99,
      tagline: t(lang, 'No limits, maximum power', 'Sin limites, maximo poder'),
      features: [
        t(lang, 'Unlimited audios', 'Audios ilimitados'),
        t(lang, 'Max duration: 30 minutes', 'Duracion maxima: 30 minutos'),
        t(lang, 'Unlimited 21-day cycles', 'Ciclos de 21 dias ilimitados'),
        t(lang, 'Advanced statistics', 'Estadisticas avanzadas'),
        t(lang, 'Priority support', 'Soporte prioritario'),
        t(lang, 'Early access to new features', 'Acceso anticipado a nuevas features'),
      ],
      cta: t(lang, 'Upgrade to Premium', 'Upgrade a Premium'),
    },
  ];

  const PRICE_IDS: Record<string, Record<BillingCycle, string>> = {
    pro: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || '',
      yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY || '',
    },
    premium: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY || '',
      yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_YEARLY || '',
    },
  };

  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const [userPlan, setUserPlan] = useState<string>('free');
  const [checkoutLoading, setCheckoutLoading] = useState<PlanId | null>(null);
  const [checkoutError, setCheckoutError] = useState('');

  useEffect(() => {
    (async () => {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (user) {
        const { data } = await sb.from('profiles').select('plan').eq('id', user.id).single();
        if (data?.plan) setUserPlan(data.plan);
      }
    })();
  }, []);

  const handleCheckout = async (planId: PlanId) => {
    if (planId === 'free') return;
    const priceId = PRICE_IDS[planId]?.[cycle];
    if (!priceId) return;
    setCheckoutLoading(planId);
    setCheckoutError('');
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');
      if (data.url) window.location.href = data.url;
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : 'Error');
      setCheckoutLoading(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '60px 24px 120px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(36px, 5vw, 56px)',
          fontWeight: 400,
          color: '#fff',
          marginBottom: 12,
          letterSpacing: '-0.02em',
        }}>
          {t(lang, 'Choose your', 'Elige tu')} <em style={{ color: '#c9a84c', fontStyle: 'italic' }}>{t(lang, 'journey', 'viaje')}</em>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, maxWidth: 540, margin: '0 auto' }}>
          {t(lang, 'Reprogram your mind at your own pace. Cancel anytime.', 'Reprograma tu mente al ritmo que quieras. Cancela cuando quieras.')}
        </p>
      </div>

      {/* Toggle */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
        <div style={{
          display: 'inline-flex',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: 100,
          padding: 4,
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          {(['monthly', 'yearly'] as BillingCycle[]).map(c => (
            <button
              key={c}
              onClick={() => setCycle(c)}
              style={{
                padding: '10px 24px',
                borderRadius: 100,
                border: 'none',
                background: cycle === c ? '#c9a84c' : 'transparent',
                color: cycle === c ? '#0a0e1a' : 'rgba(255,255,255,0.6)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                letterSpacing: 0.5,
                transition: 'all 0.2s',
              }}
            >
              {c === 'monthly' ? t(lang, 'Monthly', 'Mensual') : t(lang, 'Yearly · save 20%', 'Anual · ahorra 20%')}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 20,
        maxWidth: 1100,
        margin: '0 auto',
      }}>
        {PLANS.map(plan => {
          const price = cycle === 'monthly' ? plan.priceMonthly : plan.priceYearly;
          const isCurrent = userPlan === plan.id;
          const isFree = plan.id === 'free';
          return (
            <div
              key={plan.id}
              style={{
                background: plan.highlighted ? 'linear-gradient(180deg, rgba(201,168,76,0.08), rgba(201,168,76,0.02))' : 'rgba(255,255,255,0.02)',
                border: plan.highlighted ? '1px solid rgba(201,168,76,0.4)' : '1px solid rgba(255,255,255,0.06)',
                borderRadius: 20,
                padding: 32,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {plan.highlighted && (
                <div style={{
                  position: 'absolute',
                  top: -12,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#c9a84c',
                  color: '#0a0e1a',
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '4px 12px',
                  borderRadius: 100,
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                }}>
                  {t(lang, 'Most popular', 'Mas popular')}
                </div>
              )}

              <div style={{ fontSize: 11, color: 'rgba(201,168,76,0.7)', letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
                {plan.name}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 20 }}>
                {plan.tagline}
              </div>

              <div style={{ marginBottom: 24 }}>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 48, fontWeight: 400, color: '#fff' }}>
                  ${price}
                </span>
                {!isFree && (
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginLeft: 6 }}>
                    USD /{cycle === 'monthly' ? t(lang, 'mo', 'mes') : t(lang, 'mo · billed yearly', 'mes · facturado anual')}
                  </span>
                )}
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', flexGrow: 1 }}>
                {plan.features.map((f, i) => (
                  <li key={i} style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, padding: '7px 0', display: 'flex', alignItems: 'flex-start' }}>
                    <span style={{ color: '#c9a84c', marginRight: 10, marginTop: 2, fontSize: 12 }}>&#10003;</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout(plan.id)}
                disabled={isCurrent || isFree || checkoutLoading === plan.id}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  borderRadius: 12,
                  border: plan.highlighted ? 'none' : '1px solid rgba(201,168,76,0.3)',
                  background: plan.highlighted ? '#c9a84c' : 'transparent',
                  color: plan.highlighted ? '#0a0e1a' : '#c9a84c',
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  cursor: (isCurrent || isFree || checkoutLoading === plan.id) ? 'default' : 'pointer',
                  opacity: (isCurrent || isFree || checkoutLoading === plan.id) ? 0.4 : 1,
                  transition: 'all 0.2s',
                }}
              >
                {checkoutLoading === plan.id ? t(lang, 'Redirecting...', 'Redirigiendo...') : isCurrent ? t(lang, 'Your current plan', 'Tu plan actual') : plan.cta}
              </button>
            </div>
          );
        })}
      </div>

      {/* FAQ mini */}
      <div style={{ marginTop: 80, textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 13, maxWidth: 540, margin: '80px auto 0' }}>
        <p style={{ marginBottom: 8 }}>{t(lang, 'Secure payments · Cancel anytime', 'Pagos seguros · Cancela en cualquier momento')}</p>
        <p>{t(lang, 'All prices in USD. Applicable taxes based on your country.', 'Todos los precios en USD. Impuestos aplicables segun tu pais.')}</p>
      </div>

      {/* Checkout error toast */}
      {checkoutError && (
        <div
          onClick={() => setCheckoutError('')}
          style={{
            position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 1000,
            background: '#1a1020', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12,
            padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
          }}
        >
          <span style={{ color: '#ef4444', fontSize: 14 }}>{checkoutError}</span>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>✕</span>
        </div>
      )}
    </div>
  );
}
