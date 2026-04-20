'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { t, type Lang } from '@/lib/i18n';

const FC: Record<number, string> = { 396: '#c9a84c', 417: '#d85a30', 432: '#639922', 528: '#639922', 639: '#d4537e', 741: '#388add', 852: '#1d9e75', 963: '#534ab7' };
const FN: Record<number, string> = { 396: 'Liberation', 417: 'Change', 432: 'Harmony', 528: 'Miracle', 639: 'Connection', 741: 'Expression', 852: 'Intuition', 963: 'Crown' };
const WEEKDAYS_ES = ['L', 'M', 'Mi', 'J', 'V', 'S', 'D'];
const WEEKDAYS_EN = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const QUOTES_EN = [
  'Every thought you choose is a seed you plant.',
  'Your mind is the garden, your thoughts are the seeds.',
  'Repetition is the mother of mastery.',
  'Today is the perfect day to reprogram your mind.',
  'Your voice has the power to transform your reality.',
  'Consistency creates invisible miracles.',
  'You are the architect of your own mind.',
];
const QUOTES_ES = [
  'Cada pensamiento que eliges es una semilla que plantas.',
  'Tu mente es el jardin, tus pensamientos son las semillas.',
  'La repeticion es la madre de la maestria.',
  'Hoy es el dia perfecto para reprogramar tu mente.',
  'Tu voz tiene el poder de transformar tu realidad.',
  'La consistencia crea milagros invisibles.',
  'Eres el arquitecto de tu propia mente.',
];

function getGreeting(lang: Lang): string {
  const h = new Date().getHours();
  if (lang === 'es') { if (h < 12) return 'Buenos dias'; if (h < 18) return 'Buenas tardes'; return 'Buenas noches'; }
  if (h < 12) return 'Good morning'; if (h < 18) return 'Good afternoon'; return 'Good evening';
}

function fmtTime(s: number) { if (!s || !isFinite(s)) return '0:00'; return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`; }

interface Track { id: string; intention: string; frequency: number; duration_minutes: number; file_url: string; processed: boolean; created_at: string; }
interface ActiveCycle { id: string; intention: string; frequency: number; current_day: number; cycle_days: { day_number: number; completed: boolean }[]; started_at: string; }

export default function HomePage() {
  return <Suspense fallback={null}><HomeContent /></Suspense>;
}

function HomeContent() {
  const searchParams = useSearchParams();
  const paramLang = searchParams?.get('lang');
  const lang: Lang = paramLang === 'es' ? 'es' : 'en';
  const [userName, setUserName] = useState('');
  const [streak, setStreak] = useState(0);
  const [totalTracks, setTotalTracks] = useState(0);
  const [listeningMins, setListeningMins] = useState(0);
  const [latestTrack, setLatestTrack] = useState<Track | null>(null);
  const [activeCycle, setActiveCycle] = useState<ActiveCycle | null>(null);
  const [weekActivity, setWeekActivity] = useState<boolean[]>([false, false, false, false, false, false, false]);
  const [loading, setLoading] = useState(true);

  // Player
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const a = audioRef.current; if (!a) return;
    const t = () => setProgress(a.currentTime); const d = () => setDuration(a.duration); const e = () => { setPlaying(false); setProgress(0); };
    a.addEventListener('timeupdate', t); a.addEventListener('loadedmetadata', d); a.addEventListener('ended', e);
    return () => { a.removeEventListener('timeupdate', t); a.removeEventListener('loadedmetadata', d); a.removeEventListener('ended', e); };
  }, []);

  useEffect(() => {
    Promise.all([
      fetch('/api/profile').then(r => r.json()),
      fetch('/api/tracks').then(r => r.json()),
      fetch('/api/cycles').then(r => r.json()),
      fetch('/api/stats').then(r => r.json()),
    ]).then(([profileData, tracksData, cyclesData, statsData]) => {
      setUserName(profileData.user?.name?.split(' ')[0] || '');
      setStreak(profileData.profile?.current_streak || 0);
      setTotalTracks(statsData.total_tracks || 0);
      setListeningMins(profileData.profile?.total_listening_minutes || 0);

      const tracks = tracksData.tracks || [];
      if (tracks.length > 0) setLatestTrack(tracks[0]);

      const active = (cyclesData.cycles || []).find((c: { completed: boolean }) => !c.completed);
      if (active) setActiveCycle(active);

      // Week activity from listening history
      const history = statsData.listening_history || [];
      const now = new Date();
      const monday = new Date(now); monday.setDate(now.getDate() - ((now.getDay() + 6) % 7)); monday.setHours(0,0,0,0);
      const activity = [false, false, false, false, false, false, false];
      for (const h of history) {
        const d = new Date(h.listened_at);
        if (d >= monday) {
          const dayIdx = (d.getDay() + 6) % 7;
          activity[dayIdx] = true;
        }
      }
      // Also check tracks created this week
      for (const t of tracks) {
        const d = new Date(t.created_at);
        if (d >= monday) {
          const dayIdx = (d.getDay() + 6) % 7;
          activity[dayIdx] = true;
        }
      }
      setWeekActivity(activity);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const todayQuote = (lang === 'es' ? QUOTES_ES : QUOTES_EN)[new Date().getDay()];
  const weekDays = lang === 'es' ? WEEKDAYS_ES : WEEKDAYS_EN;
  const weekDone = weekActivity.filter(Boolean).length;
  const todayIdx = (new Date().getDay() + 6) % 7;

  const card = { background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '14px', padding: '20px' };

  if (loading) return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <div style={{ minHeight: '100vh', padding: '36px 32px', fontFamily: "'Outfit', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'rgba(201,168,76,0.6)', fontSize: '14px' }}>{t(lang, 'Loading...', 'Cargando...')}</p>
      </div>
    </>
  );

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <audio ref={audioRef} />
      <div style={{ minHeight: '100vh', padding: '36px 32px', fontFamily: "'Outfit', sans-serif" }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>

          {/* A — GREETING */}
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '32px', fontWeight: 300, color: '#fff', margin: '0 0 6px 0' }}>
              {getGreeting(lang)}, <span style={{ color: '#c9a84c', fontWeight: 400 }}>{userName || t(lang, 'traveler', 'viajero')}</span>
            </h1>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>{todayQuote}</p>
          </div>

          {/* B — TODAY'S SESSION */}
          <div style={{ ...card, background: 'linear-gradient(160deg, rgba(201,168,76,0.04), rgba(201,168,76,0.01))', border: '1px solid rgba(201,168,76,0.08)', marginBottom: '20px' }}>
            {activeCycle ? (
              <>
                <p style={{ fontSize: '10px', color: '#c9a84c', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600, marginBottom: '10px' }}>{t(lang, 'YOUR ACTIVE CYCLE', 'TU CICLO ACTIVO')}</p>
                <p style={{ fontSize: '16px', color: '#fff', fontWeight: 500, margin: '0 0 6px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activeCycle.intention}</p>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ fontSize: '12px', color: FC[activeCycle.frequency] || '#c9a84c', fontWeight: 600 }}>{activeCycle.frequency}Hz {FN[activeCycle.frequency] || ''}</span>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>{t(lang, 'Day', 'Dia')} {activeCycle.current_day}/21</span>
                </div>
                <div style={{ height: '3px', background: 'rgba(255,255,255,0.04)', borderRadius: '2px', marginBottom: '16px' }}>
                  <div style={{ height: '100%', width: `${(activeCycle.cycle_days.filter(d => d.completed).length / 21) * 100}%`, background: FC[activeCycle.frequency] || '#c9a84c', borderRadius: '2px' }} />
                </div>
                <a href={`/cycles/${activeCycle.id}`} style={{
                  background: 'linear-gradient(135deg, #c9a84c, #dbb960)', color: '#081020', textDecoration: 'none',
                  borderRadius: '10px', padding: '10px 22px', fontSize: '13px', fontWeight: 600, display: 'inline-block',
                }}>{t(lang, 'Listen to day', 'Escuchar sesion del dia')} {activeCycle.current_day}</a>
              </>
            ) : (
              <>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 500, marginBottom: '10px' }}>{t(lang, 'Start today', 'Comienza hoy')}</p>
                <p style={{ fontSize: '16px', color: '#fff', fontWeight: 500, margin: '0 0 14px 0' }}>{t(lang, 'Create your first personalized session', 'Crea tu primera sesion personalizada')}</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <a href="/dashboard" style={{ background: 'linear-gradient(135deg, #c9a84c, #dbb960)', color: '#081020', textDecoration: 'none', borderRadius: '10px', padding: '10px 22px', fontSize: '13px', fontWeight: 600 }}>{t(lang, 'Create track', 'Crear track')}</a>
                  <a href="/cycles" style={{ background: 'transparent', border: '1px solid rgba(201,168,76,0.15)', color: '#c9a84c', textDecoration: 'none', borderRadius: '10px', padding: '10px 22px', fontSize: '13px' }}>{t(lang, 'Start 21-day cycle', 'Iniciar ciclo 21 dias')}</a>
                </div>
              </>
            )}
          </div>

          {/* C — QUICK STATS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
            <div style={card}>
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>{t(lang, 'STREAK', 'RACHA')}</div>
              <div style={{ fontSize: '24px', fontWeight: 600, color: '#c9a84c', fontFamily: "'Cormorant Garamond', serif" }}>{streak > 0 ? `🔥 ${streak}` : '—'}</div>
            </div>
            <div style={card}>
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>{t(lang, 'SESSIONS', 'SESIONES')}</div>
              <div style={{ fontSize: '24px', fontWeight: 600, color: '#fff', fontFamily: "'Cormorant Garamond', serif" }}>{totalTracks}</div>
            </div>
            <div style={card}>
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>{t(lang, 'LISTENED', 'ESCUCHADO')}</div>
              <div style={{ fontSize: '24px', fontWeight: 600, color: '#fff', fontFamily: "'Cormorant Garamond', serif" }}>{listeningMins > 60 ? `${Math.floor(listeningMins / 60)}h` : `${listeningMins}m`}</div>
            </div>
          </div>

          {/* D — LATEST TRACK */}
          {latestTrack ? (
            <div style={{ ...card, marginBottom: '20px' }}>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '12px' }}>{t(lang, 'YOUR LATEST TRACK', 'TU TRACK MAS RECIENTE')}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <button onClick={() => {
                  if (!audioRef.current) return;
                  if (playing) { audioRef.current.pause(); setPlaying(false); }
                  else { audioRef.current.src = latestTrack.file_url; audioRef.current.play().catch(() => {}); setPlaying(true); }
                }} style={{
                  width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0, cursor: 'pointer',
                  background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {playing ? <div style={{ display: 'flex', gap: '3px' }}><div style={{ width: '3px', height: '14px', background: '#c9a84c', borderRadius: '2px' }} /><div style={{ width: '3px', height: '14px', background: '#c9a84c', borderRadius: '2px' }} /></div>
                  : <div style={{ width: 0, height: 0, borderTop: '7px solid transparent', borderBottom: '7px solid transparent', borderLeft: '12px solid #c9a84c', marginLeft: '3px' }} />}
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '14px', color: '#fff', margin: '0 0 3px 0', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{latestTrack.intention || t(lang, 'Untitled', 'Sin titulo')}</p>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: FC[latestTrack.frequency] || '#c9a84c', fontWeight: 600 }}>{latestTrack.frequency}Hz</span>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>{latestTrack.duration_minutes}min</span>
                  </div>
                  {playing && duration > 0 && (
                    <div style={{ marginTop: '8px', height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px' }}>
                      <div style={{ height: '100%', width: `${(progress / duration) * 100}%`, background: '#c9a84c', borderRadius: '2px', transition: 'width 0.1s linear' }} />
                    </div>
                  )}
                </div>
                {playing && <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', flexShrink: 0 }}>{fmtTime(progress)}</span>}
              </div>
            </div>
          ) : (
            <div style={{ ...card, marginBottom: '20px', textAlign: 'center', padding: '28px' }}>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.25)', margin: '0 0 12px 0' }}>{t(lang, 'No tracks yet', 'Aun no tienes tracks')}</p>
              <a href="/dashboard" style={{ fontSize: '13px', color: '#c9a84c', textDecoration: 'none' }}>{t(lang, 'Generate your first track →', 'Genera tu primer track →')}</a>
            </div>
          )}

          {/* E — WEEKLY PROGRESS */}
          <div style={{ ...card, marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '1.5px', margin: 0 }}>{t(lang, 'THIS WEEK', 'ESTA SEMANA')}</p>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>{weekDone} {t(lang, 'of 7 days', 'de 7 dias')}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
              {weekDays.map((wd, i) => {
                const done = weekActivity[i];
                const isToday = i === todayIdx;
                return (
                  <div key={wd} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: isToday ? '#c9a84c' : 'rgba(255,255,255,0.2)', marginBottom: '6px', fontWeight: isToday ? 600 : 400 }}>{wd}</div>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%', margin: '0 auto',
                      background: done ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.02)',
                      border: isToday && !done ? '1px solid rgba(201,168,76,0.3)' : '1px solid transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '12px', color: done ? '#22c55e' : 'rgba(255,255,255,0.1)',
                    }}>
                      {done ? '✓' : '·'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* F — ACHIEVEMENTS PREVIEW */}
          <div style={card}>
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '1.5px', margin: '0 0 12px 0' }}>{t(lang, 'ACHIEVEMENTS', 'LOGROS')}</p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {totalTracks >= 1 && (
                <div style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.1)', borderRadius: '10px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>🎵</span>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{t(lang, 'First session', 'Primera sesion')}</span>
                </div>
              )}
              {streak >= 3 && (
                <div style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.1)', borderRadius: '10px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>🔥</span>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{t(lang, '3-day streak', 'Racha de 3 dias')}</span>
                </div>
              )}
              {totalTracks >= 10 && (
                <div style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.1)', borderRadius: '10px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>⭐</span>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{t(lang, '10 sessions', '10 sesiones')}</span>
                </div>
              )}
              {totalTracks === 0 && streak < 3 && (
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.15)', margin: 0 }}>{t(lang, 'Generate your first track to unlock achievements', 'Genera tu primer track para desbloquear logros')}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
