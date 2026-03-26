'use client'

import { useState } from 'react'

export default function Dashboard() {
  const [step, setStep] = useState(1)
  const [goal, setGoal] = useState('')
  const [frequency, setFrequency] = useState(528)
  const [isRecording, setIsRecording] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const frequencies = [
    { hz: 396, name: 'Liberation' },
    { hz: 417, name: 'Change' },
    { hz: 432, name: 'Harmony' },
    { hz: 528, name: 'Miracle' },
    { hz: 639, name: 'Connection' },
    { hz: 741, name: 'Expression' },
    { hz: 852, name: 'Intuition' },
    { hz: 963, name: 'Crown' },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: '#050a18',
      color: 'white',
      fontFamily: 'Georgia, serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px 20px'
    }}>
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', letterSpacing: '0.3em', color: '#c9a84c', marginBottom: '8px' }}>
          V O X I R A
        </h1>
        <p style={{ color: '#4a9eff', fontSize: '0.8rem', letterSpacing: '0.2em' }}>
          your personal mind reprogramming
        </p>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
        {[1, 2, 3].map(s => (
          <div key={s} style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: step >= s ? '#4a9eff' : 'transparent',
            border: '1px solid #4a9eff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.9rem', cursor: 'pointer'
          }} onClick={() => setStep(s)}>{s}</div>
        ))}
      </div>

      {step === 1 && (
        <div style={{ width: '100%', maxWidth: '600px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '10px', color: '#c9a84c' }}>
            what do you want to achieve?
          </h2>
          <p style={{ color: '#888', marginBottom: '30px', fontSize: '0.9rem' }}>
            be specific — your subconscious responds to detail
          </p>
          <textarea
            value={goal}
            onChange={e => setGoal(e.target.value)}
            placeholder="I want to wake up every day with confidence and excitement..."
            style={{
              width: '100%', height: '150px', background: 'rgba(74,158,255,0.05)',
              border: '1px solid rgba(74,158,255,0.3)', borderRadius: '12px',
              color: 'white', padding: '16px', fontSize: '1rem',
              resize: 'none', outline: 'none', marginBottom: '20px',
              fontFamily: 'Georgia, serif'
            }}
          />
          <button
            onClick={() => goal.length > 10 && setStep(2)}
            style={{
              background: goal.length > 10 ? 'linear-gradient(135deg, #4a9eff, #1a5aff)' : '#333',
              border: 'none', borderRadius: '30px', padding: '14px 40px',
              color: 'white', fontSize: '1rem', cursor: 'pointer'
            }}>
            continue →
          </button>
        </div>
      )}

      {step === 2 && (
        <div style={{ width: '100%', maxWidth: '700px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '10px', color: '#c9a84c' }}>
            choose your frequency
          </h2>
          <p style={{ color: '#888', marginBottom: '30px', fontSize: '0.9rem' }}>
            solfeggio frequencies align your brain with your intention
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '30px' }}>
            {frequencies.map(f => (
              <div key={f.hz} onClick={() => setFrequency(f.hz)} style={{
                padding: '20px 10px', borderRadius: '12px', cursor: 'pointer',
                border: frequency === f.hz ? '1px solid #4a9eff' : '1px solid rgba(255,255,255,0.1)',
                background: frequency === f.hz ? 'rgba(74,158,255,0.15)' : 'transparent'
              }}>
                <div style={{ fontSize: '1.5rem', color: '#4a9eff', marginBottom: '4px' }}>{f.hz}</div>
                <div style={{ fontSize: '0.75rem', color: '#888', fontStyle: 'italic' }}>{f.name}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={() => setStep(1)} style={{
              background: 'transparent', border: '1px solid #333', borderRadius: '30px',
              padding: '14px 30px', color: '#888', cursor: 'pointer'
            }}>← back</button>
            <button onClick={() => setStep(3)} style={{
              background: 'linear-gradient(135deg, #4a9eff, #1a5aff)',
              border: 'none', borderRadius: '30px', padding: '14px 40px',
              color: 'white', fontSize: '1rem', cursor: 'pointer'
            }}>continue →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div style={{ width: '100%', maxWidth: '600px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '10px', color: '#c9a84c' }}>
            record your voice
          </h2>
          <p style={{ color: '#888', marginBottom: '30px', fontSize: '0.9rem' }}>
            30 seconds is enough — speak naturally
          </p>
          <div style={{
            background: 'rgba(74,158,255,0.05)', border: '1px solid rgba(74,158,255,0.2)',
            borderRadius: '20px', padding: '40px', marginBottom: '30px'
          }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 20px',
              background: isRecording ? 'rgba(255,50,50,0.2)' : 'rgba(74,158,255,0.1)',
              border: isRecording ? '2px solid #ff3232' : '2px solid #4a9eff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', cursor: 'pointer'
            }} onClick={() => setIsRecording(!isRecording)}>
              🎙️
            </div>
            <p style={{ color: isRecording ? '#ff3232' : '#4a9eff', fontSize: '0.9rem' }}>
              {isRecording ? '● recording... tap to stop' : 'tap to start recording'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={() => setStep(2)} style={{
              background: 'transparent', border: '1px solid #333', borderRadius: '30px',
              padding: '14px 30px', color: '#888', cursor: 'pointer'
            }}>← back</button>
            <button onClick={() => setIsGenerating(true)} style={{
              background: 'linear-gradient(135deg, #c9a84c, #a07830)',
              border: 'none', borderRadius: '30px', padding: '14px 40px',
              color: 'white', fontSize: '1rem', cursor: 'pointer'
            }}>
              {isGenerating ? 'generating...' : '✨ generate my audio'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
