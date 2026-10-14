'use client'

/**
 * Settings — email sending.
 *
 * This page exists because Gmail cannot be the only way to send. `gmail.send` is one of
 * Google's *restricted* scopes, so while the OAuth app's publishing status is "Testing" only
 * accounts on a hand-maintained test-user list can connect a mailbox, and reaching Production
 * needs OAuth verification plus an annual paid third-party security assessment. Everyone else
 * gets `403 access_denied` on connect while sign-in keeps working, because sign-in only asks
 * for the non-sensitive scopes.
 *
 * SMTP is the door that is always open, so it is presented as an equal option rather than a
 * fallback buried under a warning.
 */

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail, Server, Check, X, Loader2, Zap, Trash2, ShieldCheck, ChevronDown, AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { WorkspaceCard } from '@/components/settings/WorkspaceCard'

interface GmailStatus {
  connected: boolean
  gmailAddress?: string
  connectedAt?: string
}

interface SmtpStatus {
  connected: boolean
  host?: string
  port?: number
  secure?: boolean
  user?: string
  fromAddress?: string
  connectedAt?: string
}

/**
 * Host and port for the providers people actually have. Filling these in by hand is where
 * this form goes wrong most often — a wrong port produces a connection that just hangs.
 *
 * `note` is the part users do not expect: on every provider with 2FA available, the password
 * this form wants is an app-specific one, not the account password.
 */
const PRESETS: Array<{ name: string; host: string; port: number; note: string }> = [
  { name: 'Gmail / Google Workspace', host: 'smtp.gmail.com',            port: 465, note: 'Needs an App Password from your Google account — your normal password will be rejected.' },
  { name: 'Outlook / Hotmail',        host: 'smtp-mail.outlook.com',     port: 587, note: 'Needs an app password if you have two-step verification on.' },
  { name: 'Zoho Mail',                host: 'smtp.zoho.com',             port: 465, note: 'Generate an app-specific password under Security → App Passwords.' },
  { name: 'Yahoo Mail',               host: 'smtp.mail.yahoo.com',       port: 465, note: 'Needs an app password — Yahoo blocks plain account passwords.' },
  { name: 'Brevo (Sendinblue)',       host: 'smtp-relay.brevo.com',      port: 587, note: 'Use your SMTP key, not your login password.' },
  { name: 'Mailgun',                  host: 'smtp.mailgun.org',          port: 587, note: 'Use the SMTP credentials from your sending domain.' },
  { name: 'SendGrid',                 host: 'smtp.sendgrid.net',         port: 587, note: 'Username is literally "apikey"; the password is your API key.' },
]

const PORTS = [
  { value: 587, label: '587 — STARTTLS (most common)' },
  { value: 465, label: '465 — SSL / implicit TLS' },
  { value: 2525, label: '2525 — alternate' },
  { value: 25, label: '25 — usually blocked' },
]

/* ── Shared style fragments, lifted so the two cards cannot drift apart ── */

const CARD: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
  padding: 24,
}

const LABEL: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)',
  textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, display: 'block',
}

const INPUT: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
  padding: '10px 12px', color: '#FAFAFA', fontSize: 13,
  outline: 'none', boxSizing: 'border-box',
}

export default function SettingsPage() {
  const [gmail, setGmail] = useState<GmailStatus | null>(null)
  const [smtp, setSmtp] = useState<SmtpStatus | null>(null)

  const [form, setForm] = useState({ host: '', port: 587, user: '', pass: '', fromAddress: '' })
  const [presetOpen, setPresetOpen] = useState(false)
  const [presetNote, setPresetNote] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/gmail/status').then(r => r.json()).then(setGmail).catch(() => setGmail({ connected: false }))
    fetch('/api/settings/smtp').then(r => r.json()).then(setSmtp).catch(() => setSmtp({ connected: false }))
  }, [])

  // Mirrors `resolveMailer` in lib/mailer.ts, which prefers Gmail when it is connected. If
  // that order ever changes, this line has to change with it — the whole point of showing it
  // is that the user knows which mailbox a send will actually leave from.
  const activeChannel: 'gmail' | 'smtp' | null =
    gmail?.connected ? 'gmail' : smtp?.connected ? 'smtp' : null
  const activeAddress = activeChannel === 'gmail' ? gmail?.gmailAddress : smtp?.fromAddress

  function applyPreset(preset: typeof PRESETS[number]) {
    setForm(f => ({ ...f, host: preset.host, port: preset.port }))
    setPresetNote(preset.note)
    setPresetOpen(false)
  }

  async function saveSmtp(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    setSaving(true)
    try {
      const res = await fetch('/api/settings/smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not save')

      setSmtp(data)
      // Cleared on success so a live mailbox password is not left sitting in component
      // state, and so the form reads as "done" rather than still pending.
      setForm({ host: '', port: 587, user: '', pass: '', fromAddress: '' })
      setPresetNote(null)
      toast.success(`Connected — test message accepted by ${data.host}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not save'
      // Shown inline as well as in a toast: this message is the diagnostic (wrong port,
      // wrong password, no STARTTLS) and it needs to stay on screen next to the field
      // that caused it, not vanish after four seconds.
      setFormError(message)
      toast.error('Could not connect')
    } finally {
      setSaving(false)
    }
  }

  async function removeSmtp() {
    if (!confirm('Remove these SMTP credentials?')) return
    try {
      const res = await fetch('/api/settings/smtp', { method: 'DELETE' })
      if (!res.ok) throw new Error('Could not remove')
      setSmtp({ connected: false })
      toast.success('SMTP credentials removed')
    } catch {
      toast.error('Could not remove SMTP credentials')
    }
  }

  async function disconnectGmail() {
    try {
      await fetch('/api/gmail/disconnect', { method: 'DELETE' })
      setGmail({ connected: false })
      toast.success('Gmail disconnected')
    } catch {
      toast.error('Could not disconnect Gmail')
    }
  }

  return (
    <div style={{ minHeight: '100vh', color: '#FAFAFA', maxWidth: 760 }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.04em', margin: 0, color: '#FAFAFA' }}>
          Settings
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>
          How your outreach leaves your account
        </p>
      </div>

      {/* Active transport summary */}
      <div style={{
        ...CARD,
        padding: '14px 20px', marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
        background: activeChannel ? 'rgba(74,222,128,0.06)' : 'rgba(196,20,37,0.08)',
        border: activeChannel ? '1px solid rgba(74,222,128,0.2)' : '1px solid rgba(196,20,37,0.3)',
      }}>
        {activeChannel ? <Check size={14} color='#4ade80' /> : <AlertCircle size={14} color='#E5484D' />}
        <span style={{ fontSize: 13, fontWeight: 500, color: activeChannel ? '#4ade80' : 'rgba(255,255,255,0.8)' }}>
          {activeChannel
            ? `Sending from ${activeAddress} via ${activeChannel === 'gmail' ? 'Gmail' : 'your SMTP server'}`
            : 'No email account connected — outreach will generate pitches but send nothing'}
        </span>
      </div>

      {/* ── Workspace (SaaS team) ── */}
      <WorkspaceCard />

      {/* ── Gmail ── */}
      <div style={{ ...CARD, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
          <Mail size={16} color='#E5484D' style={{ marginTop: 2, flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#FAFAFA' }}>Gmail</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4, lineHeight: 1.6 }}>
              One click, no password. Google restricts the send permission, so this only works
              for accounts approved on the app&apos;s Google Cloud project.
            </div>
          </div>
          {gmail?.connected && (
            <span style={{
              fontSize: 10, color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)',
              background: 'rgba(74,222,128,0.06)', padding: '2px 6px', borderRadius: 4,
              textTransform: 'uppercase', whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              Connected
            </span>
          )}
        </div>

        {gmail === null ? (
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: "'JetBrains Mono',monospace" }}>
            Checking…
          </div>
        ) : gmail.connected ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>{gmail.gmailAddress}</span>
            <button
              onClick={disconnectGmail}
              style={{
                background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.5)', fontSize: 11, padding: '5px 12px',
                borderRadius: 6, cursor: 'pointer',
              }}
            >
              Disconnect
            </button>
          </div>
        ) : (
          <a
            href='/api/gmail/connect'
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '9px 16px', borderRadius: 8,
              background: 'rgba(196,20,37,0.25)', border: '1px solid rgba(196,20,37,0.4)',
              color: '#ff4455', fontSize: 12, fontWeight: 700, textDecoration: 'none',
            }}
          >
            <Zap size={12} /> Connect Gmail
          </a>
        )}
      </div>

      {/* ── SMTP ── */}
      <div style={CARD}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20 }}>
          <Server size={16} color='#E5484D' style={{ marginTop: 2, flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#FAFAFA' }}>Your own mail server</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4, lineHeight: 1.6 }}>
              Works with any mailbox — Gmail, Outlook, Zoho, your own domain — and needs no
              approval from anyone. Most providers want an app-specific password here rather
              than your account password.
            </div>
          </div>
          {smtp?.connected && (
            <span style={{
              fontSize: 10, color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)',
              background: 'rgba(74,222,128,0.06)', padding: '2px 6px', borderRadius: 4,
              textTransform: 'uppercase', whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              Connected
            </span>
          )}
        </div>

        {smtp?.connected && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
            padding: '12px 14px', marginBottom: 20, borderRadius: 8,
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: '#FAFAFA' }}>{smtp.fromAddress}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2, fontFamily: "'JetBrains Mono',monospace" }}>
                {smtp.host}:{smtp.port} · {smtp.secure ? 'SSL' : 'STARTTLS'}
              </div>
            </div>
            <button
              onClick={removeSmtp}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.5)', fontSize: 11, padding: '6px 12px',
                borderRadius: 6, cursor: 'pointer',
              }}
            >
              <Trash2 size={12} /> Remove
            </button>
          </div>
        )}

        <form onSubmit={saveSmtp}>
          {/* Provider preset */}
          <div style={{ marginBottom: 16, position: 'relative' }}>
            <label style={LABEL}>Provider</label>
            <button
              type='button'
              onClick={() => setPresetOpen(o => !o)}
              style={{
                ...INPUT, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                cursor: 'pointer', textAlign: 'left', color: 'rgba(255,255,255,0.5)',
              }}
            >
              Pick a provider to fill the host and port
              <ChevronDown size={14} style={{ transform: presetOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
            </button>

            <AnimatePresence>
              {presetOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4,
                    background: '#0D0D12', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8, overflow: 'hidden', zIndex: 20,
                    boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
                  }}
                >
                  {PRESETS.map(preset => (
                    <button
                      key={preset.host}
                      type='button'
                      onClick={() => applyPreset(preset)}
                      style={{
                        display: 'block', width: '100%', textAlign: 'left',
                        padding: '10px 12px', background: 'transparent', border: 'none',
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        color: '#FAFAFA', fontSize: 13, cursor: 'pointer',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                    >
                      {preset.name}
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginLeft: 8, fontFamily: "'JetBrains Mono',monospace" }}>
                        {preset.host}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {presetNote && (
            <div style={{
              display: 'flex', gap: 8, padding: '10px 12px', marginBottom: 16,
              borderRadius: 8, background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <ShieldCheck size={13} color='rgba(255,255,255,0.4)' style={{ marginTop: 2, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>{presetNote}</span>
            </div>
          )}

          {/* Host + port */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 240px', minWidth: 0 }}>
              <label style={LABEL} htmlFor='smtp-host'>Server</label>
              <input
                id='smtp-host' required value={form.host}
                onChange={e => setForm(f => ({ ...f, host: e.target.value }))}
                placeholder='smtp.gmail.com'
                autoComplete='off'
                style={INPUT}
              />
            </div>
            <div style={{ flex: '1 1 200px', minWidth: 0 }}>
              <label style={LABEL} htmlFor='smtp-port'>Port</label>
              <select
                id='smtp-port' value={form.port}
                onChange={e => setForm(f => ({ ...f, port: Number(e.target.value) }))}
                style={{ ...INPUT, cursor: 'pointer' }}
              >
                {PORTS.map(p => (
                  <option key={p.value} value={p.value} style={{ background: '#0D0D12' }}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Credentials */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 240px', minWidth: 0 }}>
              <label style={LABEL} htmlFor='smtp-user'>Username</label>
              <input
                id='smtp-user' required value={form.user}
                onChange={e => setForm(f => ({ ...f, user: e.target.value }))}
                placeholder='you@yourdomain.com'
                autoComplete='off'
                style={INPUT}
              />
            </div>
            <div style={{ flex: '1 1 200px', minWidth: 0 }}>
              <label style={LABEL} htmlFor='smtp-pass'>Password</label>
              <input
                id='smtp-pass' required type='password' value={form.pass}
                onChange={e => setForm(f => ({ ...f, pass: e.target.value }))}
                placeholder='App-specific password'
                autoComplete='new-password'
                style={INPUT}
              />
            </div>
          </div>

          {/* From address */}
          <div style={{ marginBottom: 20 }}>
            <label style={LABEL} htmlFor='smtp-from'>Send as</label>
            <input
              id='smtp-from' value={form.fromAddress}
              onChange={e => setForm(f => ({ ...f, fromAddress: e.target.value }))}
              placeholder='Defaults to your username'
              autoComplete='off'
              style={INPUT}
            />
          </div>

          {formError && (
            <div style={{
              display: 'flex', gap: 8, padding: '12px 14px', marginBottom: 20,
              borderRadius: 8, background: 'rgba(196,20,37,0.08)',
              border: '1px solid rgba(196,20,37,0.3)',
            }}>
              <X size={13} color='#E5484D' style={{ marginTop: 2, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: '#E5484D', lineHeight: 1.6 }}>{formError}</span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <button
              type='submit'
              disabled={saving}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 18px', borderRadius: 8, border: 'none',
                background: '#E5484D', color: '#fff', fontSize: 12, fontWeight: 600,
                cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1,
                transition: 'opacity 0.15s',
              }}
            >
              {saving
                ? <><Loader2 size={13} className='spin' /> Testing connection…</>
                : <><Check size={13} /> {smtp?.connected ? 'Replace credentials' : 'Test & save'}</>}
            </button>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>
              Your password is encrypted before it is stored, and the connection is tested
              before anything is saved.
            </span>
          </div>
        </form>
      </div>

      <style>{`
        .spin { animation: settings-spin 0.9s linear infinite; }
        @keyframes settings-spin { to { transform: rotate(360deg); } }
        #smtp-host:focus, #smtp-user:focus, #smtp-pass:focus, #smtp-from:focus, #smtp-port:focus {
          border-color: rgba(229,72,77,0.4);
        }
      `}</style>
    </div>
  )
}
