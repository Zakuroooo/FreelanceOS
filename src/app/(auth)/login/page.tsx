'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import Logo from '@/components/ui/Logo'
import AuthRightPanel from '@/components/auth/AuthRightPanel'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })
    setLoading(false)
    if (result?.error) {
      setError('Invalid email or password')
    } else {
      router.push('/dashboard')
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '11px 14px',
    backgroundColor: '#0f0f14',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px',
    color: '#FAFAFA',
    fontSize: '14px',
    fontFamily: 'Inter, sans-serif',
    outline: 'none',
    transition: 'border-color 150ms ease',
    boxSizing: 'border-box' as const,
  }

  const oauthBtnStyle: React.CSSProperties = {
    flex: 1,
    padding: '11px',
    backgroundColor: '#0f0f14',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '13px',
    fontFamily: 'Inter, sans-serif',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'border-color 150ms ease, background 150ms ease',
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        minHeight: '100vh',
      }}
      className="auth-grid"
    >
      {/* Left — Form */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '48px 56px',
          backgroundColor: '#060608',
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: '48px' }}>
          <Logo size="md" />
        </div>

        {/* Heading */}
        <div style={{ marginBottom: '32px' }}>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#FAFAFA',
              letterSpacing: '-0.03em',
              marginBottom: '8px',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Welcome back.
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: 'rgba(255,255,255,0.4)',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Sign in to your FreelanceOS account.
          </p>
        </div>

        {/* OAuth buttons */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
          <button
            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            style={oauthBtnStyle}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)'
              e.currentTarget.style.background = '#161620'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
              e.currentTarget.style.background = '#0f0f14'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>
          <button
            onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
            style={oauthBtnStyle}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)'
              e.currentTarget.style.background = '#161620'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
              e.currentTarget.style.background = '#0f0f14'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            GitHub
          </button>
        </div>

        {/* Divider */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.07)' }} />
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', fontFamily: 'Inter, sans-serif' }}>
            or continue with email
          </span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.07)' }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px', fontFamily: 'Inter, sans-serif', letterSpacing: '0.04em' }}>
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = 'rgba(196,20,37,0.5)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter, sans-serif', letterSpacing: '0.04em' }}>
                PASSWORD
              </label>
              <Link href="/forgot-password" style={{ fontSize: '12px', color: 'rgba(196,20,37,0.7)', textDecoration: 'none', fontFamily: 'Inter, sans-serif' }}>
                Forgot?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                style={{ ...inputStyle, paddingRight: '44px' }}
                onFocus={e => (e.target.style.borderColor = 'rgba(196,20,37,0.5)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'rgba(255,255,255,0.3)',
                  display: 'flex',
                  padding: 0,
                }}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <p style={{ fontSize: '13px', color: '#c41425', fontFamily: 'Inter, sans-serif' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: loading ? 'rgba(196,20,37,0.5)' : '#c41425',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 600,
              fontFamily: 'Inter, sans-serif',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'opacity 150ms ease',
              marginTop: '4px',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        {/* Footer */}
        <p
          style={{
            marginTop: '28px',
            fontSize: '13px',
            color: 'rgba(255,255,255,0.3)',
            fontFamily: 'Inter, sans-serif',
            textAlign: 'center',
          }}
        >
          No account?{' '}
          <Link href="/signup" style={{ color: '#c41425', textDecoration: 'none' }}>
            Sign up free
          </Link>
        </p>
      </div>

      {/* Right — Animated terminal */}
      <AuthRightPanel />

      <style>{`
        @media (max-width: 768px) {
          .auth-grid {
            grid-template-columns: 1fr !important;
          }
          .auth-grid > div:last-child {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
