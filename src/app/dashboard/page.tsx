'use client'

import { useState, useRef, useEffect } from 'react'

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
  { id: 'none', name: 'None', icon: '🔇' },
  { id: 'rain', name: 'Rain', icon: '🌧️' },
  { id: 'ocean', name: 'Ocean', icon: '🌊' },
  { id: 'stream', name: 'Stream', icon: '💧' },
  { id: 'birds', name: 'Birds', icon: '🐦' },
  { id: 'forest', name: 'Forest', icon: '🌲' },
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
  if (g.includes('money') || g.includes('success') || g.includes('million') || g.includes('dinero') || g.includes('exito') || g.includes('abundance')) return 963
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

  useEffect(() => {
    if (goal.length > 20) {
      const rec = recommendFrequency(goal)
      setRecommendedHz(rec)
      setFrequency(rec)
    }
  }, [goal])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data)
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach(t => t.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000)
    } catch (err) {
      alert('Please allow microphone access to record your voice.')
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      setAudioUrl(URL.createObjectURL(file))
    }
  }

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  const canGenerate = (audioBlob || uploadedFile) && recordingTime >= 10 || uploadedFile

  const bg = '#050a18'
  const gold = '#c9a84c'
  const blue = '#4a9eff'
  const border = 'rgba(74,158,255,0.2)'

  return (
    <div style={{ minHeight: '100vh', background: bg, color: 'white', fontFamily: 'Georgia, serif', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <a href="/" style={{ textDecoration: 'none' }}>
          <h1 style={{ fontSize: '2rem', letterSpacing: '0.3em', color: gold, marginBottom: '6px' }}>V O X I R A</h1>
        </a>
        <p style={{ color: blue, fontSize: '0.8rem', letterSpacing: '0.2em' }}>your personal mind reprogramming</p>
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '40px' }}>
        {['goal', 'frequency', 'voice'].map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div onClick={() => i + 1 <= step && setStep(i + 1)} style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: step > i + 1 ? blue : step === i + 1 ? 'rgba(74,158,255,0.2)' : 'transparent',
              border: `1px solid ${step >= i + 1 ? blue : 'rgba(255,255,255,0.2)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.85rem', cursor: i + 1 <= step ? 'pointer' : 'default',
              color: step >= i + 1 ? 'white' : '#555'
            }}>{i + 1}</div>
            <span style={{ fontSize: '0.75rem', color: step === i + 1 ? blue : '#555', letterSpacing: '0.1em' }}>{s}</span>
            {i < 2 && <div style={{ width: '30px', height: '1px', background: step > i + 1 ? blue : '#333' }} />}
          </div>
        ))}
      </div>

      {/* STEP 1: Goal */}
      {step === 1 && (
        <div style={{ width: '100%', maxWidth: '620px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.6rem', color: gold, marginBottom: '8px' }}>what do you want to achieve?</h2>
          <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '24px' }}>be specific — your subconscious responds to detail</p>
          <textarea
            value={goal}
            onChange={e => setGoal(e.target.value)}
            placeholder="I want to wake up every day with unshakeable confidence, feeling worthy of abundance and success in everything I do..."
            style={{
              width: '100%', height: '160px', background: 'rgba(74,158,255,0.04)',
              border: `1px solid ${border}`, borderRadius: '16px', color: 'white',
              padding: '18px', fontSize: '1rem', resize: 'none', outline: 'none',
              marginBottom: '16px', fontFamily: 'Georgia, serif', lineHeight: '1.6'
            }}
          />
          {recommendedHz && (
            <div style={{ padding: '12px 20px', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '10px', marginBottom: '20px', fontSize: '0.85rem', color: gold }}>
              ✨ recommended frequency: <strong>{recommendedHz}Hz</strong> — {frequencies.find(f => f.hz === recommendedHz)?.name}
            </div>
          )}
          <button onClick={() => goal.length > 15 && setStep(2)} style={{
            background: goal.length > 15 ? `linear-gradient(135deg, ${blue}, #1a5aff)` : '#1a1a2e',
            border: 'none', borderRadius: '30px', padding: '14px 44px',
            color: goal.length > 15 ? 'white' : '#444', fontSize: '1rem', cursor: goal.length > 15 ? 'pointer' : 'not-allowed',
            letterSpacing: '0.05em', transition: 'all 0.3s'
          }}>continue →</button>
        </div>
      )}

      {/* STEP 2: Frequency + Ambient */}
      {step === 2 && (
        <div style={{ width: '100%', maxWidth: '720px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.6rem', color: gold, marginBottom: '8px' }}>choose your frequency</h2>
          <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '24px' }}>solfeggio frequencies align your brain with your intention</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '32px' }}>
            {frequencies.map(f => (
              <div key={f.hz} onClick={() => setFrequency(f.hz)} style={{
                padding: '18px 8px', borderRadius: '14px', cursor: 'pointer',
                border: frequency === f.hz ? `1px solid ${blue}` : '1px solid rgba(255,255,255,0.08)',
                background: frequency === f.hz ? 'rgba(74,158,255,0.12)' : 'rgba(255,255,255,0.02)',
                transition: 'all 0.2s', position: 'relative'
              }}>
                {recommendedHz === f.hz && (
                  <div style={{ position: 'absolute', top: '-8px', right: '-8px', background: gold, borderRadius: '10px', padding: '2px 6px', fontSize: '0.6rem', color: '#000' }}>★ rec</div>
                )}
                <div style={{ fontSize: '1.4rem', color: frequency === f.hz ? blue : '#4a7ab5', marginBottom: '4px', fontWeight: 'bold' }}>{f.hz}</div>
                <div style={{ fontSize: '0.75rem', color: frequency === f.hz ? 'white' : '#888', marginBottom: '2px' }}>{f.name}</div>
                <div style={{ fontSize: '0.65rem', color: '#555', fontStyle: 'italic' }}>{f.desc}</div>
              </div>
            ))}
          </div>

          {/* Ambient sounds */}
          <div style={{ marginBottom: '28px' }}>
            <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '14px', letterSpacing: '0.1em' }}>add ambient sound (optional)</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {ambientSounds.map(a => (
                <div key={a.id} onClick={() => setAmbient(a.id)} style={{
                  padding: '10px 16px', borderRadius: '20px', cursor: 'pointer',
                  border: ambient === a.id ? `1px solid ${gold}` : '1px solid rgba(255,255,255,0.1)',
                  background: ambient === a.id ? 'rgba(201,168,76,0.1)' : 'transparent',
                  fontSize: '0.85rem', color: ambient === a.id ? gold : '#666',
                  transition: 'all 0.2s'
                }}>{a.icon} {a.name}</div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={() => setStep(1)} style={{ background: 'transparent', border: '1px solid #222', borderRadius: '30px', padding: '12px 28px', color: '#555', cursor: 'pointer' }}>← back</button>
            <button onClick={() => setStep(3)} style={{ background: `linear-gradient(135deg, ${blue}, #1a5aff)`, border: 'none', borderRadius: '30px', padding: '12px 36px', color: 'white', fontSize: '1rem', cursor: 'pointer' }}>continue →</button>
          </div>
        </div>
      )}

      {/* STEP 3: Voice */}
      {step === 3 && (
        <div style={{ width: '100%', maxWidth: '620px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.6rem', color: gold, marginBottom: '8px' }}>record your voice</h2>
          <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '24px' }}>10 seconds minimum — speak naturally and clearly</p>

          <div style={{ background: 'rgba(74,158,255,0.04)', border: `1px solid ${border}`, borderRadius: '20px', padding: '36px', marginBottom: '20px' }}>

            {/* Timer */}
            <div style={{ fontSize: '2.5rem', fontFamily: 'monospace', color: isRecording ? '#ff4444' : recordingTime > 0 ? blue : '#333', marginBottom: '20px', letterSpacing: '0.1em' }}>
              {formatTime(recordingTime)}
            </div>

            {/* Mic button */}
            <div onClick={isRecording ? stopRecording : startRecording} style={{
              width: '90px', height: '90px', borderRadius: '50%', margin: '0 auto 16px',
              background: isRecording ? 'rgba(255,68,68,0.15)' : 'rgba(74,158,255,0.08)',
              border: isRecording ? '2px solid #ff4444' : `2px solid ${blue}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2.2rem', cursor: 'pointer', transition: 'all 0.3s',
              boxShadow: isRecording ? '0 0 20px rgba(255,68,68,0.3)' : 'none'
            }}>🎙️</div>

            <p style={{ color: isRecording ? '#ff4444' : recordingTime >= 10 ? '#44ff88' : blue, fontSize: '0.9rem', marginBottom: '16px' }}>
              {isRecording ? '● recording... tap to stop' : recordingTime >= 10 ? '✓ voice captured — ready to generate' : recordingTime > 0 ? `${10 - recordingTime}s more needed` : 'tap to start recording'}
            </p>

            {/* Playback */}
            {audioUrl && !isRecording && (
              <audio controls src={audioUrl} style={{ width: '100%', marginBottom: '12px', borderRadius: '8px' }} />
            )}

            {/* Minimum warning */}
            {recordingTime > 0 && recordingTime < 10 && !isRecording && (
              <p style={{ color: '#ff8844', fontSize: '0.8rem' }}>⚠️ record at least 10 seconds for best results</p>
            )}
          </div>

          {/* Upload option */}
          <div style={{ marginBottom: '24px' }}>
            <p style={{ color: '#444', fontSize: '0.8rem', marginBottom: '10px' }}>— or upload an audio file —</p>
            <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileUpload} style={{ display: 'none' }} />
            <button onClick={() => fileInputRef.current?.click()} style={{
              background: 'transparent', border: '1px solid #333', borderRadius: '20px',
              padding: '10px 24px', color: '#666', cursor: 'pointer', fontSize: '0.85rem'
            }}>
              {uploadedFile ? `✓ ${uploadedFile.name}` : '📁 upload voice file'}
            </button>
          </div>

          {/* Summary */}
          <div style={{ padding: '14px 20px', background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '12px', marginBottom: '24px', fontSize: '0.8rem', color: '#666', textAlign: 'left' }}>
            <div style={{ marginBottom: '4px' }}><span style={{ color: blue }}>goal:</span> {goal.substring(0, 70)}{goal.length > 70 ? '...' : ''}</div>
            <div style={{ marginBottom: '4px' }}><span style={{ color: blue }}>frequency:</span> {frequency}Hz — {frequencies.find(f => f.hz === frequency)?.name}</div>
            <div><span style={{ color: blue }}>ambient:</span> {ambientSounds.find(a => a.id === ambient)?.icon} {ambientSounds.find(a => a.id === ambient)?.name}</div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={() => setStep(2)} style={{ background: 'transparent', border: '1px solid #222', borderRadius: '30px', padding: '12px 28px', color: '#555', cursor: 'pointer' }}>← back</button>
            <button
              disabled={!canGenerate && !uploadedFile}
              onClick={() => setIsGenerating(true)}
              style={{
                background: (canGenerate || uploadedFile) ? `linear-gradient(135deg, ${gold}, #a07830)` : '#1a1a2e',
                border: 'none', borderRadius: '30px', padding: '14px 44px',
                color: (canGenerate || uploadedFile) ? 'white' : '#444',
                fontSize: '1rem', cursor: (canGenerate || uploadedFile) ? 'pointer' : 'not-allowed',
                letterSpacing: '0.05em'
              }}>
              {isGenerating ? '⏳ generating your audio...' : '✨ generate my audio'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
