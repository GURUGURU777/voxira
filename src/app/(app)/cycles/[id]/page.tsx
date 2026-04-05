'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

interface CycleDay { id: string; day_number: number; completed: boolean; completed_at: string | null; track_id: string | null; emotional_score: number | null; tracks: { file_url: string } | null; }
interface Cycle { id: string; intention: string; frequency: number; current_day: number; completed: boolean; started_at: string; completed_at: string | null; preferred_time: string | null; cycle_days: CycleDay[]; }

const FC: Record<number, string> = { 396: '#c9a84c', 417: '#d85a30', 432: '#639922', 528: '#639922', 639: '#d4537e', 741: '#388add', 852: '#1d9e75', 963: '#534ab7' };
const FN: Record<number, string> = { 396: 'Liberation', 417: 'Change', 432: 'Harmony', 528: 'Miracle', 639: 'Connection', 741: 'Expression', 852: 'Intuition', 963: 'Crown' };
const WEEKDAYS = ['L', 'M', 'Mi', 'J', 'V', 'S', 'D'];
const MOOD_EMOJIS = ['😟', '😐', '🙂', '😊', '🤩'];
const PHASES = [
  { name: 'Aceptacion y Reconocimiento', color: '#388add', range: [1, 7] },
  { name: 'Transformacion y Accion', color: '#c9a84c', range: [8, 14] },
  { name: 'Integracion y Poder', color: '#22c55e', range: [15, 21] },
];

function getDayDate(s: string, n: number): Date { const d = new Date(s); d.setDate(d.getDate() + n - 1); return d; }
function isToday(d: Date): boolean { const n = new Date(); return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate(); }
function isPast(d: Date): boolean { const n = new Date(); n.setHours(0,0,0,0); const x = new Date(d); x.setHours(0,0,0,0); return x < n; }
function fmtShort(d: Date): string { return d.toLocaleDateString('es', { month: 'short', day: 'numeric' }); }
function fmtTime(s: number) { if (!s || !isFinite(s)) return '0:00'; return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`; }
function getPhase(day: number) { return PHASES[day <= 7 ? 0 : day <= 14 ? 1 : 2]; }
function getStreak(days: CycleDay[], startedAt: string): number {
  let streak = 0;
  const sorted = [...days].sort((a, b) => b.day_number - a.day_number);
  for (const d of sorted) {
    const date = getDayDate(startedAt, d.day_number);
    if (isToday(date) || isPast(date)) { if (d.completed) streak++; else break; }
  }
  return streak;
}
function getPhaseIntention(intention: string, dayNum: number): string {
  if (dayNum <= 7) return intention + ` [FASE DE ACEPTACIÓN - DÍA ${dayNum}/21: Genera afirmaciones suaves de aceptación y reconocimiento. El usuario está tomando consciencia de su patrón. Sin presión, con compasión y apertura.]`;
  if (dayNum <= 14) return intention + ` [FASE DE TRANSFORMACIÓN - DÍA ${dayNum}/21: Genera afirmaciones de empoderamiento y acción concreta. El usuario ya reconoció su patrón y está listo para el cambio activo. Afirmaciones directas y poderosas.]`;
  return intention + ` [FASE DE INTEGRACIÓN - DÍA ${dayNum}/21: Genera afirmaciones de certeza absoluta, como si el cambio ya ocurrió. El usuario está consolidando su nueva identidad. Afirmaciones en presente, con total convicción.]`;
}

// ── Custom Player ──
function Player({ src }: { src: string }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dur, setDur] = useState(0);
  const [vol, setVol] = useState(0.8);
  useEffect(() => {
    const a = ref.current; if (!a) return;
    const t = () => setProgress(a.currentTime); const d = () => setDur(a.duration); const e = () => { setPlaying(false); setProgress(0); };
    a.addEventListener('timeupdate', t); a.addEventListener('loadedmetadata', d); a.addEventListener('ended', e);
    return () => { a.removeEventListener('timeupdate', t); a.removeEventListener('loadedmetadata', d); a.removeEventListener('ended', e); };
  }, []);
  const toggle = () => { if (!ref.current) return; if (playing) ref.current.pause(); else ref.current.play().catch(() => {}); setPlaying(!playing); };
  const seek = (e: React.MouseEvent<HTMLDivElement>) => { if (!ref.current || !dur) return; ref.current.currentTime = Math.max(0, Math.min(1, (e.clientX - e.currentTarget.getBoundingClientRect().left) / e.currentTarget.getBoundingClientRect().width)) * dur; };
  const setVolume = (e: React.MouseEvent<HTMLDivElement>) => { const v = Math.max(0, Math.min(1, (e.clientX - e.currentTarget.getBoundingClientRect().left) / e.currentTarget.getBoundingClientRect().width)); setVol(v); if (ref.current) ref.current.volume = v; };
  const pct = dur > 0 ? (progress / dur) * 100 : 0;
  return (
    <div style={{ background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.08)', borderRadius: '16px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
      <audio ref={ref} src={src} preload="metadata" />
      <button onClick={toggle} style={{ width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0, cursor: 'pointer', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {playing ? <div style={{ display: 'flex', gap: '3px' }}><div style={{ width: '3px', height: '14px', background: '#c9a84c', borderRadius: '2px' }} /><div style={{ width: '3px', height: '14px', background: '#c9a84c', borderRadius: '2px' }} /></div>
        : <div style={{ width: 0, height: 0, borderTop: '7px solid transparent', borderBottom: '7px solid transparent', borderLeft: '12px solid #c9a84c', marginLeft: '3px' }} />}
      </button>
      <div style={{ flex: 1 }}><div onClick={seek} style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', cursor: 'pointer' }}><div style={{ height: '100%', width: `${pct}%`, background: '#c9a84c', borderRadius: '2px', transition: 'width 0.1s linear' }} /></div></div>
      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', flexShrink: 0, minWidth: '70px', textAlign: 'center' }}>{fmtTime(progress)} / {fmtTime(dur)}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 010 7.07" /></svg>
        <div onClick={setVolume} style={{ width: '50px', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', cursor: 'pointer' }}><div style={{ height: '100%', width: `${vol * 100}%`, background: 'rgba(255,255,255,0.3)', borderRadius: '2px' }} /></div>
      </div>
    </div>
  );
}

// ── Emotional Chart ──
function EmotionalChart({ days, startedAt }: { days: CycleDay[]; startedAt: string }) {
  const scored = days.filter(d => d.completed && d.emotional_score).sort((a, b) => a.day_number - b.day_number);
  if (scored.length < 2) return null;
  const w = 600; const h = 120; const padX = 30; const padY = 15;
  const xStep = (w - padX * 2) / 20;
  const yStep = (h - padY * 2) / 4;
  const points = scored.map(d => ({ x: padX + (d.day_number - 1) * xStep, y: h - padY - ((d.emotional_score! - 1) * yStep) }));
  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  return (
    <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '14px', padding: '20px', marginBottom: '24px' }}>
      <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>Evolucion emocional</p>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 'auto' }}>
        {/* Phase dividers */}
        <line x1={padX + 7 * xStep - xStep / 2} y1={padY} x2={padX + 7 * xStep - xStep / 2} y2={h - padY} stroke="rgba(255,255,255,0.04)" strokeDasharray="4" />
        <line x1={padX + 14 * xStep - xStep / 2} y1={padY} x2={padX + 14 * xStep - xStep / 2} y2={h - padY} stroke="rgba(255,255,255,0.04)" strokeDasharray="4" />
        {/* Y labels */}
        {MOOD_EMOJIS.map((em, i) => <text key={i} x="8" y={h - padY - i * yStep + 4} fontSize="10">{em}</text>)}
        {/* Line */}
        <path d={line} fill="none" stroke="#c9a84c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Dots */}
        {points.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="4" fill="#c9a84c" />)}
      </svg>
    </div>
  );
}

// ═══ MAIN PAGE ═══
export default function CycleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const cycleId = params.id as string;
  const [cycle, setCycle] = useState<Cycle | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDuration, setSelectedDuration] = useState(5);
  const [emotionalScore, setEmotionalScore] = useState(3);
  const [emotionalSaved, setEmotionalSaved] = useState(false);
  const [genStatus, setGenStatus] = useState('');
  const [genAudioUrl, setGenAudioUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetch(`/api/cycles?id=${cycleId}`).then(r => r.json()).then(d => setCycle(d.cycle || null)).catch(() => {}).finally(() => setLoading(false));
  }, [cycleId]);

  const handleSaveEmotion = useCallback(async (score: number) => {
    if (!cycle) return;
    const sortedDays = [...cycle.cycle_days].sort((a, b) => a.day_number - b.day_number);
    const todayDay = sortedDays.find(d => isToday(getDayDate(cycle.started_at, d.day_number)));
    if (!todayDay) return;
    setEmotionalScore(score);
    await fetch('/api/cycles', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cycle_id: cycle.id, day_number: todayDay.day_number, emotional_score: score }) });
    setCycle(prev => prev ? { ...prev, cycle_days: prev.cycle_days.map(d => d.day_number === todayDay.day_number ? { ...d, emotional_score: score } : d) } : prev);
    setEmotionalSaved(true);
  }, [cycle]);

  const handleGenerate = useCallback(async () => {
    if (!cycle) return;
    const sortedDays = [...cycle.cycle_days].sort((a, b) => a.day_number - b.day_number);
    const todayDay = sortedDays.find(d => isToday(getDayDate(cycle.started_at, d.day_number)));
    if (!todayDay || todayDay.completed) return;
    setIsGenerating(true); setGenAudioUrl(null);
    try {
      setGenStatus('🎙 Obteniendo tu voz...');
      const profileData = await (await fetch('/api/profile')).json();
      const voiceUrl = profileData.profile?.voice_audio_url;
      if (!voiceUrl) { setGenStatus('❌ No tienes voz guardada. Ve al Dashboard para grabar tu voz.'); setIsGenerating(false); return; }

      setGenStatus('🎙 Clonando tu voz...');
      const voiceBlob = await (await fetch(voiceUrl)).blob();
      const cloneForm = new FormData(); cloneForm.append('audio', voiceBlob, 'voice.webm'); cloneForm.append('name', `VOXIRA-cycle-${Date.now()}`);
      const cloneData = await (await fetch('/api/clone-voice', { method: 'POST', body: cloneForm })).json();
      if (!cloneData.voice_id) throw new Error(cloneData.error || 'Clone failed');

      const phase = getPhase(todayDay.day_number);
      setGenStatus(`✨ Generando afirmaciones fase ${PHASES.indexOf(phase) + 1}...`);
      const enrichedIntention = getPhaseIntention(cycle.intention, todayDay.day_number);
      const genData = await (await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ voice_id: cloneData.voice_id, intention: enrichedIntention, frequency: cycle.frequency, duration: selectedDuration, lang: 'es' }) })).json();
      if (!genData.audio) throw new Error(genData.error || 'Generation failed');

      setGenStatus('💾 Guardando sesion...');
      const sb = createClient();
      const { data: { user: u } } = await sb.auth.getUser();
      if (!u) throw new Error('Not authenticated');
      const trackBlob = new Blob([Uint8Array.from(atob(genData.audio), c => c.charCodeAt(0))], { type: 'audio/mpeg' });
      const fileName = `${u.id}/${Date.now()}-${cycle.frequency}hz-${selectedDuration}min.mp3`;
      const { error: upErr } = await sb.storage.from('tracks').upload(fileName, trackBlob, { contentType: 'audio/mpeg', upsert: false });
      if (upErr) throw new Error('Upload failed');
      const { data: { publicUrl } } = sb.storage.from('tracks').getPublicUrl(fileName);
      const trackData = await (await fetch('/api/tracks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ file_url: publicUrl, file_size: trackBlob.size, intention: cycle.intention, frequency: cycle.frequency, ambient: 'none', duration_minutes: selectedDuration, processed: genData.processed || false }) })).json();

      const patchData = await (await fetch('/api/cycles', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cycle_id: cycle.id, day_number: todayDay.day_number, track_id: trackData.track?.id, emotional_score: emotionalScore }) })).json();

      setCycle(prev => {
        if (!prev) return prev;
        return { ...prev, current_day: Math.min(todayDay.day_number + 1, 21), completed: patchData.completed || false, completed_at: patchData.completed ? new Date().toISOString() : null,
          cycle_days: prev.cycle_days.map(d => d.day_number === todayDay.day_number ? { ...d, completed: true, completed_at: new Date().toISOString(), track_id: trackData.track?.id, tracks: { file_url: publicUrl }, emotional_score: emotionalScore } : d) };
      });
      setGenAudioUrl(publicUrl);
      setGenStatus('✅ Sesion del dia ' + todayDay.day_number + ' completada!');
    } catch (err) { setGenStatus(`❌ ${err instanceof Error ? err.message : 'Error'}`); } finally { setIsGenerating(false); }
  }, [cycle, selectedDuration, emotionalScore]);

  const handleDelete = useCallback(async () => {
    if (!confirm('Eliminar este ciclo?')) return;
    await fetch(`/api/cycles?id=${cycleId}`, { method: 'DELETE' });
    router.push('/cycles');
  }, [cycleId, router]);

  if (loading) return (<><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" /><div style={{ minHeight: '100vh', padding: '36px 32px', fontFamily: "'Outfit', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: 'rgba(201,168,76,0.6)', fontSize: '14px' }}>Cargando ciclo...</p></div></>);
  if (!cycle) return (<><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" /><div style={{ minHeight: '100vh', padding: '36px 32px', fontFamily: "'Outfit', sans-serif", textAlign: 'center', paddingTop: '80px' }}><p style={{ color: 'rgba(255,255,255,0.3)' }}>Ciclo no encontrado</p><a href="/cycles" style={{ color: '#c9a84c', fontSize: '13px' }}>← Volver</a></div></>);

  const color = FC[cycle.frequency] || '#c9a84c';
  const sortedDays = [...cycle.cycle_days].sort((a, b) => a.day_number - b.day_number);
  const completedDays = sortedDays.filter(d => d.completed).length;
  const pct = (completedDays / 21) * 100;
  const startDate = getDayDate(cycle.started_at, 1);
  const endDate = getDayDate(cycle.started_at, 21);
  const todayDay = sortedDays.find(d => isToday(getDayDate(cycle.started_at, d.day_number)));
  const todayCompleted = todayDay?.completed || false;
  const todayTrackUrl = todayDay?.tracks?.file_url || null;
  const streak = getStreak(sortedDays, cycle.started_at);
  const phase = todayDay ? getPhase(todayDay.day_number) : PHASES[0];
  const phaseIdx = PHASES.indexOf(phase);

  // Calendar
  const startDow = (startDate.getDay() + 6) % 7;
  const cells: (CycleDay | null)[] = Array(startDow).fill(null).concat(sortedDays);
  const rows: (CycleDay | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  while (rows[rows.length - 1].length < 7) rows[rows.length - 1].push(null);

  // Completion stats
  const avgEmotion = sortedDays.filter(d => d.emotional_score).length > 0
    ? (sortedDays.filter(d => d.emotional_score).reduce((s, d) => s + (d.emotional_score || 0), 0) / sortedDays.filter(d => d.emotional_score).length).toFixed(1) : null;

  const card = { background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '14px', padding: '20px' };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <div style={{ minHeight: '100vh', padding: '36px 32px', fontFamily: "'Outfit', sans-serif" }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>

          <a href="/cycles" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', textDecoration: 'none', display: 'inline-block', marginBottom: '24px' }}>← Todos los ciclos</a>

          {/* ═══ A — HEADER ═══ */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
              <span style={{ fontSize: '11px', color, fontWeight: 600, background: `${color}12`, border: `1px solid ${color}25`, borderRadius: '6px', padding: '3px 10px' }}>{cycle.frequency}Hz {FN[cycle.frequency] || ''}</span>
              <span style={{ fontSize: '11px', color: phase.color, fontWeight: 500, background: `${phase.color}12`, border: `1px solid ${phase.color}25`, borderRadius: '6px', padding: '3px 10px' }}>Fase {phaseIdx + 1}: {phase.name}</span>
              {cycle.completed && <span style={{ fontSize: '11px', color: '#22c55e', background: 'rgba(34,197,94,0.1)', borderRadius: '6px', padding: '3px 10px' }}>Completado</span>}
            </div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', fontWeight: 400, color: '#fff', margin: '0 0 6px 0', lineHeight: 1.4, fontStyle: 'italic' }}>{cycle.intention}</h1>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>{fmtShort(startDate)} — {fmtShort(endDate)} {endDate.getFullYear()}</span>
              {cycle.preferred_time && <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)' }}>🕐 {cycle.preferred_time}</span>}
            </div>
          </div>

          {/* ═══ B — PROGRESS ═══ */}
          <div style={{ ...card, display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px' }}>
            <div style={{ width: '80px', height: '80px', position: 'relative', flexShrink: 0 }}>
              <svg viewBox="0 0 80 80" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="4" />
                <circle cx="40" cy="40" r="34" fill="none" stroke={color} strokeWidth="4" strokeDasharray={`${pct * 2.136} 213.6`} strokeLinecap="round" />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '20px', fontWeight: 700, color, fontFamily: "'Cormorant Garamond', serif" }}>{completedDays}</span>
                <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)' }}>/21</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              {streak > 0 && <div><div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '3px' }}>Racha</div><div style={{ fontSize: '18px', fontWeight: 600, color: '#c9a84c' }}>🔥 {streak}</div></div>}
              <div><div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '3px' }}>Fase</div><div style={{ fontSize: '18px', fontWeight: 600, color: phase.color }}>{phaseIdx + 1}/3</div></div>
              <div><div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '3px' }}>Progreso</div><div style={{ fontSize: '18px', fontWeight: 600, color: '#fff' }}>{Math.round(pct)}%</div></div>
            </div>
          </div>

          {/* ═══ C — EMOTIONAL CHECK-IN ═══ */}
          {todayDay && !todayCompleted && !emotionalSaved && !cycle.completed && (
            <div style={{ ...card, marginBottom: '24px', background: 'rgba(201,168,76,0.03)', border: '1px solid rgba(201,168,76,0.08)' }}>
              <p style={{ fontSize: '14px', color: '#fff', margin: '0 0 14px 0', fontWeight: 500 }}>Como te sientes hoy?</p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                {MOOD_EMOJIS.map((em, i) => {
                  const val = i + 1; const sel = emotionalScore === val;
                  return (
                    <button key={val} onClick={() => handleSaveEmotion(val)} style={{
                      fontSize: '28px', padding: '10px 14px', borderRadius: '12px', cursor: 'pointer', border: 'none',
                      background: sel ? 'rgba(201,168,76,0.1)' : 'rgba(255,255,255,0.02)',
                      outline: sel ? '2px solid #c9a84c' : 'none', transition: 'all 0.2s',
                    }}>{em}</button>
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', padding: '0 8px' }}>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.15)' }}>Mal</span>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.15)' }}>Excelente</span>
              </div>
            </div>
          )}

          {/* ═══ D — CALENDAR ═══ */}
          <div style={{ ...card, marginBottom: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '6px' }}>
              {WEEKDAYS.map(wd => <div key={wd} style={{ textAlign: 'center', fontSize: '10px', color: 'rgba(255,255,255,0.2)', fontWeight: 500 }}>{wd}</div>)}
            </div>
            {rows.map((row, ri) => (
              <div key={ri} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
                {row.map((day, ci) => {
                  if (!day) return <div key={`e${ci}`} />;
                  const date = getDayDate(cycle.started_at, day.day_number);
                  const today = isToday(date); const past = isPast(date);
                  const missed = past && !day.completed && !today;
                  return (
                    <div key={day.id} style={{
                      borderRadius: '8px', padding: '6px 2px', textAlign: 'center',
                      background: day.completed ? 'rgba(34,197,94,0.15)' : missed ? 'rgba(239,68,68,0.1)' : today ? 'rgba(201,168,76,0.08)' : 'rgba(255,255,255,0.015)',
                      border: today && !day.completed ? '1px solid #c9a84c' : '1px solid transparent',
                      animation: today && !day.completed ? 'pulse 2s infinite' : 'none',
                    }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: day.completed ? '#22c55e' : missed ? '#ef4444' : today ? '#c9a84c' : 'rgba(255,255,255,0.15)' }}>
                        {day.completed ? '✓' : missed ? '✗' : day.day_number}
                      </div>
                      <div style={{ fontSize: '9px', color: today ? 'rgba(201,168,76,0.6)' : 'rgba(255,255,255,0.15)', marginTop: '1px' }}>
                        {date.getDate()} {date.toLocaleDateString('es', { month: 'short' })}
                      </div>
                      {day.emotional_score && <div style={{ fontSize: '10px', marginTop: '1px' }}>{MOOD_EMOJIS[day.emotional_score - 1]}</div>}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* ═══ PHASES PREVIEW ═══ */}
          <div style={{ ...card, marginBottom: '24px' }}>
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '14px' }}>Tu programa de 3 fases</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {[
                { n: 1, name: 'Aceptacion', desc: 'Tomaras consciencia de tus patrones con compasion y apertura', days: '1-7', color: '#388add', icon: '🌱' },
                { n: 2, name: 'Transformacion', desc: 'Activaras el cambio con afirmaciones de empoderamiento', days: '8-14', color: '#c9a84c', icon: '⚡' },
                { n: 3, name: 'Integracion', desc: 'Consolidaras tu nueva identidad con certeza absoluta', days: '15-21', color: '#22c55e', icon: '👑' },
              ].map(p => {
                const isCurrent = phaseIdx === p.n - 1;
                return (
                  <div key={p.n} style={{ background: isCurrent ? `${p.color}08` : 'rgba(255,255,255,0.01)', border: `1px solid ${isCurrent ? p.color + '20' : 'rgba(255,255,255,0.03)'}`, borderRadius: '12px', padding: '16px', opacity: isCurrent ? 1 : 0.5, transition: 'all 0.3s' }}>
                    <div style={{ fontSize: '20px', marginBottom: '8px' }}>{p.icon}</div>
                    <div style={{ fontSize: '11px', color: p.color, fontWeight: 600, marginBottom: '4px' }}>Fase {p.n} · Dias {p.days}</div>
                    <div style={{ fontSize: '13px', color: '#fff', fontWeight: 500, marginBottom: '4px' }}>{p.name}</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', lineHeight: 1.5 }}>{p.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ═══ E — EMOTIONAL CHART ═══ */}
          <EmotionalChart days={sortedDays} startedAt={cycle.started_at} />

          {/* ═══ F+G — GENERATE SESSION + PLAYER ═══ */}
          {todayDay && !cycle.completed && (
            <div style={{ ...card, marginBottom: '24px', background: 'rgba(201,168,76,0.03)', border: '1px solid rgba(201,168,76,0.08)' }}>
              <p style={{ fontSize: '10px', color: '#c9a84c', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
                {todayCompleted ? `Dia ${todayDay.day_number} — completado` : `Sesion del dia ${todayDay.day_number} — Fase ${phaseIdx + 1}`}
              </p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', margin: '0 0 14px 0' }}>
                Hoy, {new Date().toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>

              {(todayTrackUrl || genAudioUrl) && <div style={{ marginBottom: '14px' }}><Player src={genAudioUrl || todayTrackUrl!} /></div>}

              {!todayCompleted && !genAudioUrl && (
                <>
                  {genStatus && <p style={{ fontSize: '13px', color: genStatus.includes('❌') ? '#ef4444' : '#c9a84c', margin: '0 0 14px 0' }}>{genStatus}</p>}
                  <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>Duracion</p>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    {[5, 10, 15, 30].map(d => {
                      const sel = selectedDuration === d;
                      return <button key={d} onClick={() => setSelectedDuration(d)} style={{ background: sel ? 'rgba(201,168,76,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${sel ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.06)'}`, borderRadius: '8px', padding: '6px 16px', fontSize: '12px', cursor: 'pointer', color: sel ? '#c9a84c' : 'rgba(255,255,255,0.35)', fontFamily: "'Outfit', sans-serif", fontWeight: sel ? 600 : 400 }}>{d} min</button>;
                    })}
                  </div>
                  <button onClick={handleGenerate} disabled={isGenerating} style={{
                    background: 'linear-gradient(135deg, #c9a84c, #dbb960)', color: '#081020', border: 'none', borderRadius: '10px',
                    padding: '12px 28px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
                    opacity: isGenerating ? 0.4 : 1, letterSpacing: '0.5px',
                  }}>{isGenerating ? '⏳ Generando...' : `Generar sesion del dia ${todayDay.day_number}`}</button>
                </>
              )}
            </div>
          )}

          {/* ═══ H — COMPLETION CERTIFICATE ═══ */}
          {cycle.completed && (
            <div style={{ background: 'linear-gradient(160deg, rgba(34,197,94,0.06), rgba(201,168,76,0.04))', border: '1px solid rgba(34,197,94,0.15)', borderRadius: '16px', padding: '28px', marginBottom: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎉</div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', fontWeight: 400, color: '#fff', margin: '0 0 8px 0' }}>Ciclo completado!</h2>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginBottom: '20px', fontStyle: 'italic' }}>&ldquo;{cycle.intention}&rdquo;</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <div><div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '3px' }}>Dias</div><div style={{ fontSize: '22px', fontWeight: 600, color: '#22c55e' }}>21/21</div></div>
                <div><div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '3px' }}>Mejor racha</div><div style={{ fontSize: '22px', fontWeight: 600, color: '#c9a84c' }}>🔥 {streak}</div></div>
                {avgEmotion && <div><div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '3px' }}>Promedio emocional</div><div style={{ fontSize: '22px', fontWeight: 600, color: '#c9a84c' }}>{avgEmotion}/5</div></div>}
              </div>
              {/* Shareable card */}
              <div id="share-card" style={{ background: 'linear-gradient(160deg, #0b1121, #0d1526)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '14px', padding: '24px', margin: '0 auto', maxWidth: '340px', textAlign: 'center' }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '14px', color: 'rgba(255,255,255,0.3)', letterSpacing: '6px', marginBottom: '12px' }}>VOXIRA</div>
                <div style={{ fontSize: '13px', color: '#22c55e', fontWeight: 600, marginBottom: '8px' }}>✓ 21 dias completados</div>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', margin: '0 0 10px 0', lineHeight: 1.5 }}>&ldquo;{cycle.intention}&rdquo;</p>
                <span style={{ fontSize: '11px', color, fontWeight: 600 }}>{cycle.frequency}Hz — {FN[cycle.frequency] || ''}</span>
              </div>
            </div>
          )}

          {/* Delete */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
            <button onClick={handleDelete} style={{ fontSize: '12px', color: 'rgba(239,68,68,0.4)', background: 'none', border: '1px solid rgba(239,68,68,0.08)', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>Eliminar ciclo</button>
          </div>
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
    </>
  );
}
