'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

interface CycleDay { id: string; day_number: number; completed: boolean; completed_at: string | null; track_id: string | null; tracks: { file_url: string } | null; }
interface Cycle { id: string; intention: string; frequency: number; current_day: number; completed: boolean; started_at: string; completed_at: string | null; cycle_days: CycleDay[]; }

const FC: Record<number, string> = { 396: '#c9a84c', 417: '#d85a30', 432: '#639922', 528: '#639922', 639: '#d4537e', 741: '#388add', 852: '#1d9e75', 963: '#534ab7' };
const FN: Record<number, string> = { 396: 'Liberation', 417: 'Change', 432: 'Harmony', 528: 'Miracle', 639: 'Connection', 741: 'Expression', 852: 'Intuition', 963: 'Crown' };
const WEEKDAYS = ['L', 'M', 'Mi', 'J', 'V', 'S', 'D'];

function getDayDate(startedAt: string, dayNumber: number): Date { const d = new Date(startedAt); d.setDate(d.getDate() + dayNumber - 1); return d; }
function isToday(date: Date): boolean { const n = new Date(); return date.getFullYear() === n.getFullYear() && date.getMonth() === n.getMonth() && date.getDate() === n.getDate(); }
function isPast(date: Date): boolean { const n = new Date(); n.setHours(0,0,0,0); const d = new Date(date); d.setHours(0,0,0,0); return d < n; }
function fmtShort(date: Date): string { return date.toLocaleDateString('es', { month: 'short', day: 'numeric' }); }
function fmtTime(s: number) { if (!s || !isFinite(s)) return '0:00'; return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`; }

// ── Custom Player ──
function Player({ src }: { src: string }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);

  useEffect(() => {
    const a = ref.current; if (!a) return;
    const onTime = () => setProgress(a.currentTime);
    const onDur = () => setDuration(a.duration);
    const onEnd = () => { setPlaying(false); setProgress(0); };
    a.addEventListener('timeupdate', onTime); a.addEventListener('loadedmetadata', onDur); a.addEventListener('ended', onEnd);
    return () => { a.removeEventListener('timeupdate', onTime); a.removeEventListener('loadedmetadata', onDur); a.removeEventListener('ended', onEnd); };
  }, []);

  const toggle = () => { if (!ref.current) return; if (playing) ref.current.pause(); else ref.current.play().catch(() => {}); setPlaying(!playing); };
  const seek = (e: React.MouseEvent<HTMLDivElement>) => { if (!ref.current || !duration) return; const r = e.currentTarget.getBoundingClientRect(); ref.current.currentTime = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * duration; };
  const setVol = (e: React.MouseEvent<HTMLDivElement>) => { const r = e.currentTarget.getBoundingClientRect(); const v = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)); setVolume(v); if (ref.current) ref.current.volume = v; };
  const pct = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div style={{ background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.08)', borderRadius: '16px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
      <audio ref={ref} src={src} preload="metadata" />
      <button onClick={toggle} style={{
        width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0, cursor: 'pointer',
        background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {playing ? (
          <div style={{ display: 'flex', gap: '3px' }}><div style={{ width: '3px', height: '14px', background: '#c9a84c', borderRadius: '2px' }} /><div style={{ width: '3px', height: '14px', background: '#c9a84c', borderRadius: '2px' }} /></div>
        ) : (
          <div style={{ width: 0, height: 0, borderTop: '7px solid transparent', borderBottom: '7px solid transparent', borderLeft: '12px solid #c9a84c', marginLeft: '3px' }} />
        )}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div onClick={seek} style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', cursor: 'pointer' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: '#c9a84c', borderRadius: '2px', transition: 'width 0.1s linear' }} />
        </div>
      </div>
      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', flexShrink: 0, minWidth: '70px', textAlign: 'center' }}>{fmtTime(progress)} / {fmtTime(duration)}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 010 7.07" /></svg>
        <div onClick={setVol} style={{ width: '50px', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', cursor: 'pointer' }}>
          <div style={{ height: '100%', width: `${volume * 100}%`, background: 'rgba(255,255,255,0.3)', borderRadius: '2px' }} />
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──
export default function CycleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const cycleId = params.id as string;

  const [cycle, setCycle] = useState<Cycle | null>(null);
  const [loading, setLoading] = useState(true);

  // Generation
  const [selectedDuration, setSelectedDuration] = useState(5);
  const [genStatus, setGenStatus] = useState('');
  const [genAudioUrl, setGenAudioUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetch(`/api/cycles?id=${cycleId}`).then(r => r.json()).then(d => setCycle(d.cycle || null)).catch(() => {}).finally(() => setLoading(false));
  }, [cycleId]);

  const handleGenerate = useCallback(async () => {
    if (!cycle) return;
    const sortedDays = [...cycle.cycle_days].sort((a, b) => a.day_number - b.day_number);
    const todayDay = sortedDays.find(d => isToday(getDayDate(cycle.started_at, d.day_number)));
    if (!todayDay || todayDay.completed) return;

    setIsGenerating(true); setGenAudioUrl(null);
    try {
      setGenStatus('🎙 Obteniendo tu voz...');
      const profileRes = await fetch('/api/profile');
      const profileData = await profileRes.json();
      const voiceUrl = profileData.profile?.voice_audio_url;
      if (!voiceUrl) { setGenStatus('❌ No tienes voz guardada. Ve al Dashboard para grabar tu voz.'); setIsGenerating(false); return; }

      setGenStatus('🎙 Clonando tu voz...');
      const voiceBlob = await (await fetch(voiceUrl)).blob();
      const cloneForm = new FormData();
      cloneForm.append('audio', voiceBlob, 'voice.webm');
      cloneForm.append('name', `VOXIRA-cycle-${Date.now()}`);
      const cloneRes = await fetch('/api/clone-voice', { method: 'POST', body: cloneForm });
      const cloneData = await cloneRes.json();
      if (!cloneRes.ok || !cloneData.voice_id) throw new Error(cloneData.error || 'Clone failed');

      setGenStatus('✨ Generando afirmaciones con tu voz...');
      const genRes = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ voice_id: cloneData.voice_id, intention: cycle.intention, frequency: cycle.frequency, duration: selectedDuration, lang: 'es' }) });
      const genData = await genRes.json();
      if (!genRes.ok || !genData.audio) throw new Error(genData.error || 'Generation failed');

      setGenStatus('💾 Guardando sesion...');
      const sb = createClient();
      const { data: { user: u } } = await sb.auth.getUser();
      if (!u) throw new Error('Not authenticated');

      const trackBlob = new Blob([Uint8Array.from(atob(genData.audio), c => c.charCodeAt(0))], { type: 'audio/mpeg' });
      const fileName = `${u.id}/${Date.now()}-${cycle.frequency}hz-${selectedDuration}min.mp3`;
      const { error: upErr } = await sb.storage.from('tracks').upload(fileName, trackBlob, { contentType: 'audio/mpeg', upsert: false });
      if (upErr) throw new Error('Upload failed');
      const { data: { publicUrl } } = sb.storage.from('tracks').getPublicUrl(fileName);

      const trackRes = await fetch('/api/tracks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ file_url: publicUrl, file_size: trackBlob.size, intention: cycle.intention, frequency: cycle.frequency, ambient: 'none', duration_minutes: selectedDuration, processed: genData.processed || false }) });
      const trackData = await trackRes.json();

      // Complete day
      const patchRes = await fetch('/api/cycles', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cycle_id: cycle.id, day_number: todayDay.day_number, track_id: trackData.track?.id }) });
      const patchData = await patchRes.json();

      // Update local state
      setCycle(prev => {
        if (!prev) return prev;
        return { ...prev, current_day: Math.min(todayDay.day_number + 1, 21), completed: patchData.completed || false, completed_at: patchData.completed ? new Date().toISOString() : null,
          cycle_days: prev.cycle_days.map(d => d.day_number === todayDay.day_number ? { ...d, completed: true, completed_at: new Date().toISOString(), track_id: trackData.track?.id, tracks: { file_url: publicUrl } } : d) };
      });

      setGenAudioUrl(publicUrl);
      setGenStatus('✅ Sesion del dia ' + todayDay.day_number + ' completada!');
    } catch (err) {
      setGenStatus(`❌ ${err instanceof Error ? err.message : 'Error'}`);
    } finally { setIsGenerating(false); }
  }, [cycle, selectedDuration]);

  const handleDelete = useCallback(async () => {
    if (!confirm('Eliminar este ciclo?')) return;
    await fetch(`/api/cycles?id=${cycleId}`, { method: 'DELETE' });
    router.push('/cycles');
  }, [cycleId, router]);

  if (loading) return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <div style={{ minHeight: '100vh', padding: '36px 32px', fontFamily: "'Outfit', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'rgba(201,168,76,0.6)', fontSize: '14px' }}>Cargando ciclo...</p>
      </div>
    </>
  );

  if (!cycle) return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <div style={{ minHeight: '100vh', padding: '36px 32px', fontFamily: "'Outfit', sans-serif", textAlign: 'center', paddingTop: '80px' }}>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px', marginBottom: '20px' }}>Ciclo no encontrado</p>
        <a href="/cycles" style={{ color: '#c9a84c', fontSize: '13px' }}>← Volver a ciclos</a>
      </div>
    </>
  );

  const color = FC[cycle.frequency] || '#c9a84c';
  const sortedDays = [...cycle.cycle_days].sort((a, b) => a.day_number - b.day_number);
  const completedDays = sortedDays.filter(d => d.completed).length;
  const pct = (completedDays / 21) * 100;
  const startDate = getDayDate(cycle.started_at, 1);
  const endDate = getDayDate(cycle.started_at, 21);
  const todayDay = sortedDays.find(d => isToday(getDayDate(cycle.started_at, d.day_number)));
  const todayCompleted = todayDay?.completed || false;
  const todayTrackUrl = todayDay?.tracks?.file_url || null;

  // Calendar
  const startDow = (startDate.getDay() + 6) % 7;
  const cells: (CycleDay | null)[] = Array(startDow).fill(null).concat(sortedDays);
  const rows: (CycleDay | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  while (rows[rows.length - 1].length < 7) rows[rows.length - 1].push(null);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <div style={{ minHeight: '100vh', padding: '36px 32px', fontFamily: "'Outfit', sans-serif" }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>

          {/* Back link */}
          <a href="/cycles" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', textDecoration: 'none', display: 'inline-block', marginBottom: '24px' }}>← Todos los ciclos</a>

          {/* Header */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color, fontWeight: 600, background: `${color}12`, border: `1px solid ${color}25`, borderRadius: '6px', padding: '3px 10px' }}>{cycle.frequency}Hz {FN[cycle.frequency] || ''}</span>
              {cycle.completed && <span style={{ fontSize: '11px', color: '#22c55e', background: 'rgba(34,197,94,0.1)', borderRadius: '6px', padding: '3px 10px' }}>Completado</span>}
            </div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 400, color: '#fff', margin: '0 0 6px 0', lineHeight: 1.4, fontStyle: 'italic' }}>{cycle.intention}</h1>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>{fmtShort(startDate)} — {fmtShort(endDate)} {endDate.getFullYear()}</p>
          </div>

          {/* Progress circle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px', padding: '20px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '14px' }}>
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
            <div>
              <div style={{ fontSize: '22px', fontWeight: 600, color: '#fff', fontFamily: "'Cormorant Garamond', serif" }}>{Math.round(pct)}%</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>{completedDays} dias completados</div>
            </div>
          </div>

          {/* Calendar */}
          <div style={{ marginBottom: '24px', padding: '20px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '14px' }}>
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
                      borderRadius: '8px', padding: '8px 2px', textAlign: 'center',
                      background: day.completed ? 'rgba(34,197,94,0.15)' : missed ? 'rgba(239,68,68,0.1)' : today ? 'rgba(201,168,76,0.08)' : 'rgba(255,255,255,0.015)',
                      border: today && !day.completed ? '1px solid #c9a84c' : '1px solid transparent',
                      animation: today && !day.completed ? 'pulse 2s infinite' : 'none',
                    }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: day.completed ? '#22c55e' : missed ? '#ef4444' : today ? '#c9a84c' : 'rgba(255,255,255,0.15)' }}>
                        {day.completed ? '✓' : missed ? '✗' : day.day_number}
                      </div>
                      <div style={{ fontSize: '9px', color: today ? 'rgba(201,168,76,0.6)' : 'rgba(255,255,255,0.15)', marginTop: '2px' }}>
                        {date.getDate()} {date.toLocaleDateString('es', { month: 'short' })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Today's session area */}
          {todayDay && !cycle.completed && (
            <div style={{ marginBottom: '24px', padding: '20px', background: 'rgba(201,168,76,0.03)', border: '1px solid rgba(201,168,76,0.08)', borderRadius: '14px' }}>
              <p style={{ fontSize: '10px', color: '#c9a84c', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600, marginBottom: '14px' }}>
                {todayCompleted ? `Dia ${todayDay.day_number} completado` : `Sesion del dia ${todayDay.day_number}`}
              </p>

              {/* Player for completed day or just-generated */}
              {(todayTrackUrl || genAudioUrl) && (
                <div style={{ marginBottom: '14px' }}>
                  <Player src={genAudioUrl || todayTrackUrl!} />
                </div>
              )}

              {/* Generation UI (only if not completed) */}
              {!todayCompleted && !genAudioUrl && (
                <>
                  {genStatus && <p style={{ fontSize: '13px', color: genStatus.includes('❌') ? '#ef4444' : '#c9a84c', margin: '0 0 14px 0' }}>{genStatus}</p>}

                  {/* Duration selector */}
                  <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>Duracion</p>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    {[5, 10, 15, 30].map(d => {
                      const sel = selectedDuration === d;
                      return (
                        <button key={d} onClick={() => setSelectedDuration(d)} style={{
                          background: sel ? 'rgba(201,168,76,0.08)' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${sel ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.06)'}`,
                          borderRadius: '8px', padding: '6px 16px', fontSize: '12px', cursor: 'pointer',
                          color: sel ? '#c9a84c' : 'rgba(255,255,255,0.35)', fontFamily: "'Outfit', sans-serif", fontWeight: sel ? 600 : 400,
                        }}>{d} min</button>
                      );
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

          {/* Delete */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={handleDelete} style={{
              fontSize: '12px', color: 'rgba(239,68,68,0.4)', background: 'none', border: '1px solid rgba(239,68,68,0.08)',
              borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
            }}>Eliminar ciclo</button>
          </div>
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
    </>
  );
}
