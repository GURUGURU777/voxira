'use client';
import { useState, useEffect, useCallback } from 'react';

interface CycleDay { id: string; day_number: number; completed: boolean; completed_at: string | null; track_id: string | null; }
interface Cycle { id: string; intention: string; frequency: number; current_day: number; completed: boolean; started_at: string; completed_at: string | null; cycle_days: CycleDay[]; }

const FC: Record<number, string> = { 396: '#c9a84c', 417: '#d85a30', 432: '#639922', 528: '#639922', 639: '#d4537e', 741: '#388add', 852: '#1d9e75', 963: '#534ab7' };
const FN: Record<number, string> = { 396: 'Liberation', 417: 'Change', 432: 'Harmony', 528: 'Miracle', 639: 'Connection', 741: 'Expression', 852: 'Intuition', 963: 'Crown' };
const FREQUENCIES = [396, 417, 432, 528, 639, 741, 852, 963];

function fmtDate(iso: string) { return new Date(iso).toLocaleDateString('es', { month: 'short', day: 'numeric' }); }

export default function CyclesPage() {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newIntention, setNewIntention] = useState('');
  const [newFreq, setNewFreq] = useState(528);
  const [creating, setCreating] = useState(false);
  const [expandedCycle, setExpandedCycle] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/cycles').then(r => r.json()).then(d => setCycles(d.cycles || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleCreate = useCallback(async () => {
    if (!newIntention.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/cycles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ intention: newIntention, frequency: newFreq }) });
      const d = await res.json();
      if (d.cycle) { setCycles(p => [d.cycle, ...p]); setShowCreate(false); setNewIntention(''); }
    } catch {} finally { setCreating(false); }
  }, [newIntention, newFreq]);

  const handleCompleteDay = useCallback(async (cycleId: string, dayNumber: number) => {
    const res = await fetch('/api/cycles', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cycle_id: cycleId, day_number: dayNumber }) });
    const d = await res.json();
    if (d.success) {
      setCycles(prev => prev.map(c => {
        if (c.id !== cycleId) return c;
        return {
          ...c,
          current_day: Math.min(dayNumber + 1, 21),
          completed: d.completed,
          completed_at: d.completed ? new Date().toISOString() : null,
          cycle_days: c.cycle_days.map(day => day.day_number === dayNumber ? { ...day, completed: true, completed_at: new Date().toISOString() } : day),
        };
      }));
    }
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Eliminar este ciclo?')) return;
    await fetch(`/api/cycles?id=${id}`, { method: 'DELETE' });
    setCycles(p => p.filter(c => c.id !== id));
  }, []);

  const activeCycles = cycles.filter(c => !c.completed);
  const completedCycles = cycles.filter(c => c.completed);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <div style={{ minHeight: '100vh', padding: '36px 32px', fontFamily: "'Outfit', sans-serif" }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>

          {/* HEADER */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '36px' }}>
            <div>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '34px', fontWeight: 300, color: '#fff', margin: 0 }}>
                ciclos <span style={{ color: '#c9a84c', fontWeight: 400 }}>21 dias</span>
              </h1>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', marginTop: '6px' }}>
                21 dias de escucha consciente transforman tu mente
              </p>
            </div>
            <button onClick={() => setShowCreate(true)} style={{
              background: 'linear-gradient(135deg, #c9a84c, #dbb960)', color: '#081020',
              border: 'none', borderRadius: '10px', padding: '10px 22px', fontSize: '12px', fontWeight: 700,
              letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap',
              fontFamily: "'Outfit', sans-serif",
            }}>+ Nuevo Ciclo</button>
          </div>

          {/* CREATE FORM */}
          {showCreate && (
            <div style={{ background: 'rgba(201,168,76,0.03)', border: '1px solid rgba(201,168,76,0.1)', borderRadius: '16px', padding: '24px', marginBottom: '28px' }}>
              <p style={{ fontSize: '10px', color: '#c9a84c', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600, marginBottom: '16px' }}>Nuevo ciclo de 21 dias</p>
              <input value={newIntention} onChange={e => setNewIntention(e.target.value)} placeholder="Tu intencion para este ciclo..." style={{
                width: '100%', background: 'rgba(4,10,22,0.5)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px',
                padding: '14px 16px', color: '#fff', fontSize: '14px', fontFamily: "'Outfit', sans-serif", outline: 'none', boxSizing: 'border-box', marginBottom: '14px',
              }} />
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px' }}>Frecuencia</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '18px' }}>
                {FREQUENCIES.map(hz => {
                  const sel = newFreq === hz;
                  return (
                    <button key={hz} onClick={() => setNewFreq(hz)} style={{
                      background: sel ? 'rgba(201,168,76,0.08)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${sel ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.05)'}`,
                      borderRadius: '8px', padding: '6px 14px', fontSize: '12px', cursor: 'pointer',
                      color: sel ? '#c9a84c' : 'rgba(255,255,255,0.3)', fontFamily: "'Outfit', sans-serif",
                    }}>{hz}Hz</button>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleCreate} disabled={creating || !newIntention.trim()} style={{
                  background: 'linear-gradient(135deg, #c9a84c, #dbb960)', color: '#081020', border: 'none', borderRadius: '10px',
                  padding: '10px 24px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
                  opacity: creating || !newIntention.trim() ? 0.4 : 1,
                }}>{creating ? 'Creando...' : 'Crear Ciclo'}</button>
                <button onClick={() => setShowCreate(false)} style={{
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px',
                  padding: '10px 24px', fontSize: '13px', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
                }}>Cancelar</button>
              </div>
            </div>
          )}

          {/* LOADING */}
          {loading && <div style={{ textAlign: 'center', padding: '60px 0' }}><p style={{ color: 'rgba(201,168,76,0.6)', fontSize: '14px' }}>Cargando ciclos...</p></div>}

          {/* EMPTY */}
          {!loading && cycles.length === 0 && !showCreate && (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>&#9678;</div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 300, color: 'rgba(255,255,255,0.5)', margin: '0 0 8px 0' }}>Sin ciclos activos</h2>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.2)', marginBottom: '28px' }}>Comienza tu primer ciclo de 21 dias</p>
              <button onClick={() => setShowCreate(true)} style={{
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
                    <div key={cycle.id} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '14px', overflow: 'hidden' }}>
                      <div onClick={() => setExpandedCycle(expanded ? null : cycle.id)} style={{ padding: '18px 22px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {/* Progress ring */}
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

                      {/* Progress bar */}
                      <div style={{ height: '2px', background: 'rgba(255,255,255,0.03)', margin: '0 22px' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '1px', transition: 'width 0.3s' }} />
                      </div>

                      {/* Expanded: 21 day grid */}
                      {expanded && (
                        <div style={{ padding: '18px 22px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', marginBottom: '14px' }}>
                            {cycle.cycle_days.sort((a, b) => a.day_number - b.day_number).map(day => {
                              const isCurrent = day.day_number === cycle.current_day && !day.completed;
                              return (
                                <button
                                  key={day.id}
                                  onClick={() => isCurrent && handleCompleteDay(cycle.id, day.day_number)}
                                  disabled={!isCurrent}
                                  style={{
                                    width: '100%', aspectRatio: '1', borderRadius: '8px', border: 'none', cursor: isCurrent ? 'pointer' : 'default',
                                    background: day.completed ? color : isCurrent ? `${color}20` : 'rgba(255,255,255,0.02)',
                                    color: day.completed ? '#081020' : isCurrent ? color : 'rgba(255,255,255,0.15)',
                                    fontSize: '12px', fontWeight: day.completed || isCurrent ? 700 : 400,
                                    fontFamily: "'Outfit', sans-serif",
                                    outline: isCurrent ? `2px solid ${color}` : 'none', outlineOffset: '1px',
                                    transition: 'all 0.2s',
                                  }}
                                >
                                  {day.day_number}
                                </button>
                              );
                            })}
                          </div>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <a href={`/dashboard?intention=${encodeURIComponent(cycle.intention)}&frequency=${cycle.frequency}`} style={{
                              fontSize: '12px', color: '#c9a84c', textDecoration: 'none',
                              border: '1px solid rgba(201,168,76,0.15)', borderRadius: '8px', padding: '6px 14px',
                            }}>Generar sesion del dia</a>
                            <button onClick={() => handleDelete(cycle.id)} style={{
                              fontSize: '12px', color: 'rgba(239,68,68,0.5)', background: 'none', border: '1px solid rgba(239,68,68,0.1)',
                              borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
                            }}>Eliminar</button>
                          </div>
                        </div>
                      )}
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
    </>
  );
}
