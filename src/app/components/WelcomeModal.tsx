'use client';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    num: '01',
    title: 'Set your intention',
    desc: 'Tell us what you want to manifest',
    highlight: true,
  },
  {
    num: '02',
    title: 'Choose your frequency',
    desc: '528Hz, 396Hz, or other healing frequencies',
    highlight: false,
  },
  {
    num: '03',
    title: 'Clone your voice',
    desc: '30 seconds — AI does the rest',
    highlight: false,
  },
];

export default function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  if (!isOpen) return null;

  const handleBegin = async () => {
    try {
      await fetch('/api/profile/complete-onboarding', { method: 'POST' });
    } catch (err) {
      console.error('[WelcomeModal] complete-onboarding failed:', err);
    } finally {
      onClose();
    }
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: 'rgba(5,12,24,0.55)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          fontFamily: "'Outfit',sans-serif",
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '440px',
            padding: '36px 28px',
            background: 'linear-gradient(160deg,rgba(12,26,46,0.95),rgba(8,16,32,0.98))',
            border: '1px solid rgba(61,142,207,0.12)',
            borderRadius: '24px',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            overflow: 'hidden',
          }}
        >
          {/* Líneas doradas decorativas (igual que /login) */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '15%',
              right: '15%',
              height: '1px',
              background: 'linear-gradient(90deg,transparent,rgba(201,168,76,0.25),transparent)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: '15%',
              right: '15%',
              height: '1px',
              background: 'linear-gradient(90deg,transparent,rgba(201,168,76,0.25),transparent)',
            }}
          />

          {/* Logo small */}
          <p
            style={{
              textAlign: 'center',
              fontSize: '11px',
              letterSpacing: '3px',
              color: 'rgba(201,168,76,0.6)',
              textTransform: 'uppercase',
              margin: '0 0 18px 0',
            }}
          >
            A F I R M I A
          </p>

          {/* Title */}
          <h2
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: '30px',
              fontWeight: 400,
              color: '#fff',
              textAlign: 'center',
              margin: '0 0 8px 0',
              lineHeight: 1.2,
            }}
          >
            Welcome to{' '}
            <span
              style={{
                background: 'linear-gradient(135deg,#c9a84c,#e8d08c)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontStyle: 'italic',
                fontWeight: 600,
              }}
            >
              AFIRMIA
            </span>
          </h2>

          {/* Subtitle */}
          <p
            style={{
              fontSize: '13px',
              fontStyle: 'italic',
              color: 'rgba(255,255,255,0.5)',
              textAlign: 'center',
              margin: '0 0 28px 0',
            }}
          >
            Reprogram your mind in 3 simple steps
          </p>

          {/* Step cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
            {STEPS.map((step) => (
              <div
                key={step.num}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '14px 16px',
                  borderRadius: '14px',
                  background: step.highlight ? 'rgba(201,168,76,0.05)' : 'rgba(255,255,255,0.02)',
                  border: step.highlight
                    ? '1px solid rgba(201,168,76,0.15)'
                    : '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <div
                  style={{
                    flexShrink: 0,
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(201,168,76,0.08)',
                    border: '1px solid rgba(201,168,76,0.2)',
                    fontFamily: "'Cormorant Garamond',serif",
                    fontStyle: 'italic',
                    fontSize: '17px',
                    color: '#c9a84c',
                  }}
                >
                  {step.num}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#fff',
                      margin: '0 0 2px 0',
                    }}
                  >
                    {step.title}
                  </p>
                  <p
                    style={{
                      fontSize: '12px',
                      color: 'rgba(255,255,255,0.45)',
                      margin: 0,
                      lineHeight: 1.4,
                    }}
                  >
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Footer box */}
          <div
            style={{
              padding: '14px 16px',
              borderRadius: '12px',
              background: 'rgba(201,168,76,0.03)',
              border: '1px solid rgba(201,168,76,0.08)',
              marginBottom: '24px',
            }}
          >
            <p
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontStyle: 'italic',
                fontSize: '15px',
                color: 'rgba(255,255,255,0.55)',
                textAlign: 'center',
                margin: 0,
              }}
            >
              After: <span style={{ color: '#c9a84c' }}>Listen daily.</span> Transform in 21 days.
            </p>
          </div>

          {/* CTA */}
          <button
            onClick={handleBegin}
            style={{
              width: '100%',
              padding: '14px',
              border: 'none',
              borderRadius: '12px',
              background: 'linear-gradient(135deg,#c9a84c,#e8d08c)',
              color: '#0a1428',
              fontFamily: "'Outfit',sans-serif",
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'filter 0.3s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.filter = 'brightness(1)')}
          >
            Let&apos;s begin →
          </button>
        </div>
      </div>
    </>
  );
}
