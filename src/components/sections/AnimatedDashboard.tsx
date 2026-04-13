'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────
type AnimPhase =
  | 'boot'
  | 'cursor-to-discover'
  | 'discover-click'
  | 'rows-appear'
  | 'cursor-to-generate'
  | 'generate-click'
  | 'panel-open'
  | 'typing'
  | 'score-fill'
  | 'cursor-to-send'
  | 'send-click'
  | 'success'
  | 'reset'

type CursorPos = { x: number; y: number }

// ─── Constants ────────────────────────────────────────────────────────────
const COMPANY = 'Apex Digital Co.'

const DISCOVER_POS:  CursorPos = { x: 88, y: 162 }
const GENERATE_POS:  CursorPos = { x: 646, y: 36 }
const TYPING_POS:    CursorPos = { x: 454, y: 196 }
const SEND_POS:      CursorPos = { x: 582, y: 338 }
const INITIAL_POS:   CursorPos = { x: 240, y: 80 }

// ─── Sub-components ───────────────────────────────────────────────────────

function Cursor({ pos, clicking }: { pos: CursorPos; clicking: boolean }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        transition: 'transform 0.72s cubic-bezier(0.33, 1, 0.68, 1)',
        pointerEvents: 'none',
        zIndex: 50,
        willChange: 'transform',
      }}
    >
      <svg
        width="20" height="24"
        viewBox="0 0 20 24"
        style={{
          transform: clicking ? 'scale(0.84)' : 'scale(1)',
          transition: 'transform 0.1s ease',
          filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.7))',
          display: 'block',
        }}
      >
        <path
          d="M3 2L3 18.5L7.5 13.5L11 20.5L13 19.5L9.5 12.5L17 12.5L3 2Z"
          fill="white"
          stroke="rgba(0,0,0,0.5)"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

function TypewriterText({ active, text }: { active: boolean; text: string }) {
  const [shown, setShown] = useState('')
  useEffect(() => {
    if (!active) { setShown(''); return }
    let i = 0
    const id = setInterval(() => {
      i++
      setShown(text.slice(0, i))
      if (i >= text.length) clearInterval(id)
    }, 55)
    return () => clearInterval(id)
  }, [active, text])

  return (
    <>
      {shown}
      {active && shown.length < text.length && (
        <span style={{
          display: 'inline-block',
          width: '1px',
          height: '13px',
          backgroundColor: '#C41425',
          marginLeft: '1px',
          verticalAlign: 'text-bottom',
          animation: 'glow-pulse 0.8s ease-in-out infinite',
        }} />
      )}
    </>
  )
}

function ScoreBar({ pct, fill }: { pct: number; fill: boolean }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: '10px', color: '#5A5A68', letterSpacing: '0.08em', textTransform: 'uppercase' }}>AI Match Score</span>
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#C41425' }}>{fill ? `${pct}%` : '—'}</span>
      </div>
      <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: fill ? `${pct}%` : '0%',
          background: 'linear-gradient(90deg, #C41425, #FF3347)',
          transition: 'width 1.1s cubic-bezier(0.22, 1, 0.36, 1)',
          borderRadius: '2px',
        }} />
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────
export default function AnimatedDashboard() {
  const cancelRef = useRef(false)
  const [phase, setPhase] = useState<AnimPhase>('boot')
  const [cursorPos, setCursorPos] = useState<CursorPos>(INITIAL_POS)
  const [clicking, setClicking] = useState(false)
  const [activeNav, setActiveNav] = useState('Overview')
  const [visibleRows, setVisibleRows] = useState(0)
  const [panelOpen, setPanelOpen] = useState(false)
  const [typingActive, setTypingActive] = useState(false)
  const [scoreFill, setScoreFill] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [newRowVisible, setNewRowVisible] = useState(false)

  const wait = useCallback((ms: number) =>
    new Promise<void>(resolve => {
      const id = setTimeout(() => { if (!cancelRef.current) resolve() }, ms)
      return id
    }), [])

  const click = useCallback(async () => {
    if (cancelRef.current) return
    setClicking(true)
    await wait(180)
    if (!cancelRef.current) setClicking(false)
  }, [wait])

  useEffect(() => {
    cancelRef.current = false
    let running = true

    const run = async () => {
      while (running && !cancelRef.current) {
        // RESET
        setPhase('boot')
        setActiveNav('Overview')
        setVisibleRows(0)
        setPanelOpen(false)
        setTypingActive(false)
        setScoreFill(false)
        setShowSuccess(false)
        setNewRowVisible(false)
        setCursorPos(INITIAL_POS)
        await wait(900)

        // Move cursor to Discover
        setPhase('cursor-to-discover')
        setCursorPos(DISCOVER_POS)
        await wait(750)

        // Click Discover
        await click()
        setPhase('discover-click')
        setActiveNav('Discover')
        await wait(300)

        // Rows appear one by one
        setPhase('rows-appear')
        for (let i = 1; i <= 4; i++) {
          if (cancelRef.current) return
          await wait(220)
          setVisibleRows(i)
        }
        await wait(700)

        // Move to Generate Pitch
        setPhase('cursor-to-generate')
        setCursorPos(GENERATE_POS)
        await wait(750)

        // Click Generate
        await click()
        setPhase('generate-click')
        await wait(200)
        setPanelOpen(true)
        setPhase('panel-open')
        await wait(500)

        // Typing
        setPhase('typing')
        setCursorPos(TYPING_POS)
        await wait(300)
        setTypingActive(true)
        await wait(1200) // typing duration (55ms × 17 chars = ~935ms)

        // Score fills
        setPhase('score-fill')
        setScoreFill(true)
        await wait(1300)

        // Move to Send
        setPhase('cursor-to-send')
        setCursorPos(SEND_POS)
        await wait(700)

        // Send click
        await click()
        setPhase('send-click')
        await wait(200)
        setShowSuccess(true)
        setPhase('success')
        await wait(400)
        setNewRowVisible(true)
        await wait(2000)

        // Cleanup before reset
        setPhase('reset')
        setShowSuccess(false)
        setPanelOpen(false)
        setTypingActive(false)
        setScoreFill(false)
        await wait(600)
        setVisibleRows(0)
        setNewRowVisible(false)
        await wait(400)
      }
    }

    run()
    return () => {
      running = false
      cancelRef.current = true
    }
  }, [click, wait])

  // ─── Sidebar items ───────────────────────────────────────────────────────
  const navItems = ['Overview', 'Discover', 'Clients', 'Pitches', 'Outreach', 'Deals']

  // ─── Pitch rows ──────────────────────────────────────────────────────────
  const pitchRows = [
    { company: 'Wave Commerce',    type: 'Cold Email',    score: 91, status: 'Replied' },
    { company: 'Bright Studio',    type: 'LinkedIn DM',   score: 87, status: 'Sent' },
    { company: 'Peak Digital',     type: 'Full Proposal', score: 95, status: 'Deal' },
    { company: 'Nova Collective',  type: 'Cold Email',    score: 83, status: 'Queued' },
  ]

  function statusStyle(s: string) {
    const map: Record<string, { bg: string; color: string }> = {
      Deal:    { bg: 'rgba(0,201,167,0.12)',   color: '#00C9A7' },
      Replied: { bg: 'rgba(245,158,11,0.12)',  color: '#F59E0B' },
      Sent:    { bg: 'rgba(196,20,37,0.14)',   color: '#FF4455' },
      Queued:  { bg: 'rgba(255,255,255,0.06)', color: '#5A5A68' },
    }
    return map[s] ?? map.Queued
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '1060px',
        margin: '0 auto',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 40px 100px rgba(0,0,0,0.75), 0 0 80px rgba(196,20,37,0.04)',
        background: '#07070B',
        userSelect: 'none',
      }}
    >
      {/* ── Browser chrome ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '10px 14px',
        background: '#0A0A0F',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        {[0.14, 0.1, 0.07].map((o, i) => (
          <div key={i} style={{ width: '9px', height: '9px', borderRadius: '50%', background: `rgba(255,255,255,${o})` }} />
        ))}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '3px 14px',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '4px',
            fontSize: '11px', color: '#4A4A5A',
            fontFamily: 'JetBrains Mono, monospace',
            letterSpacing: '0.01em',
          }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#00C9A7', display: 'inline-block' }} />
            app.freelanceos.io
          </div>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '176px 1fr', minHeight: '400px', position: 'relative' }}>

        {/* Sidebar */}
        <aside style={{
          borderRight: '1px solid rgba(255,255,255,0.04)',
          padding: '20px 10px',
          background: '#08080C',
          display: 'flex',
          flexDirection: 'column',
          gap: '1px',
        }}>
          {/* Logo */}
          <div style={{ padding: '4px 8px 16px', fontSize: '13px', fontWeight: 700, color: '#FAFAFA', letterSpacing: '-0.03em' }}>
            Freelance<span style={{ color: '#C41425' }}>OS</span>
          </div>

          {/* Status */}
          <div style={{
            padding: '6px 8px',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(0,201,167,0.06)',
            borderRadius: '4px',
            border: '1px solid rgba(0,201,167,0.1)',
          }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#00C9A7', display: 'inline-block', animation: 'glow-pulse 2s ease-in-out infinite' }} />
            <span style={{ fontSize: '10px', color: '#00C9A7', fontWeight: 600, letterSpacing: '0.06em' }}>AI Active</span>
          </div>

          {navItems.map(item => {
            const active = item === activeNav
            return (
              <div key={item} style={{
                padding: '7px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: active ? 500 : 400,
                color: active ? '#FAFAFA' : '#4A4A5A',
                background: active ? 'rgba(255,255,255,0.06)' : 'transparent',
                borderLeft: `2px solid ${active ? '#C41425' : 'transparent'}`,
                transition: 'all 0.2s ease',
                paddingLeft: active ? '10px' : '8px',
                cursor: 'default',
              }}>
                {item}
              </div>
            )
          })}

          {/* Metric mini at bottom */}
          <div style={{ marginTop: 'auto', padding: '10px 8px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ fontSize: '10px', color: '#4A4A5A', marginBottom: '4px' }}>This month</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#FAFAFA', letterSpacing: '-0.03em', lineHeight: 1 }}>$48K</div>
            <div style={{ fontSize: '10px', color: '#00C9A7', marginTop: '2px' }}>↑ 32% vs last</div>
          </div>
        </aside>

        {/* Main panel */}
        <main style={{ position: 'relative', overflow: 'hidden', padding: '0' }}>

          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
          }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#FAFAFA', letterSpacing: '-0.02em' }}>
                {activeNav}
              </div>
              <div style={{ fontSize: '10px', color: '#4A4A5A', marginTop: '1px' }}>
                {activeNav === 'Discover' ? '1,284 potential clients found' : 'Freelance automation dashboard'}
              </div>
            </div>

            {/* Generate Pitch button */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              background: phase === 'generate-click' ? 'rgba(196,20,37,0.8)' : '#C41425',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 600,
              color: '#fff',
              cursor: 'default',
              transition: 'all 0.15s ease',
              transform: phase === 'generate-click' ? 'scale(0.94)' : 'scale(1)',
              boxShadow: '0 0 12px rgba(196,20,37,0.2)',
            }}>
              <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1L10.2 6.8L16 8L10.2 9.2L8 15L5.8 9.2L0 8L5.8 6.8L8 1Z" />
              </svg>
              Generate Pitch
            </div>
          </div>

          {/* Metrics strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'rgba(255,255,255,0.03)' }}>
            {[
              { label: 'Clients Found', value: '1,284', delta: '+47 today', color: '#FAFAFA' },
              { label: 'Pitches Sent',  value: '3,841', delta: '+12 today',  color: '#FAFAFA' },
              { label: 'Active Deals',  value: '24',    delta: '$72K value', color: '#F59E0B' },
            ].map(m => (
              <div key={m.label} style={{ padding: '14px 18px', background: '#07070B' }}>
                <div style={{ fontSize: '10px', color: '#4A4A5A', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>{m.label}</div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: m.color, letterSpacing: '-0.04em', lineHeight: 1 }}>{m.value}</div>
                <div style={{ fontSize: '10px', color: '#4A4A5A', marginTop: '4px' }}>{m.delta}</div>
              </div>
            ))}
          </div>

          {/* Client / Pitch table */}
          <div style={{ padding: '0 20px 16px' }}>
            <div style={{
              fontSize: '10px',
              letterSpacing: '0.08em',
              color: '#4A4A5A',
              textTransform: 'uppercase',
              padding: '12px 0 8px',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
              display: 'grid',
              gridTemplateColumns: '1fr 100px 60px 64px',
              gap: '8px',
            }}>
              <span>Company</span>
              <span>Type</span>
              <span>Score</span>
              <span style={{ textAlign: 'right' }}>Status</span>
            </div>

            {/* Rows */}
            {pitchRows.map((row, i) => {
              const visible = i < visibleRows
              const st = statusStyle(row.status)
              return (
                <div key={row.company} style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 100px 60px 64px',
                  gap: '8px',
                  alignItems: 'center',
                  padding: '9px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0)' : 'translateY(8px)',
                  transition: 'opacity 0.3s ease, transform 0.3s ease',
                }}>
                  <span style={{ fontSize: '12px', color: '#FAFAFA', fontWeight: 500 }}>{row.company}</span>
                  <span style={{ fontSize: '11px', color: '#5A5A68' }}>{row.type}</span>
                  <span style={{ fontSize: '11px', color: '#00C9A7', fontWeight: 600 }}>{row.score}%</span>
                  <span style={{
                    padding: '2px 7px',
                    borderRadius: '3px',
                    fontSize: '9px',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    backgroundColor: st.bg,
                    color: st.color,
                    textAlign: 'center',
                    justifySelf: 'end',
                  }}>
                    {row.status}
                  </span>
                </div>
              )
            })}

            {/* New row from animation */}
            {newRowVisible && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 100px 60px 64px',
                gap: '8px',
                alignItems: 'center',
                padding: '9px 0',
                borderBottom: '1px solid rgba(255,255,255,0.03)',
                opacity: newRowVisible ? 1 : 0,
                transform: 'translateY(0)',
                transition: 'opacity 0.4s ease',
                background: 'rgba(196,20,37,0.04)',
              }}>
                <span style={{ fontSize: '12px', color: '#FAFAFA', fontWeight: 500 }}>{COMPANY}</span>
                <span style={{ fontSize: '11px', color: '#5A5A68' }}>Cold Email</span>
                <span style={{ fontSize: '11px', color: '#00C9A7', fontWeight: 600 }}>94%</span>
                <span style={{
                  padding: '2px 7px',
                  borderRadius: '3px',
                  fontSize: '9px',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  backgroundColor: 'rgba(196,20,37,0.14)',
                  color: '#FF4455',
                  textAlign: 'center',
                  justifySelf: 'end',
                }}>
                  Sent
                </span>
              </div>
            )}
          </div>

          {/* ── Slide-in pitch panel ── */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: '280px',
            background: '#0A0A10',
            borderLeft: '1px solid rgba(255,255,255,0.06)',
            transform: panelOpen ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.4s cubic-bezier(0.33, 1, 0.68, 1)',
            display: 'flex',
            flexDirection: 'column',
            padding: '16px',
            gap: '14px',
          }}>
            {/* Panel header */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <svg width="10" height="10" viewBox="0 0 16 16" fill="#C41425">
                  <path d="M8 1L10.2 6.8L16 8L10.2 9.2L8 15L5.8 9.2L0 8L5.8 6.8L8 1Z" />
                </svg>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#C41425', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  AI Pitch Generator
                </span>
              </div>
              <div style={{ fontSize: '10px', color: '#4A4A5A' }}>Generating personalized pitch</div>
            </div>

            {/* Form field — Company */}
            <div>
              <label style={{ fontSize: '10px', color: '#4A4A5A', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                Company
              </label>
              <div style={{
                padding: '8px 10px',
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${typingActive ? 'rgba(196,20,37,0.4)' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: '4px',
                fontSize: '12px',
                color: '#FAFAFA',
                minHeight: '32px',
                transition: 'border-color 0.2s ease',
                fontFamily: 'inherit',
              }}>
                <TypewriterText active={typingActive} text={COMPANY} />
              </div>
            </div>

            {/* Pitch type */}
            <div>
              <label style={{ fontSize: '10px', color: '#4A4A5A', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                Pitch Type
              </label>
              <div style={{
                padding: '8px 10px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '4px',
                fontSize: '12px',
                color: typingActive ? '#FAFAFA' : '#4A4A5A',
                transition: 'color 0.3s ease',
              }}>
                {typingActive ? 'Cold Email' : '—'}
              </div>
            </div>

            {/* Score bar */}
            <ScoreBar pct={94} fill={scoreFill} />

            {/* Preview text */}
            {scoreFill && (
              <div style={{
                padding: '10px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '4px',
                fontSize: '10px',
                color: '#5A5A68',
                lineHeight: 1.6,
                opacity: scoreFill ? 1 : 0,
                transition: 'opacity 0.4s ease',
              }}>
                &ldquo;Hi, I noticed Apex Digital Co. is scaling their ecommerce presence...&rdquo;
              </div>
            )}

            {/* Send button */}
            <button style={{
              marginTop: 'auto',
              padding: '10px',
              background: phase === 'send-click' ? '#991020' : '#C41425',
              borderRadius: '4px',
              border: 'none',
              fontSize: '12px',
              fontWeight: 600,
              color: '#fff',
              cursor: 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transform: phase === 'send-click' ? 'scale(0.96)' : 'scale(1)',
              transition: 'all 0.12s ease',
            }}>
              <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor">
                <path d="M1 1l14 7L1 15V9l10-1L1 7V1z"/>
              </svg>
              Send Pitch
            </button>
          </div>

          {/* ── Cursor ── */}
          <Cursor pos={cursorPos} clicking={clicking} />

          {/* ── Success notification ── */}
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            background: 'rgba(0,201,167,0.1)',
            border: '1px solid rgba(0,201,167,0.2)',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 500,
            color: '#00C9A7',
            opacity: showSuccess ? 1 : 0,
            transform: showSuccess ? 'translateY(0)' : 'translateY(-8px)',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
            zIndex: 60,
            pointerEvents: 'none',
            backdropFilter: 'blur(8px)',
          }}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm3.7 6.3L7.1 10.9c-.2.2-.5.3-.7.3-.2 0-.5-.1-.7-.3L3.3 8.5c-.4-.4-.4-1 0-1.4.4-.4 1-.4 1.4 0L6.4 8.8l3.9-3.9c.4-.4 1-.4 1.4 0 .4.4.4 1 0 1.4z"/>
            </svg>
            Pitch sent to {COMPANY}
          </div>
        </main>
      </div>

      {/* Bottom gradient overlay */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '80px',
        background: 'linear-gradient(to top, #07070B 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />
    </div>
  )
}
