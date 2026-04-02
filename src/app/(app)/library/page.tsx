'use client';
import { useState, useEffect, useRef } from 'react';

interface Track { id: string; intention: string; frequency: number; ambient: string; duration_minutes: number; file_url: string; processed: boolean; created_at: string; }
const FC: Record<number,string> = {396:'#ff6b6b',417:'#48dbfb',432:'#2ecc71',528:'#0abde3',639:'#5f27cd',741:'#c9a84c',852:'#f368e0',963:'#dfe6e9'};
const FN: Record<number,string> = {396:'Liberation',417:'Change',432:'Harmony',528:'Miracle',639:'Connection',741:'Expression',852:'Intuition',963:'Crown'};

export default function LibraryPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState<string|null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => { fetch('/api/tracks').then(r=>r.json()).then(d=>{setTracks(d.tracks||[]);}).catch(()=>{}).finally(()=>setLoading(false)); }, []);

  const handlePlay = (t: Track) => {
    if (playing===t.id) { audioRef.current?.pause(); setPlaying(null); }
    else { if(audioRef.current){audioRef.current.src=t.file_url;audioRef.current.play().catch(()=>{});} setPlaying(t.id); }
  };
  const handleDelete = async (id: string) => {
    if(!confirm('Delete this track?')) return;
    await fetch(`/api/tracks?id=${id}`,{method:'DELETE'}).catch(()=>{});
    setTracks(p=>p.filter(t=>t.id!==id));
    if(playing===id){audioRef.current?.pause();setPlaying(null);}
  };
  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>
      <audio ref={audioRef} onEnded={()=>setPlaying(null)}/>
      <div style={{background:'radial-gradient(ellipse at 30% 20%,#0f2035,#081020 50%,#050c18)',minHeight:'100vh',padding:'32px 24px',fontFamily:"'Outfit',sans-serif",position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',width:'700px',height:'700px',borderRadius:'50%',top:'-250px',right:'-200px',background:'radial-gradient(circle,rgba(61,142,207,0.07),transparent 70%)',pointerEvents:'none'}}/>
        <div style={{position:'relative',zIndex:1,maxWidth:'860px',margin:'0 auto'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'48px'}}>
            <div>
              <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'36px',fontWeight:400,color:'#fff',margin:0}}>your <span style={{background:'linear-gradient(135deg,#c9a84c,#e8d08c)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',fontWeight:600}}>library</span></h1>
              <p style={{fontSize:'13px',color:'rgba(255,255,255,0.3)',marginTop:'6px'}}>{tracks.length} track{tracks.length!==1?'s':''}</p>
            </div>
            <div style={{display:'flex',gap:'12px'}}>
              <a href="/dashboard" style={{background:'linear-gradient(135deg,#c9a84c,#dbb960)',color:'#081020',border:'none',borderRadius:'12px',padding:'12px 24px',fontSize:'13px',fontWeight:700,fontFamily:"'Outfit',sans-serif",textDecoration:'none',letterSpacing:'1px',textTransform:'uppercase'}}>+ New Track</a>
              <a href="/" style={{background:'transparent',color:'rgba(255,255,255,0.4)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'12px 24px',fontSize:'13px',fontWeight:500,fontFamily:"'Outfit',sans-serif",textDecoration:'none'}}>Home</a>
            </div>
          </div>
          {loading&&<div style={{textAlign:'center',padding:'60px 0'}}><p style={{color:'rgba(201,168,76,0.6)',fontSize:'14px'}}>Loading your tracks...</p></div>}
          {!loading&&tracks.length===0&&(
            <div style={{textAlign:'center',padding:'80px 0'}}>
              <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'28px',fontWeight:400,color:'rgba(255,255,255,0.5)',margin:'0 0 12px 0'}}>No tracks yet</h2>
              <p style={{fontSize:'14px',color:'rgba(255,255,255,0.25)',marginBottom:'28px'}}>Generate your first personalized track</p>
              <a href="/dashboard" style={{background:'linear-gradient(135deg,#c9a84c,#dbb960)',color:'#081020',borderRadius:'14px',padding:'15px 36px',fontSize:'14px',fontWeight:700,fontFamily:"'Outfit',sans-serif",textDecoration:'none',letterSpacing:'1px',textTransform:'uppercase'}}>Create Your First Track</a>
            </div>
          )}
          <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
            {tracks.map(track=>{const color=FC[track.frequency]||'#c9a84c';const name=FN[track.frequency]||track.frequency+'Hz';const isP=playing===track.id;return(
              <div key={track.id} style={{background:'linear-gradient(160deg,rgba(12,26,46,0.85),rgba(8,16,32,0.95))',border:`1px solid ${isP?color+'40':'rgba(61,142,207,0.08)'}`,borderRadius:'16px',padding:'20px 24px',display:'flex',alignItems:'center',gap:'16px',transition:'all 0.3s'}}>
                <button onClick={()=>handlePlay(track)} style={{width:'48px',height:'48px',borderRadius:'50%',border:`1px solid ${color}40`,background:isP?`${color}15`:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  {isP?<div style={{display:'flex',gap:'3px'}}><div style={{width:'3px',height:'14px',background:color,borderRadius:'2px'}}/><div style={{width:'3px',height:'14px',background:color,borderRadius:'2px'}}/></div>:<div style={{width:0,height:0,borderTop:'8px solid transparent',borderBottom:'8px solid transparent',borderLeft:`14px solid ${color}`,marginLeft:'3px'}}/>}
                </button>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:'15px',color:'#fff',margin:'0 0 4px 0',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{track.intention||'Untitled'}</p>
                  <div style={{display:'flex',gap:'16px',alignItems:'center'}}>
                    <span style={{fontSize:'12px',color,fontWeight:600,fontFamily:"'Cormorant Garamond',serif"}}>{track.frequency}Hz {name}</span>
                    <span style={{fontSize:'11px',color:'rgba(255,255,255,0.25)'}}>{track.duration_minutes}min</span>
                    <span style={{fontSize:'11px',color:'rgba(255,255,255,0.2)'}}>{fmtDate(track.created_at)}</span>
                    {track.processed&&<span style={{fontSize:'9px',color:'rgba(34,197,94,0.6)',textTransform:'uppercase',letterSpacing:'1px'}}>binaural</span>}
                  </div>
                </div>
                <a href={track.file_url} download style={{color:'rgba(255,255,255,0.25)',padding:'8px',flexShrink:0}}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg></a>
                <button onClick={()=>handleDelete(track.id)} style={{background:'none',border:'none',color:'rgba(255,255,255,0.15)',cursor:'pointer',padding:'8px',flexShrink:0}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button>
              </div>
            );})}
          </div>
          <footer style={{textAlign:'center',marginTop:'56px',paddingBottom:'32px'}}><p style={{fontSize:'11px',color:'rgba(255,255,255,0.12)',letterSpacing:'2px'}}>© 2026 V O X I R A</p></footer>
        </div>
      </div>
    </>
  );
}
