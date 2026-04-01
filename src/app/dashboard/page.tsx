'use client';

import { Suspense, useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

type Lang = 'en' | 'es';
const t = (lang: Lang, en: string, es: string) => lang === 'es' ? es : en;
type Step = 1 | 2 | 3;
interface Frequency { hz: number; nameEn: string; nameEs: string; descEn: string; descEs: string; color: string; glowColor: string; binauralOffset: number; }
interface AmbientSound { id: string; nameEn: string; nameEs: string; icon: string; }

const FREQUENCIES: Frequency[] = [
  { hz: 396, nameEn: 'Liberation', nameEs: 'Liberación', descEn: 'Release fear and guilt', descEs: 'Disuelve miedo y culpa', color: '#ff6b6b', glowColor: 'rgba(255,107,107,0.15)', binauralOffset: 3 },
  { hz: 417, nameEn: 'Change', nameEs: 'Cambio', descEn: 'Undo negative situations', descEs: 'Deshace situaciones negativas', color: '#48dbfb', glowColor: 'rgba(72,219,251,0.15)', binauralOffset: 3 },
  { hz: 432, nameEn: 'Harmony', nameEs: 'Armonía', descEn: 'Natural universal tuning', descEs: 'Afinación universal natural', color: '#2ecc71', glowColor: 'rgba(46,204,113,0.15)', binauralOffset: 3 },
  { hz: 528, nameEn: 'Miracle', nameEs: 'Milagro', descEn: 'Love frequency · DNA repair', descEs: 'Frecuencia del amor · ADN', color: '#0abde3', glowColor: 'rgba(10,189,227,0.15)', binauralOffset: 3 },
  { hz: 639, nameEn: 'Connection', nameEs: 'Conexión', descEn: 'Harmonize relationships', descEs: 'Armoniza relaciones', color: '#5f27cd', glowColor: 'rgba(95,39,205,0.15)', binauralOffset: 3 },
  { hz: 741, nameEn: 'Expression', nameEs: 'Expresión', descEn: 'Expand consciousness', descEs: 'Expande consciencia', color: '#c9a84c', glowColor: 'rgba(201,168,76,0.15)', binauralOffset: 3 },
  { hz: 852, nameEn: 'Intuition', nameEs: 'Intuición', descEn: 'Awaken inner strength', descEs: 'Despierta fuerza interior', color: '#f368e0', glowColor: 'rgba(243,104,224,0.15)', binauralOffset: 3 },
  { hz: 963, nameEn: 'Crown', nameEs: 'Corona', descEn: 'Connect with the universe', descEs: 'Conexión con el universo', color: '#dfe6e9', glowColor: 'rgba(223,230,233,0.12)', binauralOffset: 3 },
];
const AMBIENT_SOUNDS: AmbientSound[] = [
  { id: 'rain', nameEn: 'Rain', nameEs: 'Lluvia', icon: '🌧' },{ id: 'ocean', nameEn: 'Ocean', nameEs: 'Océano', icon: '🌊' },{ id: 'stream', nameEn: 'Stream', nameEs: 'Arroyo', icon: '💧' },{ id: 'birds', nameEn: 'Birds', nameEs: 'Pájaros', icon: '🐦' },{ id: 'forest', nameEn: 'Forest', nameEs: 'Bosque', icon: '🌲' },
];
const GOAL_SUGGESTIONS_EN = ['Overcome fear of failure','Boost my confidence','Attract abundance','Heal my body','Find inner peace','Improve relationships','Awaken creativity','Connect with my purpose'];
const GOAL_SUGGESTIONS_ES = ['Superar el miedo al fracaso','Aumentar mi confianza','Atraer abundancia','Sanar mi cuerpo','Encontrar paz interior','Mejorar mis relaciones','Despertar mi creatividad','Conectar con mi propósito'];
const GOAL_TO_FREQUENCY: Record<string, number> = {fear:396,miedo:396,failure:396,fracaso:396,guilt:396,culpa:396,change:417,cambio:417,harmony:432,balance:432,confidence:528,confianza:528,love:528,amor:528,peace:528,paz:528,miracle:528,relationship:639,relaciones:639,connection:639,abundance:741,abundancia:741,creativity:741,creatividad:741,expression:741,intuition:852,purpose:963,universe:963,universo:963,crown:963,heal:528,sanar:528,body:432,cuerpo:432};

function VoxiraLogo({ size = 180 }: { size?: number }) {
  const x = 128;
  return (<div style={{display:'inline-flex',alignItems:'center',height:size*0.28}}><svg viewBox="0 0 300 60" style={{height:'100%',width:'auto'}}><defs><radialGradient id="lf" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#fff" stopOpacity="0.95"/><stop offset="15%" stopColor="#d4edff" stopOpacity="0.6"/><stop offset="35%" stopColor="#4a9eff" stopOpacity="0.2"/><stop offset="100%" stopColor="#4a9eff" stopOpacity="0"/></radialGradient><linearGradient id="st" x1="0%" y1="50%" x2="100%" y2="50%"><stop offset="0%" stopColor="#4a9eff" stopOpacity="0"/><stop offset="50%" stopColor="#b0d8ff" stopOpacity="0.5"/><stop offset="100%" stopColor="#4a9eff" stopOpacity="0"/></linearGradient><filter id="tg"><feGaussianBlur stdDeviation="1.8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="wg"><feGaussianBlur stdDeviation="1.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><rect x={x-90} y="27" width="180" height="6" fill="url(#st)" opacity="0.6"><animate attributeName="opacity" values="0.4;0.7;0.4" dur="4s" repeatCount="indefinite"/></rect><g filter="url(#wg)" opacity="0.5"><path d={`M${x-40},30 Q${x-15},5 ${x},30 Q${x+15},55 ${x+40},30`} fill="none" stroke="#4a9eff" strokeWidth="0.8" opacity="0.6"><animate attributeName="opacity" values="0.3;0.7;0.3" dur="3s" repeatCount="indefinite"/></path><path d={`M${x-40},30 Q${x-15},55 ${x},30 Q${x+15},5 ${x+40},30`} fill="none" stroke="#4a9eff" strokeWidth="0.8" opacity="0.6"><animate attributeName="opacity" values="0.3;0.7;0.3" dur="3.2s" repeatCount="indefinite" begin="0.5s"/></path></g><circle cx={x} cy="30" r="20" fill="url(#lf)"><animate attributeName="r" values="18;22;18" dur="4s" repeatCount="indefinite"/></circle><circle cx={x} cy="30" r="3.5" fill="white" opacity="0.9"><animate attributeName="opacity" values="0.7;1;0.7" dur="3s" repeatCount="indefinite"/></circle><text x="18" y="43" fontFamily="'Outfit',sans-serif" fontWeight="300" fontSize="36" fill="white" filter="url(#tg)">V</text><text x="62" y="43" fontFamily="'Outfit',sans-serif" fontWeight="300" fontSize="36" fill="white" filter="url(#tg)">O</text><text x={x} y="43" fontFamily="'Outfit',sans-serif" fontWeight="300" fontSize="36" fill="white" filter="url(#tg)" textAnchor="middle" opacity="0.95">X</text><text x="168" y="43" fontFamily="'Outfit',sans-serif" fontWeight="300" fontSize="36" fill="white" filter="url(#tg)">I</text><text x="196" y="43" fontFamily="'Outfit',sans-serif" fontWeight="300" fontSize="36" fill="white" filter="url(#tg)">R</text><text x="240" y="43" fontFamily="'Outfit',sans-serif" fontWeight="300" fontSize="36" fill="white" filter="url(#tg)">A</text></svg></div>);
}

function ParticleField() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { const c = ref.current; if (!c) return; const ctx = c.getContext('2d'); if (!ctx) return; const w = c.offsetWidth; const h = c.offsetHeight; c.width = w; c.height = h; let id: number; const ps = Array.from({length:50},()=>({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-0.5)*0.3,vy:(Math.random()-0.5)*0.3,s:Math.random()*2+0.5,a:Math.random()*0.4+0.1,c:Math.random()>0.7?'#c9a84c':'#3d8ecf'})); const draw=()=>{ctx.clearRect(0,0,w,h);ps.forEach((p,i)=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0)p.x=w;if(p.x>w)p.x=0;if(p.y<0)p.y=h;if(p.y>h)p.y=0;ctx.beginPath();ctx.arc(p.x,p.y,p.s,0,Math.PI*2);ctx.fillStyle=p.c;ctx.globalAlpha=p.a;ctx.fill();for(let j=i+1;j<ps.length;j++){const dx=p.x-ps[j].x,dy=p.y-ps[j].y,d=Math.sqrt(dx*dx+dy*dy);if(d<120){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(ps[j].x,ps[j].y);ctx.strokeStyle=p.c;ctx.globalAlpha=(1-d/120)*0.08;ctx.lineWidth=0.5;ctx.stroke();}}});ctx.globalAlpha=1;id=requestAnimationFrame(draw);}; draw(); return()=>cancelAnimationFrame(id); },[]);
  return <canvas ref={ref} style={{position:'absolute',inset:0,zIndex:0,pointerEvents:'none',width:'100%',height:'100%'}}/>;
}

function SacredRing({ frequency, isActive }: { frequency: Frequency|null; isActive: boolean }) {
  const color = frequency?.color||'#3d8ecf'; const hz = frequency?.hz||528;
  return (<div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:'280px',height:'280px',opacity:isActive?0.25:0.08,transition:'opacity 1s ease',pointerEvents:'none'}}><svg viewBox="0 0 280 280" style={{width:'100%',height:'100%'}}><circle cx="140" cy="140" r="135" fill="none" stroke={color} strokeWidth="0.5" opacity="0.4" style={{animation:'spinSlow 30s linear infinite'}}/><circle cx="140" cy="140" r="120" fill="none" stroke={color} strokeWidth="0.3" opacity="0.3" style={{animation:'spinSlow 25s linear infinite reverse'}}/>{Array.from({length:6}).map((_,i)=>{const a=(i*60*Math.PI)/180;return <circle key={i} cx={140+Math.cos(a)*50} cy={140+Math.sin(a)*50} r="30" fill="none" stroke={color} strokeWidth="0.3" opacity="0.15"/>;})}<circle cx="140" cy="140" r="50" fill="none" stroke={color} strokeWidth="0.3" opacity="0.2"/><text x="140" y="144" textAnchor="middle" fill={color} fontSize="14" fontFamily="'Cormorant Garamond',serif" opacity="0.5" fontWeight="300">{hz}</text></svg></div>);
}

function Waveform({ isRecording, frequency }: { isRecording: boolean; frequency: Frequency|null }) {
  const ref = useRef<HTMLCanvasElement>(null); const anim = useRef<number>(0);
  useEffect(() => { const c = ref.current; if (!c) return; const ctx = c.getContext('2d'); if (!ctx) return; const dpr = window.devicePixelRatio||1; const rect = c.getBoundingClientRect(); c.width = rect.width*dpr; c.height = rect.height*dpr; ctx.scale(dpr,dpr); const w = rect.width; const h = rect.height; let time = 0; const color = frequency?.color||'#3d8ecf'; const draw = () => { ctx.clearRect(0,0,w,h); for(let wave=0;wave<5;wave++){const amp=isRecording?(20+wave*8):(5+wave*3);const f=0.008+wave*0.003;const sp=0.02+wave*0.008;const al=0.15-wave*0.02;ctx.beginPath();ctx.moveTo(0,h/2);for(let x=0;x<=w;x++){ctx.lineTo(x,h/2+Math.sin(x*f+time*sp)*amp+Math.sin(x*f*1.8+time*sp*1.3)*(amp*0.3));}const grad=ctx.createLinearGradient(0,0,w,0);grad.addColorStop(0,'transparent');grad.addColorStop(0.2,color);grad.addColorStop(0.5,'#c9a84c');grad.addColorStop(0.8,color);grad.addColorStop(1,'transparent');ctx.strokeStyle=grad;ctx.globalAlpha=al;ctx.lineWidth=1.5;ctx.stroke();}ctx.globalAlpha=1;time++;anim.current=requestAnimationFrame(draw);}; draw(); return()=>cancelAnimationFrame(anim.current); },[isRecording,frequency]);
  return <canvas ref={ref} style={{width:'100%',height:'140px',borderRadius:'16px',display:'block'}}/>;
}

function FreqCard({ freq, isSelected, isRecommended, onClick, lang }: { freq: Frequency; isSelected: boolean; isRecommended: boolean; onClick: () => void; lang: Lang }) {
  return (<button onClick={onClick} style={{background:isSelected?`linear-gradient(145deg,${freq.glowColor},rgba(8,16,32,0.8))`:'rgba(8,16,32,0.6)',border:`1px solid ${isSelected?freq.color+'50':'rgba(61,142,207,0.06)'}`,borderRadius:'16px',padding:'20px',cursor:'pointer',textAlign:'left',position:'relative',transition:'all 0.4s cubic-bezier(0.4,0,0.2,1)',overflow:'hidden',transform:isSelected?'scale(1.02)':'scale(1)'}}>
    {isSelected&&<><div style={{position:'absolute',top:0,left:0,width:'40px',height:'40px',borderTop:`2px solid ${freq.color}`,borderLeft:`2px solid ${freq.color}`,borderTopLeftRadius:'16px',opacity:0.6}}/><div style={{position:'absolute',bottom:0,right:0,width:'40px',height:'40px',borderBottom:`2px solid ${freq.color}`,borderRight:`2px solid ${freq.color}`,borderBottomRightRadius:'16px',opacity:0.6}}/></>}
    {isRecommended&&<div style={{position:'absolute',top:'10px',right:'10px',background:'linear-gradient(135deg,#c9a84c,#e8d08c)',color:'#081020',fontSize:'8px',fontWeight:800,padding:'3px 8px',borderRadius:'6px',letterSpacing:'1px',textTransform:'uppercase'}}>{t(lang,'RECOMMENDED','RECOMENDADA')}</div>}
    <div style={{display:'flex',alignItems:'center',gap:'14px',marginBottom:'8px'}}><div style={{width:'44px',height:'44px',borderRadius:'50%',border:`2px solid ${isSelected?freq.color:'rgba(255,255,255,0.08)'}`,display:'flex',alignItems:'center',justifyContent:'center',position:'relative',boxShadow:isSelected?`0 0 15px ${freq.glowColor}`:'none'}}>{isSelected&&<div style={{position:'absolute',inset:'-4px',borderRadius:'50%',border:`1px solid ${freq.color}30`,animation:'spinSlow 8s linear infinite'}}/>}<span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'14px',fontWeight:600,color:isSelected?freq.color:'rgba(255,255,255,0.5)'}}>{freq.hz}</span></div><div><div style={{fontSize:'16px',fontWeight:700,color:isSelected?'#fff':'rgba(255,255,255,0.7)'}}>{t(lang,freq.nameEn,freq.nameEs)}</div><div style={{fontSize:'12px',color:'rgba(255,255,255,0.35)',marginTop:'2px'}}>{t(lang,freq.descEn,freq.descEs)}</div></div></div>
    {isSelected&&(<div style={{marginTop:'12px',padding:'10px 14px',background:'rgba(0,0,0,0.3)',borderRadius:'10px',display:'flex',gap:'20px',alignItems:'center',flexWrap:'wrap'}}><div style={{textAlign:'center'}}><div style={{fontSize:'9px',color:'rgba(255,255,255,0.3)',textTransform:'uppercase',letterSpacing:'1px'}}>{t(lang,'RIGHT EAR','OÍDO DER')}</div><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'18px',color:freq.color,fontWeight:600}}>{freq.hz}<span style={{fontSize:'11px',opacity:0.6}}>Hz</span></div></div><div style={{width:'1px',height:'28px',background:`linear-gradient(180deg,transparent,${freq.color}40,transparent)`}}/><div style={{textAlign:'center'}}><div style={{fontSize:'9px',color:'rgba(255,255,255,0.3)',textTransform:'uppercase',letterSpacing:'1px'}}>{t(lang,'LEFT EAR','OÍDO IZQ')}</div><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'18px',color:freq.color,fontWeight:600}}>{freq.hz-3}<span style={{fontSize:'11px',opacity:0.6}}>Hz</span></div></div><div style={{width:'1px',height:'28px',background:`linear-gradient(180deg,transparent,${freq.color}40,transparent)`}}/><div style={{textAlign:'center'}}><div style={{fontSize:'9px',color:'rgba(255,255,255,0.3)',textTransform:'uppercase',letterSpacing:'1px'}}>BINAURAL</div><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'18px',color:'#c9a84c',fontWeight:600}}>Δ3<span style={{fontSize:'11px',opacity:0.6}}>Hz</span></div></div></div>)}
  </button>);
}

function Steps({ currentStep, lang }: { currentStep: Step; lang: Lang }) {
  const steps = [{num:1,en:'Intention',es:'Intención'},{num:2,en:'Frequency',es:'Frecuencia'},{num:3,en:'Your Voice',es:'Tu Voz'}];
  return (<div style={{display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'48px'}}>{steps.map((s,i)=>(<div key={s.num} style={{display:'flex',alignItems:'center'}}><div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'10px',zIndex:1}}><div style={{width:'52px',height:'52px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px',fontWeight:600,fontFamily:"'Cormorant Garamond',serif",background:currentStep>=s.num?'linear-gradient(135deg,#c9a84c,#e8d08c)':'transparent',color:currentStep>=s.num?'#081020':'rgba(255,255,255,0.2)',border:currentStep>=s.num?'none':'1px solid rgba(255,255,255,0.08)',boxShadow:currentStep===s.num?'0 0 25px rgba(201,168,76,0.35)':'none',transition:'all 0.6s ease'}}>{currentStep>s.num?'✓':`0${s.num}`}</div><span style={{fontSize:'11px',fontWeight:500,color:currentStep>=s.num?'rgba(201,168,76,0.8)':'rgba(255,255,255,0.2)',letterSpacing:'1.5px',textTransform:'uppercase'}}>{t(lang,s.en,s.es)}</span></div>{i<2&&<div style={{width:'72px',height:'1px',margin:'0 20px',marginBottom:'30px',background:currentStep>s.num?'#c9a84c':'rgba(255,255,255,0.05)'}}/>}</div>))}</div>);
}

// ─── DASHBOARD CONTENT (uses useSearchParams) ────────────

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paramLang = searchParams.get('lang');
  const [lang, setLang] = useState<Lang>(paramLang === 'es' ? 'es' : 'en');
  const [step, setStep] = useState<Step>(1);
  const [goal, setGoal] = useState('');
  const [selectedFrequency, setSelectedFrequency] = useState<Frequency | null>(null);
  const [recommendedHz, setRecommendedHz] = useState<number | null>(null);
  const [selectedAmbient, setSelectedAmbient] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedVoiceId, setSavedVoiceId] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState('');

  // Load user profile on mount
  useEffect(() => {
    fetch('/api/profile').then(r => r.json()).then(data => {
      if (data.profile?.voice_id) setSavedVoiceId(data.profile.voice_id);
      if (data.user?.name) setUserName(data.user.name);
      if (data.user?.avatar) setUserAvatar(data.user.avatar);
    }).catch(() => {});
  }, []);
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [affirmations, setAffirmations] = useState<string[]>([]);

  const toggleLang = useCallback(() => { const n = lang === 'en' ? 'es' : 'en'; setLang(n); router.replace(`/dashboard?lang=${n}`, { scroll: false }); }, [lang, router]);

  useEffect(() => { if (!goal || goal.trim().length < 5) { setRecommendedHz(null); return; } const l = goal.toLowerCase(); const fm: Record<string, number> = {fear:396,miedo:396,anxiety:396,ansiedad:396,guilt:396,culpa:396,trauma:396,change:417,cambio:417,transform:417,harmony:432,balance:432,equilibrio:432,nature:432,naturaleza:432,confidence:528,confianza:528,love:528,amor:528,peace:528,paz:528,heal:528,sanar:528,miracle:528,milagro:528,body:432,cuerpo:432,relationship:639,relaciones:639,connection:639,familia:639,family:639,partner:639,pareja:639,abundance:741,abundancia:741,creativity:741,creatividad:741,expression:741,money:741,dinero:741,wealth:741,riqueza:741,millionaire:741,millonario:741,rich:741,rico:741,prosper:741,prosperidad:741,manifest:741,manifestar:741,intuition:852,intuicion:852,purpose:963,proposito:963,universe:963,universo:963,spiritual:963,espiritual:963,awaken:852,despertar:852}; const hc: Record<number, number> = {}; for (const [kw, hz] of Object.entries(fm)) { if (l.includes(kw)) { hc[hz] = (hc[hz] || 0) + 1; } } const s = Object.entries(hc).sort((a, b) => b[1] - a[1]); setRecommendedHz(s.length > 0 ? Number(s[0][0]) : null); }, [goal]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4' });
      mediaRecorderRef.current = mr; audioChunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mr.onstop = () => { setAudioBlob(new Blob(audioChunksRef.current, { type: mr.mimeType })); stream.getTracks().forEach(tk => tk.stop()); };
      mr.start(250); setIsRecording(true); setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(p => p + 1), 1000);
    } catch { setStatusMessage(t(lang, '❌ Microphone access denied', '❌ Acceso al micrófono denegado')); }
  }, [lang]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state !== 'inactive') mediaRecorderRef.current?.stop();
    setIsRecording(false); if (timerRef.current) clearInterval(timerRef.current); setHasRecording(true);
  }, []);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) { setAudioBlob(f); setHasRecording(true); } }, []);

  const handleGenerate = useCallback(async () => {
    if (!audioBlob || !selectedFrequency) return;
    try {
      setIsGenerating(true);
      setStatusMessage(t(lang, '🎙 Cloning your voice...', '🎙 Clonando tu voz...'));
      const form = new FormData(); form.append('audio', audioBlob, 'recording.webm'); form.append('name', `VOXIRA-${Date.now()}`);
      let voiceId = savedVoiceId;
      if (!voiceId) {
        const cloneRes = await fetch('/api/clone-voice', { method: 'POST', body: form });
      const cloneData = await cloneRes.json();
      if (!cloneRes.ok || !cloneData.voice_id) throw new Error(cloneData.error || 'Clone failed');
        voiceId = cloneData.voice_id;
        // Save voice_id to profile for reuse
        fetch('/api/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ voice_id: voiceId }) }).catch(() => {});
        setSavedVoiceId(voiceId);
      }

      setStatusMessage(t(lang, '✨ Generating affirmations with your voice...', '✨ Generando afirmaciones con tu voz...'));
      const genRes = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ voice_id: voiceId, intention: goal, frequency: selectedFrequency.hz, lang }) });
      const genData = await genRes.json();
      if (!genRes.ok || !genData.audio) throw new Error(genData.error || 'Generation failed');

      setAffirmations(genData.affirmations || []);
      setGeneratedAudio(genData.audio);
      setStatusMessage(t(lang, '✅ Your track is ready!', '✅ ¡Tu track está listo!'));
      // Save track to Supabase
      fetch('/api/tracks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ audio_base64: genData.audio, intention: goal, frequency: selectedFrequency.hz, ambient: 'none', duration_minutes: 5, processed: genData.processed || false }) }).catch(() => {});
      // autoplay removed
    } catch (err) {
      setStatusMessage(`❌ ${err instanceof Error ? err.message : 'Error'}`);
    } finally { setIsGenerating(false); }
  }, [audioBlob, selectedFrequency, goal, lang]);

  const formatTime = (s: number) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;
  const toggleAmbient = (id: string) => setSelectedAmbient(p => p.includes(id) ? p.filter(s => s !== id) : [...p, id]);
  const suggestions = lang === 'es' ? GOAL_SUGGESTIONS_ES : GOAL_SUGGESTIONS_EN;

  const card: React.CSSProperties = {background:'linear-gradient(160deg,rgba(12,26,46,0.85),rgba(8,16,32,0.95))',border:'1px solid rgba(61,142,207,0.08)',borderRadius:'24px',padding:'40px',backdropFilter:'blur(24px)',position:'relative',overflow:'hidden'};
  const accent: React.CSSProperties = {position:'absolute',top:0,left:'15%',right:'15%',height:'1px',background:'linear-gradient(90deg,transparent,rgba(201,168,76,0.25),transparent)'};
  const btnG: React.CSSProperties = {background:'linear-gradient(135deg,#c9a84c,#dbb960)',color:'#081020',border:'none',borderRadius:'14px',padding:'15px 36px',fontSize:'14px',fontWeight:700,fontFamily:"'Outfit',sans-serif",cursor:'pointer',letterSpacing:'1px',textTransform:'uppercase',boxShadow:'0 4px 24px rgba(201,168,76,0.2)',transition:'all 0.3s ease'};
  const btnS: React.CSSProperties = {background:'transparent',color:'rgba(255,255,255,0.4)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'14px',padding:'15px 36px',fontSize:'14px',fontWeight:500,fontFamily:"'Outfit',sans-serif",cursor:'pointer',transition:'all 0.3s ease'};

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <div style={{background:'radial-gradient(ellipse at 30% 20%,#0f2035,#081020 50%,#050c18)',minHeight:'100vh',padding:'32px 24px',fontFamily:"'Outfit',sans-serif",position:'relative',overflow:'hidden'}}>
        <ParticleField />
        <div style={{position:'absolute',width:'700px',height:'700px',borderRadius:'50%',top:'-250px',right:'-200px',background:'radial-gradient(circle,rgba(61,142,207,0.07),transparent 70%)',animation:'orbFloat 18s ease-in-out infinite',pointerEvents:'none'}}/>
        <div style={{position:'absolute',width:'600px',height:'600px',borderRadius:'50%',bottom:'-200px',left:'-150px',background:'radial-gradient(circle,rgba(201,168,76,0.04),transparent 70%)',animation:'orbFloat 22s ease-in-out infinite reverse',pointerEvents:'none'}}/>

        <div style={{position:'relative',zIndex:1,maxWidth:'860px',margin:'0 auto'}}>
          <header style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'48px'}}>
            <span style={{fontSize:'12px',fontWeight:300,color:'rgba(255,255,255,0.15)',letterSpacing:'1px'}}>Personal Mindset Frequencies</span>
            <a href={`/?lang=${lang}`} style={{textDecoration:'none'}}><VoxiraLogo size={180}/></a>
            <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
              <button onClick={toggleLang} style={{background:'rgba(12,26,46,0.6)',border:'1px solid rgba(61,142,207,0.1)',borderRadius:'8px',padding:'6px 12px',fontSize:'11px',color:'rgba(255,255,255,0.4)',cursor:'pointer',letterSpacing:'1px',textTransform:'uppercase'}}>{lang==='en'?'ES':'EN'}</button>
              <div style={{width:'34px',height:'34px',borderRadius:'50%',background:'rgba(12,26,46,0.6)',border:'1px solid rgba(61,142,207,0.1)',display:'flex',alignItems:'center',justifyContent:'center'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
            </div>
          </header>

          <Steps currentStep={step} lang={lang} />

          {/* STEP 1 */}
          {step===1&&(<div style={{animation:'fadeUp 0.7s ease'}}><div style={card}><div style={accent}/><SacredRing frequency={selectedFrequency||FREQUENCIES[3]} isActive={!!goal}/><div style={{position:'relative',zIndex:1}}><div style={{textAlign:'center',marginBottom:'36px'}}><p style={{fontSize:'11px',fontWeight:500,color:'rgba(201,168,76,0.6)',letterSpacing:'3px',textTransform:'uppercase',marginBottom:'12px'}}>{t(lang,'step one','paso uno')}</p><h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'32px',fontWeight:400,color:'#fff',margin:0}}>{t(lang,'set your ','define tu ')}<span style={{background:'linear-gradient(135deg,#c9a84c,#e8d08c)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',fontWeight:600}}>{t(lang,'intention','intención')}</span></h2><p style={{fontSize:'14px',color:'rgba(255,255,255,0.35)',marginTop:'10px',fontStyle:'italic'}}>{t(lang,'the more specific, the deeper the reprogramming','cuanto más específica, más profunda la reprogramación')}</p></div>
          <div style={{position:'relative',marginBottom:'28px'}}><textarea value={goal} onChange={e=>setGoal(e.target.value)} placeholder={t(lang,'What do you want to manifest?','¿Qué quieres manifestar?')} rows={4} style={{width:'100%',background:'rgba(4,10,22,0.5)',border:'1px solid rgba(61,142,207,0.12)',borderRadius:'16px',padding:'20px 22px',color:'#fff',fontSize:'16px',fontFamily:"'Outfit',sans-serif",resize:'none',outline:'none',boxSizing:'border-box',lineHeight:1.7}}/>{goal&&recommendedHz&&<div style={{position:'absolute',bottom:'-12px',right:'20px',background:'rgba(8,16,32,0.95)',border:'1px solid rgba(201,168,76,0.25)',borderRadius:'20px',padding:'5px 16px',fontSize:'11px',color:'#c9a84c',backdropFilter:'blur(10px)'}}>✦ {t(lang,'Recommended','Recomendada')}: {recommendedHz}Hz</div>}</div>
          <div style={{marginBottom:'36px'}}><p style={{fontSize:'10px',color:'rgba(255,255,255,0.25)',textTransform:'uppercase',letterSpacing:'2px',marginBottom:'14px'}}>{t(lang,'Quick intentions','Intenciones rápidas')}</p><div style={{display:'flex',flexWrap:'wrap',gap:'8px'}}>{suggestions.map(s=>(<button key={s} onClick={()=>setGoal(s)} style={{background:goal===s?'rgba(201,168,76,0.1)':'rgba(12,26,46,0.5)',border:`1px solid ${goal===s?'rgba(201,168,76,0.25)':'rgba(61,142,207,0.08)'}`,borderRadius:'10px',padding:'8px 16px',color:goal===s?'#c9a84c':'rgba(255,255,255,0.4)',fontSize:'13px',cursor:'pointer',fontWeight:goal===s?600:400}}>{s}</button>))}</div></div>
          <div style={{display:'flex',justifyContent:'flex-end'}}><button onClick={()=>goal.trim()&&setStep(2)} disabled={!goal.trim()} style={{...btnG,opacity:goal.trim()?1:0.3,cursor:goal.trim()?'pointer':'not-allowed'}}>{t(lang,'Continue','Continuar')} →</button></div></div></div></div>)}

          {/* STEP 2 */}
          {step===2&&(<div style={{animation:'fadeUp 0.7s ease'}}><div style={card}><div style={accent}/><div style={{position:'relative',zIndex:1}}><div style={{textAlign:'center',marginBottom:'36px'}}><p style={{fontSize:'11px',fontWeight:500,color:'rgba(201,168,76,0.6)',letterSpacing:'3px',textTransform:'uppercase',marginBottom:'12px'}}>{t(lang,'step two','paso dos')}</p><h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'32px',fontWeight:400,color:'#fff',margin:0}}>{t(lang,'choose your ','elige tu ')}<span style={{background:'linear-gradient(135deg,#c9a84c,#e8d08c)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',fontWeight:600}}>{t(lang,'solfeggio frequency','frecuencia solfeggio')}</span></h2></div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:'12px',marginBottom:'36px'}}>{FREQUENCIES.map(f=><FreqCard key={f.hz} freq={f} isSelected={selectedFrequency?.hz===f.hz} isRecommended={recommendedHz===f.hz} onClick={()=>setSelectedFrequency(f)} lang={lang}/>)}</div>
          <div style={{marginBottom:'36px'}}><p style={{fontSize:'10px',color:'rgba(255,255,255,0.25)',textTransform:'uppercase',letterSpacing:'2px',marginBottom:'14px'}}>{t(lang,'Ambient layers','Capas ambientales')} <span style={{color:'rgba(255,255,255,0.15)',fontStyle:'italic',textTransform:'none'}}>{t(lang,'optional','opcional')}</span></p><div style={{display:'flex',gap:'10px',flexWrap:'wrap'}}>{AMBIENT_SOUNDS.map(s=>{const a=selectedAmbient.includes(s.id);return <button key={s.id} onClick={()=>toggleAmbient(s.id)} style={{background:a?'rgba(61,142,207,0.1)':'rgba(12,26,46,0.5)',border:`1px solid ${a?'rgba(61,142,207,0.25)':'rgba(61,142,207,0.08)'}`,borderRadius:'12px',padding:'10px 20px',color:a?'#4a9eff':'rgba(255,255,255,0.4)',fontSize:'14px',cursor:'pointer',display:'flex',alignItems:'center',gap:'8px'}}><span style={{fontSize:'16px'}}>{s.icon}</span>{t(lang,s.nameEn,s.nameEs)}</button>;})}</div></div>
          <div style={{display:'flex',justifyContent:'space-between'}}><button onClick={()=>setStep(1)} style={btnS}>← {t(lang,'Back','Atrás')}</button><button onClick={()=>selectedFrequency&&setStep(3)} disabled={!selectedFrequency} style={{...btnG,opacity:selectedFrequency?1:0.3,cursor:selectedFrequency?'pointer':'not-allowed'}}>{t(lang,'Continue','Continuar')} →</button></div></div></div></div>)}

          {/* STEP 3 */}
          {step===3&&(<div style={{animation:'fadeUp 0.7s ease'}}><div style={card}><div style={accent}/><div style={{position:'relative',zIndex:1}}>
          <div style={{textAlign:'center',marginBottom:'36px'}}><p style={{fontSize:'11px',fontWeight:500,color:'rgba(201,168,76,0.6)',letterSpacing:'3px',textTransform:'uppercase',marginBottom:'12px'}}>{t(lang,'step three','paso tres')}</p><h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'32px',fontWeight:400,color:'#fff',margin:0}}>{t(lang,'record your ','graba tu ')}<span style={{background:'linear-gradient(135deg,#c9a84c,#e8d08c)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',fontWeight:600}}>{t(lang,'voice','voz')}</span></h2><p style={{fontSize:'14px',color:'rgba(255,255,255,0.35)',marginTop:'10px',fontStyle:'italic'}}>{t(lang,'AI will clone your voice to deliver your affirmations','la IA clonará tu voz para entregar tus afirmaciones')}</p></div>

          {/* Summary */}
          <div style={{background:'rgba(4,10,22,0.4)',border:'1px solid rgba(61,142,207,0.06)',borderRadius:'16px',padding:'22px 26px',marginBottom:'32px',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:'20px'}}>
            <div><div style={{fontSize:'9px',color:'rgba(255,255,255,0.25)',textTransform:'uppercase',letterSpacing:'1.5px',marginBottom:'6px'}}>{t(lang,'Intention','Intención')}</div><div style={{fontSize:'14px',color:'rgba(255,255,255,0.8)'}}>{goal}</div></div>
            <div><div style={{fontSize:'9px',color:'rgba(255,255,255,0.25)',textTransform:'uppercase',letterSpacing:'1.5px',marginBottom:'6px'}}>{t(lang,'Frequency','Frecuencia')}</div><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'20px',color:selectedFrequency?.color,fontWeight:600}}>{selectedFrequency?.hz}Hz <span style={{fontSize:'12px',color:'rgba(255,255,255,0.4)',fontWeight:400}}>{t(lang,selectedFrequency?.nameEn||'',selectedFrequency?.nameEs||'')}</span></div></div>
            <div><div style={{fontSize:'9px',color:'rgba(255,255,255,0.25)',textTransform:'uppercase',letterSpacing:'1.5px',marginBottom:'6px'}}>Binaural</div><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'14px',color:'rgba(255,255,255,0.5)'}}>R:{selectedFrequency?.hz} · L:{(selectedFrequency?.hz||0)-3} · Δ3Hz</div></div>
          </div>

          <div style={{background:'rgba(4,10,22,0.3)',borderRadius:'16px',padding:'20px',marginBottom:'28px',border:`1px solid ${isRecording?'rgba(201,168,76,0.15)':'rgba(61,142,207,0.05)'}`,overflow:'hidden'}}><Waveform isRecording={isRecording} frequency={selectedFrequency}/></div>

          <div style={{textAlign:'center',marginBottom:'28px'}}><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'56px',fontWeight:300,color:isRecording?'#c9a84c':'rgba(255,255,255,0.15)',letterSpacing:'6px'}}>{formatTime(recordingTime)}</div>{isRecording&&<div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',marginTop:'8px'}}><div style={{width:'6px',height:'6px',borderRadius:'50%',background:'#ef4444',animation:'pulse 1.5s infinite'}}/><span style={{fontSize:'11px',color:'rgba(239,68,68,0.8)',textTransform:'uppercase',letterSpacing:'2px'}}>{t(lang,'Recording','Grabando')}</span></div>}</div>

          <div style={{display:'flex',justifyContent:'center',gap:'20px',marginBottom:'32px'}}>
            {!isRecording&&!hasRecording&&<><button onClick={startRecording} style={{background:'linear-gradient(135deg,#c9a84c,#dbb960)',border:'none',borderRadius:'50%',width:'80px',height:'80px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 30px rgba(201,168,76,0.25)',position:'relative'}}><div style={{position:'absolute',inset:'-6px',borderRadius:'50%',border:'1px solid rgba(201,168,76,0.2)',animation:'spinSlow 10s linear infinite'}}/><svg width="28" height="28" viewBox="0 0 24 24" fill="#081020"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg></button><input ref={fileInputRef} type="file" accept="audio/*" style={{display:'none'}} onChange={handleFileUpload}/><button onClick={()=>fileInputRef.current?.click()} style={{background:'transparent',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'50%',width:'56px',height:'56px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',alignSelf:'center'}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg></button></>}
            {isRecording&&<button onClick={stopRecording} style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:'50%',width:'80px',height:'80px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 30px rgba(239,68,68,0.15)'}}><div style={{width:'24px',height:'24px',borderRadius:'4px',background:'#ef4444'}}/></button>}
            {hasRecording&&!isRecording&&<div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'14px'}}><div style={{background:'rgba(34,197,94,0.06)',border:'1px solid rgba(34,197,94,0.2)',borderRadius:'14px',padding:'14px 28px',display:'flex',alignItems:'center',gap:'10px'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg><span style={{fontSize:'14px',color:'#22c55e'}}>{t(lang,'Voice captured','Audio capturado')} · {formatTime(recordingTime)}</span></div><button onClick={()=>{setHasRecording(false);setRecordingTime(0);setAudioBlob(null);setGeneratedAudio(null);setStatusMessage('');setAffirmations([]);}} style={{background:'none',border:'none',color:'rgba(255,255,255,0.3)',fontSize:'12px',cursor:'pointer'}}>{t(lang,'Record again','Grabar de nuevo')}</button></div>}
          </div>

          {!hasRecording&&!isRecording&&<div style={{textAlign:'center',marginBottom:'32px',padding:'14px 24px',background:'rgba(201,168,76,0.03)',border:'1px solid rgba(201,168,76,0.08)',borderRadius:'12px'}}><p style={{fontSize:'13px',color:'rgba(255,255,255,0.4)',margin:0,lineHeight:1.6}}>{t(lang,'✦ Speak clearly for at least 30 seconds.','✦ Habla con claridad al menos 30 segundos.')}</p></div>}

          {statusMessage&&<div style={{textAlign:'center',marginBottom:'20px',padding:'12px 24px',background:statusMessage.includes('❌')?'rgba(239,68,68,0.06)':'rgba(201,168,76,0.06)',border:`1px solid ${statusMessage.includes('❌')?'rgba(239,68,68,0.15)':'rgba(201,168,76,0.15)'}`,borderRadius:'12px'}}><p style={{fontSize:'14px',color:statusMessage.includes('❌')?'#ef4444':'#c9a84c',margin:0}}>{statusMessage}</p></div>}

          {affirmations.length>0&&<div style={{marginBottom:'24px',padding:'20px 24px',background:'rgba(34,197,94,0.04)',border:'1px solid rgba(34,197,94,0.1)',borderRadius:'14px'}}><p style={{fontSize:'10px',color:'rgba(34,197,94,0.6)',textTransform:'uppercase',letterSpacing:'1.5px',marginBottom:'12px'}}>{t(lang,'Your personalized affirmations','Tus afirmaciones personalizadas')}</p>{affirmations.map((a,i)=><p key={i} style={{fontSize:'14px',color:'rgba(255,255,255,0.7)',margin:'6px 0',fontStyle:'italic'}}>✦ {a}</p>)}</div>}

          {generatedAudio&&<div style={{marginBottom:'24px',textAlign:'center'}}><audio controls src={`data:audio/mp3;base64,${generatedAudio}`} style={{width:'100%',maxWidth:'400px'}}/></div>}

          <div style={{display:'flex',justifyContent:'space-between'}}>
            <button onClick={()=>setStep(2)} style={btnS}>← {t(lang,'Back','Atrás')}</button>
            <button onClick={handleGenerate} disabled={!hasRecording||isGenerating} style={{...btnG,opacity:hasRecording&&!isGenerating?1:0.3,cursor:hasRecording&&!isGenerating?'pointer':'not-allowed',fontSize:'15px',padding:'16px 44px',boxShadow:hasRecording&&!isGenerating?'0 4px 30px rgba(201,168,76,0.3)':'none'}}>
              {isGenerating?t(lang,'⏳ Generating...','⏳ Generando...'):`✦ ${t(lang,'Generate Track','Generar Audio')}`}
            </button>
          </div>
          </div></div></div>)}

          <footer style={{textAlign:'center',marginTop:'56px',paddingBottom:'32px'}}><p style={{fontSize:'11px',color:'rgba(255,255,255,0.12)',letterSpacing:'2px'}}>© 2026 V O X I R A</p></footer>
        </div>
      </div>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes orbFloat{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(30px,-25px) scale(1.05)}66%{transform:translate(-25px,18px) scale(0.95)}}
        @keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.2}}
        @keyframes spinSlow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        *{box-sizing:border-box;margin:0}::selection{background:rgba(201,168,76,0.3)}textarea::placeholder{color:rgba(255,255,255,0.2)}button:hover{filter:brightness(1.1)}
      `}</style>
    </>
  );
}

// ─── WRAPPER WITH SUSPENSE ───────────────────────────────

export default function DashboardPage() {
  return (
    <Suspense fallback={<div style={{ background: '#081020', minHeight: '100vh' }} />}>
      <DashboardContent />
    </Suspense>
  );
}
