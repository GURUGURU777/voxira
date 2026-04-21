'use client';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { t, type Lang } from '@/lib/i18n';

interface CycleDay { id: string; day_number: number; completed: boolean; }
interface Cycle { id: string; intention: string; frequency: number; current_day: number; completed: boolean; started_at: string; completed_at: string | null; cycle_days: CycleDay[]; }

const FC: Record<number, string> = { 396: '#c9a84c', 417: '#d85a30', 432: '#639922', 528: '#639922', 639: '#d4537e', 741: '#388add', 852: '#1d9e75', 963: '#534ab7' };
const FN: Record<number, string> = { 396: 'Liberation', 417: 'Change', 432: 'Harmony', 528: 'Miracle', 639: 'Connection', 741: 'Expression', 852: 'Intuition', 963: 'Crown' };

function getDayDate(s: string, n: number): Date { const d = new Date(s); d.setDate(d.getDate() + n - 1); return d; }
function isToday(d: Date): boolean { const n = new Date(); return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate(); }
function isPast(d: Date): boolean { const n = new Date(); n.setHours(0,0,0,0); const x = new Date(d); x.setHours(0,0,0,0); return x < n; }
function getStreak(days: CycleDay[], startedAt: string): number {
  let streak = 0;
  const sorted = [...days].sort((a, b) => b.day_number - a.day_number);
  for (const d of sorted) { const date = getDayDate(startedAt, d.day_number); if (isToday(date) || isPast(date)) { if (d.completed) streak++; else break; } }
  return streak;
}

export default function CyclesPage() {
  return <Suspense fallback={null}><CyclesContent /></Suspense>;
}

function CyclesContent() {
  const searchParams = useSearchParams();
  const paramLang = searchParams?.get('lang');
  const lang: Lang = paramLang === 'es' ? 'es' : 'en';

  const router = useRouter();
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState<string>('free');
  const [hasUsedFreeCycle, setHasUsedFreeCycle] = useState(false);
  const [blockedModalOpen, setBlockedModalOpen] = useState(false);

  // Create flow
  const [createStep, setCreateStep] = useState<0 | 1 | 2 | 3>(0);
  const [area, setArea] = useState('');
  const [pattern, setPattern] = useState('');
  const [emotions, setEmotions] = useState<string[]>([]);
  const [aiIntention, setAiIntention] = useState('');
  const [aiFrequency, setAiFrequency] = useState(528);
  const [aiReason, setAiReason] = useState('');
  const [generating, setGenerating] = useState(false);
  const [creating, setCreating] = useState(false);

  const fmtDate = useCallback((iso: string) => {
    return new Date(iso).toLocaleDateString(lang === 'es' ? 'es' : 'en', { month: 'short', day: 'numeric' });
  }, [lang]);

  const AREAS = [
    { id: 'salud', label: t(lang, 'Health', 'Salud'), icon: '🧬', color: '#22c55e' },
    { id: 'relaciones', label: t(lang, 'Relationships', 'Relaciones'), icon: '💞', color: '#d4537e' },
    { id: 'finanzas', label: t(lang, 'Finances', 'Finanzas'), icon: '💰', color: '#c9a84c' },
    { id: 'emociones', label: t(lang, 'Emotions', 'Emociones'), icon: '🌊', color: '#388add' },
    { id: 'habitos', label: t(lang, 'Habits', 'Habitos'), icon: '⚡', color: '#d85a30' },
    { id: 'espiritualidad', label: t(lang, 'Spirituality', 'Espiritualidad'), icon: '✦', color: '#534ab7' },
  ];
  const EMOTIONS = [
    t(lang, 'Anxiety', 'Ansiedad'),
    t(lang, 'Frustration', 'Frustracion'),
    t(lang, 'Sadness', 'Tristeza'),
    t(lang, 'Fear', 'Miedo'),
    t(lang, 'Guilt', 'Culpa'),
    t(lang, 'Anger', 'Enojo'),
  ];
  const AREA_PLACEHOLDERS: Record<string, string> = {
    salud: t(lang, 'Describe the health pattern you want to transform...', 'Describe el patron de salud que quieres transformar...'),
    relaciones: t(lang, 'Describe the pattern in your relationships you want to change...', 'Describe el patron en tus relaciones que quieres cambiar...'),
    finanzas: t(lang, 'Describe your relationship with money that you want to transform...', 'Describe tu relacion con el dinero que quieres transformar...'),
    emociones: t(lang, 'Describe the emotion or emotional pattern you want to change...', 'Describe la emocion o patron emocional que quieres cambiar...'),
    habitos: t(lang, 'Describe the habit you want to transform...', 'Describe el habito que quieres transformar...'),
    espiritualidad: t(lang, 'Describe the spiritual aspect you want to develop...', 'Describe el aspecto espiritual que quieres desarrollar...'),
  };

  useEffect(() => {
    fetch('/api/cycles').then(r => r.json()).then(d => setCycles(d.cycles || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/profile');
        const d = await res.json();
        if (d.profile) {
          setUserPlan(d.profile.plan || 'free');
          setHasUsedFreeCycle(d.profile.has_used_free_cycle || false);
        }
      } catch {}
    })();
  }, []);

  const resetCreate = () => { setCreateStep(0); setArea(''); setPattern(''); setEmotions([]); setAiIntention(''); setAiFrequency(528); setAiReason(''); };

  const handleGenerateIntention = useCallback(async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/cycles/generate-intention', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ area, pattern, emotions }) });
      const d = await res.json();
      if (d.intention) { setAiIntention(d.intention); setAiFrequency(d.frequency || 528); setAiReason(d.frequency_reason || ''); setCreateStep(3); }
    } catch {} finally { setGenerating(false); }
  }, [area, pattern, emotions]);

  const handleCreateCycle = useCallback(async () => {
    if (!aiIntention.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/cycles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ intention: aiIntention, frequency: aiFrequency }) });
      const d = await res.json();
      if (res.status === 403 && d.error === 'free_cycle_used') {
        resetCreate();
        setBlockedModalOpen(true);
        return;
      }
      if (d.cycle) {
        setCycles(p => [d.cycle, ...p]);
        setHasUsedFreeCycle(true);
        resetCreate();
      }
    } catch {} finally { setCreating(false); }
  }, [aiIntention, aiFrequency]);

  const activeCycles = cycles.filter(c => !c.completed);
  const completedCycles = cycles.filter(c => c.completed);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <div style={{ minHeight: '100vh', padding: '36px 32px', fontFamily: "'Outfit', sans-serif" }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>

          {/* HEADER — compact when cycles exist */}
          {(activeCycles.length > 0 || completedCycles.length > 0 || createStep > 0) && (
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '36px' }}>
              <div>
                <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '34px', fontWeight: 300, color: '#fff', margin: 0 }}>
                  {t(lang, 'cycles', 'ciclos')} <span style={{ color: '#c9a84c', fontWeight: 400 }}>{t(lang, '21 days', '21 dias')}</span>
                </h1>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', marginTop: '6px' }}>{t(lang, '21 days of conscious listening transform your mind', '21 dias de escucha consciente transforman tu mente')}</p>
              </div>
              {createStep === 0 && (
                <button onClick={() => {
                  if (userPlan === 'free' && hasUsedFreeCycle) {
                    setBlockedModalOpen(true);
                  } else {
                    setCreateStep(1);
                  }
                }} style={{
                  background: 'linear-gradient(135deg, #c9a84c, #dbb960)', color: '#081020', border: 'none', borderRadius: '10px',
                  padding: '10px 22px', fontSize: '12px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase',
                  cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: "'Outfit', sans-serif",
                }}>{t(lang, '+ New Cycle', '+ Nuevo Ciclo')}</button>
              )}
            </div>
          )}

          {/* CREATE FLOW */}
          {createStep > 0 && (
            <div style={{ background: 'rgba(201,168,76,0.03)', border: '1px solid rgba(201,168,76,0.1)', borderRadius: '16px', padding: '28px', marginBottom: '28px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                {[1, 2, 3].map(s => (
                  <div key={s} style={{ height: '3px', flex: 1, borderRadius: '2px', background: createStep >= s ? '#c9a84c' : 'rgba(255,255,255,0.05)', transition: 'background 0.3s' }} />
                ))}
              </div>

              {createStep === 1 && (
                <div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontWeight: 400, color: '#fff', margin: '0 0 6px 0' }}>
                    {t(lang, 'What area of your life do you want to', 'Que area de tu vida quieres')} <span style={{ color: '#c9a84c' }}>{t(lang, 'transform', 'transformar')}</span>?
                  </h3>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', marginBottom: '20px' }}>{t(lang, 'Select the main area', 'Selecciona el area principal')}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
                    {AREAS.map(a => (
                      <button key={a.id} onClick={() => { setArea(a.id); setCreateStep(2); }} style={{
                        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '12px', padding: '18px 14px', cursor: 'pointer', textAlign: 'center',
                        fontFamily: "'Outfit', sans-serif", transition: 'all 0.2s',
                      }}>
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>{a.icon}</div>
                        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{a.label}</div>
                      </button>
                    ))}
                  </div>
                  <button onClick={resetCreate} style={{ marginTop: '16px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: '12px', cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>{t(lang, 'Cancel', 'Cancelar')}</button>
                </div>
              )}

              {createStep === 2 && (
                <div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontWeight: 400, color: '#fff', margin: '0 0 6px 0' }}>
                    {t(lang, 'What is the pattern you want to', 'Cual es el patron que quieres')} <span style={{ color: '#c9a84c' }}>{t(lang, 'change', 'cambiar')}</span>?
                  </h3>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', marginBottom: '16px' }}>{t(lang, 'Be as specific as possible', 'Se lo mas especifico posible')}</p>
                  <textarea value={pattern} onChange={e => setPattern(e.target.value)} placeholder={AREA_PLACEHOLDERS[area] || t(lang, 'Describe the pattern...', 'Describe el patron...')} rows={3} style={{
                    width: '100%', background: 'rgba(4,10,22,0.5)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px',
                    padding: '14px 16px', color: '#fff', fontSize: '14px', fontFamily: "'Outfit', sans-serif", outline: 'none', boxSizing: 'border-box', resize: 'none', marginBottom: '18px', lineHeight: 1.6,
                  }} />
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', marginBottom: '10px' }}>{t(lang, 'How does that pattern make you feel?', 'Como te hace sentir ese patron?')}</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                    {EMOTIONS.map(em => {
                      const sel = emotions.includes(em);
                      return (
                        <button key={em} onClick={() => setEmotions(p => sel ? p.filter(e => e !== em) : [...p, em])} style={{
                          background: sel ? 'rgba(201,168,76,0.08)' : 'rgba(255,255,255,0.02)',
                          border: `1px solid ${sel ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.05)'}`,
                          borderRadius: '8px', padding: '6px 14px', fontSize: '12px', cursor: 'pointer',
                          color: sel ? '#c9a84c' : 'rgba(255,255,255,0.35)', fontFamily: "'Outfit', sans-serif",
                        }}>{em}</button>
                      );
                    })}
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={handleGenerateIntention} disabled={generating || !pattern.trim()} style={{
                      background: 'linear-gradient(135deg, #c9a84c, #dbb960)', color: '#081020', border: 'none', borderRadius: '10px',
                      padding: '10px 24px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
                      opacity: generating || !pattern.trim() ? 0.4 : 1,
                    }}>{generating ? t(lang, '✨ Analyzing...', '✨ Analizando...') : t(lang, 'Continue', 'Continuar')}</button>
                    <button onClick={() => setCreateStep(1)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 24px', fontSize: '13px', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>{t(lang, 'Back', 'Atras')}</button>
                  </div>
                </div>
              )}

              {createStep === 3 && (
                <div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontWeight: 400, color: '#fff', margin: '0 0 6px 0' }}>
                    {t(lang, 'Your', 'Tu programa')} <span style={{ color: '#c9a84c' }}>{t(lang, 'personalized program', 'personalizado')}</span>
                  </h3>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', marginBottom: '20px' }}>{t(lang, 'Generated with AI based on your profile', 'Generado con IA basado en tu perfil')}</p>
                  <div style={{ marginBottom: '18px' }}>
                    <p style={{ fontSize: '10px', color: '#c9a84c', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 600 }}>{t(lang, 'Your intention', 'Tu intencion')}</p>
                    <textarea value={aiIntention} onChange={e => setAiIntention(e.target.value)} rows={3} style={{
                      width: '100%', background: 'rgba(4,10,22,0.5)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '10px',
                      padding: '14px 16px', color: '#fff', fontSize: '15px', fontFamily: "'Outfit', sans-serif", outline: 'none', boxSizing: 'border-box', resize: 'none', lineHeight: 1.6, fontStyle: 'italic',
                    }} />
                  </div>
                  <div style={{ background: 'rgba(4,10,22,0.4)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: `2px solid ${FC[aiFrequency] || '#c9a84c'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '14px', fontWeight: 600, color: FC[aiFrequency] || '#c9a84c' }}>{aiFrequency}</span>
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', color: '#fff', fontWeight: 500 }}>{aiFrequency}Hz — {FN[aiFrequency] || ''}</div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>{aiReason}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={handleCreateCycle} disabled={creating} style={{
                      background: 'linear-gradient(135deg, #c9a84c, #dbb960)', color: '#081020', border: 'none', borderRadius: '10px',
                      padding: '12px 28px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
                      letterSpacing: '0.5px', opacity: creating ? 0.5 : 1,
                    }}>{creating ? t(lang, 'Creating...', 'Creando...') : t(lang, 'Start my 21-day cycle', 'Iniciar mi ciclo de 21 dias')}</button>
                    <button onClick={() => setCreateStep(2)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px 24px', fontSize: '13px', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>{t(lang, 'Back', 'Atras')}</button>
                  </div>
                </div>
              )}

            </div>
          )}

          {loading && <div style={{ textAlign: 'center', padding: '60px 0' }}><p style={{ color: 'rgba(201,168,76,0.6)', fontSize: '14px' }}>{t(lang, 'Loading cycles...', 'Cargando ciclos...')}</p></div>}

          {/* HERO — full when no cycles, hidden during create flow */}
          {!loading && cycles.length === 0 && createStep === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0 20px' }}>
              {/* Title */}
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '46px', fontWeight: 300, color: '#fff', margin: '0 0 14px 0', lineHeight: 1.15 }}>
                {t(lang, 'Transform your mind in', 'Transforma tu mente en')} <span style={{ color: '#c9a84c', fontWeight: 500 }}>{t(lang, '21 days', '21 dias')}</span>
              </h1>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.4)', maxWidth: '560px', margin: '0 auto 44px', lineHeight: 1.7 }}>
                {t(lang, 'Neuroscience shows that 21 days of consistent practice create new neural pathways. Your voice, your frequencies, your transformation.', 'La neurociencia demuestra que 21 dias de practica consistente crean nuevas rutas neuronales. Tu voz, tus frecuencias, tu transformacion.')}
              </p>

              {/* 3 Steps */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '44px' }}>
                {[
                  { icon: <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round"><circle cx="16" cy="16" r="12"/><circle cx="16" cy="16" r="6"/><circle cx="16" cy="16" r="1.5" fill="#c9a84c" stroke="none"/></svg>, title: t(lang, 'Define your intention', 'Define tu intencion'), desc: t(lang, 'Choose what you want to transform in your life', 'Elige que quieres transformar en tu vida') },
                  { icon: <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round"><path d="M8 18v-2a8 8 0 0116 0v2"/><rect x="6" y="18" width="4" height="6" rx="1.5"/><rect x="22" y="18" width="4" height="6" rx="1.5"/></svg>, title: t(lang, 'Listen every day', 'Escucha cada dia'), desc: t(lang, 'Your cloned voice delivers affirmations with healing frequencies', 'Tu voz clonada entrega afirmaciones con frecuencias de sanacion') },
                  { icon: <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4v24M4 16h24M8.5 8.5l15 15M23.5 8.5l-15 15"/><circle cx="16" cy="16" r="3"/></svg>, title: t(lang, 'Transform', 'Transforma'), desc: t(lang, 'After 21 days, your subconscious embraces your new truth', 'Despues de 21 dias, tu subconsciente abraza tu nueva verdad') },
                ].map((step, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '28px 20px' }}>
                    <div style={{ marginBottom: '14px' }}>{step.icon}</div>
                    <div style={{ fontSize: '10px', color: 'rgba(201,168,76,0.5)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 600 }}>{t(lang, 'Step', 'Paso')} {i + 1}</div>
                    <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: 500, color: '#fff', margin: '0 0 8px 0' }}>{step.title}</h3>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', margin: 0, lineHeight: 1.5 }}>{step.desc}</p>
                  </div>
                ))}
              </div>

              {/* 3 Phases */}
              <div style={{ textAlign: 'left', background: 'rgba(201,168,76,0.03)', border: '1px solid rgba(201,168,76,0.08)', borderRadius: '16px', padding: '28px 28px', marginBottom: '44px' }}>
                <p style={{ fontSize: '10px', color: '#c9a84c', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px', fontWeight: 600 }}>{t(lang, 'The 3 reprogramming phases', 'Las 3 fases de reprogramacion')}</p>
                {[
                  { days: t(lang, 'Days 1–7', 'Dias 1–7'), name: t(lang, 'Planting seeds', 'Sembrando semillas'), desc: t(lang, 'Your subconscious begins to listen and accept new beliefs', 'Tu subconsciente comienza a escuchar y aceptar nuevas creencias'), color: 'rgba(201,168,76,0.6)' },
                  { days: t(lang, 'Days 8–14', 'Dias 8–14'), name: t(lang, 'Transformation and action', 'Transformacion y accion'), desc: t(lang, 'Old patterns dissolve, new habits emerge', 'Los viejos patrones se disuelven, nuevos habitos emergen'), color: 'rgba(201,168,76,0.8)' },
                  { days: t(lang, 'Days 15–21', 'Dias 15–21'), name: t(lang, 'Integration', 'Integracion'), desc: t(lang, 'Your new beliefs become your natural state', 'Tus nuevas creencias se convierten en tu estado natural'), color: '#c9a84c' },
                ].map((phase, i) => (
                  <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: i < 2 ? '18px' : 0 }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: phase.color, marginTop: '6px', flexShrink: 0 }} />
                    <div>
                      <span style={{ fontSize: '13px', color: phase.color, fontWeight: 600 }}>{phase.days}: {phase.name}</span>
                      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', margin: '4px 0 0', lineHeight: 1.5 }}>{phase.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                onClick={() => {
                  if (userPlan === 'free' && hasUsedFreeCycle) {
                    router.push('/pricing');
                  } else {
                    setCreateStep(1);
                  }
                }}
                style={{
                  background: 'linear-gradient(135deg, #c9a84c, #dbb960)',
                  color: '#081020',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '18px 48px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  fontFamily: "'Outfit', sans-serif",
                  boxShadow: '0 4px 30px rgba(201,168,76,0.25)',
                }}
              >
                {userPlan === 'free' && hasUsedFreeCycle ? t(lang, 'Unlock unlimited cycles', 'Desbloquea ciclos ilimitados') : t(lang, 'Start your first cycle', 'Comienza tu primer ciclo')}
              </button>
            </div>
          )}

          {/* ACTIVE CYCLES — compact cards */}
          {activeCycles.length > 0 && (
            <div style={{ marginBottom: '36px' }}>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '14px' }}>{t(lang, 'Active cycles', 'Ciclos activos')}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {activeCycles.map(cycle => {
                  const color = FC[cycle.frequency] || '#c9a84c';
                  const done = cycle.cycle_days.filter(d => d.completed).length;
                  const pct = (done / 21) * 100;
                  return (
                    <a key={cycle.id} href={`/cycles/${cycle.id}`} style={{
                      display: 'flex', alignItems: 'center', gap: '16px', textDecoration: 'none',
                      padding: '16px 20px', borderRadius: '14px',
                      background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)',
                      transition: 'border-color 0.2s', cursor: 'pointer',
                    }}>
                      <div style={{ width: '46px', height: '46px', position: 'relative', flexShrink: 0 }}>
                        <svg viewBox="0 0 46 46" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                          <circle cx="23" cy="23" r="19" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="3" />
                          <circle cx="23" cy="23" r="19" fill="none" stroke={color} strokeWidth="3" strokeDasharray={`${pct * 1.19} 119`} strokeLinecap="round" />
                        </svg>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color }}>{done}</div>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '14px', color: '#fff', margin: '0 0 4px 0', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cycle.intention}</p>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', color, fontWeight: 600 }}>{cycle.frequency}Hz {FN[cycle.frequency] || ''}</span>
                          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>{done}/21 {t(lang, 'days', 'dias')}</span>
                          {getStreak(cycle.cycle_days, cycle.started_at) > 1 && <span style={{ fontSize: '11px', color: '#c9a84c' }}>🔥 {getStreak(cycle.cycle_days, cycle.started_at)}</span>}
                          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.15)' }}>{fmtDate(cycle.started_at)}</span>
                        </div>
                        <div style={{ height: '3px', background: 'rgba(255,255,255,0.04)', borderRadius: '2px', marginTop: '8px' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '2px', transition: 'width 0.3s' }} />
                        </div>
                      </div>
                      <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '16px', flexShrink: 0 }}>›</span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* COMPLETED */}
          {completedCycles.length > 0 && (
            <div>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '14px' }}>{t(lang, 'Completed', 'Completados')}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {completedCycles.map(cycle => {
                  const color = FC[cycle.frequency] || '#c9a84c';
                  return (
                    <a key={cycle.id} href={`/cycles/${cycle.id}`} style={{
                      display: 'flex', alignItems: 'center', gap: '14px', textDecoration: 'none',
                      padding: '14px 18px', borderRadius: '12px', background: 'rgba(34,197,94,0.03)', border: '1px solid rgba(34,197,94,0.08)',
                    }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#22c55e', flexShrink: 0 }}>✓</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', margin: '0 0 2px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cycle.intention}</p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <span style={{ fontSize: '11px', color, fontWeight: 600 }}>{cycle.frequency}Hz</span>
                          {cycle.completed_at && <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.15)' }}>{t(lang, 'Completed', 'Completado')} {fmtDate(cycle.completed_at)}</span>}
                        </div>
                      </div>
                      <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '16px', flexShrink: 0 }}>›</span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {blockedModalOpen && (
        <div
          onClick={() => setBlockedModalOpen(false)}
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
            <div style={{ fontSize: 11, color: 'rgba(201,168,76,0.7)', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700, marginBottom: 16 }}>
              {t(lang, 'Free cycle completed', 'Ciclo gratis completado')}
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: '#fff', fontWeight: 400, marginBottom: 12 }}>
              {t(lang, 'You already used your free cycle', 'Ya usaste tu ciclo gratis')}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
              {t(lang, 'Upgrade to Pro for unlimited cycles and keep transforming your mind without pauses.', 'Upgrade a Pro para ciclos ilimitados y seguir transformando tu mente sin pausas.')}
            </p>
            <button
              onClick={() => router.push('/pricing')}
              style={{
                width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                background: '#c9a84c', color: '#0a0e1a', fontSize: 14, fontWeight: 700,
                letterSpacing: 0.5, cursor: 'pointer', marginBottom: 12,
              }}
            >
              {t(lang, 'View plans', 'Ver planes')}
            </button>
            <button
              onClick={() => setBlockedModalOpen(false)}
              style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 13, cursor: 'pointer' }}
            >
              {t(lang, 'Close', 'Cerrar')}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
