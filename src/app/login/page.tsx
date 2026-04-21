'use client';
import { createClient } from '@/lib/supabase';
import { useState } from 'react';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { setError(error.message); setIsLoading(false); }
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <div style={{background:'radial-gradient(ellipse at 30% 20%,#0f2035,#081020 50%,#050c18)',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Outfit',sans-serif",position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',width:'700px',height:'700px',borderRadius:'50%',top:'-250px',right:'-200px',background:'radial-gradient(circle,rgba(61,142,207,0.07),transparent 70%)',animation:'orbFloat 18s ease-in-out infinite',pointerEvents:'none'}}/>
        <div style={{position:'absolute',width:'600px',height:'600px',borderRadius:'50%',bottom:'-200px',left:'-150px',background:'radial-gradient(circle,rgba(201,168,76,0.04),transparent 70%)',animation:'orbFloat 22s ease-in-out infinite reverse',pointerEvents:'none'}}/>
        <div style={{position:'relative',zIndex:1,maxWidth:'440px',width:'100%',padding:'0 24px'}}>
          <div style={{textAlign:'center',marginBottom:'48px'}}>
            <img src="/afirmia_256.png" alt="AFIRMIA" style={{width:'180px',height:'auto',margin:'0 auto 12px',display:'block'}} />
            <p style={{fontSize:'13px',color:'rgba(201,168,76,0.6)',letterSpacing:'3px',textTransform:'uppercase',marginTop:'12px'}}>Subconscious Reprogramming</p>
          </div>
          <div style={{background:'linear-gradient(160deg,rgba(12,26,46,0.85),rgba(8,16,32,0.95))',border:'1px solid rgba(61,142,207,0.08)',borderRadius:'24px',padding:'48px 40px',backdropFilter:'blur(24px)',position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',top:0,left:'15%',right:'15%',height:'1px',background:'linear-gradient(90deg,transparent,rgba(201,168,76,0.25),transparent)'}}/>
            <div style={{textAlign:'center',marginBottom:'36px'}}>
              <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'28px',fontWeight:400,color:'#fff',margin:'0 0 12px 0'}}>reprogram your <span style={{background:'linear-gradient(135deg,#c9a84c,#e8d08c)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',fontWeight:600}}>mind</span></h2>
              <p style={{fontSize:'14px',color:'rgba(255,255,255,0.35)',fontStyle:'italic',margin:0}}>with your own voice</p>
            </div>
            <button onClick={handleGoogleLogin} disabled={isLoading} style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:'12px',padding:'16px 24px',background:isLoading?'rgba(255,255,255,0.05)':'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:'14px',color:'#fff',fontSize:'15px',fontWeight:500,fontFamily:"'Outfit',sans-serif",cursor:isLoading?'wait':'pointer',transition:'all 0.3s ease',marginBottom:'20px'}}>
              {!isLoading && <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>}
              {isLoading ? 'Connecting...' : 'Continue with Google'}
            </button>
            {error && <p style={{fontSize:'13px',color:'#ef4444',textAlign:'center',margin:'0 0 16px 0'}}>Error: {error}</p>}
            <p style={{fontSize:'11px',color:'rgba(255,255,255,0.25)',textAlign:'center',lineHeight:1.6,margin:0}}>By continuing, you consent to AI voice cloning for personal use. Your voice data can be deleted anytime.</p>
          </div>
          <p style={{textAlign:'center',marginTop:'32px',fontSize:'11px',color:'rgba(255,255,255,0.12)',letterSpacing:'2px'}}>© 2026 A F I R M I A</p>
        </div>
        <style>{`
          @keyframes orbFloat{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(30px,-25px) scale(1.05)}66%{transform:translate(-25px,18px) scale(0.95)}}
          button:hover{filter:brightness(1.15)!important;border-color:rgba(201,168,76,0.3)!important}
        `}</style>
      </div>
    </>
  );
}
