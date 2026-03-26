'use client'

import { useState, useRef } from 'react'

const frequencies = [
  { hz: 396, name: 'Liberation', desc: 'release fear & guilt' },
  { hz: 417, name: 'Change', desc: 'break old patterns' },
  { hz: 432, name: 'Harmony', desc: 'natural alignment' },
  { hz: 528, name: 'Miracle', desc: 'DNA repair & love' },
  { hz: 639, name: 'Connection', desc: 'relationships & heart' },
  { hz: 741, name: 'Expression', desc: 'speak your truth' },
  { hz: 852, name: 'Intuition', desc: 'third eye activation' },
  { hz: 963, name: 'Crown', desc: 'divine connection' },
]

const ambientSounds = [
  { id: 'none', name: 'silence', icon: '○' },
  { id: 'rain', name: 'rain', icon: '◌' },
  { id: 'ocean', name: 'ocean', icon: '◌' },
  { id: 'stream', name: 'stream', icon: '◌' },
  { id: 'birds', name: 'birds', icon: '◌' },
  { id: 'forest', name: 'forest', icon: '◌' },
]

function recommendFrequency(goal: string): number {
  const g = goal.toLowerCase()
  if (g.includes('fear') || g.includes('anxiety') || g.includes('guilt') || g.includes('miedo') || g.includes('culpa')) return 396
  if (g.includes('change') || g.includes('habit') || g.includes('quit') || g.includes('stop') || g.includes('cambiar') || g.includes('dejar')) return 417
  if (g.includes('peace') || g.includes('balance') || g.includes('paz') || g.includes('equilibrio')) return 432
  if (g.includes('love') || g.includes('health') || g.includes('heal') || g.includes('amor') || g.includes('salud')) return 528
  if (g.includes('relationship') || g.includes('friend') || g.includes('family') || g.includes('relacion') || g.includes('familia')) return 639
  if (g.includes('confidence') || g.includes('speak') || g.includes('confianza') || g.includes('hablar')) return 741
  if (g.includes('intuition') || g.includes('spiritual') || g.includes('intuicion') || g.includes('espiritual')) return 852
  if (g.includes('money') || g.includes('success') || g.includes('million') || g.includes('dinero') || g.includes('exito') || g.includes('abundance') || g.includes('millonare') || g.includes('millonario')) return 963
  return 528
}

export default function Dashboard() {
  const [step, setStep] = useState(1)
  const [goal, setGoal] = useState('')
  const [frequency, setFrequency] = useState(528)
  const [recommendedHz, setRecommendedHz] = useState<number | null>(null)
  const [ambient, setAmbient] = useState('none')
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleGoalChange = (val: string) => {
    setGoal(val)
    if (val.length > 20) {
      const rec = recommendFrequency(val)
      setRecommendedHz(rec)
      setFrequency(rec)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []
      mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data)
      mediaRecorder.onstop = () => {
        if (timerRef.current) clearInterval(timerRef.current)
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach(t => t.stop())
      }
      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000)
    } catch {
      alert('Please allow microphone access to record your voice.')
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      setAudioUrl(URL.createObjectURL(file))
      setRecordingTime(30)
    }
  }

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`
  const canGenerate = (audioBlob && recordingTime >= 10) || uploadedFile

  return (
    <div style={{
      minHeight: '100vh',
      background: '#02050f',
      color: 'white',
      fontFamily: "'Georgia', serif",
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: '60px 24px',
    }}>

      {/* Logo */}
      <a href="/" style={{ textDecoration: 'none', marginBottom: '60px' }}>
        <p style={{ color: '#c9a84c', letterSpacing: '0.4em', fontSize: '0.85rem', textAlign: 'center' }}>V O X I R A</p>
      </a>

      {/* Step indicator — minimal dots */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '60px' }}>
        {[1, 2, 3].map(s => (
          <div key={s} style={{
            width: s === step ? '24px' : '6px',
            height: '6px',
            borderRadius: '3px',
            background: s === step ? '#4a9eff' : s < step ? '#1a4a8a' : '#111',
            transition: 'all 0.4s ease',
            cursor: s <= step ? 'pointer' : 'default'
          }} onClick={() => s <= step && setStep(s)} />
        ))}
      </div>

      {/* STEP 1 — Intent */}
      {step === 1 && (
        <div style={{ width: '100%', maxWidth: '560px', textAlign: 'center' }}>
          <p style={{ color: '#4a9eff', fontSize: '0.7rem', letterSpacing: '0.3em', marginBottom: '16px', textTransform: 'uppercase' }}>step one</p>
          <h2 style={{ fontSize: '1.8rem', color: 'white', marginBottom: '8px', fontWeight: 'normal', lineHeight: '1.3' }}>
            set your intention
          </h2>
          <p style={{ color: '#333', fontSize: '0.9rem', marginBottom: '36px' }}>
            the more specific, the deeper the reprogramming
          </p>
          <textarea
            value={goal}
            onChange={e => handleGoalChange(e.target.value)}
            placeholder="I want to..."
            style={{
              width: '100%', height: '140px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '4px', color: 'white',
              padding: '20px', fontSize: '1.05rem',
              resize: 'none', outline: 'none',
              fontFamily: 'Georgia, serif',
              lineHeight: '1.7', marginBottom: '16px',
              transition: 'border 0.3s'
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(74,158,255,0.3)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
          />
          {recommendedHz && (
            <p style={{ color: '#c9a84c', fontSize: '0.78rem', letterSpacing: '0.1em', marginBottom: '24px' }}>
              ✦ {recommendedHz}Hz recommended — {frequencies.find(f => f.hz === recommendedHz)?.name}
            </p>
          )}
          <button
            onClick={() => goal.length > 15 && setStep(2)}
            style={{
              background: 'none', border: 'none',
              color: goal.length > 15 ? '#4a9eff' : '#222',
              fontSize: '0.9rem', cursor: goal.length > 15 ? 'pointer' : 'not-allowed',
              letterSpacing: '0.15em', padding: '8px 0',
              borderBottom: `1px solid ${goal.length > 15 ? '#4a9eff' : '#222'}`,
              transition: 'all 0.3s'
            }}>
            continue
          </button>
        </div>
      )}

      {/* STEP 2 — Frequency */}
      {step === 2 && (
        <div style={{ width: '100%', maxWidth: '640px', textAlign: 'center' }}>
          <p style={{ color: '#4a9eff', fontSize: '0.7rem', letterSpacing: '0.3em', marginBottom: '16px', textTransform: 'uppercase' }}>step two</p>
          <h2 style={{ fontSize: '1.8rem', color: 'white', marginBottom: '8px', fontWeight: 'normal' }}>
            choose your frequency
          </h2>
          <p style={{ color: '#333', fontSize: '0.9rem', marginBottom: '40px' }}>
            binaural waves will be tuned to your selection
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', overflow: 'hidden', marginBottom: '40px' }}>
            {frequencies.map(f => (
              <div key={f.hz} onClick={() => setFrequency(f.hz)} style={{
                padding: '20px 8px', cursor: 'pointer',
                background: frequency === f.hz ? 'rgba(74,158,255,0.08)' : '#02050f',
                transition: 'all 0.2s', position: 'relative'
              }}>
                {recommendedHz === f.hz && (
                  <div style={{ position: 'absolute', top: '6px', right: '6px', width: '4px', height: '4px', borderRadius: '50%', background: '#c9a84c' }} />
                )}
                <div style={{ fontSize: '1.3rem', color: frequency === f.hz ? '#4a9eff' : '#2a4a6a', marginBottom: '6px' }}>{f.hz}</div>
                <div style={{ fontSize: '0.7rem', color: frequency === f.hz ? '#aaa' : '#333', letterSpacing: '0.05em' }}>{f.name}</div>
              </div>
            ))}
          </div>

          {/* Ambient */}
          <div style={{ marginBottom: '40px' }}>
            <p style={{ color: '#222', fontSize: '0.75rem', letterSpacing: '0.2em', marginBottom: '16px', textTransform: 'uppercase' }}>ambient layer</p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {ambientSounds.map(a => (
                <button key={a.id} onClick={() => setAmbient(a.id)} style={{
                  background: 'none',
                  border: `1px solid ${ambient === a.id ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: '2px', padding: '8px 16px',
                  color: ambient === a.id ? '#c9a84c' : '#333',
                  fontSize: '0.8rem', cursor: 'pointer', letterSpacing: '0.1em',
                  transition: 'all 0.2s'
                }}>{a.name}</button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '40px', justifyContent: 'center' }}>
            <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#222', cursor: 'pointer', fontSize: '0.85rem', letterSpacing: '0.1em' }}>← back</button>
            <button onClick={() => setStep(3)} style={{ background: 'none', border: 'none', color: '#4a9eff', cursor: 'pointer', fontSize: '0.85rem', letterSpacing: '0.15em', borderBottom: '1px solid #4a9eff', paddingBottom: '2px' }}>continue</button>
          </div>
        </div>
      )}

      {/* STEP 3 — Voice */}
      {step === 3 && (
        <div style={{ width: '100%', maxWidth: '520px', textAlign: 'center' }}>
          <p style={{ color: '#4a9eff', fontSize: '0.7rem', letterSpacing: '0.3em', marginBottom: '16px', textTransform: 'uppercase' }}>step three</p>
          <h2 style={{ fontSize: '1.8rem', color: 'white', marginBottom: '8px', fontWeight: 'normal' }}>
            your voice
          </h2>
          <p style={{ color: '#333', fontSize: '0.9rem', marginBottom: '48px' }}>
            10 seconds minimum — speak clearly and naturally
          </p>

          {/* Timer display */}
          <div style={{ fontSize: '3rem', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '32px', color: isRecording ? '#ff4444' : recordingTime >= 10 ? '#44bb66' : '#1a2a3a' }}>
            {formatTime(recordingTime)}
          </div>

          {/* Mic */}
          <div onClick={isRecording ? stopRecording : startRecording} style={{
            width: '72px', height: '72px', borderRadius: '50%',
            margin: '0 auto 20px',
            border: `1px solid ${isRecording ? '#ff4444' : recordingTime >= 10 ? '#44bb66' : 'rgba(74,158,255,0.3)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.6rem', cursor: 'pointer',
            background: isRecording ? 'rgba(255,68,68,0.05)' : 'transparent',
            transition: 'all 0.3s'
          }}>🎙️</div>

          <p style={{ fontSize: '0.8rem', letterSpacing: '0.1em', color: isRecording ? '#ff4444' : recordingTime >= 10 ? '#44bb66' : '#333', marginBottom: '32px' }}>
            {isRecording ? '● recording' : recordingTime >= 10 ? '✓ ready' : recordingTime > 0 ? `${10 - recordingTime}s more` : 'tap to record'}
          </p>

          {audioUrl && !isRecording && (
            <audio controls src={audioUrl} style={{ width: '100%', marginBottom: '24px', opacity: 0.7 }} />
          )}

          {/* Upload */}
          <div style={{ marginBottom: '40px' }}>
            <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileUpload} style={{ display: 'none' }} />
            <button onClick={() => fileInputRef.current?.click()} style={{
              background: 'none', border: 'none', color: '#222',
              cursor: 'pointer', fontSize: '0.78rem', letterSpacing: '0.15em',
              borderBottom: '1px solid #1a1a1a', paddingBottom: '2px'
            }}>
              {uploadedFile ? `✓ ${uploadedFile.name}` : 'or upload a file'}
            </button>
          </div>

          {/* Summary */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '20px', marginBottom: '32px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#222', fontSize: '0.75rem', letterSpacing: '0.1em' }}>INTENTION</span>
              <span style={{ color: '#555', fontSize: '0.8rem', maxWidth: '280px', textAlign: 'right' }}>{goal.substring(0, 50)}{goal.length > 50 ? '...' : ''}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#222', fontSize: '0.75rem', letterSpacing: '0.1em' }}>FREQUENCY</span>
              <span style={{ color: '#555', fontSize: '0.8rem' }}>{frequency}Hz — {frequencies.find(f => f.hz === frequency)?.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#222', fontSize: '0.75rem', letterSpacing: '0.1em' }}>AMBIENT</span>
              <span style={{ color: '#555', fontSize: '0.8rem' }}>{ambient}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '40px', justifyContent: 'center', alignItems: 'center' }}>
            <button onClick={() => setStep(2)} style={{ background: 'none', border: 'none', color: '#222', cursor: 'pointer', fontSize: '0.85rem', letterSpacing: '0.1em' }}>← back</button>
            <button
              disabled={!canGenerate}
              onClick={() => canGenerate && setIsGenerating(true)}
              style={{
                background: canGenerate ? 'rgba(201,168,76,0.1)' : 'none',
                border: `1px solid ${canGenerate ? 'rgba(201,168,76,0.4)' : '#111'}`,
                borderRadius: '2px', padding: '12px 32px',
                color: canGenerate ? '#c9a84c' : '#1a1a1a',
                fontSize: '0.85rem', cursor: canGenerate ? 'pointer' : 'not-allowed',
                letterSpacing: '0.2em', transition: 'all 0.3s'
              }}>
              {isGenerating ? 'generating...' : 'generate'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
