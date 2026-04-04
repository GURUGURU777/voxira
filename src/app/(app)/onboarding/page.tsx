'use client';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const GOALS = [
  { id: 'stress', icon: '🧘', label: 'Reducir estres y ansiedad' },
  { id: 'confidence', icon: '💪', label: 'Aumentar confianza' },
  { id: 'abundance', icon: '💰', label: 'Atraer abundancia' },
  { id: 'relationships', icon: '❤️', label: 'Mejorar relaciones' },
  { id: 'habits', icon: '🧠', label: 'Superar adicciones' },
  { id: 'spiritual', icon: '✨', label: 'Crecimiento espiritual' },
];

const EXPERIENCE = [
  { id: 'never', label: 'Nunca, soy principiante' },
  { id: 'sometimes', label: 'Algunas veces, tengo algo de experiencia' },
  { id: 'regular', label: 'Si, practico regularmente' },
];

const DURATIONS = [
  { min: 5, label: '5 min', desc: 'Tengo poco tiempo' },
  { min: 10, label: '10 min', desc: 'Un momento para mi' },
  { min: 15, label: '15 min', desc: 'Sesion completa' },
  { min: 30, label: '30 min', desc: 'Inmersion profunda' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState('');
  const [experience, setExperience] = useState('');
  const [minutes, setMinutes] = useState(10);
  const [saving, setSaving] = useState(false);

  const handleFinish = useCallback(async () => {
    setSaving(true);
    try {
      await fetch('/api/profile', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, meditation_experience: experience, daily_minutes: minutes, onboarding_completed: true }),
      });
      router.push('/home');
    } catch {} finally { setSaving(false); }
  }, [goal, experience, minutes, router]);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px', fontFamily: "'Outfit', sans-serif" }}>
        <div style={{ maxWidth: '540px', width: '100%' }}>

          {/* Progress */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '40px' }}>
            {[1, 2, 3].map(s => (
              <div key={s} style={{ height: '3px', flex: 1, borderRadius: '2px', background: step >= s ? '#c9a84c' : 'rgba(255,255,255,0.05)', transition: 'background 0.4s' }} />
            ))}
          </div>

          {/* STEP 1 */}
          {step === 1 && (
            <div style={{ animation: 'fadeUp 0.5s ease' }}>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '30px', fontWeight: 300, color: '#fff', margin: '0 0 8px 0' }}>
                Cual es tu <span style={{ color: '#c9a84c', fontWeight: 400 }}>objetivo</span> principal?
              </h1>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.3)', marginBottom: '28px' }}>Esto nos ayuda a personalizar tu experiencia</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {GOALS.map(g => (
                  <button key={g.id} onClick={() => { setGoal(g.id); setStep(2); }} style={{
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '14px', padding: '20px 16px', cursor: 'pointer', textAlign: 'left',
                    fontFamily: "'Outfit', sans-serif", transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '12px',
                  }}>
                    <span style={{ fontSize: '24px' }}>{g.icon}</span>
                    <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', fontWeight: 400 }}>{g.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div style={{ animation: 'fadeUp 0.5s ease' }}>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '30px', fontWeight: 300, color: '#fff', margin: '0 0 8px 0' }}>
                Has practicado <span style={{ color: '#c9a84c', fontWeight: 400 }}>meditacion</span>?
              </h1>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.3)', marginBottom: '28px' }}>Adaptaremos la intensidad a tu nivel</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {EXPERIENCE.map(e => (
                  <button key={e.id} onClick={() => { setExperience(e.id); setStep(3); }} style={{
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '14px', padding: '18px 20px', cursor: 'pointer', textAlign: 'left',
                    fontFamily: "'Outfit', sans-serif", fontSize: '14px', color: 'rgba(255,255,255,0.6)', transition: 'all 0.2s',
                  }}>{e.label}</button>
                ))}
              </div>
              <button onClick={() => setStep(1)} style={{ marginTop: '16px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', fontSize: '12px', cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>← Atras</button>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div style={{ animation: 'fadeUp 0.5s ease' }}>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '30px', fontWeight: 300, color: '#fff', margin: '0 0 8px 0' }}>
                Cuantos minutos al <span style={{ color: '#c9a84c', fontWeight: 400 }}>dia</span>?
              </h1>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.3)', marginBottom: '28px' }}>Elige lo que se adapte a tu rutina</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '28px' }}>
                {DURATIONS.map(d => {
                  const sel = minutes === d.min;
                  return (
                    <button key={d.min} onClick={() => setMinutes(d.min)} style={{
                      background: sel ? 'rgba(201,168,76,0.08)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${sel ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.05)'}`,
                      borderRadius: '14px', padding: '18px 16px', cursor: 'pointer', textAlign: 'center',
                      fontFamily: "'Outfit', sans-serif", transition: 'all 0.2s',
                    }}>
                      <div style={{ fontSize: '22px', fontWeight: 600, color: sel ? '#c9a84c' : 'rgba(255,255,255,0.5)', fontFamily: "'Cormorant Garamond', serif", marginBottom: '4px' }}>{d.label}</div>
                      <div style={{ fontSize: '12px', color: sel ? 'rgba(201,168,76,0.7)' : 'rgba(255,255,255,0.25)' }}>{d.desc}</div>
                    </button>
                  );
                })}
              </div>
              <button onClick={handleFinish} disabled={saving} style={{
                width: '100%', background: 'linear-gradient(135deg, #c9a84c, #dbb960)', color: '#081020', border: 'none',
                borderRadius: '14px', padding: '16px', fontSize: '15px', fontWeight: 700, cursor: 'pointer',
                fontFamily: "'Outfit', sans-serif", letterSpacing: '0.5px', opacity: saving ? 0.5 : 1,
              }}>{saving ? 'Guardando...' : 'Comenzar mi transformacion'}</button>
              <button onClick={() => setStep(2)} style={{ marginTop: '12px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', fontSize: '12px', cursor: 'pointer', fontFamily: "'Outfit', sans-serif", display: 'block', margin: '12px auto 0' }}>← Atras</button>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </>
  );
}
