'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail, Sparkles, Search, Send, Check, X, ChevronRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { SERVICE_CATALOG } from '@/lib/services'

/**
 * Activation checklist — the first-win path.
 * Steps are computed server-side from real state (/api/onboarding), so they
 * can't be gamed and auto-complete the moment the action actually happens.
 */

interface Steps {
  emailConnected: boolean
  emailChannel?: string | null
  servicesChosen: boolean
  services: string[]
  firstScan: boolean
  firstPitchSent: boolean
}

const DISMISS_KEY = 'freelanceos_onboarding_dismissed'

export default function OnboardingChecklist() {
  const [steps, setSteps]   = useState<Steps | null>(null)
  const [dismissed, setDismissed] = useState(true) // hidden until we know it's needed
  const [pickingServices, setPickingServices] = useState(false)
  const [selected, setSelected]   = useState<Set<string>>(new Set())
  const [saving, setSaving]       = useState(false)

  const refresh = () => {
    fetch('/api/onboarding')
      .then(r => r.json())
      .then(data => setSteps(data.steps))
      .catch(() => {})
  }

  useEffect(() => {
    let active = true
    fetch('/api/onboarding')
      .then(r => (r.ok ? r.json() : Promise.reject(new Error('failed'))))
      .then(data => {
        if (!active) return
        const s: Steps = data.steps
        setSteps(s)
        setSelected(new Set(s.services ?? []))
        const done = s.emailConnected && s.servicesChosen && s.firstScan && s.firstPitchSent
        setDismissed(done || localStorage.getItem(DISMISS_KEY) === '1')
      })
      .catch(() => {})
    return () => { active = false }
  }, [])

  const saveServices = async () => {
    if (selected.size === 0) {
      toast.error('Pick at least one service')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ services: Array.from(selected) }),
      })
      if (!res.ok) throw new Error('Save failed')
      toast.success('Services saved — pitches will lead with them')
      setPickingServices(false)
      refresh()
    } catch {
      toast.error('Could not save services')
    } finally {
      setSaving(false)
    }
  }

  if (!steps || dismissed) return null

  const doneCount = [steps.emailConnected, steps.servicesChosen, steps.firstScan, steps.firstPitchSent].filter(Boolean).length
  const progress = (doneCount / 4) * 100

  const STEPS = [
    {
      key: 'email', done: steps.emailConnected,
      Icon: Mail, color: '#60a5fa',
      title: 'Connect your mailbox',
      sub: steps.emailConnected ? `Sending from your ${steps.emailChannel === 'gmail' ? 'Gmail' : 'SMTP'} account` : 'One tap with Gmail, or SMTP for any provider',
      href: steps.emailConnected ? undefined : '/settings',
      cta: steps.emailConnected ? undefined : 'Connect',
      onClick: undefined,
    },
    {
      key: 'services', done: steps.servicesChosen,
      Icon: Sparkles, color: '#a78bfa',
      title: 'Choose what you sell',
      sub: steps.servicesChosen ? `${steps.services.length} service${steps.services.length > 1 ? 's' : ''} — pitches will lead with these` : 'Pick your services so every pitch sells the right thing',
      href: undefined,
      cta: steps.servicesChosen ? 'Edit' : 'Choose',
      onClick: () => setPickingServices(p => !p),
    },
    {
      key: 'scan', done: steps.firstScan,
      Icon: Search, color: '#f59e0b',
      title: 'Run your first scan',
      sub: steps.firstScan ? 'Leads are in your pipeline' : 'Find local businesses with real digital gaps',
      href: '/discover',
      cta: 'Discover',
      onClick: undefined,
    },
    {
      key: 'pitch', done: steps.firstPitchSent,
      Icon: Send, color: '#4ade80',
      title: 'Send your first pitch',
      sub: steps.firstPitchSent ? 'First pitch delivered — keep going' : 'Generate a ground-truth pitch and fire it off',
      href: '/discover',
      cta: 'Start',
      onClick: undefined,
    },
  ]

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          marginBottom: 32,
          border: '1px solid rgba(229,72,77,0.2)',
          borderRadius: 16,
          background: 'linear-gradient(135deg,#101018 0%,#0A0A0F 100%)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* accent glow */}
        <div style={{
          position: 'absolute', top: -120, left: '50%', transform: 'translateX(-50%)',
          width: 480, height: 220, pointerEvents: 'none',
          background: 'radial-gradient(ellipse, rgba(229,72,77,0.12) 0%, rgba(229,72,77,0) 65%)',
        }} />

        {/* Header + progress ring */}
        <div style={{ padding: '18px 22px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#E5484D', marginBottom: 4 }}>
              Get activated
            </div>
            <div style={{ fontSize: 15.5, fontWeight: 700, letterSpacing: '-0.02em', color: '#FAFAFA' }}>
              {doneCount === 0 ? 'Set up in under 3 minutes' : `${doneCount}/4 done — almost there`}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ position: 'relative', width: 38, height: 38 }}>
              <svg width="38" height="38" viewBox="0 0 38 38" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="19" cy="19" r="15.5" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="3.5" />
                <circle
                  cx="19" cy="19" r="15.5" fill="none"
                  stroke="#E5484D" strokeWidth="3.5" strokeLinecap="round"
                  strokeDasharray={`${(progress / 100) * 97.4} 97.4`}
                  style={{ transition: 'stroke-dasharray 0.6s cubic-bezier(0.2,0.8,0.2,1)' }}
                />
              </svg>
              <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10.5, fontWeight: 800, color: '#FAFAFA' }}>
                {doneCount}
              </span>
            </div>
            <button
              onClick={() => { localStorage.setItem(DISMISS_KEY, '1'); setDismissed(true) }}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, padding: 5, cursor: 'pointer', color: 'rgba(255,255,255,0.45)', display: 'flex' }}
              title="Hide checklist"
            >
              <X size={13} />
            </button>
          </div>
        </div>

        {/* Step tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 1, background: 'rgba(255,255,255,0.04)' }}>
          {STEPS.map(step => {
            const Icon = step.Icon
            const inner = (
              <div style={{
                height: '100%', padding: '14px 18px',
                background: step.done ? 'rgba(74,222,128,0.03)' : '#0C0C12',
                display: 'flex', flexDirection: 'column', gap: 8,
                cursor: !step.done && (step.href || step.onClick) ? 'pointer' : 'default',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: step.done ? 'rgba(74,222,128,0.1)' : `${step.color}12`,
                    border: `1px solid ${step.done ? 'rgba(74,222,128,0.3)' : `${step.color}25`}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: step.done ? '#4ade80' : step.color,
                  }}>
                    {step.done ? <Check size={13} /> : <Icon size={13} />}
                  </div>
                  {!step.done && step.cta && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 11, fontWeight: 700, color: step.color }}>
                      {step.cta} <ChevronRight size={11} />
                    </span>
                  )}
                </div>
                <div>
                  <div style={{
                    fontSize: 13, fontWeight: 600,
                    color: step.done ? 'rgba(74,222,128,0.85)' : '#FAFAFA',
                    textDecorationLine: step.done ? 'line-through' : 'none',
                    marginBottom: 2,
                  }}>
                    {step.title}
                  </div>
                  <div style={{ fontSize: 11.5, lineHeight: 1.45, color: 'rgba(255,255,255,0.38)' }}>
                    {step.sub}
                  </div>
                </div>
              </div>
            )

            if (step.done) return <div key={step.key}>{inner}</div>
            if (step.href) return <Link key={step.key} href={step.href} style={{ textDecoration: 'none' }}>{inner}</Link>
            return <div key={step.key} onClick={step.onClick} role="button">{inner}</div>
          })}
        </div>

        {/* Service picker drawer */}
        <AnimatePresence>
          {pickingServices && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div style={{ padding: '16px 20px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 10 }}>
                  What do you offer? (pitches will sell these)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8, marginBottom: 12 }}>
                  {SERVICE_CATALOG.map(svc => {
                    const on = selected.has(svc.id)
                    return (
                      <button
                        key={svc.id}
                        onClick={() => setSelected(prev => {
                          const next = new Set(prev)
                          if (next.has(svc.id)) next.delete(svc.id)
                          else next.add(svc.id)
                          return next
                        })}
                        style={{
                          textAlign: 'left', padding: '10px 12px', borderRadius: 10,
                          background: on ? 'rgba(167,139,250,0.12)' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${on ? 'rgba(167,139,250,0.4)' : 'rgba(255,255,255,0.07)'}`,
                          color: on ? '#c4b5fd' : 'rgba(255,255,255,0.65)',
                          fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                        }}
                      >
                        {svc.label}
                        {on && <Check size={13} />}
                      </button>
                    )
                  })}
                </div>
                <button
                  onClick={() => void saveServices()}
                  disabled={saving || selected.size === 0}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7,
                    padding: '10px 20px', borderRadius: 10,
                    background: selected.size > 0 ? 'linear-gradient(135deg, #C41425, #E5484D)' : 'rgba(255,255,255,0.05)',
                    border: 'none', color: selected.size > 0 ? '#fff' : 'rgba(255,255,255,0.3)',
                    fontSize: 13, fontWeight: 700, cursor: selected.size > 0 ? 'pointer' : 'not-allowed',
                  }}
                >
                  Save services ({selected.size})
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  )
}
