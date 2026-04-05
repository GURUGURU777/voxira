'use client';

import { useState, useRef, useEffect } from 'react';

/* ══════════════════════════════════════════════════════════
   VOXIRA LANDING PAGE — Production Build
   Navy-blue palette matching dashboard V3
   ══════════════════════════════════════════════════════════ */

function VoxiraLogo({ size = 200 }: { size?: number }) {
  const xCenter = 128;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', height: size * 0.28 }}>
      <svg viewBox="0 0 300 60" style={{ height: '100%', width: 'auto' }}>
        <defs>
          <radialGradient id="lf" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.95" />
            <stop offset="15%" stopColor="#d4edff" stopOpacity="0.6" />
            <stop offset="35%" stopColor="#4a9eff" stopOpacity="0.2" />
            <stop offset="60%" stopColor="#4a9eff" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#4a9eff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="st" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#4a9eff" stopOpacity="0" />
            <stop offset="35%" stopColor="#4a9eff" stopOpacity="0.25" />
            <stop offset="50%" stopColor="#b0d8ff" stopOpacity="0.5" />
            <stop offset="65%" stopColor="#4a9eff" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#4a9eff" stopOpacity="0" />
          </linearGradient>
          <filter id="tg"><feGaussianBlur stdDeviation="1.8" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <filter id="wg"><feGaussianBlur stdDeviation="1.2" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        <rect x={xCenter - 90} y="27" width="180" height="6" fill="url(#st)" opacity="0.6"><animate attributeName="opacity" values="0.4;0.7;0.4" dur="4s" repeatCount="indefinite" /></rect>
        <g filter="url(#wg)" opacity="0.5">
          <path d={`M${xCenter - 40},30 Q${xCenter - 15},5 ${xCenter},30 Q${xCenter + 15},55 ${xCenter + 40},30`} fill="none" stroke="#4a9eff" strokeWidth="0.8" opacity="0.6"><animate attributeName="opacity" values="0.3;0.7;0.3" dur="3s" repeatCount="indefinite" /></path>
          <path d={`M${xCenter - 48},30 Q${xCenter - 18},0 ${xCenter},30 Q${xCenter + 18},60 ${xCenter + 48},30`} fill="none" stroke="#4a9eff" strokeWidth="0.5" opacity="0.4"><animate attributeName="opacity" values="0.2;0.5;0.2" dur="3.5s" repeatCount="indefinite" /></path>
          <path d={`M${xCenter - 30},30 Q${xCenter - 12},10 ${xCenter},30 Q${xCenter + 12},50 ${xCenter + 30},30`} fill="none" stroke="#6db8ff" strokeWidth="0.6" opacity="0.5"><animate attributeName="opacity" values="0.4;0.6;0.4" dur="2.5s" repeatCount="indefinite" /></path>
          <path d={`M${xCenter - 40},30 Q${xCenter - 15},55 ${xCenter},30 Q${xCenter + 15},5 ${xCenter + 40},30`} fill="none" stroke="#4a9eff" strokeWidth="0.8" opacity="0.6"><animate attributeName="opacity" values="0.3;0.7;0.3" dur="3.2s" repeatCount="indefinite" begin="0.5s" /></path>
          <path d={`M${xCenter - 48},30 Q${xCenter - 18},60 ${xCenter},30 Q${xCenter + 18},0 ${xCenter + 48},30`} fill="none" stroke="#4a9eff" strokeWidth="0.5" opacity="0.4"><animate attributeName="opacity" values="0.2;0.5;0.2" dur="3.8s" repeatCount="indefinite" begin="0.3s" /></path>
          <path d={`M${xCenter - 30},30 Q${xCenter - 12},50 ${xCenter},30 Q${xCenter + 12},10 ${xCenter + 30},30`} fill="none" stroke="#6db8ff" strokeWidth="0.6" opacity="0.5"><animate attributeName="opacity" values="0.4;0.6;0.4" dur="2.8s" repeatCount="indefinite" begin="0.7s" /></path>
        </g>
        <circle cx={xCenter} cy="30" r="20" fill="url(#lf)"><animate attributeName="r" values="18;22;18" dur="4s" repeatCount="indefinite" /></circle>
        <circle cx={xCenter} cy="30" r="3.5" fill="white" opacity="0.9"><animate attributeName="opacity" values="0.7;1;0.7" dur="3s" repeatCount="indefinite" /></circle>
        <circle cx={xCenter} cy="30" r="10" fill="none" stroke="rgba(180,220,255,0.15)" strokeWidth="0.5"><animate attributeName="r" values="8;12;8" dur="4s" repeatCount="indefinite" /></circle>
        <text x="18" y="43" fontFamily="'Outfit',sans-serif" fontWeight="300" fontSize="36" fill="white" filter="url(#tg)">V</text>
        <text x="62" y="43" fontFamily="'Outfit',sans-serif" fontWeight="300" fontSize="36" fill="white" filter="url(#tg)">O</text>
        <text x={xCenter} y="43" fontFamily="'Outfit',sans-serif" fontWeight="300" fontSize="36" fill="white" filter="url(#tg)" textAnchor="middle" opacity="0.95">X</text>
        <text x="168" y="43" fontFamily="'Outfit',sans-serif" fontWeight="300" fontSize="36" fill="white" filter="url(#tg)">I</text>
        <text x="196" y="43" fontFamily="'Outfit',sans-serif" fontWeight="300" fontSize="36" fill="white" filter="url(#tg)">R</text>
        <text x="240" y="43" fontFamily="'Outfit',sans-serif" fontWeight="300" fontSize="36" fill="white" filter="url(#tg)">A</text>
      </svg>
    </div>
  );
}

function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const w = c.offsetWidth;
    const h = c.offsetHeight;
    c.width = w;
    c.height = h;
    let animId: number;
    const ps = Array.from({ length: 40 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2,
      s: Math.random() * 1.5 + 0.5, a: Math.random() * 0.3 + 0.05,
      c: Math.random() > 0.75 ? '#c9a84c' : '#3d8ecf',
    }));
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ps.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2);
        ctx.fillStyle = p.c; ctx.globalAlpha = p.a; ctx.fill();
        for (let j = i + 1; j < ps.length; j++) {
          const dx = p.x - ps[j].x;
          const dy = p.y - ps[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 100) {
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(ps[j].x, ps[j].y);
            ctx.strokeStyle = p.c; ctx.globalAlpha = (1 - d / 100) * 0.06;
            ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
      });
      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', width: '100%', height: '100%' }} />;
}

function AudioWaveform({ isPlaying }: { isPlaying: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = c.getBoundingClientRect();
    c.width = rect.width * dpr;
    c.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const w = rect.width;
    const h = rect.height;
    let time = 0;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const bars = 60;
      const barW = w / bars;
      for (let i = 0; i < bars; i++) {
        const amp = isPlaying
          ? Math.abs(Math.sin(i * 0.3 + time * 0.08) * 0.6 + Math.sin(i * 0.15 + time * 0.05) * 0.4) * h * 0.4
          : Math.abs(Math.sin(i * 0.2) * 0.3) * h * 0.15;
        const grad = ctx.createLinearGradient(0, h / 2 - amp, 0, h / 2 + amp);
        grad.addColorStop(0, 'rgba(74,158,255,0.05)');
        grad.addColorStop(0.5, isPlaying ? 'rgba(201,168,76,0.6)' : 'rgba(61,142,207,0.25)');
        grad.addColorStop(1, 'rgba(74,158,255,0.05)');
        ctx.fillStyle = grad;
        ctx.fillRect(i * barW + 1, h / 2 - amp, barW - 2, amp * 2);
      }
      time++;
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying]);
  return <canvas ref={canvasRef} style={{ width: '100%', height: '80px', display: 'block', borderRadius: '12px' }} />;
}

const FREQS = [
  { hz: 396, name: 'Liberation', color: '#ff6b6b' },
  { hz: 417, name: 'Change', color: '#48dbfb' },
  { hz: 432, name: 'Harmony', color: '#2ecc71' },
  { hz: 528, name: 'Miracle', color: '#0abde3' },
  { hz: 639, name: 'Connection', color: '#5f27cd' },
  { hz: 741, name: 'Expression', color: '#c9a84c' },
  { hz: 852, name: 'Intuition', color: '#f368e0' },
  { hz: 963, name: 'Crown', color: '#dfe6e9' },
];

export default function LandingPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playProgress, setPlayProgress] = useState(0);
  const [activeFreq, setActiveFreq] = useState(3);
  const [tracksGenerated, setTracksGenerated] = useState(12847);
  const playRef = useRef<NodeJS.Timeout | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [lang, setLang] = useState<'en' | 'es'>('en');

  const L = (en: string, es: string) => lang === 'es' ? es : en;

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('voxira-lang') : null;
    if (saved === 'es' || saved === 'en') setLang(saved);
  }, []);

  const toggleLang = () => {
    const next = lang === 'en' ? 'es' : 'en';
    setLang(next);
    localStorage.setItem('voxira-lang', next);
  };

  useEffect(() => {
    fetch('/api/profile').then(r => { if (r.ok) return r.json(); throw 0; })
      .then(d => { if (d.user?.id) setIsLoggedIn(true); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isPlaying) {
      playRef.current = setInterval(() => {
        setPlayProgress(p => {
          if (p >= 100) { setIsPlaying(false); return 0; }
          return p + 0.5;
        });
      }, 100);
    } else {
      if (playRef.current) clearInterval(playRef.current);
    }
    return () => { if (playRef.current) clearInterval(playRef.current); };
  }, [isPlaying]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTracksGenerated(p => p + Math.floor(Math.random() * 3));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const scrollToDemo = () => {
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,600&family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <div style={{
        background: 'radial-gradient(ellipse at 30% 10%, #0f2035 0%, #081020 50%, #050c18 100%)',
        minHeight: '100vh', fontFamily: "'Outfit', sans-serif", color: '#fff',
        position: 'relative', overflow: 'hidden',
      }}>
        <ParticleField />
        <div style={{ position: 'fixed', width: '800px', height: '800px', borderRadius: '50%', top: '-300px', right: '-300px', background: 'radial-gradient(circle,rgba(61,142,207,0.06),transparent 70%)', animation: 'orbFloat 20s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ position: 'fixed', width: '600px', height: '600px', borderRadius: '50%', bottom: '-200px', left: '-200px', background: 'radial-gradient(circle,rgba(201,168,76,0.04),transparent 70%)', animation: 'orbFloat 24s ease-in-out infinite reverse', pointerEvents: 'none', zIndex: 0 }} />

        {/* NAV */}
        <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(180deg, rgba(8,16,32,0.9) 0%, transparent 100%)', backdropFilter: 'blur(12px)' }}>
          <VoxiraLogo size={140} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <a href="#demo" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '14px', fontWeight: 400 }}>Demo</a>
            <a href="#how" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '14px', fontWeight: 400 }}>{L('How it works', 'Como funciona')}</a>
            <a href="#frequencies" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '14px', fontWeight: 400 }}>{L('Frequencies', 'Frecuencias')}</a>
            <button onClick={toggleLang} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', letterSpacing: '1px' }}>{lang === 'en' ? 'ES' : 'EN'}</button>
            <a href={isLoggedIn ? '/dashboard' : '/login'} style={{ background: 'linear-gradient(135deg, #c9a84c, #dbb960)', color: '#081020', textDecoration: 'none', borderRadius: '10px', padding: '10px 24px', fontSize: '13px', fontWeight: 700, boxShadow: '0 2px 16px rgba(201,168,76,0.2)' }}>{isLoggedIn ? L('Start', 'Comenzar') : L('Start Free', 'Comenzar Gratis')}</a>
          </div>
        </nav>

        <div style={{ position: 'relative', zIndex: 1 }}>

          {/* HERO */}
          <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '120px 24px 80px', position: 'relative' }}>
            <p style={{ fontSize: '13px', fontWeight: 400, color: '#c9a84c', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '28px', fontStyle: 'italic', animation: 'fadeUp 0.8s ease both' }}>
              {L('elevate your mind, heal your soul', 'eleva tu mente, sana tu alma')}
            </p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 400, lineHeight: 1.15, margin: 0, maxWidth: '800px', animation: 'fadeUp 0.8s ease both 0.15s', opacity: 0 }}>
              {L('Reprogram your mind ', 'Reprograma tu mente ')}
              <span style={{ fontStyle: 'italic', fontWeight: 600, background: 'linear-gradient(135deg, #c9a84c, #e8d08c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{L('with your own voice', 'con tu propia voz')}</span>
            </h1>
            <p style={{ fontSize: '17px', fontWeight: 300, color: 'rgba(255,255,255,0.45)', marginTop: '24px', maxWidth: '520px', lineHeight: 1.7, animation: 'fadeUp 0.8s ease both 0.3s', opacity: 0 }}>
              {L('AI clones your voice. Solfeggio frequencies sync your brain. Personalized affirmations rewire your beliefs.', 'La IA clona tu voz. Las frecuencias Solfeggio sincronizan tu cerebro. Afirmaciones personalizadas reprograman tus creencias.')}
            </p>
            <div style={{ display: 'flex', gap: '16px', marginTop: '44px', animation: 'fadeUp 0.8s ease both 0.45s', opacity: 0 }}>
              <a href={isLoggedIn ? '/dashboard' : '/login'} style={{ background: 'linear-gradient(135deg, #c9a84c, #dbb960)', color: '#081020', textDecoration: 'none', borderRadius: '14px', padding: '18px 44px', fontSize: '15px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', boxShadow: '0 4px 30px rgba(201,168,76,0.25), 0 0 60px rgba(201,168,76,0.08)' }}>{isLoggedIn ? L('Start', 'Comenzar') : L('Start Free', 'Comenzar Gratis')}</a>
              <button onClick={scrollToDemo} style={{ background: 'transparent', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '18px 36px', fontSize: '15px', fontWeight: 400, cursor: 'pointer' }}>{L('▶ Listen Demo', '▶ Escuchar Demo')}</button>
            </div>
            <div style={{ marginTop: '60px', display: 'flex', alignItems: 'center', gap: '32px', animation: 'fadeUp 0.8s ease both 0.6s', opacity: 0 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 600, color: '#c9a84c' }}>{tracksGenerated.toLocaleString()}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: '4px' }}>{L('tracks generated', 'tracks generados')}</div>
              </div>
              <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.06)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 600, color: '#c9a84c' }}>2 min</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: '4px' }}>{L('to generate', 'para generar')}</div>
              </div>
              <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.06)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 600, color: '#c9a84c' }}>{L('Free', 'Gratis')}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: '4px' }}>{L('no card required', 'sin tarjeta')}</div>
              </div>
            </div>
            <div style={{ position: 'absolute', bottom: '32px', animation: 'bounce 2s infinite' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
            </div>
          </section>

          {/* AUDIO DEMO */}
          <section id="demo" style={{ padding: '100px 24px', maxWidth: '700px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <p style={{ fontSize: '11px', color: 'rgba(201,168,76,0.6)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>{L('hear the difference', 'escucha la diferencia')}</p>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '36px', fontWeight: 400, margin: 0 }}>
                {L('Your voice, ', 'Tu voz, ')}<span style={{ fontStyle: 'italic', color: '#c9a84c', fontWeight: 600 }}>{L('transformed', 'transformada')}</span>
              </h2>
            </div>
            <div style={{ background: 'linear-gradient(160deg, rgba(12,26,46,0.85), rgba(8,16,32,0.95))', border: '1px solid rgba(61,142,207,0.08)', borderRadius: '24px', padding: '32px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.25), transparent)' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff' }}>Abundance & Confidence</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>528 Hz · Miracle · ocean waves</div>
                </div>
                <div style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '8px', padding: '4px 12px', fontSize: '11px', color: '#c9a84c', letterSpacing: '1px' }}>SAMPLE</div>
              </div>
              <AudioWaveform isPlaying={isPlaying} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '20px' }}>
                <button onClick={() => { setIsPlaying(!isPlaying); if (!isPlaying) setPlayProgress(0); }} style={{
                  background: isPlaying ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #c9a84c, #dbb960)',
                  border: 'none', borderRadius: '50%', width: '48px', height: '48px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  boxShadow: isPlaying ? 'none' : '0 0 20px rgba(201,168,76,0.2)',
                }}>
                  {isPlaying ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#081020"><polygon points="5,3 19,12 5,21" /></svg>
                  )}
                </button>
                <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${playProgress}%`, height: '100%', background: 'linear-gradient(90deg, #c9a84c, #4a9eff)', borderRadius: '2px', transition: 'width 0.1s linear' }} />
                </div>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', fontFamily: "'Cormorant Garamond', serif" }}>
                  {isPlaying ? `0:${Math.floor(playProgress / 100 * 30).toString().padStart(2, '0')}` : '0:30'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '20px', flexWrap: 'wrap' }}>
                {['AI Voice Clone', '528 Hz Binaural', 'Ocean Ambient', 'Δ3Hz Brain Sync'].map(tag => (
                  <span key={tag} style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', background: 'rgba(61,142,207,0.06)', border: '1px solid rgba(61,142,207,0.08)', borderRadius: '6px', padding: '4px 10px', letterSpacing: '0.5px' }}>{tag}</span>
                ))}
              </div>
            </div>
            <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>
              {L('✦ This is a sample. Your track will use YOUR cloned voice.', '✦ Esto es una muestra. Tu track usara TU voz clonada.')}
            </p>
          </section>

          {/* HOW IT WORKS */}
          <section id="how" style={{ padding: '100px 24px', maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <p style={{ fontSize: '11px', color: 'rgba(201,168,76,0.6)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>{L('three steps', 'tres pasos')}</p>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '36px', fontWeight: 400, margin: 0 }}>
                {L('How ', 'Como funciona ')}<span style={{ fontStyle: 'italic', color: '#c9a84c', fontWeight: 600 }}>VOXIRA</span>{lang === 'en' ? ' works' : ''}
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
              {[
                { num: '01', title: L('Set intention', 'Define tu intencion'), desc: L('Tell us what you want to manifest. We generate personalized affirmations with AI.', 'Dinos que quieres manifestar. Generamos afirmaciones personalizadas con IA.'), iconSvg: '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="rgba(201,168,76,0.6)" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74L12 2z"/><path d="M5 3l1 3M19 3l-1 3M3 12l3 1M21 12l-3 1"/></svg>' },
                { num: '02', title: L('Record voice', 'Graba tu voz'), desc: L('15 seconds is all we need. Our AI clones your voice with precision.', '15 segundos es todo lo que necesitamos. Nuestra IA clona tu voz con precision.'), iconSvg: '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="rgba(201,168,76,0.6)" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0014 0"/><line x1="12" y1="17" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>' },
                { num: '03', title: L('Listen & transform', 'Escucha y transforma'), desc: L('Your cloned voice delivers affirmations over Solfeggio frequencies with binaural beats.', 'Tu voz clonada entrega afirmaciones sobre frecuencias Solfeggio con beats binaurales.'), iconSvg: '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="rgba(201,168,76,0.6)" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0118 0v6"/><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/><path d="M8 12a2 2 0 104 0M12 12a2 2 0 104 0" opacity="0.4"/></svg>' },
              ].map((step) => (
                <div key={step.num} style={{ background: 'linear-gradient(160deg, rgba(12,26,46,0.6), rgba(8,16,32,0.8))', border: '1px solid rgba(61,142,207,0.06)', borderRadius: '20px', padding: '36px 28px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.15), transparent)' }} />
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '48px', fontWeight: 300, color: 'rgba(201,168,76,0.12)', marginBottom: '20px' }}>{step.num}</div>
                  <div style={{ marginBottom: '16px' }} dangerouslySetInnerHTML={{ __html: step.iconSvg }} />
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 600, color: '#fff', margin: 0, marginBottom: '12px' }}>{step.title}</h3>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, margin: 0 }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FREQUENCIES */}
          <section id="frequencies" style={{ padding: '100px 24px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <p style={{ fontSize: '11px', color: 'rgba(201,168,76,0.6)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>{L('solfeggio frequencies', 'frecuencias solfeggio')}</p>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '36px', fontWeight: 400, margin: 0 }}>
                {L('Ancient tones for ', 'Tonos ancestrales para ')}<span style={{ fontStyle: 'italic', color: '#c9a84c', fontWeight: 600 }}>{L('modern minds', 'mentes modernas')}</span>
              </h2>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.35)', marginTop: '16px', fontStyle: 'italic' }}>{L('Each frequency paired with binaural beats — 3Hz difference between ears for deep brain entrainment', 'Cada frecuencia combinada con beats binaurales — 3Hz de diferencia entre oidos para sincronizacion cerebral profunda')}</p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
              {FREQS.map((f, i) => (
                <button key={f.hz} onClick={() => setActiveFreq(i)} style={{
                  background: activeFreq === i ? `linear-gradient(135deg, ${f.color}18, rgba(8,16,32,0.8))` : 'rgba(8,16,32,0.6)',
                  border: `1px solid ${activeFreq === i ? f.color + '40' : 'rgba(61,142,207,0.06)'}`,
                  borderRadius: '14px', padding: '16px 24px', cursor: 'pointer', textAlign: 'center', minWidth: '120px',
                }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontWeight: 600, color: activeFreq === i ? f.color : 'rgba(255,255,255,0.5)' }}>{f.hz}</div>
                  <div style={{ fontSize: '11px', color: activeFreq === i ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)', marginTop: '4px', letterSpacing: '0.5px' }}>{f.name}</div>
                  {activeFreq === i && (
                    <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', marginTop: '8px', fontFamily: "'Cormorant Garamond', serif" }}>R:{f.hz}Hz · L:{f.hz - 3}Hz</div>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* FINAL CTA */}
          <section style={{ padding: '120px 24px', textAlign: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 400, margin: 0, marginBottom: '16px' }}>
                {L('your mind · your voice · your ', 'tu mente · tu voz · tu ')}
                <span style={{ fontStyle: 'italic', fontWeight: 600, background: 'linear-gradient(135deg, #c9a84c, #e8d08c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{L('transformation', 'transformacion')}</span>
              </h2>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.35)', marginBottom: '40px' }}>{L('3 free tracks · no card required · ready in 2 minutes', '3 tracks gratis · sin tarjeta · listo en 2 minutos')}</p>
              <a href={isLoggedIn ? '/dashboard' : '/login'} style={{
                background: 'linear-gradient(135deg, #c9a84c, #dbb960)', color: '#081020', textDecoration: 'none',
                borderRadius: '14px', padding: '20px 56px', fontSize: '16px', fontWeight: 700,
                letterSpacing: '1.5px', textTransform: 'uppercase',
                boxShadow: '0 4px 40px rgba(201,168,76,0.3), 0 0 80px rgba(201,168,76,0.1)',
                display: 'inline-block',
              }}>{isLoggedIn ? L('Start', 'Comenzar') : L('Start Now', 'Comenzar Ahora')}</a>
            </div>
          </section>

          {/* FOOTER */}
          <footer style={{ padding: '40px 24px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
            <VoxiraLogo size={100} />
            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '20px' }}>
              <a href="#" style={{ color: 'rgba(255,255,255,0.2)', textDecoration: 'none', fontSize: '12px' }}>{L('Terms', 'Terminos')}</a>
              <a href="#" style={{ color: 'rgba(255,255,255,0.2)', textDecoration: 'none', fontSize: '12px' }}>{L('Privacy', 'Privacidad')}</a>
              <a href="#" style={{ color: 'rgba(255,255,255,0.2)', textDecoration: 'none', fontSize: '12px' }}>{L('Contact', 'Contacto')}</a>
            </div>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.1)', marginTop: '16px', letterSpacing: '2px' }}>© 2026 VOXIRA · Powered by ElevenLabs & OpenAI</p>
          </footer>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes orbFloat { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(30px,-25px) scale(1.05)} 66%{transform:translate(-25px,18px) scale(0.95)} }
        @keyframes bounce { 0%,20%,50%,80%,100%{transform:translateY(0)} 40%{transform:translateY(8px)} 60%{transform:translateY(4px)} }
        @keyframes spinSlow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        * { box-sizing: border-box; margin: 0; }
        html { scroll-behavior: smooth; }
        ::selection { background: rgba(201,168,76,0.3); }
        button:hover { filter: brightness(1.1); }
        a:hover { opacity: 0.85; }
        @media (max-width: 768px) {
          nav { padding: 16px 20px !important; }
          nav a[href="#demo"], nav a[href="#how"], nav a[href="#frequencies"] { display: none !important; }
          section > div[style*="grid-template-columns: repeat(3"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
