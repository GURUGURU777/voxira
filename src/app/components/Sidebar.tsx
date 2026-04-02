'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  plan: string;
  credits: number;
  tracks_count: number;
}

const NAV_ITEMS = [
  { label: 'Inicio', icon: '\u2302', href: '/dashboard' },
  { label: 'Crear', icon: '\u2726', href: '/dashboard' },
  { label: 'Biblioteca', icon: '\u266B', href: '/library', hasBadge: true },
  { label: 'Ciclos 21 d\u00edas', icon: '\u25CE', href: '#', disabled: true },
  { label: 'Estad\u00edsticas', icon: '\u25C8', href: '#', disabled: true },
];

const BOTTOM_ITEMS = [
  { label: 'Configuraci\u00f3n', icon: '\u2699', href: '#', disabled: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(data => {
        setProfile({
          name: data.user?.name || data.user?.email || '',
          email: data.user?.email || '',
          avatar: data.user?.avatar || '',
          plan: data.profile?.plan || 'free',
          credits: data.profile?.credits ?? 0,
          tracks_count: data.profile?.tracks_count ?? 0,
        });
      })
      .catch(() => {});
  }, []);

  const initials = profile?.name
    ? profile.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const maxTracks = profile?.plan === 'pro' ? 100 : 5;
  const tracksUsed = profile?.tracks_count ?? 0;
  const progressPct = Math.min((tracksUsed / maxTracks) * 100, 100);

  return (
    <aside style={{
      width: 230,
      minHeight: '100vh',
      background: '#080c18',
      borderRight: '1px solid rgba(201,168,76,0.06)',
      display: 'flex',
      flexDirection: 'column',
      padding: '28px 0',
      fontFamily: "'Outfit', sans-serif",
      flexShrink: 0,
    }}>
      {/* Logo */}
      <a href="/dashboard" style={{ textDecoration: 'none', padding: '0 24px', marginBottom: 40 }}>
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 18,
          fontWeight: 300,
          color: '#fff',
          letterSpacing: 10,
          textAlign: 'center',
        }}>
          VOXIRA
        </div>
        <div style={{
          height: 1,
          marginTop: 16,
          background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.15), transparent)',
        }} />
      </a>

      {/* Main nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '0 12px' }}>
          {NAV_ITEMS.map(item => {
            const isActive = item.href !== '#' && pathname.startsWith(item.href);
            return (
              <a
                key={item.label}
                href={item.disabled ? undefined : item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '11px 14px',
                  borderRadius: 10,
                  marginBottom: 2,
                  textDecoration: 'none',
                  cursor: item.disabled ? 'default' : 'pointer',
                  background: isActive ? 'rgba(201,168,76,0.07)' : 'transparent',
                  transition: 'background 0.2s',
                }}
              >
                <span style={{
                  fontSize: 16,
                  width: 22,
                  textAlign: 'center',
                  color: isActive ? '#c9a84c' : 'rgba(255,255,255,0.2)',
                  opacity: item.disabled ? 0.3 : 1,
                }}>
                  {item.icon}
                </span>
                <span style={{
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#c9a84c' : item.disabled ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.35)',
                  letterSpacing: 0.3,
                }}>
                  {item.label}
                </span>
                {item.hasBadge && tracksUsed > 0 && (
                  <span style={{
                    marginLeft: 'auto',
                    background: 'rgba(201,168,76,0.12)',
                    color: '#c9a84c',
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: 8,
                  }}>
                    {tracksUsed}
                  </span>
                )}
                {item.disabled && (
                  <span style={{
                    marginLeft: 'auto',
                    fontSize: 9,
                    color: 'rgba(255,255,255,0.12)',
                    fontWeight: 500,
                    letterSpacing: 0.5,
                  }}>
                    PRONTO
                  </span>
                )}
              </a>
            );
          })}
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Divider */}
        <div style={{
          height: 1,
          margin: '0 24px 8px',
          background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.06), transparent)',
        }} />

        {/* Bottom nav */}
        <div style={{ padding: '0 12px' }}>
          {BOTTOM_ITEMS.map(item => (
            <a
              key={item.label}
              href={item.disabled ? undefined : item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '11px 14px',
                borderRadius: 10,
                textDecoration: 'none',
                cursor: item.disabled ? 'default' : 'pointer',
              }}
            >
              <span style={{ fontSize: 16, width: 22, textAlign: 'center', color: 'rgba(255,255,255,0.2)', opacity: item.disabled ? 0.3 : 1 }}>
                {item.icon}
              </span>
              <span style={{ fontSize: 13, color: item.disabled ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.35)', letterSpacing: 0.3 }}>
                {item.label}
              </span>
              {item.disabled && (
                <span style={{ marginLeft: 'auto', fontSize: 9, color: 'rgba(255,255,255,0.12)', fontWeight: 500, letterSpacing: 0.5 }}>
                  PRONTO
                </span>
              )}
            </a>
          ))}
        </div>

        {/* Plan card */}
        <div style={{
          margin: '12px 14px',
          padding: '16px',
          background: 'rgba(201,168,76,0.03)',
          border: '1px solid rgba(201,168,76,0.08)',
          borderRadius: 12,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(201,168,76,0.6)', letterSpacing: 1.5, textTransform: 'uppercase' }}>
              {profile?.plan === 'pro' ? 'Pro' : 'Free'}
            </span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>
              {tracksUsed}/{maxTracks}
            </span>
          </div>
          {/* Progress bar */}
          <div style={{ height: 3, background: 'rgba(255,255,255,0.04)', borderRadius: 2, marginBottom: 10 }}>
            <div style={{
              height: '100%',
              width: `${progressPct}%`,
              background: 'linear-gradient(90deg, #c9a84c, #dbb960)',
              borderRadius: 2,
              transition: 'width 0.5s ease',
            }} />
          </div>
          {profile?.plan !== 'pro' && (
            <a href="#" style={{
              fontSize: 11,
              color: '#c9a84c',
              textDecoration: 'none',
              fontWeight: 500,
              opacity: 0.7,
            }}>
              Upgrade a Pro
            </a>
          )}
        </div>

        {/* User profile */}
        <div style={{
          margin: '4px 14px 0',
          padding: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          borderRadius: 10,
        }}>
          {profile?.avatar ? (
            <img
              src={profile.avatar}
              alt=""
              style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid rgba(201,168,76,0.15)' }}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'rgba(201,168,76,0.08)',
              border: '1px solid rgba(201,168,76,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 700,
              color: '#c9a84c',
            }}>
              {initials}
            </div>
          )}
          <div style={{ overflow: 'hidden' }}>
            <div style={{
              fontSize: 12,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.6)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {profile?.name || '...'}
            </div>
            <div style={{
              fontSize: 10,
              color: 'rgba(255,255,255,0.15)',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}>
              {profile?.plan === 'pro' ? 'Pro' : 'Free plan'}
            </div>
          </div>
        </div>
      </nav>
    </aside>
  );
}
