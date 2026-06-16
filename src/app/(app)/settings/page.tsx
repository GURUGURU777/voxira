'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { t } from '@/lib/i18n';

interface Profile { name: string; email: string; avatar: string; voice_audio_url: string | null; plan: string; }

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editName, setEditName] = useState('');
  const [nameDirty, setNameDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lang, setLang] = useState<'en' | 'es'>('en');
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  // Voice preview
  const voiceRef = useRef<HTMLAudioElement>(null);
  const [voicePlaying, setVoicePlaying] = useState(false);

  // Voice recorder modal
  const MIN_RECORDING_SECONDS = 15;
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [savingVoice, setSavingVoice] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recorderChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);

  // Cleanup recorder/stream/timer on unmount so the mic doesn't leak
  useEffect(() => () => {
    if (recordingTimerRef.current !== null) window.clearInterval(recordingTimerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch {}
    }
    mediaStreamRef.current?.getTracks().forEach(t => t.stop());
  }, []);

  useEffect(() => {
    fetch('/api/profile').then(r => r.json()).then(d => {
      setProfile({
        name: d.user?.name || '',
        email: d.user?.email || '',
        avatar: d.user?.avatar || '',
        voice_audio_url: d.profile?.voice_audio_url || null,
        plan: d.profile?.plan || 'free',
      });
      setEditName(d.user?.name || '');
    }).catch(() => {}).finally(() => setLoading(false));
    const saved = localStorage.getItem('voxira-lang');
    if (saved === 'en' || saved === 'es') setLang(saved as 'en' | 'es');
  }, []);

  const handleSaveName = async () => {
    setSaving(true);
    // Note: name is in auth metadata, not profiles. For now just show saved.
    setSaving(false); setNameDirty(false);
  };

  const handleLangChange = (l: 'en' | 'es') => {
    setLang(l);
    localStorage.setItem('voxira-lang', l);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'No se pudo abrir el portal');
        setPortalLoading(false);
      }
    } catch (e) {
      alert('Error al abrir el portal de suscripcion');
      setPortalLoading(false);
    }
  };

  const stopRecorderAndStream = () => {
    if (recordingTimerRef.current !== null) {
      window.clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch {}
    }
    mediaStreamRef.current?.getTracks().forEach(t => t.stop());
    mediaStreamRef.current = null;
  };

  const openVoiceModal = () => {
    setRecordedBlob(null);
    setRecordingTime(0);
    setIsRecording(false);
    setVoiceError(null);
    setShowVoiceModal(true);
  };

  const closeVoiceModal = () => {
    stopRecorderAndStream();
    setShowVoiceModal(false);
    setRecordedBlob(null);
    setRecordingTime(0);
    setIsRecording(false);
    setVoiceError(null);
  };

  const startRecording = async () => {
    setVoiceError(null);
    setRecordedBlob(null);
    setRecordingTime(0);
    recorderChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const mr = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (e) => { if (e.data.size > 0) recorderChunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(recorderChunksRef.current, { type: mimeType });
        setRecordedBlob(blob);
        mediaStreamRef.current?.getTracks().forEach(t => t.stop());
        mediaStreamRef.current = null;
      };
      mr.start();
      setIsRecording(true);
      recordingTimerRef.current = window.setInterval(() => setRecordingTime(t => t + 1), 1000);
    } catch (e) {
      setVoiceError('No se pudo acceder al microfono. Revisa los permisos.');
      stopRecorderAndStream();
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recordingTimerRef.current !== null) {
      window.clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const saveVoice = async () => {
    if (!recordedBlob) return;
    if (recordingTime < MIN_RECORDING_SECONDS) {
      setVoiceError(`Necesitas al menos ${MIN_RECORDING_SECONDS} segundos`);
      return;
    }
    setSavingVoice(true);
    setVoiceError(null);
    try {
      const form = new FormData();
      form.append('audio', recordedBlob, 'recording.webm');
      form.append('name', `VOXIRA-${Date.now()}`);
      const res = await fetch('/api/clone-voice', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Error al guardar voz');
      setProfile(prev => prev ? { ...prev, voice_audio_url: data.voice_audio_url || prev.voice_audio_url } : prev);
      setShowVoiceModal(false);
      setRecordedBlob(null);
      setRecordingTime(0);
      setToast(t(lang, 'Voice updated successfully', 'Voz actualizada exitosamente'));
      window.setTimeout(() => setToast(null), 3000);
    } catch (e) {
      setVoiceError(e instanceof Error ? e.message : 'Error al guardar voz');
    } finally {
      setSavingVoice(false);
    }
  };

  const formatRecTime = (s: number) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

  const initials = profile?.name ? profile.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';

  const card = { background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '14px', padding: '24px', marginBottom: '20px' };
  const label = { fontSize: '10px', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase' as const, letterSpacing: '1.5px', marginBottom: '8px' };

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
      <audio ref={voiceRef} onEnded={() => setVoicePlaying(false)} />
      <div style={{ minHeight: '100vh', padding: '36px 32px', fontFamily: "'Outfit', sans-serif" }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>

          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '34px', fontWeight: 300, color: '#fff', margin: '0 0 32px 0' }}>
            <span style={{ color: '#c9a84c', fontWeight: 400 }}>{t(lang, 'Settings', 'Configuracion')}</span>
          </h1>

          {/* ═══ 1 — PROFILE ═══ */}
          <div style={card}>
            <p style={label}>{t(lang, 'Profile', 'Perfil')}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              {profile?.avatar ? (
                <img src={profile.avatar} alt="" style={{ width: 56, height: 56, borderRadius: '50%', border: '2px solid rgba(201,168,76,0.15)' }} referrerPolicy="no-referrer" />
              ) : (
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(201,168,76,0.08)', border: '2px solid rgba(201,168,76,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#c9a84c' }}>{initials}</div>
              )}
              <div style={{ flex: 1 }}>
                <input value={editName} onChange={e => { setEditName(e.target.value); setNameDirty(e.target.value !== profile?.name); }} style={{
                  width: '100%', background: 'rgba(4,10,22,0.5)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px',
                  padding: '10px 14px', color: '#fff', fontSize: '14px', fontFamily: "'Outfit', sans-serif", outline: 'none', boxSizing: 'border-box',
                }} />
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', margin: '6px 0 0', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile?.email}</p>
              </div>
            </div>
            {nameDirty && (
              <button onClick={handleSaveName} disabled={saving} style={{
                background: 'linear-gradient(135deg, #c9a84c, #dbb960)', color: '#081020', border: 'none', borderRadius: '8px',
                padding: '8px 20px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
              }}>{saving ? t(lang, 'Saving...', 'Guardando...') : t(lang, 'Save changes', 'Guardar cambios')}</button>
            )}
          </div>

          {/* ═══ 2 — VOICE ═══ */}
          <div style={card}>
            <p style={label}>{t(lang, 'Your voice', 'Tu voz')}</p>
            {profile?.voice_audio_url ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button onClick={() => {
                  if (voicePlaying) { voiceRef.current?.pause(); setVoicePlaying(false); }
                  else { if (voiceRef.current) { voiceRef.current.src = profile.voice_audio_url!; voiceRef.current.play().catch(() => {}); } setVoicePlaying(true); }
                }} style={{
                  width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', flexShrink: 0,
                  background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {voicePlaying ? <div style={{ display: 'flex', gap: '2px' }}><div style={{ width: '2px', height: '10px', background: '#22c55e', borderRadius: '1px' }} /><div style={{ width: '2px', height: '10px', background: '#22c55e', borderRadius: '1px' }} /></div>
                  : <div style={{ width: 0, height: 0, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: '9px solid #22c55e', marginLeft: '2px' }} />}
                </button>
                <span style={{ fontSize: '13px', color: '#22c55e', fontWeight: 500 }}>{t(lang, 'Voice saved', 'Voz guardada')}</span>
                <button onClick={openVoiceModal} style={{ marginLeft: 'auto', fontSize: '12px', color: 'rgba(255,255,255,0.3)', background: 'transparent', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>{t(lang, 'Change voice', 'Cambiar voz')}</button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>{t(lang, "You haven't recorded your voice yet", 'No has grabado tu voz aun')}</span>
                <button onClick={openVoiceModal} style={{ fontSize: '12px', color: '#c9a84c', background: 'transparent', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>{t(lang, 'Record my voice', 'Grabar mi voz')}</button>
              </div>
            )}
          </div>

          {/* ═══ 3 — LANGUAGE ═══ */}
          <div style={card}>
            <p style={label}>{t(lang, 'Language', 'Idioma')}</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[{ id: 'es' as const, label: 'Espanol' }, { id: 'en' as const, label: 'English' }].map(l => {
                const sel = lang === l.id;
                return (
                  <button key={l.id} onClick={() => handleLangChange(l.id)} style={{
                    background: sel ? 'rgba(201,168,76,0.08)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${sel ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.05)'}`,
                    borderRadius: '8px', padding: '8px 20px', fontSize: '13px', cursor: 'pointer',
                    color: sel ? '#c9a84c' : 'rgba(255,255,255,0.35)', fontFamily: "'Outfit', sans-serif", fontWeight: sel ? 600 : 400,
                  }}>{l.label}</button>
                );
              })}
            </div>
          </div>

          {/* ═══ 4 — PLANS ═══ */}
          <div style={{ ...card, padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <p style={{ ...label, margin: 0 }}>{t(lang, 'Plans & pricing', 'Plan y precios')}</p>
              <div style={{ display: 'flex', gap: '0', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <button onClick={() => setBilling('monthly')} style={{ padding: '6px 14px', fontSize: '11px', border: 'none', borderRadius: '7px', cursor: 'pointer', fontFamily: "'Outfit', sans-serif", background: billing === 'monthly' ? 'rgba(201,168,76,0.1)' : 'transparent', color: billing === 'monthly' ? '#c9a84c' : 'rgba(255,255,255,0.3)' }}>{t(lang, 'Monthly', 'Mensual')}</button>
                <button onClick={() => setBilling('annual')} style={{ padding: '6px 14px', fontSize: '11px', border: 'none', borderRadius: '7px', cursor: 'pointer', fontFamily: "'Outfit', sans-serif", background: billing === 'annual' ? 'rgba(201,168,76,0.1)' : 'transparent', color: billing === 'annual' ? '#c9a84c' : 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {t(lang, 'Annual', 'Anual')} <span style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', fontSize: '9px', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>-20%</span>
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {/* FREE */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${profile?.plan === 'free' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)'}`, borderRadius: '12px', padding: '20px' }}>
                <div style={{ fontSize: '14px', color: '#fff', fontWeight: 600, marginBottom: '4px' }}>Free</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>$0<span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>{t(lang, '/mo', '/mes')}</span></div>
                {[t(lang,'3 free audios','3 audios gratis'), t(lang,'Max 5 min duration','Duracion max 5 min'), t(lang,'Synthesized sounds','Sonidos sintetizados'), t(lang,'1 frequency per session','1 frecuencia por sesion')].map(f => (
                  <div key={f} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ color: '#22c55e', fontSize: '12px' }}>✓</span>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{f}</span>
                  </div>
                ))}
                <button disabled style={{ marginTop: '14px', width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '10px', fontSize: '12px', color: 'rgba(255,255,255,0.25)', cursor: 'default', fontFamily: "'Outfit', sans-serif" }}>{t(lang, 'Current plan', 'Plan actual')}</button>
              </div>

              {/* PRO */}
              <div style={{ background: 'rgba(201,168,76,0.03)', border: '2px solid rgba(201,168,76,0.2)', borderRadius: '12px', padding: '20px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #c9a84c, #dbb960)', color: '#081020', fontSize: '9px', fontWeight: 700, padding: '3px 12px', borderRadius: '6px', letterSpacing: '1px' }}>MAS POPULAR</div>
                <div style={{ fontSize: '14px', color: '#c9a84c', fontWeight: 600, marginBottom: '4px' }}>Pro</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>
                  ${billing === 'annual' ? '7.99' : '9.99'}<span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>{t(lang, '/mo', '/mes')}</span>
                </div>
                {[t(lang,'20 tracks/month','20 tracks por mes'), t(lang,'Up to 15 min','Duracion hasta 15 min'), t(lang,'Premium ambient sounds','Sonidos ambientales premium'), t(lang,'All frequencies','Todas las frecuencias')].map(f => (
                  <div key={f} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ color: '#22c55e', fontSize: '12px' }}>✓</span>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{f}</span>
                  </div>
                ))}
                {profile?.plan === 'pro' ? (
                <button disabled style={{ marginTop: '14px', width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '10px', fontSize: '12px', color: 'rgba(255,255,255,0.25)', cursor: 'default', fontFamily: "'Outfit', sans-serif" }}>{t(lang, 'Current plan', 'Plan actual')}</button>
              ) : profile?.plan === 'premium' ? (
                <button onClick={handleManageSubscription} disabled={portalLoading} style={{ marginTop: '14px', width: '100%', background: 'transparent', border: '1px solid rgba(201,168,76,0.2)', color: '#c9a84c', borderRadius: '8px', padding: '10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>{portalLoading ? t(lang,'Opening...','Abriendo...') : t(lang,'Manage subscription','Administrar suscripcion')}</button>
              ) : (
                <button onClick={() => router.push('/pricing')} style={{ marginTop: '14px', width: '100%', background: 'linear-gradient(135deg, #c9a84c, #dbb960)', color: '#081020', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>{t(lang, 'Upgrade to Pro', 'Upgrade a Pro')}</button>
              )}
              </div>

              {/* PREMIUM */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px', padding: '20px' }}>
                <div style={{ fontSize: '14px', color: '#fff', fontWeight: 600, marginBottom: '4px' }}>Premium</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>
                  ${billing === 'annual' ? '15.99' : '19.99'}<span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>{t(lang, '/mo', '/mes')}</span>
                </div>
                {[t(lang,'Unlimited tracks','Tracks ilimitados'), t(lang,'Up to 60 min','Duracion hasta 60 min'), t(lang,'21-day AI cycles','Ciclos 21 dias con IA'), t(lang,'Premium sounds','Sonidos premium'), t(lang,'All frequencies','Todas las frecuencias'), t(lang,'Priority support','Soporte prioritario')].map(f => (
                  <div key={f} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ color: '#22c55e', fontSize: '12px' }}>✓</span>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{f}</span>
                  </div>
                ))}
                {profile?.plan === 'premium' ? (
                <button onClick={handleManageSubscription} disabled={portalLoading} style={{ marginTop: '14px', width: '100%', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', color: '#c9a84c', borderRadius: '8px', padding: '10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>{portalLoading ? t(lang,'Opening...','Abriendo...') : t(lang,'Manage subscription','Administrar suscripcion')}</button>
              ) : (
                <button onClick={() => router.push('/pricing')} style={{ marginTop: '14px', width: '100%', background: 'transparent', border: '1px solid rgba(201,168,76,0.2)', color: '#c9a84c', borderRadius: '8px', padding: '10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>{t(lang, 'Upgrade to Premium', 'Upgrade a Premium')}</button>
              )}
              </div>
            </div>
          </div>

          {/* ═══ 5 — ACCOUNT ═══ */}
          <div style={card}>
            <p style={label}>{t(lang, 'Account', 'Cuenta')}</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>{t(lang, 'Log out', 'Cerrar sesion')}</button>
              <button onClick={() => setShowDeleteModal(true)} style={{ background: 'transparent', border: '1px solid rgba(239,68,68,0.1)', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', color: 'rgba(239,68,68,0.5)', cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>{t(lang, 'Delete my account', 'Eliminar mi cuenta')}</button>
            </div>
          </div>

          {/* ═══ 6 — LEGAL ═══ */}
          <div style={card}>
            <p style={label}>{t(lang, 'Legal', 'Legal')}</p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <a href="/terms" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>{t(lang, 'Terms of Service', 'Terminos de Servicio')}</a>
              <a href="/privacy" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>{t(lang, 'Privacy Policy', 'Politica de Privacidad')}</a>
              <a href="mailto:contacto@afirmia.app" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>{t(lang, 'Contact', 'Contacto')}</a>
            </div>
          </div>

          {/* ═══ 7 — SOCIAL ═══ */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '12px', marginBottom: '40px' }}>
            {/* Instagram */}
            <a href="#" style={{ color: 'rgba(255,255,255,0.3)' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></svg></a>
            {/* TikTok */}
            <a href="#" style={{ color: 'rgba(255,255,255,0.3)' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 104 4V4a5 5 0 005 5" /></svg></a>
            {/* YouTube */}
            <a href="#" style={{ color: 'rgba(255,255,255,0.3)' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="4" /><polygon points="10,8 16,12 10,16" fill="currentColor" /></svg></a>
            {/* X/Twitter */}
            <a href="#" style={{ color: 'rgba(255,255,255,0.3)' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l16 16M20 4L4 20" /></svg></a>
          </div>
        </div>
      </div>

      {/* Delete modal */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} onClick={() => setShowDeleteModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#111827', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '16px', padding: '28px', maxWidth: '400px', width: '100%' }}>
            <h3 style={{ fontSize: '18px', color: '#fff', fontWeight: 600, margin: '0 0 10px 0', fontFamily: "'Outfit', sans-serif" }}>{t(lang, 'Delete account', 'Eliminar cuenta')}</h3>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, margin: '0 0 20px 0' }}>
              {t(lang, 'This action is irreversible. All your tracks, cycles and personal data will be deleted.', 'Esta accion es irreversible. Se eliminaran todos tus tracks, ciclos y datos personales.')}
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowDeleteModal(false)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '8px 20px', fontSize: '13px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>{t(lang, 'Cancel', 'Cancelar')}</button>
              <button onClick={() => setShowDeleteModal(false)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '8px 20px', fontSize: '13px', color: '#ef4444', cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>{t(lang, 'Yes, delete', 'Si, eliminar')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Voice recorder modal */}
      {showVoiceModal && (
        <div onClick={() => { if (!isRecording && !savingVoice) closeVoiceModal(); }} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(4,10,22,0.75)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#0b1426', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '16px', padding: '32px', maxWidth: '440px', width: '100%', fontFamily: "'Outfit', sans-serif" }}>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontWeight: 400, color: '#fff', margin: '0 0 6px 0' }}>
              <span style={{ color: '#c9a84c' }}>{t(lang, 'Record', 'Grabar')}</span> {t(lang, 'your voice', 'tu voz')}
            </h3>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '0 0 24px 0', lineHeight: 1.5 }}>
              {t(lang, `Speak for at least ${MIN_RECORDING_SECONDS} seconds in a quiet place.`, `Habla durante al menos ${MIN_RECORDING_SECONDS} segundos en un lugar silencioso.`)}
            </p>

            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '52px', fontWeight: 300, color: isRecording ? '#c9a84c' : recordedBlob ? '#22c55e' : 'rgba(255,255,255,0.15)', letterSpacing: '4px' }}>
                {formatRecTime(recordingTime)}
              </div>
              {isRecording && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }} />
                  <span style={{ fontSize: '10px', color: 'rgba(239,68,68,0.8)', textTransform: 'uppercase', letterSpacing: '2px' }}>{t(lang, 'Recording', 'Grabando')}</span>
                </div>
              )}
              {recordedBlob && !isRecording && (
                <p style={{ fontSize: '12px', color: '#22c55e', margin: '8px 0 0' }}>{t(lang, 'Audio captured', 'Audio capturado')}</p>
              )}
              {isRecording && recordingTime > 0 && recordingTime < MIN_RECORDING_SECONDS && (
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', margin: '6px 0 0' }}>{t(lang, `Min ${MIN_RECORDING_SECONDS}s`, `Minimo ${MIN_RECORDING_SECONDS}s`)}</p>
              )}
            </div>

            {voiceError && (
              <p style={{ fontSize: '12px', color: '#ef4444', textAlign: 'center', margin: '0 0 12px' }}>{voiceError}</p>
            )}

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              {!isRecording && !recordedBlob && (
                <button onClick={startRecording} style={{ background: 'linear-gradient(135deg, #c9a84c, #dbb960)', color: '#081020', border: 'none', borderRadius: '50%', width: '72px', height: '72px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit', sans-serif" }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#081020' }} />
                </button>
              )}
              {isRecording && (
                <button onClick={stopRecording} disabled={recordingTime < MIN_RECORDING_SECONDS} style={{ background: recordingTime < MIN_RECORDING_SECONDS ? 'rgba(239,68,68,0.2)' : '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: '72px', height: '72px', cursor: recordingTime < MIN_RECORDING_SECONDS ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '20px', height: '20px', background: '#fff', borderRadius: '3px' }} />
                </button>
              )}
              {recordedBlob && !isRecording && (
                <button onClick={() => { setRecordedBlob(null); setRecordingTime(0); setVoiceError(null); }} style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px 18px', fontSize: '12px', cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>{t(lang, 'Record again', 'Grabar de nuevo')}</button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={closeVoiceModal} disabled={savingVoice} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', color: 'rgba(255,255,255,0.5)', cursor: savingVoice ? 'default' : 'pointer', fontFamily: "'Outfit', sans-serif" }}>{t(lang, 'Cancel', 'Cancelar')}</button>
              <button onClick={saveVoice} disabled={!recordedBlob || savingVoice || recordingTime < MIN_RECORDING_SECONDS} style={{ background: (!recordedBlob || recordingTime < MIN_RECORDING_SECONDS) ? 'rgba(201,168,76,0.2)' : 'linear-gradient(135deg, #c9a84c, #dbb960)', color: '#081020', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: 600, cursor: (!recordedBlob || savingVoice || recordingTime < MIN_RECORDING_SECONDS) ? 'default' : 'pointer', fontFamily: "'Outfit', sans-serif" }}>{savingVoice ? t(lang,'Saving...','Guardando...') : t(lang,'Save','Guardar')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 200, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '10px', padding: '12px 20px', fontSize: '13px', color: '#22c55e', fontFamily: "'Outfit', sans-serif", backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
          {toast}
        </div>
      )}
    </>
  );
}
