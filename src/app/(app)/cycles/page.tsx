'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase';

interface CycleDay { id: string; day_number: number; completed: boolean; completed_at: string | null; track_id: string | null; }
interface Cycle { id: string; intention: string; frequency: number; current_day: number; completed: boolean; started_at: string; completed_at: string | null; cycle_days: CycleDay[]; }

const FC: Record<number, string> = { 396: '#c9a84c', 417: '#d85a30', 432: '#639922', 528: '#639922', 639: '#d4537e', 741: '#388add', 852: '#1d9e75', 963: '#534ab7' };
const FN: Record<number, string> = { 396: 'Liberation', 417: 'Change', 432: 'Harmony', 528: 'Miracle', 639: 'Connection', 741: 'Expression', 852: 'Intuition', 963: 'Crown' };
const WEEKDAYS = ['L', 'M', 'Mi', 'J', 'V', 'S', 'D'];

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
function getDayDate(startedAt: string, dayNumber: number): Date { const d = new Date(startedAt); d.setDate(d.getDate() + dayNumber - 1); return d; }
function isToday(date: Date): boolean { const n = new Date(); return date.getFullYear() === n.getFullYear() && date.getMonth() === n.getMonth() && date.getDate() === n.getDate(); }
function isPast(date: Date): boolean { const n = new Date(); n.setHours(0,0,0,0); const d = new Date(date); d.setHours(0,0,0,0); return d < n; }
function fmtShort(date: Date): string { return date.toLocaleDateString('es', { month: 'short', day: 'numeric' }); }

export default function CyclesPage() {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCycle, setExpandedCycle] = useState<string | null>(null);

  // Create flow
  const [createStep, setCreateStep] = useState<0 | 1 | 2 | 3>(0); // 0=hidden
  const [area, setArea] = useState('');
  const [pattern, setPattern] = useState('');
  const [emotions, setEmotions] = useState<string[]>([]);
  const [aiIntention, setAiIntention] = useState('');
  const [aiFrequency, setAiFrequency] = useState(528);
  const [aiReason, setAiReason] = useState('');
  const [generating, setGenerating] = useState(false);
  const [creating, setCreating] = useState(false);

  // Inline generation
  const [genCycleId, setGenCycleId] = useState<string | null>(null);
  const [genDayNum, setGenDayNum] = useState<number | null>(null);
  const [genStatus, setGenStatus] = useState('');
  const [genAudio, setGenAudio] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetch('/api/cycles').then(r => r.json()).then(d => setCycles(d.cycles || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  // ── Create flow handlers ──
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
      if (d.cycle) { setCycles(p => [d.cycle, ...p]); resetCreate(); setExpandedCycle(d.cycle.id); }
    } catch {} finally { setCreating(false); }
  }, [aiIntention, aiFrequency]);

  // ── Inline generation ──
  const handleGenerateSession = useCallback(async (cycle: Cycle, dayNum: number) => {
    setGenCycleId(cycle.id); setGenDayNum(dayNum); setGenAudio(null); setIsGenerating(true);
    try {
      // 1. Get voice
      setGenStatus('🎙 Obteniendo tu voz...');
      const profileRes = await fetch('/api/profile');
      const profileData = await profileRes.json();
      const voiceUrl = profileData.profile?.voice_audio_url;
      if (!voiceUrl) { setGenStatus('❌ No tienes voz guardada. Ve al Dashboard para grabar tu voz primero.'); setIsGenerating(false); return; }

      // 2. Clone voice
      setGenStatus('🎙 Clonando tu voz...');
      const voiceRes = await fetch(voiceUrl);
      const voiceBlob = await voiceRes.blob();
      const cloneForm = new FormData();
      cloneForm.append('audio', voiceBlob, 'voice.webm');
      cloneForm.append('name', `VOXIRA-cycle-${Date.now()}`);
      const cloneRes = await fetch('/api/clone-voice', { method: 'POST', body: cloneForm });
      const cloneData = await cloneRes.json();
      if (!cloneRes.ok || !cloneData.voice_id) throw new Error(cloneData.error || 'Clone failed');

      // 3. Generate audio
      setGenStatus('✨ Generando afirmaciones con tu voz...');
      const genRes = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ voice_id: cloneData.voice_id, intention: cycle.intention, frequency: cycle.frequency, duration: 5, lang: 'es' }) });
      const genData = await genRes.json();
      if (!genRes.ok || !genData.audio) throw new Error(genData.error || 'Generation failed');

      setGenAudio(genData.audio);
      setGenStatus('✅ Sesion lista!');

      // 4. Auto-save track + complete day
      const sb = createClient();
      const { data: { user: u } } = await sb.auth.getUser();
      if (u) {
        const trackBlob = new Blob([Uint8Array.from(atob(genData.audio), c => c.charCodeAt(0))], { type: 'audio/mpeg' });
        const fileName = `${u.id}/${Date.now()}-${cycle.frequency}hz-5min.mp3`;
        const { error: upErr } = await sb.storage.from('tracks').upload(fileName, trackBlob, { contentType: 'audio/mpeg', upsert: false });
        if (!upErr) {
          const { data: { publicUrl } } = sb.storage.from('tracks').getPublicUrl(fileName);
          const trackRes = await fetch('/api/tracks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ file_url: publicUrl, file_size: trackBlob.size, intention: cycle.intention, frequency: cycle.frequency, ambient: 'none', duration_minutes: 5, processed: genData.processed || false }) });
          const trackData = await trackRes.json();

          // Complete cycle day
          const patchRes = await fetch('/api/cycles', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cycle_id: cycle.id, day_number: dayNum, track_id: trackData.track?.id }) });
          const patchData = await patchRes.json();
          if (patchData.success) {
            setCycles(prev => prev.map(c => {
              if (c.id !== cycle.id) return c;
              return { ...c, current_day: Math.min(dayNum + 1, 21), completed: patchData.completed, completed_at: patchData.completed ? new Date().toISOString() : null,
                cycle_days: c.cycle_days.map(d => d.day_number === dayNum ? { ...d, completed: true, completed_at: new Date().toISOString(), track_id: trackData.track?.id } : d) };
            }));
          }
        }
      }
    } catch (err) {
      setGenStatus(`❌ ${err instanceof Error ? err.message : 'Error'}`);
    } finally { setIsGenerating(false); }
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Eliminar este ciclo?')) return;
    await fetch(`/api/cycles?id=${id}`, { method: 'DELETE' });
    setCycles(p => p.filter(c => c.id !== id));
  }, []);

  const activeCycles = cycles.filter(c => !c.completed);
  const completedCycles = cycles.filter(c => c.completed);

  const cardBg = 'rgba(255,255,255,0.01)';
  const cardBorder = '1px solid rgba(255,255,255,0.04)';

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <audio ref={audioRef} />
      <div style={{ minHeight: '100vh', padding: '36px 32px', fontFamily: "'Outfit', sans-serif" }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>

          {/* HEADER */}
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

          {/* ═══ CREATE FLOW ═══ */}
          {createStep > 0 && (
            <div style={{ background: 'rgba(201,168,76,0.03)', border: '1px solid rgba(201,168,76,0.1)', borderRadius: '16px', padding: '28px', marginBottom: '28px' }}>

              {/* Step indicator */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                {[1, 2, 3].map(s => (
                  <div key={s} style={{ height: '3px', flex: 1, borderRadius: '2px', background: createStep >= s ? '#c9a84c' : 'rgba(255,255,255,0.05)', transition: 'background 0.3s' }} />
                ))}
              </div>

              {/* STEP 1: Area */}
              {createStep === 1 && (
                <div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontWeight: 400, color: '#fff', margin: '0 0 6px 0' }}>
                    Que area de tu vida quieres <span style={{ color: '#c9a84c' }}>transformar</span>?
                  </h3>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', marginBottom: '20px' }}>Selecciona el area principal</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
                    {AREAS.map(a => {
                      const sel = area === a.id;
                      return (
                        <button key={a.id} onClick={() => { setArea(a.id); setCreateStep(2); }} style={{
                          background: sel ? `${a.color}12` : 'rgba(255,255,255,0.02)', border: `1px solid ${sel ? a.color + '30' : 'rgba(255,255,255,0.05)'}`,
                          borderRadius: '12px', padding: '18px 14px', cursor: 'pointer', textAlign: 'center',
                          fontFamily: "'Outfit', sans-serif", transition: 'all 0.2s',
                        }}>
                          <div style={{ fontSize: '24px', marginBottom: '8px' }}>{a.icon}</div>
                          <div style={{ fontSize: '13px', color: sel ? a.color : 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{a.label}</div>
                        </button>
                      );
                    })}
                  </div>
                  <button onClick={resetCreate} style={{ marginTop: '16px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: '12px', cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>Cancelar</button>
                </div>
              )}

              {/* STEP 2: Pattern + Emotions */}
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

              {/* STEP 3: AI Result */}
              {createStep === 3 && (
                <div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontWeight: 400, color: '#fff', margin: '0 0 6px 0' }}>
                    Tu programa <span style={{ color: '#c9a84c' }}>personalizado</span>
                  </h3>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', marginBottom: '20px' }}>Generado con IA basado en tu perfil</p>

                  {/* Intention */}
                  <div style={{ marginBottom: '18px' }}>
                    <p style={{ fontSize: '10px', color: '#c9a84c', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 600 }}>Tu intencion</p>
                    <textarea value={aiIntention} onChange={e => setAiIntention(e.target.value)} rows={3} style={{
                      width: '100%', background: 'rgba(4,10,22,0.5)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '10px',
                      padding: '14px 16px', color: '#fff', fontSize: '15px', fontFamily: "'Outfit', sans-serif", outline: 'none', boxSizing: 'border-box', resize: 'none', lineHeight: 1.6, fontStyle: 'italic',
                    }} />
                  </div>

                  {/* Frequency */}
                  <div style={{ background: 'rgba(4,10,22,0.4)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '50%', border: `2px solid ${FC[aiFrequency] || '#c9a84c'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
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
                    }}>{creating ? 'Creando...' : 'Iniciar mi ciclo de 21 dias'}</button>
                    <button onClick={() => setCreateStep(2)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px 24px', fontSize: '13px', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>Atras</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* LOADING */}
          {loading && <div style={{ textAlign: 'center', padding: '60px 0' }}><p style={{ color: 'rgba(201,168,76,0.6)', fontSize: '14px' }}>Cargando ciclos...</p></div>}

          {/* EMPTY */}
          {!loading && cycles.length === 0 && createStep === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>&#9678;</div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 300, color: 'rgba(255,255,255,0.5)', margin: '0 0 8px 0' }}>Sin ciclos activos</h2>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.2)', marginBottom: '28px' }}>Comienza tu primer ciclo de 21 dias</p>
              <button onClick={() => setCreateStep(1)} style={{
                background: 'linear-gradient(135deg, #c9a84c, #dbb960)', color: '#081020', border: 'none',
                borderRadius: '12px', padding: '14px 32px', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                letterSpacing: '1px', textTransform: 'uppercase', fontFamily: "'Outfit', sans-serif",
              }}>Crear Primer Ciclo</button>
            </div>
          )}

          {/* ACTIVE CYCLES */}
          {activeCycles.length > 0 && (
            <div style={{ marginBottom: '36px' }}>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '14px' }}>Ciclos activos</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {activeCycles.map(cycle => {
                  const color = FC[cycle.frequency] || '#c9a84c';
                  const completedDays = cycle.cycle_days.filter(d => d.completed).length;
                  const pct = (completedDays / 21) * 100;
                  const expanded = expandedCycle === cycle.id;
                  return (
                    <div key={cycle.id} style={{ background: cardBg, border: cardBorder, borderRadius: '14px', overflow: 'hidden' }}>
                      <div onClick={() => setExpandedCycle(expanded ? null : cycle.id)} style={{ padding: '18px 22px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '50px', height: '50px', position: 'relative', flexShrink: 0 }}>
                          <svg viewBox="0 0 50 50" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                            <circle cx="25" cy="25" r="21" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="3" />
                            <circle cx="25" cy="25" r="21" fill="none" stroke={color} strokeWidth="3" strokeDasharray={`${pct * 1.32} 132`} strokeLinecap="round" />
                          </svg>
                          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, color }}>{completedDays}</div>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '15px', color: '#fff', margin: '0 0 4px 0', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cycle.intention}</p>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', color, fontWeight: 600 }}>{cycle.frequency}Hz {FN[cycle.frequency] || ''}</span>
                            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>Dia {cycle.current_day}/21</span>
                            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.15)' }}>Inicio {fmtDate(cycle.started_at)}</span>
                          </div>
                        </div>
                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.15)', flexShrink: 0 }}>{expanded ? '▲' : '▼'}</span>
                      </div>
                      <div style={{ height: '2px', background: 'rgba(255,255,255,0.03)', margin: '0 22px' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '1px', transition: 'width 0.3s' }} />
                      </div>

                      {/* Expanded calendar + inline gen */}
                      {expanded && (() => {
                        const startDate = getDayDate(cycle.started_at, 1);
                        const endDate = getDayDate(cycle.started_at, 21);
                        const sortedDays = [...cycle.cycle_days].sort((a, b) => a.day_number - b.day_number);
                        const todayDayNum = sortedDays.find(d => isToday(getDayDate(cycle.started_at, d.day_number)))?.day_number || null;
                        const todayCompleted = todayDayNum ? sortedDays.find(d => d.day_number === todayDayNum)?.completed : false;
                        const startDow = (startDate.getDay() + 6) % 7;
                        const cells: (CycleDay | null)[] = Array(startDow).fill(null).concat(sortedDays);
                        const rows: (CycleDay | null)[][] = [];
                        for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
                        while (rows[rows.length - 1].length < 7) rows[rows.length - 1].push(null);
                        const isGenThisCycle = genCycleId === cycle.id;

                        return (
                        <div style={{ padding: '18px 22px' }}>
                          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginBottom: '14px' }}>
                            {fmtShort(startDate)} — {fmtShort(endDate)} {endDate.getFullYear()}
                          </p>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '6px' }}>
                            {WEEKDAYS.map(wd => <div key={wd} style={{ textAlign: 'center', fontSize: '10px', color: 'rgba(255,255,255,0.2)', fontWeight: 500 }}>{wd}</div>)}
                          </div>
                          {rows.map((row, ri) => (
                            <div key={ri} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
                              {row.map((day, ci) => {
                                if (!day) return <div key={`e${ci}`} />;
                                const date = getDayDate(cycle.started_at, day.day_number);
                                const today = isToday(date);
                                const past = isPast(date);
                                const missed = past && !day.completed && !today;
                                return (
                                  <div key={day.id} style={{
                                    borderRadius: '8px', padding: '6px 2px', textAlign: 'center',
                                    background: day.completed ? 'rgba(34,197,94,0.15)' : missed ? 'rgba(239,68,68,0.1)' : today ? 'rgba(201,168,76,0.08)' : 'rgba(255,255,255,0.015)',
                                    border: today ? '1px solid #c9a84c' : '1px solid transparent',
                                    animation: today && !day.completed ? 'pulse 2s infinite' : 'none',
                                  }}>
                                    <div style={{ fontSize: '13px', fontWeight: 600, color: day.completed ? '#22c55e' : missed ? '#ef4444' : today ? '#c9a84c' : 'rgba(255,255,255,0.15)' }}>
                                      {day.completed ? '✓' : missed ? '✗' : day.day_number}
                                    </div>
                                    <div style={{ fontSize: '9px', color: today ? 'rgba(201,168,76,0.6)' : 'rgba(255,255,255,0.15)', marginTop: '1px' }}>
                                      {date.getDate()} {date.toLocaleDateString('es', { month: 'short' })}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ))}

                          {/* Inline generation area */}
                          {todayDayNum && !todayCompleted && (
                            <div style={{ marginTop: '16px', background: 'rgba(201,168,76,0.03)', border: '1px solid rgba(201,168,76,0.08)', borderRadius: '12px', padding: '16px' }}>
                              {/* Status */}
                              {isGenThisCycle && genStatus && (
                                <p style={{ fontSize: '13px', color: genStatus.includes('❌') ? '#ef4444' : '#c9a84c', margin: '0 0 12px 0' }}>{genStatus}</p>
                              )}
                              {/* Player */}
                              {isGenThisCycle && genAudio && (
                                <div style={{ marginBottom: '12px' }}>
                                  <audio controls src={`data:audio/mp3;base64,${genAudio}`} style={{ width: '100%', maxWidth: '400px' }} />
                                </div>
                              )}
                              {/* Generate button */}
                              {(!isGenThisCycle || (!isGenerating && !genAudio)) && (
                                <button onClick={() => handleGenerateSession(cycle, todayDayNum)} disabled={isGenerating} style={{
                                  background: 'linear-gradient(135deg, #c9a84c, #dbb960)', color: '#081020', border: 'none', borderRadius: '10px',
                                  padding: '10px 22px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
                                  opacity: isGenerating ? 0.4 : 1,
                                }}>Generar sesion del dia {todayDayNum}</button>
                              )}
                            </div>
                          )}

                          {/* Delete */}
                          <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                            <button onClick={() => handleDelete(cycle.id)} style={{
                              fontSize: '12px', color: 'rgba(239,68,68,0.5)', background: 'none', border: '1px solid rgba(239,68,68,0.1)',
                              borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
                            }}>Eliminar</button>
                          </div>
                        </div>
                        );
                      })()}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* COMPLETED CYCLES */}
          {completedCycles.length > 0 && (
            <div>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '14px' }}>Ciclos completados</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {completedCycles.map(cycle => {
                  const color = FC[cycle.frequency] || '#c9a84c';
                  return (
                    <div key={cycle.id} style={{ padding: '14px 18px', borderRadius: '12px', background: 'rgba(34,197,94,0.03)', border: '1px solid rgba(34,197,94,0.08)', display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>&#10003;</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', margin: '0 0 2px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cycle.intention}</p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <span style={{ fontSize: '11px', color, fontWeight: 600 }}>{cycle.frequency}Hz</span>
                          {cycle.completed_at && <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.15)' }}>Completado {fmtDate(cycle.completed_at)}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
    </>
  );
}
