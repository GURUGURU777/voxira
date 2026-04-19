'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';

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

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    priceMonthly: 0,
    priceYearly: 0,
    tagline: 'Prueba la reprogramacion mental',
    features: [
      '3 audios por mes',
      'Duracion maxima: 5 minutos',
      '2 frecuencias Solfeggio (528, 396)',
      'Sin sonidos ambientales',
      'Sin ciclos de 21 dias',
    ],
    cta: 'Tu plan actual',
  },
  {
    id: 'pro',
    name: 'Pro',
    priceMonthly: 9.99,
    priceYearly: 7.99,
    tagline: 'Para transformaciones profundas',
    features: [
      '20 audios por mes',
      'Duracion maxima: 15 minutos',
      'Las 7 frecuencias Solfeggio',
      'Los 5 sonidos ambientales',
      '1 ciclo de 21 dias activo',
      'Descargas ilimitadas',
    ],
    cta: 'Upgrade a Pro',
    highlighted: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    priceMonthly: 19.99,
    priceYearly: 15.99,
    tagline: 'Sin limites, maximo poder',
    features: [
      'Audios ilimitados',
      'Duracion maxima: 30 minutos',
      'Ciclos de 21 dias ilimitados',
      'Estadisticas avanzadas',
      'Soporte prioritario',
      'Acceso anticipado a nuevas features',
    ],
    cta: 'Upgrade a Premium',
  },
];

export default function PricingPage() {
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const [userPlan, setUserPlan] = useState<string>('free');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanId | null>(null);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    (async () => {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (user) {
        const { data } = await sb.from('profiles').select('plan').eq('id', user.id).single();
        if (data?.plan) setUserPlan(data.plan);
        if (user.email) setEmail(user.email);
      }
    })();
  }, []);

  const handleUpgradeClick = (planId: PlanId) => {
    if (planId === 'free') return;
    setSelectedPlan(planId);
    setModalOpen(true);
    setSubmitted(false);
  };

  const handleSubmitWaitlist = async () => {
    if (!selectedPlan || !email) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, interested_plan: selectedPlan, billing_cycle: cycle }),
      });
      if (res.ok) setSubmitted(true);
    } finally {
      setSubmitting(false);
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
          Elige tu <em style={{ color: '#c9a84c', fontStyle: 'italic' }}>viaje</em>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, maxWidth: 540, margin: '0 auto' }}>
          Reprograma tu mente al ritmo que quieras. Cancela cuando quieras.
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
              {c === 'monthly' ? 'Mensual' : 'Anual · ahorra 20%'}
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
                  Mas popular
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
                    /{cycle === 'monthly' ? 'mes' : 'mes · facturado anual'}
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
                onClick={() => handleUpgradeClick(plan.id)}
                disabled={isCurrent || isFree}
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
                  cursor: (isCurrent || isFree) ? 'default' : 'pointer',
                  opacity: (isCurrent || isFree) ? 0.4 : 1,
                  transition: 'all 0.2s',
                }}
              >
                {isCurrent ? 'Tu plan actual' : plan.cta}
              </button>
            </div>
          );
        })}
      </div>

      {/* FAQ mini */}
      <div style={{ marginTop: 80, textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 13, maxWidth: 540, margin: '80px auto 0' }}>
        <p style={{ marginBottom: 8 }}>Pagos seguros · Cancela en cualquier momento</p>
        <p>Todos los precios en USD. Impuestos aplicables segun tu pais.</p>
      </div>

      {/* Modal Waitlist */}
      {modalOpen && (
        <div
          onClick={() => setModalOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#0e1424', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 20,
              padding: 40, maxWidth: 440, width: '100%', textAlign: 'center',
            }}
          >
            {!submitted ? (
              <>
                <div style={{ fontSize: 11, color: 'rgba(201,168,76,0.7)', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700, marginBottom: 16 }}>
                  Proximamente
                </div>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: '#fff', fontWeight: 400, marginBottom: 12 }}>
                  Estamos finalizando los pagos
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
                  Dejanos tu correo y te avisamos en cuanto {selectedPlan === 'pro' ? 'Pro' : 'Premium'} este disponible. Los primeros en la lista reciben descuento de lanzamiento.
                </p>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  style={{
                    width: '100%', padding: '14px 16px', borderRadius: 12,
                    border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)',
                    color: '#fff', fontSize: 14, marginBottom: 16, outline: 'none',
                  }}
                />
                <button
                  onClick={handleSubmitWaitlist}
                  disabled={submitting || !email}
                  style={{
                    width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                    background: '#c9a84c', color: '#0a0e1a', fontSize: 14, fontWeight: 700,
                    letterSpacing: 0.5, cursor: submitting ? 'wait' : 'pointer',
                    opacity: submitting || !email ? 0.5 : 1,
                  }}
                >
                  {submitting ? 'Enviando...' : 'Avisarme cuando este listo'}
                </button>
                <button
                  onClick={() => setModalOpen(false)}
                  style={{ marginTop: 12, background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 13, cursor: 'pointer' }}
                >
                  Cerrar
                </button>
              </>
            ) : (
              <>
                <div style={{ fontSize: 48, marginBottom: 16 }}>&#10024;</div>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: '#fff', fontWeight: 400, marginBottom: 12 }}>
                  Estas en la lista
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
                  Te avisaremos a {email} en cuanto los pagos esten listos. Gracias por tu interes.
                </p>
                <button
                  onClick={() => setModalOpen(false)}
                  style={{
                    padding: '12px 32px', borderRadius: 12, border: '1px solid rgba(201,168,76,0.3)',
                    background: 'transparent', color: '#c9a84c', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Cerrar
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
