'use client';
import { useState, useEffect, useCallback } from 'react';

interface CycleDay { id: string; day_number: number; completed: boolean; }
interface Cycle { id: string; intention: string; frequency: number; current_day: number; completed: boolean; started_at: string; completed_at: string | null; cycle_days: CycleDay[]; }

const FC: Record<number, string> = { 396: '#c9a84c', 417: '#d85a30', 432: '#639922', 528: '#639922', 639: '#d4537e', 741: '#388add', 852: '#1d9e75', 963: '#534ab7' };
const FN: Record<number, string> = { 396: 'Liberation', 417: 'Change', 432: 'Harmony', 528: 'Miracle', 639: 'Connection', 741: 'Expression', 852: 'Intuition', 963: 'Crown' };

const AREAS = [
  { id: 'salud', label: 'Salud', icon: '🧬', color: '#22c55e' },
  { id: 'relaciones', label: 'Relaciones', icon: '💞', color: '#d4537e' },
  { id: 'finanzas', label: 'Finanzas', icon: '💰', color: '#c9a84c' },
  { id: 'emociones', label: 'Emociones', icon: '🌊', color: '#388add' },
  { id: 'habitos', label: 'Habitos', icon: '⚡', color: '#d85a30' },
  { id: 'espiritualidad', label: 'Espiritualidad', icon: '✦', color: '#534ab7' },
];
const EMOTIONS = ['Ansiedad', 'Frustracion', 'Tristeza', 'Miedo', 'Culpa', 'Enojo'];
const AREA_PLACEHOLDERS: Record<string, string> = {
  salud: 'Describe el patron de salud que quieres transformar...',
  relaciones: 'Describe el patron en tus relaciones que quieres cambiar...',
  finanzas: 'Describe tu relacion con el dinero que quieres transformar...',
  emociones: 'Describe la emocion o patron emocional que quieres cambiar...',
  habitos: 'Describe el habito que quieres transformar...',
  espiritualidad: 'Describe el aspecto espiritual que quieres desarrollar...',
};

function fmtDate(iso: string) { return new Date(iso).toLocaleDateString('es', { month: 'short', day: 'numeric' }); }
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
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(true);

  // Create flow
  const [createStep, setCreateStep] = useState<0 | 1 | 2 | 3 | 4>(0); // 4 = preferred time
  const [area, setArea] = useState('');
  const [pattern, setPattern] = useState('');
  const [emotions, setEmotions] = useState<string[]>([]);
  const [aiIntention, setAiIntention] = useState('');
  const [aiFrequency, setAiFrequency] = useState(528);
  const [aiReason, setAiReason] = useState('');
  const [preferredTime, setPreferredTime] = useState('07:00');
  const [generating, setGenerating] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch('/api/cycles').then(r => r.json()).then(d => setCycles(d.cycles || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const resetCreate = () => { setCreateStep(0); setArea(''); setPattern(''); setEmotions([]); setAiIntention(''); setAiFrequency(528); setAiReason(''); setPreferredTime('07:00'); };

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
      const res = await fetch('/api/cycles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ intention: aiIntention, frequency: aiFrequency, preferred_time: preferredTime }) });
      const d = await res.json();
      if (d.cycle) { setCycles(p => [d.cycle, ...p]); resetCreate(); }
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
                  ciclos <span style={{ color: '#c9a84c', fontWeight: 400 }}>21 dias</span>
                </h1>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', marginTop: '6px' }}>21 dias de escucha consciente transforman tu mente</p>
              </div>
              {createStep === 0 && (
                <button onClick={() => setCreateStep(1)} style={{
                  background: 'linear-gradient(135deg, #c9a84c, #dbb960)', color: '#081020', border: 'none', borderRadius: '10px',
                  padding: '10px 22px', fontSize: '12px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase',
                  cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: "'Outfit', sans-serif",
                }}>+ Nuevo Ciclo</button>
              )}
            </div>
          )}

          {/* ═══ CREATE FLOW ═══ */}
          {createStep > 0 && (
            <div style={{ background: 'rgba(201,168,76,0.03)', border: '1px solid rgba(201,168,76,0.1)', borderRadius: '16px', padding: '28px', marginBottom: '28px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                {[1, 2, 3, 4].map(s => (
                  <div key={s} style={{ height: '3px', flex: 1, borderRadius: '2px', background: createStep >= s ? '#c9a84c' : 'rgba(255,255,255,0.05)', transition: 'background 0.3s' }} />
                ))}
              </div>

              {createStep === 1 && (
                <div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontWeight: 400, color: '#fff', margin: '0 0 6px 0' }}>
                    Que area de tu vida quieres <span style={{ color: '#c9a84c' }}>transformar</span>?
                  </h3>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', marginBottom: '20px' }}>Selecciona el area principal</p>
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
                  <button onClick={resetCreate} style={{ marginTop: '16px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: '12px', cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>Cancelar</button>
                </div>
              )}

              {createStep === 2 && (
                <div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontWeight: 400, color: '#fff', margin: '0 0 6px 0' }}>
                    Cual es el patron que quieres <span style={{ color: '#c9a84c' }}>cambiar</span>?
                  </h3>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', marginBottom: '16px' }}>Se lo mas especifico posible</p>
                  <textarea value={pattern} onChange={e => setPattern(e.target.value)} placeholder={AREA_PLACEHOLDERS[area] || 'Describe el patron...'} rows={3} style={{
                    width: '100%', background: 'rgba(4,10,22,0.5)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px',
                    padding: '14px 16px', color: '#fff', fontSize: '14px', fontFamily: "'Outfit', sans-serif", outline: 'none', boxSizing: 'border-box', resize: 'none', marginBottom: '18px', lineHeight: 1.6,
                  }} />
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', marginBottom: '10px' }}>Como te hace sentir ese patron?</p>
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
                    }}>{generating ? '✨ Analizando...' : 'Continuar'}</button>
                    <button onClick={() => setCreateStep(1)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 24px', fontSize: '13px', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>Atras</button>
                  </div>
                </div>
              )}

              {createStep === 3 && (
                <div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontWeight: 400, color: '#fff', margin: '0 0 6px 0' }}>
                    Tu programa <span style={{ color: '#c9a84c' }}>personalizado</span>
                  </h3>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', marginBottom: '20px' }}>Generado con IA basado en tu perfil</p>
                  <div style={{ marginBottom: '18px' }}>
                    <p style={{ fontSize: '10px', color: '#c9a84c', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 600 }}>Tu intencion</p>
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
                    <button onClick={() => setCreateStep(4)} style={{
                      background: 'linear-gradient(135deg, #c9a84c, #dbb960)', color: '#081020', border: 'none', borderRadius: '10px',
                      padding: '12px 28px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
                      letterSpacing: '0.5px',
                    }}>Continuar</button>
                    <button onClick={() => setCreateStep(2)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px 24px', fontSize: '13px', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>Atras</button>
                  </div>
                </div>
              )}

              {/* STEP 4: Preferred time */}
              {createStep === 4 && (
                <div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontWeight: 400, color: '#fff', margin: '0 0 6px 0' }}>
                    A que hora prefieres tu <span style={{ color: '#c9a84c' }}>sesion diaria</span>?
                  </h3>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', marginBottom: '20px' }}>La consistencia es clave para la reprogramacion</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                    {['06:00', '07:00', '08:00', '09:00', '12:00', '18:00', '21:00', '22:00'].map(t => {
                      const sel = preferredTime === t;
                      const label = Number(t.split(':')[0]) < 12 ? `${t} AM` : t === '12:00' ? '12:00 PM' : `${Number(t.split(':')[0]) - 12}:00 PM`;
                      return (
                        <button key={t} onClick={() => setPreferredTime(t)} style={{
                          background: sel ? 'rgba(201,168,76,0.08)' : 'rgba(255,255,255,0.02)',
                          border: `1px solid ${sel ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.05)'}`,
                          borderRadius: '8px', padding: '8px 16px', fontSize: '13px', cursor: 'pointer',
                          color: sel ? '#c9a84c' : 'rgba(255,255,255,0.35)', fontFamily: "'Outfit', sans-serif",
                        }}>{label}</button>
                      );
                    })}
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={handleCreateCycle} disabled={creating} style={{
                      background: 'linear-gradient(135deg, #c9a84c, #dbb960)', color: '#081020', border: 'none', borderRadius: '10px',
                      padding: '12px 28px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
                      letterSpacing: '0.5px', opacity: creating ? 0.5 : 1,
                    }}>{creating ? 'Creando...' : 'Iniciar mi ciclo de 21 dias'}</button>
                    <button onClick={() => setCreateStep(3)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px 24px', fontSize: '13px', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>Atras</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {loading && <div style={{ textAlign: 'center', padding: '60px 0' }}><p style={{ color: 'rgba(201,168,76,0.6)', fontSize: '14px' }}>Cargando ciclos...</p></div>}

          {/* HERO — full when no cycles, hidden during create flow */}
          {!loading && cycles.length === 0 && createStep === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0 20px' }}>
              {/* Title */}
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '46px', fontWeight: 300, color: '#fff', margin: '0 0 14px 0', lineHeight: 1.15 }}>
                Transforma tu mente en <span style={{ color: '#c9a84c', fontWeight: 500 }}>21 dias</span>
              </h1>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.4)', maxWidth: '560px', margin: '0 auto 44px', lineHeight: 1.7 }}>
                La neurociencia demuestra que 21 dias de practica consistente crean nuevas rutas neuronales. Tu voz, tus frecuencias, tu transformacion.
              </p>

              {/* 3 Steps */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '44px' }}>
                {[
                  { icon: '🎯', title: 'Define tu intencion', desc: 'Elige que quieres transformar en tu vida' },
                  { icon: '🎧', title: 'Escucha cada dia', desc: 'Tu voz clonada entrega afirmaciones con frecuencias de sanacion' },
                  { icon: '✨', title: 'Transforma', desc: 'Despues de 21 dias, tu subconsciente abraza tu nueva verdad' },
                ].map((step, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '28px 20px' }}>
                    <div style={{ fontSize: '32px', marginBottom: '14px' }}>{step.icon}</div>
                    <div style={{ fontSize: '10px', color: 'rgba(201,168,76,0.5)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 600 }}>Paso {i + 1}</div>
                    <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: 500, color: '#fff', margin: '0 0 8px 0' }}>{step.title}</h3>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', margin: 0, lineHeight: 1.5 }}>{step.desc}</p>
                  </div>
                ))}
              </div>

              {/* 3 Phases */}
              <div style={{ textAlign: 'left', background: 'rgba(201,168,76,0.03)', border: '1px solid rgba(201,168,76,0.08)', borderRadius: '16px', padding: '28px 28px', marginBottom: '44px' }}>
                <p style={{ fontSize: '10px', color: '#c9a84c', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px', fontWeight: 600 }}>Las 3 fases de reprogramacion</p>
                {[
                  { days: 'Dias 1–7', name: 'Sembrando semillas', desc: 'Tu subconsciente comienza a escuchar y aceptar nuevas creencias', color: 'rgba(201,168,76,0.6)' },
                  { days: 'Dias 8–14', name: 'Transformacion y accion', desc: 'Los viejos patrones se disuelven, nuevos habitos emergen', color: 'rgba(201,168,76,0.8)' },
                  { days: 'Dias 15–21', name: 'Integracion', desc: 'Tus nuevas creencias se convierten en tu estado natural', color: '#c9a84c' },
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
              <button onClick={() => setCreateStep(1)} style={{
                background: 'linear-gradient(135deg, #c9a84c, #dbb960)', color: '#081020', border: 'none',
                borderRadius: '14px', padding: '18px 44px', fontSize: '15px', fontWeight: 700, cursor: 'pointer',
                letterSpacing: '1px', textTransform: 'uppercase', fontFamily: "'Outfit', sans-serif",
                boxShadow: '0 4px 30px rgba(201,168,76,0.25)',
              }}>Comienza tu primer ciclo</button>
            </div>
          )}

          {/* ACTIVE CYCLES — compact cards */}
          {activeCycles.length > 0 && (
            <div style={{ marginBottom: '36px' }}>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '14px' }}>Ciclos activos</p>
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
                          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>{done}/21 dias</span>
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
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '14px' }}>Completados</p>
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
                          {cycle.completed_at && <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.15)' }}>Completado {fmtDate(cycle.completed_at)}</span>}
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
    </>
  );
}
