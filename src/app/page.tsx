'use client';

import { motion } from 'framer-motion';
import { useState, useRef } from 'react';

const QUICK_GOALS = ['abundance', 'confidence', 'heal anxiety', 'pass my exam', 'win the game', 'inner peace', 'attract love'];

const SOLFEGGIO = [
  { hz: '396', name: 'Liberation' },
  { hz: '417', name: 'Change' },
  { hz: '432', name: 'Harmony' },
  { hz: '528', name: 'Miracle' },
  { hz: '639', name: 'Connection' },
  { hz: '741', name: 'Expression' },
  { hz: '852', name: 'Intuition' },
  { hz: '963', name: 'Crown' },
];

function EnergyWaves({ intensity = 1, height = 80, className = '' }: { intensity?: number; height?: number; className?: string }) {
  return (
    <svg width="100%" height={height} viewBox={`0 0 600 ${height}`} className={className} aria-hidden>
      <path d={`M-20 ${height/2} Q60 ${height*0.15}, 140 ${height/2} Q220 ${height*0.85}, 300 ${height/2} Q380 ${height*0.15}, 460 ${height/2} Q540 ${height*0.85}, 640 ${height/2}`} fill="none" stroke="#0A1E2E" strokeWidth={8 * intensity} opacity={0.5}/>
      <path d={`M-40 ${height/2+2} Q80 ${height*0.2}, 160 ${height/2+2} Q240 ${height*0.8}, 320 ${height/2+2} Q400 ${height*0.2}, 480 ${height/2+2} Q560 ${height*0.8}, 640 ${height/2+2}`} fill="none" stroke="#0D2940" strokeWidth={7 * intensity} opacity={0.4}/>
      <path d={`M-10 ${height/2} Q50 ${height*0.2}, 120 ${height/2} Q190 ${height*0.8}, 260 ${height/2} Q330 ${height*0.2}, 400 ${height/2} Q470 ${height*0.8}, 540 ${height/2} Q610 ${height*0.2}, 650 ${height/2}`} fill="none" stroke="#0F3654" strokeWidth={4 * intensity} opacity={0.5}/>
      <path d={`M0 ${height/2-2} Q70 ${height*0.25}, 150 ${height/2-2} Q230 ${height*0.72}, 300 ${height/2-2} Q370 ${height*0.25}, 450 ${height/2-2} Q530 ${height*0.72}, 600 ${height/2-2}`} fill="none" stroke="#124568" strokeWidth={3 * intensity} opacity={0.5}/>
      <path d={`M10 ${height/2+2} Q80 ${height*0.28}, 160 ${height/2+2} Q240 ${height*0.75}, 310 ${height/2+2} Q380 ${height*0.28}, 460 ${height/2+2} Q540 ${height*0.75}, 610 ${height/2+2}`} fill="none" stroke="#15557C" strokeWidth={2.2 * intensity} opacity={0.55}/>
      <path d={`M0 ${height/2} Q75 ${height*0.28}, 150 ${height/2} Q225 ${height*0.72}, 300 ${height/2} Q375 ${height*0.28}, 450 ${height/2} Q525 ${height*0.72}, 600 ${height/2}`} fill="none" stroke="#1A6B96" strokeWidth={1.8 * intensity} opacity={0.65}/>
      <path d={`M5 ${height/2-1} Q80 ${height*0.3}, 155 ${height/2-1} Q230 ${height*0.68}, 305 ${height/2-1} Q380 ${height*0.3}, 455 ${height/2-1} Q530 ${height*0.68}, 605 ${height/2-1}`} fill="none" stroke="#2080B0" strokeWidth={1.3 * intensity} opacity={0.6}/>
      <path d={`M-5 ${height/2+1} Q70 ${height*0.32}, 145 ${height/2+1} Q220 ${height*0.7}, 295 ${height/2+1} Q370 ${height*0.32}, 445 ${height/2+1} Q520 ${height*0.7}, 595 ${height/2+1}`} fill="none" stroke="#2898C8" strokeWidth={intensity} opacity={0.5}/>
      <path d={`M0 ${height/2} Q75 ${height*0.36}, 150 ${height/2} Q225 ${height*0.64}, 300 ${height/2} Q375 ${height*0.36}, 450 ${height/2} Q525 ${height*0.64}, 600 ${height/2}`} fill="none" stroke="#34B0E0" strokeWidth={0.7 * intensity} opacity={0.45}/>
      <path d={`M10 ${height/2} Q85 ${height*0.38}, 160 ${height/2} Q235 ${height*0.62}, 310 ${height/2} Q385 ${height*0.38}, 460 ${height/2} Q535 ${height*0.62}, 610 ${height/2}`} fill="none" stroke="#48C8F0" strokeWidth={0.5 * intensity} opacity={0.35}/>
      <path d={`M0 ${height/2-2} Q100 ${height*0.25}, 200 ${height/2+2} Q300 ${height*0.72}, 400 ${height/2-4} Q500 ${height*0.22}, 600 ${height/2+2}`} fill="none" stroke="#1A5570" strokeWidth={1.5 * intensity} opacity={0.3}/>
      <circle cx="80" cy={height*0.38} r={1*intensity} fill="#34B0E0" opacity={0.4}/>
      <circle cx="200" cy={height*0.62} r={0.8*intensity} fill="#48C8F0" opacity={0.3}/>
      <circle cx="320" cy={height*0.32} r={1.2*intensity} fill="#C9A84C" opacity={0.3}/>
      <circle cx="440" cy={height*0.68} r={0.8*intensity} fill="#34B0E0" opacity={0.35}/>
      <circle cx="520" cy={height*0.4} r={intensity} fill="#C9A84C" opacity={0.2}/>
      <circle cx="150" cy={height*0.56} r={0.6*intensity} fill="#2898C8" opacity={0.3}/>
    </svg>
  );
}

export default function Home() {
  const [goal, setGoal] = useState('');
  const [selectedFreq, setSelectedFreq] = useState('528');
  const [voiceMode, setVoiceMode] = useState<'none' | 'record' | 'upload'>('none');
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="min-h-screen bg-[#060D14] text-white overflow-hidden">
      {/* Nav with logo */}
      <nav className="px-5 md:px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-0">
          
          <span className="text-xl text-white/90 font-light" style={{ fontFamily: "Georgia, serif", letterSpacing: "4px" }}>
            V O X I R A
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-white/[0.1] text-xs text-white/50 hover:text-white/70 hover:border-white/20 transition-all">
            <svg width="14" height="14" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Sign in
          </button>
          <button className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#124568] to-[#1A6B96] text-xs text-white font-medium shadow-[0_0_12px_rgba(26,107,150,0.2)]">
            Start free
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-6 pb-2 text-center px-5">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}>
          <EnergyWaves height={55} />
        </motion.div>
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-sm text-[#C9A84C] tracking-[3px] font-light mb-4" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
          elevate your mind, heal your soul
        </motion.p>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }} className="text-3xl md:text-5xl font-light leading-tight mb-3" style={{ fontFamily: 'Georgia, serif' }}>
          Reprogram your mind{' '}
          <span className="italic text-[#C9A84C] font-normal">with your own voice</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-sm text-white/30 max-w-md mx-auto leading-relaxed font-light">
          AI-powered audio: your cloned voice + Solfeggio frequencies + personalized affirmations
        </motion.p>
      </section>

      {/* Main Action Box */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="mx-4 md:mx-auto md:max-w-2xl my-6">
        <div className="p-6 rounded-[22px] bg-gradient-to-br from-[#1A6B96]/[0.08] to-[#124568]/[0.04] border border-[#1A6B96]/20 shadow-[0_0_40px_rgba(26,107,150,0.08),0_4px_30px_rgba(0,0,0,0.3)] relative overflow-hidden">
          <div className="absolute top-[-40px] right-[-40px] w-[120px] h-[120px] rounded-full bg-[radial-gradient(circle,rgba(40,152,200,0.08),transparent)] pointer-events-none" />
          <div className="absolute bottom-[-30px] left-[-30px] w-[100px] h-[100px] rounded-full bg-[radial-gradient(circle,rgba(26,107,150,0.06),transparent)] pointer-events-none" />

          <p className="text-sm text-[#C9A84C] tracking-[2px] font-light mb-5" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
            try it now — free, instant result
          </p>

          {/* Step 1: Goal */}
          <div className="mb-5">
            <div className="flex items-center gap-2 text-sm text-white/35 mb-2">
              <span className="w-5 h-5 rounded-full bg-[#1A6B96]/20 border border-[#2898C8]/30 flex items-center justify-center text-xs text-[#48C8F0]">1</span>
              What do you want to manifest?
            </div>
            <div className="bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-4">
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder={'"I want unstoppable confidence in everything I do"'}
                className="w-full bg-transparent text-base text-white/80 placeholder-white/[0.18] outline-none"
                style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-2.5">
              {QUICK_GOALS.map((g) => (
                <button key={g} onClick={() => setGoal(g)} className="px-4 py-2 rounded-full bg-[#1A6B96]/[0.08] border border-[#1A6B96]/[0.18] text-sm text-white/45 hover:text-white/60 hover:border-[#1A6B96]/30 transition-all">
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-[#1A6B96]/10 my-4" />

          {/* Step 2: Voice */}
          <div className="mb-5">
            <div className="flex items-center gap-2 text-sm text-white/35 mb-2.5">
              <span className="w-5 h-5 rounded-full bg-[#1A6B96]/20 border border-[#2898C8]/30 flex items-center justify-center text-xs text-[#48C8F0]">2</span>
              Record or upload your voice (30 sec)
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { setVoiceMode('record'); setIsRecording(!isRecording); }}
                className={`flex items-center justify-center gap-3 py-5 px-3 rounded-xl border transition-all ${voiceMode === 'record' ? 'bg-red-500/[0.08] border-red-500/25' : 'bg-[#1A6B96]/[0.06] border-[#1A6B96]/[0.15] hover:border-[#1A6B96]/25'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-[1.5px] ${voiceMode === 'record' && isRecording ? 'bg-red-500/20 border-red-500/40' : 'bg-red-500/10 border-red-500/25'}`}>
                  <div className={`rounded-full bg-red-500 ${voiceMode === 'record' && isRecording ? 'w-3.5 h-3.5 animate-pulse' : 'w-3.5 h-3.5'}`} />
                </div>
                <div className="text-left">
                  <div className="text-base text-white/70 font-medium">Record</div>
                  <div className="text-xs text-white/25">Use your mic</div>
                </div>
              </button>
              <button
                onClick={() => { setVoiceMode('upload'); fileInputRef.current?.click(); }}
                className={`flex items-center justify-center gap-3 py-5 px-3 rounded-xl border transition-all ${voiceMode === 'upload' ? 'bg-[#1A6B96]/[0.12] border-[#2898C8]/25' : 'bg-[#1A6B96]/[0.06] border-[#1A6B96]/[0.15] hover:border-[#1A6B96]/25'}`}
              >
                <div className="w-10 h-10 rounded-full bg-[#1A6B96]/10 border-[1.5px] border-[#2898C8]/25 flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2898C8" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                </div>
                <div className="text-left">
                  <div className="text-base text-white/70 font-medium">Upload</div>
                  <div className="text-xs text-white/25">MP3, WAV, M4A</div>
                </div>
              </button>
              <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" />
            </div>
          </div>

          <div className="h-px bg-[#1A6B96]/10 my-4" />

          {/* Step 3: Frequency */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-white/35 mb-2.5">
              <span className="w-5 h-5 rounded-full bg-[#1A6B96]/20 border border-[#2898C8]/30 flex items-center justify-center text-xs text-[#48C8F0]">3</span>
              Choose your Solfeggio frequency
            </div>
            <div className="flex flex-wrap gap-2">
              {SOLFEGGIO.map((f) => (
                <button
                  key={f.hz}
                  onClick={() => setSelectedFreq(f.hz)}
                  className={`px-3.5 py-2 rounded-lg text-sm transition-all ${selectedFreq === f.hz ? 'bg-[#1A6B96]/[0.2] border border-[#2898C8]/30 text-[#48C8F0] font-medium' : 'border border-white/[0.06] text-white/25 hover:text-white/40 hover:border-white/10'}`}
                >
                  {selectedFreq === f.hz ? `${f.hz} Hz — ${f.name}` : f.hz}
                </button>
              ))}
            </div>
          </div>

          {/* Create */}
          <button className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl bg-gradient-to-r from-[#124568] via-[#1A6B96] to-[#2080B0] shadow-[0_0_28px_rgba(26,107,150,0.35),0_0_60px_rgba(26,107,150,0.1)] hover:shadow-[0_0_36px_rgba(26,107,150,0.5)] transition-all">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 3v18M3 12h18"/></svg>
            <span className="text-lg text-white font-medium tracking-wide">Generate My Track</span>
          </button>
          <p className="text-center text-xs text-white/[0.12] mt-3">free · no account needed · ready in 2 minutes</p>
        </div>
      </motion.section>

      {/* Player */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3 }} className="mx-4 md:mx-auto md:max-w-2xl mb-8">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#1A6B96]/[0.06] to-[#1A6B96]/[0.02] border border-[#1A6B96]/[0.12]">
          <div className="flex items-center gap-3 mb-4">
            <button className="w-12 h-12 rounded-full bg-gradient-to-br from-[#124568] to-[#1A6B96] flex items-center justify-center shadow-[0_0_16px_rgba(26,107,150,0.3)] shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
            </button>
            <div className="flex-1 min-w-0">
              <div className="text-base text-white truncate" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>Abundance &amp; Inner Peace</div>
              <div className="text-xs text-white/20 mt-0.5">528 Hz · ocean waves · your voice</div>
            </div>
            <span className="text-xs text-white/[0.12] shrink-0">1:47 / 4:32</span>
          </div>
          <div className="relative h-11 mb-2.5">
            <div className="flex items-end gap-[2px] h-full absolute inset-0">
              {Array.from({ length: 30 }, (_, i) => {
                const h = 25 + Math.sin(i * 0.4) * 30 + Math.sin(i * 0.7) * 20;
                return <motion.div key={i} className="flex-1 rounded-md" style={{ background: `rgba(26,107,150,${0.25 + (h/100)*0.35})` }} initial={{ height: '10%' }} animate={{ height: `${h}%` }} transition={{ duration: 0.8, delay: i * 0.02 }} />;
              })}
            </div>
          </div>
          <div className="h-[3px] bg-white/[0.04] rounded-full">
            <div className="w-[38%] h-full bg-gradient-to-r from-[#124568] via-[#1A6B96] to-[#2898C8] rounded-full shadow-[0_0_6px_rgba(40,152,200,0.25)]" />
          </div>
          <div className="flex justify-between mt-2">
            <div className="flex gap-3">
              <span className="text-xs text-[#2898C8]/40 tracking-wider">528 Hz</span>
              <span className="text-xs text-white/[0.06]">·</span>
              <span className="text-xs text-[#C9A84C]/25 tracking-wider">FIBONACCI REVERB</span>
            </div>
            <span className="text-xs text-white/[0.08] tracking-wider">SIDECHAIN ON</span>
          </div>
        </div>
      </motion.section>

      {/* Frequencies */}
      <section className="px-4 md:px-10 mb-8 text-center">
        <p className="text-sm text-[#C9A84C] tracking-[3px] font-light mb-5" style={{ fontFamily: 'Georgia, serif' }}>solfeggio frequencies</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-w-3xl mx-auto">
          {SOLFEGGIO.map((f, i) => (
            <motion.button key={f.hz} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} viewport={{ once: true }} onClick={() => setSelectedFreq(f.hz)}
              className={`py-5 px-3 rounded-xl text-center transition-all relative overflow-hidden ${selectedFreq === f.hz ? 'bg-[#1A6B96]/[0.12] border border-[#2898C8]/25' : 'bg-[#124568]/[0.06] border border-[#1A6B96]/[0.08] hover:border-[#1A6B96]/20 hover:bg-[#1A6B96]/[0.08]'}`}
            >
              <div className="text-2xl font-light" style={{ fontFamily: 'Georgia, serif', color: `hsl(${195 + i * 3}, ${50 + i * 2}%, ${35 + i * 3}%)` }}>{f.hz}</div>
              <div className="text-xs text-white/50 mt-1" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>{f.name}</div>
              {selectedFreq === f.hz && <div className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_center,rgba(40,152,200,0.06),transparent)] pointer-events-none" />}
            </motion.button>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-5 mb-8 text-center">
        <EnergyWaves height={35} intensity={0.6} className="mb-5" />
        <p className="text-sm text-[#C9A84C] tracking-[3px] font-light mb-6" style={{ fontFamily: 'Georgia, serif' }}>how it works</p>
        <div className="flex justify-center gap-10 md:gap-16">
          {[
            { n: '01', t: 'frequency', d: 'binaural waves\nsync your brain' },
            { n: '02', t: 'your voice', d: 'AI clones your voice\nwith precision' },
            { n: '03', t: 'affirmations', d: 'personalized\nfor your goals' },
          ].map((s, i) => (
            <motion.div key={s.n} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.12 }} viewport={{ once: true }} className="text-center">
              <div className="text-2xl font-light text-[#1A6B96] italic" style={{ fontFamily: 'Georgia, serif' }}>{s.n}</div>
              <div className="text-base text-white mt-2">{s.t}</div>
              <div className="text-sm text-white/25 mt-1 font-light leading-relaxed whitespace-pre-line">{s.d}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 pb-8 text-center">
        <EnergyWaves height={35} intensity={0.6} className="mb-6" />
        <h2 className="text-2xl md:text-3xl font-light leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
          your mind · your voice · <span className="italic text-[#C9A84C]">your transformation</span>
        </h2>
        <p className="text-xs text-white/15 mt-3 mb-5">3 free credits · no card required</p>
        <button className="px-10 py-3.5 rounded-full bg-gradient-to-r from-[#124568] via-[#1A6B96] to-[#2080B0] text-white text-base tracking-wide italic shadow-[0_0_24px_rgba(26,107,150,0.35),0_0_60px_rgba(26,107,150,0.12)] hover:shadow-[0_0_32px_rgba(26,107,150,0.5)] transition-all" style={{ fontFamily: 'Georgia, serif' }}>
          start now
        </button>
      </section>

      {/* Footer */}
      <footer className="px-5 md:px-10 py-3 flex justify-between">
        <span className="text-xs text-white/[0.08]">© 2026 V O X I R A</span>
        <div className="flex gap-4">
          <a href="#" className="text-xs text-white/[0.08] hover:text-white/15 transition-colors">terms</a>
          <a href="#" className="text-xs text-white/[0.08] hover:text-white/15 transition-colors">privacy</a>
        </div>
      </footer>
    </div>
  );
}
