'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { t, type Lang } from '@/lib/i18n';

const FC: Record<number, string> = { 396: '#c9a84c', 417: '#d85a30', 432: '#639922', 528: '#639922', 639: '#d4537e', 741: '#388add', 852: '#1d9e75', 963: '#534ab7' };
const FN: Record<number, string> = { 396: 'Liberation', 417: 'Change', 432: 'Harmony', 528: 'Miracle', 639: 'Connection', 741: 'Expression', 852: 'Intuition', 963: 'Crown' };

interface Stats {
  profile: { total_listening_minutes: number; current_streak: number; longest_streak: number; last_listened_at: string | null };
  total_tracks: number;
  active_cycles: { id: string; intention: string; frequency: number; current_day: number }[];
  completed_cycles: number;
  listening_history: { listened_seconds: number; completed: boolean; listened_at: string }[];
  frequency_breakdown: Record<number, number>;
}

export default function StatsPage() {
  return <Suspense fallback={null}><StatsContent /></Suspense>;
}

function StatsContent() {
  const searchParams = useSearchParams();
  const paramLang = searchParams?.get('lang');
  const lang: Lang = paramLang === 'es' ? 'es' : 'en';

  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(d => setStats(d)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <div style={{ minHeight: '100vh', padding: '36px 32px', fontFamily: "'Outfit', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'rgba(201,168,76,0.6)', fontSize: '14px' }}>{t(lang, 'Loading statistics...', 'Cargando estadisticas...')}</p>
      </div>
    </>
  );

  const hours = Math.floor((stats?.profile.total_listening_minutes || 0) / 60);
  const mins = (stats?.profile.total_listening_minutes || 0) % 60;
  const totalFreqTracks = Object.values(stats?.frequency_breakdown || {}).reduce((a, b) => a + b, 0);

  // Last 7 days listening
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().split('T')[0];
    const dayTotal = (stats?.listening_history || [])
      .filter(h => h.listened_at.startsWith(key))
      .reduce((sum, h) => sum + h.listened_seconds, 0);
    return { label: d.toLocaleDateString(lang === 'es' ? 'es' : 'en', { weekday: 'short' }).slice(0, 2), minutes: Math.round(dayTotal / 60) };
  });
  const maxMin = Math.max(...last7.map(d => d.minutes), 1);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <div style={{ minHeight: '100vh', padding: '36px 32px', fontFamily: "'Outfit', sans-serif" }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>

          {/* HEADER */}
          <div style={{ marginBottom: '36px' }}>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '34px', fontWeight: 300, color: '#fff', margin: 0 }}>
              {t(lang, 'your', 'tus')} <span style={{ color: '#c9a84c', fontWeight: 400 }}>{t(lang, 'statistics', 'estadisticas')}</span>
            </h1>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', marginTop: '6px' }}>{t(lang, 'Your mental reprogramming progress', 'Tu progreso de reprogramacion mental')}</p>
          </div>

          {/* TOP STATS GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '32px' }}>
            {[
              { label: t(lang, 'TOTAL TIME', 'Tiempo total'), value: hours > 0 ? `${hours}h ${mins}m` : `${mins}m`, icon: '⏱' },
              { label: t(lang, 'TRACKS CREATED', 'Tracks creados'), value: String(stats?.total_tracks || 0), icon: '♫' },
              { label: t(lang, 'CURRENT STREAK', 'Racha actual'), value: `${stats?.profile.current_streak || 0} ${t(lang, 'days', 'dias')}`, icon: '🔥' },
              { label: t(lang, 'LONGEST STREAK', 'Racha maxima'), value: `${stats?.profile.longest_streak || 0} ${t(lang, 'days', 'dias')}`, icon: '⭐' },
              { label: t(lang, 'ACTIVE CYCLES', 'Ciclos activos'), value: String(stats?.active_cycles?.length || 0), icon: '◎' },
              { label: t(lang, 'COMPLETED CYCLES', 'Ciclos completados'), value: String(stats?.completed_cycles || 0), icon: '✓' },
            ].map(stat => (
              <div key={stat.label} style={{
                background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)',
                borderRadius: '14px', padding: '20px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>{stat.label}</span>
                  <span style={{ fontSize: '16px', opacity: 0.4 }}>{stat.icon}</span>
                </div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 600, color: '#c9a84c' }}>{stat.value}</div>
              </div>
            ))}
          </div>

          {/* LISTENING CHART — last 7 days */}
          <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '14px', padding: '24px', marginBottom: '24px' }}>
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px' }}>{t(lang, 'Last 7 days', 'Ultimos 7 dias')}</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '120px' }}>
              {last7.map((day, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)' }}>{day.minutes > 0 ? `${day.minutes}m` : ''}</span>
                  <div style={{
                    width: '100%', maxWidth: '36px',
                    height: `${Math.max((day.minutes / maxMin) * 80, 3)}px`,
                    background: day.minutes > 0 ? 'linear-gradient(180deg, #c9a84c, rgba(201,168,76,0.3))' : 'rgba(255,255,255,0.03)',
                    borderRadius: '4px', transition: 'height 0.3s',
                  }} />
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)' }}>{day.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* FREQUENCY BREAKDOWN */}
          {totalFreqTracks > 0 && (
            <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '14px', padding: '24px', marginBottom: '24px' }}>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px' }}>{t(lang, 'Frequencies used', 'Frecuencias usadas')}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Object.entries(stats?.frequency_breakdown || {}).sort((a, b) => b[1] - a[1]).map(([hz, count]) => {
                  const color = FC[Number(hz)] || '#c9a84c';
                  const pct = (count / totalFreqTracks) * 100;
                  return (
                    <div key={hz}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '12px', color, fontWeight: 500 }}>{hz}Hz {FN[Number(hz)] || ''}</span>
                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>{count} track{count !== 1 ? 's' : ''}</span>
                      </div>
                      <div style={{ height: '4px', background: 'rgba(255,255,255,0.03)', borderRadius: '2px' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '2px', transition: 'width 0.3s' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ACTIVE CYCLES */}
          {(stats?.active_cycles?.length || 0) > 0 && (
            <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '14px', padding: '24px' }}>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '14px' }}>{t(lang, 'Cycles in progress', 'Ciclos en progreso')}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {stats!.active_cycles.map(cycle => {
                  const color = FC[cycle.frequency] || '#c9a84c';
                  const pct = ((cycle.current_day - 1) / 21) * 100;
                  return (
                    <div key={cycle.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>{cycle.intention}</span>
                        <span style={{ fontSize: '11px', color }}>{t(lang, 'Day', 'Dia')} {cycle.current_day}/21</span>
                      </div>
                      <div style={{ height: '3px', background: 'rgba(255,255,255,0.03)', borderRadius: '2px' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '2px' }} />
                      </div>
                    </div>
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
