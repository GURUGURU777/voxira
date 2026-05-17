'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { t, type Lang } from '@/lib/i18n';

interface Track { id: string; intention: string; frequency: number; ambient: string; duration_minutes: number; file_url: string; file_size: number; processed: boolean; created_at: string; }

const FC: Record<number, string> = {
  396: 'rgba(201,168,76,1)', 417: 'rgba(216,90,48,1)', 432: 'rgba(99,153,34,1)',
  528: 'rgba(99,153,34,1)', 639: 'rgba(212,83,126,1)', 741: 'rgba(56,138,221,1)',
  852: 'rgba(29,158,117,1)', 963: 'rgba(83,74,183,1)',
};
const FN: Record<number, string> = {
  396: 'Liberation', 417: 'Change', 432: 'Harmony', 528: 'Miracle',
  639: 'Connection', 741: 'Expression', 852: 'Intuition', 963: 'Crown',
};

function freqColor(hz: number) { return FC[hz] || 'rgba(201,168,76,1)'; }
function freqName(hz: number) { return FN[hz] || hz + 'Hz'; }
function fmtDate(iso: string, lang: Lang = 'en') { return new Date(iso).toLocaleDateString(lang === 'es' ? 'es' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
function fmtTime(s: number) { if (!s || !isFinite(s)) return '0:00'; const m = Math.floor(s / 60); return `${m}:${Math.floor(s % 60).toString().padStart(2, '0')}`; }

export default function LibraryPage() {
  return <Suspense fallback={null}><LibraryContent /></Suspense>;
}

function LibraryContent() {
  const searchParams = useSearchParams();
  const paramLang = searchParams?.get('lang');
  const lang: Lang = paramLang === 'es' ? 'es' : 'en';

  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [filter, setFilter] = useState('recent');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetch('/api/tracks').then(r => r.json()).then(d => { setTracks(d.tracks || []); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  // Audio time tracking
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => setProgress(a.currentTime);
    const onDur = () => setDuration(a.duration);
    const onEnd = () => { setPlaying(null); setProgress(0); };
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('loadedmetadata', onDur);
    a.addEventListener('ended', onEnd);
    return () => { a.removeEventListener('timeupdate', onTime); a.removeEventListener('loadedmetadata', onDur); a.removeEventListener('ended', onEnd); };
  }, []);

  const handlePlay = useCallback((t: Track) => {
    if (playing === t.id) {
      audioRef.current?.pause();
      setPlaying(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = t.file_url;
        audioRef.current.volume = volume;
        audioRef.current.play().catch(() => {});
      }
      setPlaying(t.id);
      setCurrentTrack(t);
      setProgress(0);
    }
  }, [playing, volume]);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audioRef.current.currentTime = pct * duration;
  }, [duration]);

  const handleVolume = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const v = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm(t(lang, 'Delete this track?', '¿Eliminar este track?'))) return;
    await fetch(`/api/tracks?id=${id}`, { method: 'DELETE' }).catch(() => {});
    setTracks(p => p.filter(t => t.id !== id));
    if (playing === id) { audioRef.current?.pause(); setPlaying(null); setCurrentTrack(null); }
    setOpenMenu(null);
  }, [playing]);

  const handleDownload = useCallback((t: Track) => {
    const a = document.createElement('a');
    a.href = t.file_url;
    a.download = `${t.intention || 'track'}-${t.frequency}hz.mp3`;
    a.click();
    setOpenMenu(null);
  }, []);

  // Close menu on outside click
  useEffect(() => {
    if (!openMenu) return;
    const close = () => setOpenMenu(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [openMenu]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  }, []);

  const sorted = [...tracks].sort((a, b) => {
    if (filter === 'frequency') return a.frequency - b.frequency;
    if (filter === 'duration') return a.duration_minutes - b.duration_minutes;
    if (filter === 'recent') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    return 0; // 'all' — original order
  });

  const playingTrack = currentTrack && playing ? currentTrack : null;
  const listTracks = playingTrack ? sorted.filter(t => t.id !== playingTrack.id) : sorted;
  const progressPct = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <audio ref={audioRef} />
      <div style={{ minHeight: '100vh', padding: '36px 32px', paddingBottom: playingTrack ? '100px' : '32px', fontFamily: "'Outfit', sans-serif", position: 'relative' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>

          {/* HEADER */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
            <div>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '34px', fontWeight: 300, color: '#fff', margin: 0 }}>
                {t(lang, 'your', 'tu')} <span style={{ color: '#c9a84c', fontWeight: 400 }}>{t(lang, 'library', 'biblioteca')}</span>
              </h1>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', marginTop: '6px' }}>
                {tracks.length} {t(lang, `reprogramming session${tracks.length !== 1 ? 's' : ''}`, `sesion${tracks.length !== 1 ? 'es' : ''} de reprogramacion`)}
              </p>
            </div>
            <a href="/dashboard" style={{
              background: 'linear-gradient(135deg, #c9a84c, #dbb960)', color: '#081020', textDecoration: 'none',
              borderRadius: '10px', padding: '10px 22px', fontSize: '12px', fontWeight: 700,
              letterSpacing: '1px', textTransform: 'uppercase', whiteSpace: 'nowrap',
            }}>{t(lang, '+ NEW TRACK', '+ NUEVO TRACK')}</a>
          </div>

          {/* FILTERS */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '28px' }}>
            {[
              { id: 'recent', label: t(lang, 'Recent', 'Recientes') },
              { id: 'frequency', label: t(lang, 'Frequency', 'Frecuencia') },
              { id: 'duration', label: t(lang, 'Duration', 'Duracion') },
              { id: 'all', label: t(lang, 'All', 'Todas') },
            ].map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)} style={{
                background: filter === f.id ? 'rgba(201,168,76,0.08)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${filter === f.id ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.04)'}`,
                borderRadius: '8px', padding: '6px 14px', fontSize: '12px', cursor: 'pointer',
                color: filter === f.id ? '#c9a84c' : 'rgba(255,255,255,0.3)',
                fontFamily: "'Outfit', sans-serif", fontWeight: filter === f.id ? 500 : 400,
              }}>{f.label}</button>
            ))}
          </div>

          {/* LOADING */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <p style={{ color: 'rgba(201,168,76,0.6)', fontSize: '14px' }}>{t(lang, 'Loading your tracks...', 'Cargando tus tracks...')}</p>
            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && tracks.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>♫</div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 300, color: 'rgba(255,255,255,0.5)', margin: '0 0 8px 0' }}>{t(lang, 'No tracks yet', 'Aún no hay tracks')}</h2>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.2)', marginBottom: '28px' }}>{t(lang, 'Generate your first personalized track', 'Genera tu primer track personalizado')}</p>
              <a href="/dashboard" style={{
                background: 'linear-gradient(135deg, #c9a84c, #dbb960)', color: '#081020', textDecoration: 'none',
                borderRadius: '12px', padding: '14px 32px', fontSize: '13px', fontWeight: 700,
                letterSpacing: '1px', textTransform: 'uppercase',
              }}>{t(lang, 'Create Your First Track', 'Crea Tu Primer Track')}</a>
            </div>
          )}

          {/* NOW PLAYING CARD */}
          {playingTrack && (
            <div style={{
              background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.08)',
              borderRadius: '16px', padding: '22px 26px', marginBottom: '24px',
            }}>
              <div style={{ fontSize: '9px', color: '#c9a84c', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600, marginBottom: '14px' }}>
                {t(lang, 'Now playing', 'Reproduciendo ahora')}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button onClick={() => handlePlay(playingTrack)} style={{
                  width: '54px', height: '54px', borderRadius: '50%', cursor: 'pointer', flexShrink: 0,
                  background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <div style={{ width: '3px', height: '16px', background: '#c9a84c', borderRadius: '2px' }} />
                    <div style={{ width: '3px', height: '16px', background: '#c9a84c', borderRadius: '2px' }} />
                  </div>
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '16px', color: '#fff', margin: '0 0 4px 0', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {playingTrack.intention || 'Untitled'}
                  </p>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
                    <span style={{ color: freqColor(playingTrack.frequency), fontWeight: 600 }}>{playingTrack.frequency}Hz</span>
                    <span>{playingTrack.duration_minutes}min</span>
                    <span>{fmtDate(playingTrack.created_at, lang)}</span>
                  </div>
                  {/* Progress bar */}
                  <div onClick={handleSeek} style={{ marginTop: '12px', height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', cursor: 'pointer', position: 'relative' }}>
                    <div style={{ height: '100%', width: `${progressPct}%`, background: 'linear-gradient(90deg, #c9a84c, #dbb960)', borderRadius: '2px', transition: 'width 0.1s linear' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '10px', color: 'rgba(255,255,255,0.2)' }}>
                    <span>{fmtTime(progress)}</span>
                    <span>{fmtTime(duration)}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button onClick={() => { if (audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.play().catch(() => {}); } }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', cursor: 'pointer', padding: '6px' }} title="Repeat">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 014-4h14" /><path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 01-4 4H3" /></svg>
                  </button>
                  <button onClick={() => handleDownload(playingTrack)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', cursor: 'pointer', padding: '6px' }} title="Download">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TRACK LIST */}
          {!loading && listTracks.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {listTracks.map(track => {
                const color = freqColor(track.frequency);
                const isP = playing === track.id;
                return (
                  <div key={track.id} style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '14px 18px', borderRadius: '12px',
                    background: isP ? 'rgba(201,168,76,0.04)' : 'rgba(255,255,255,0.01)',
                    border: `1px solid ${isP ? 'rgba(201,168,76,0.1)' : 'rgba(255,255,255,0.03)'}`,
                    transition: 'all 0.2s',
                  }}>
                    {/* Play button */}
                    <button onClick={() => handlePlay(track)} style={{
                      width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0, cursor: 'pointer',
                      background: isP ? `${color}15` : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isP ? color : 'rgba(255,255,255,0.06)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {isP ? (
                        <div style={{ display: 'flex', gap: '3px' }}>
                          <div style={{ width: '3px', height: '12px', background: color, borderRadius: '2px' }} />
                          <div style={{ width: '3px', height: '12px', background: color, borderRadius: '2px' }} />
                        </div>
                      ) : (
                        <div style={{ width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: `11px solid ${color}`, marginLeft: '2px' }} />
                      )}
                    </button>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '14px', color: isP ? '#fff' : 'rgba(255,255,255,0.75)', margin: '0 0 3px 0', fontWeight: isP ? 500 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {track.intention || 'Untitled'}
                      </p>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>{track.duration_minutes}min</span>
                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.15)' }}>{fmtDate(track.created_at, lang)}</span>
                        {track.processed && <span style={{ fontSize: '9px', color: 'rgba(34,197,94,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>binaural</span>}
                      </div>
                    </div>

                    {/* Favorite */}
                    <button onClick={() => toggleFavorite(track.id)} style={{
                      background: 'none', border: 'none', cursor: 'pointer', padding: '4px', flexShrink: 0,
                      color: favorites.has(track.id) ? '#c9a84c' : 'rgba(255,255,255,0.12)',
                      transition: 'color 0.2s',
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill={favorites.has(track.id) ? '#c9a84c' : 'none'} stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
                    </button>

                    {/* Frequency badge */}
                    <span style={{
                      fontSize: '11px', fontWeight: 600, color, flexShrink: 0,
                      background: `${color}10`, border: `1px solid ${color}25`,
                      borderRadius: '6px', padding: '3px 10px',
                      fontFamily: "'Cormorant Garamond', serif",
                    }}>
                      {track.frequency}Hz
                    </span>

                    {/* 3-dot menu */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <button onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === track.id ? null : track.id); }} style={{
                        background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer', padding: '6px',
                        display: 'flex', alignItems: 'center',
                      }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" /></svg>
                      </button>
                      {openMenu === track.id && (
                        <div onClick={e => e.stopPropagation()} style={{
                          position: 'absolute', right: 0, top: '100%', zIndex: 50,
                          background: '#111827', border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '10px', padding: '4px', minWidth: '140px',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                        }}>
                          <button onClick={() => handleDownload(track)} style={{
                            display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                            background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', padding: '8px 12px',
                            fontSize: '12px', cursor: 'pointer', borderRadius: '6px', textAlign: 'left',
                            fontFamily: "'Outfit', sans-serif",
                          }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
                            {t(lang, 'Download', 'Descargar')}
                          </button>
                          <button onClick={() => handleDelete(track.id)} style={{
                            display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                            background: 'none', border: 'none', color: 'rgba(239,68,68,0.6)', padding: '8px 12px',
                            fontSize: '12px', cursor: 'pointer', borderRadius: '6px', textAlign: 'left',
                            fontFamily: "'Outfit', sans-serif",
                          }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                            {t(lang, 'Delete', 'Eliminar')}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* BOTTOM PLAYER */}
        {playingTrack && (
          <div style={{
            position: 'fixed', bottom: 0, left: 230, right: 0, zIndex: 40,
            background: 'rgba(8,12,24,0.95)', backdropFilter: 'blur(16px)',
            borderTop: '1px solid rgba(201,168,76,0.08)', padding: '0',
          }}>
            {/* Thin progress bar on top */}
            <div onClick={handleSeek} style={{ height: '2px', background: 'rgba(255,255,255,0.04)', cursor: 'pointer' }}>
              <div style={{ height: '100%', width: `${progressPct}%`, background: '#c9a84c', transition: 'width 0.1s linear' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '10px 24px' }}>
              {/* Play/pause */}
              <button onClick={() => handlePlay(playingTrack)} style={{
                width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0, cursor: 'pointer',
                background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ display: 'flex', gap: '3px' }}>
                  <div style={{ width: '3px', height: '12px', background: '#c9a84c', borderRadius: '2px' }} />
                  <div style={{ width: '3px', height: '12px', background: '#c9a84c', borderRadius: '2px' }} />
                </div>
              </button>
              {/* Track info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '13px', color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {playingTrack.intention || 'Untitled'}
                </p>
                <span style={{ fontSize: '11px', color: freqColor(playingTrack.frequency), fontWeight: 600 }}>{playingTrack.frequency}Hz {freqName(playingTrack.frequency)}</span>
              </div>
              {/* Time */}
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', flexShrink: 0 }}>
                {fmtTime(progress)} / {fmtTime(duration)}
              </span>
              {/* Volume */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" /></svg>
                <div onClick={handleVolume} style={{ width: '60px', height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', cursor: 'pointer', position: 'relative' }}>
                  <div style={{ height: '100%', width: `${volume * 100}%`, background: 'rgba(255,255,255,0.3)', borderRadius: '2px' }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
