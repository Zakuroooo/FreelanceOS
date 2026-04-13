'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
════════════════════════════════════════════════════════════════ */
const INNER_W = 940
const INNER_H = 478
const COMPANY = 'Apex Digital Co.'

const SPARKLINES = {
  clients: [48, 62, 55, 74, 70, 89, 112],
  pitches: [190, 240, 215, 295, 270, 340, 395],
  deals:   [3, 5, 4, 8, 7, 11, 15],
}

const TABLE_ROWS = [
  { abbr: 'WC', bg: '#2348BE', company: 'Wave Commerce',   industry: 'Ecommerce', score: 91, status: 'Replied' },
  { abbr: 'BS', bg: '#6D32BE', company: 'Bright Studio',   industry: 'Design',    score: 87, status: 'Sent' },
  { abbr: 'PD', bg: '#BE3255', company: 'Peak Digital',    industry: 'SaaS',      score: 95, status: 'Deal' },
  { abbr: 'NC', bg: '#1F7BAE', company: 'Nova Collective', industry: 'Marketing', score: 84, status: 'Queued' },
]

const STATUS: Record<string, { bg: string; txt: string }> = {
  Deal:    { bg: 'rgba(0,201,167,0.12)',   txt: '#00C9A7' },
  Replied: { bg: 'rgba(245,158,11,0.12)',  txt: '#F59E0B' },
  Sent:    { bg: 'rgba(195,1,1,0.14)',     txt: '#FF4A58' },
  Queued:  { bg: 'rgba(255,255,255,0.05)', txt: '#4A4A5A' },
}

const NAV_ITEMS = [
  { name: 'Overview', dot: 'rgba(255,255,255,0.2)' },
  { name: 'Discover', dot: '#4F9EF0' },
  { name: 'Clients',  dot: '#9B6FEB' },
  { name: 'Pitches',  dot: '#c30101' },
  { name: 'Outreach', dot: '#F59E0B' },
  { name: 'Deals',    dot: '#00C9A7' },
]

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
════════════════════════════════════════════════════════════════ */

function Cursor({ x, y, clicking }: { x: number; y: number; clicking: boolean }) {
  return (
    <>
      {/* Cursor arrow */}
      <div style={{
        position: 'absolute', left: 0, top: 0,
        transform: `translate(${x}px, ${y}px)`,
        transition: 'transform 0.68s cubic-bezier(0.33, 1, 0.68, 1)',
        pointerEvents: 'none', zIndex: 999, willChange: 'transform',
      }}>
        <svg width="18" height="22" viewBox="0 0 18 22" fill="none"
          style={{
            transform: clicking ? 'scale(0.82)' : 'scale(1)',
            transition: 'transform 0.1s ease',
            filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.9))',
            display: 'block',
          }}
        >
          <path d="M2.5 2L2.5 17.5L7 12.8L10.2 19.5L12.2 18.6L9 11.8L16 11.8L2.5 2Z"
            fill="white" stroke="rgba(0,0,0,0.55)" strokeWidth="1" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Click ripple */}
      {clicking && (
        <div style={{
          position: 'absolute', left: x, top: y,
          width: '20px', height: '20px',
          borderRadius: '50%',
          border: '1.5px solid rgba(195,1,1,0.5)',
          transform: 'translate(-2px, -2px)',
          animation: 'cursor-ripple 0.38s ease-out forwards',
          pointerEvents: 'none', zIndex: 998,
        }} />
      )}

      <style>{`
        @keyframes cursor-ripple {
          from { transform: translate(-2px, -2px) scale(0.5); opacity: 0.8; }
          to   { transform: translate(-2px, -2px) scale(2.5); opacity: 0; }
        }
        @keyframes text-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes ai-pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(0,201,167,0.4); }
          50%       { opacity: 0.6; box-shadow: 0 0 0 4px rgba(0,201,167,0); }
        }
      `}</style>
    </>
  )
}

function Typewriter({ active, text }: { active: boolean; text: string }) {
  const [shown, setShown] = useState('')
  useEffect(() => {
    if (!active) { setShown(''); return }
    let i = 0
    const id = setInterval(() => {
      i++; setShown(text.slice(0, i))
      if (i >= text.length) clearInterval(id)
    }, 58)
    return () => clearInterval(id)
  }, [active, text])
  return (
    <>
      {shown}
      {active && shown.length < text.length && (
        <span style={{
          display: 'inline-block', width: '1.5px', height: '11px',
          background: '#c30101', marginLeft: '1px',
          verticalAlign: 'text-bottom',
          animation: 'text-blink 0.75s step-end infinite',
        }} />
      )}
    </>
  )
}

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const W = 54, H = 22
  const mn = Math.min(...values), mx = Math.max(...values)
  const r = mx - mn || 1
  const pts = values.map((v, i) =>
    `${((i / (values.length - 1)) * W).toFixed(1)},${(H - ((v - mn) / r) * H * 0.82 - H * 0.09).toFixed(1)}`
  ).join(' ')
  return (
    <svg width={W} height={H} style={{ overflow: 'visible', flexShrink: 0 }}>
      <polyline points={pts} fill="none" stroke={color}
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
    </svg>
  )
}

function ScoreBar({ fill }: { fill: boolean }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
        <span style={{ fontSize: '9px', color: '#4A4A5A', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          AI Match Score
        </span>
        <span style={{ fontSize: '11px', fontWeight: 700, color: fill ? '#c30101' : '#2A2A35' }}>
          {fill ? '94%' : '—'}
        </span>
      </div>
      <div style={{ height: '2px', background: 'rgba(255,255,255,0.05)', borderRadius: '1px', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: fill ? '94%' : '0%',
          background: 'linear-gradient(90deg, #8B0000, #c30101)',
          transition: 'width 1.15s cubic-bezier(0.22, 1, 0.36, 1)',
          borderRadius: '1px',
        }} />
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════ */
export default function AnimatedDashboard() {
  const wrapperRef  = useRef<HTMLDivElement>(null)
  const innerRef    = useRef<HTMLDivElement>(null)
  const discoverRef = useRef<HTMLDivElement>(null)
  const generateRef = useRef<HTMLDivElement>(null)
  const inputRef    = useRef<HTMLDivElement>(null)
  const sendRef     = useRef<HTMLButtonElement>(null)
  const scaleRef    = useRef(1)

  const [scale,       setScale]       = useState(1)
  const [cursorX,     setCursorX]     = useState(300)
  const [cursorY,     setCursorY]     = useState(60)
  const [clicking,    setClicking]    = useState(false)
  const [activeNav,   setActiveNav]   = useState('Overview')
  const [visibleRows, setVisibleRows] = useState(0)
  const [panelOpen,   setPanelOpen]   = useState(false)
  const [typing,      setTyping]      = useState(false)
  const [scoreFill,   setScoreFill]   = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [newRow,      setNewRow]      = useState(false)

  /* Scale observer — makes dashboard scale to container */
  useEffect(() => {
    if (!wrapperRef.current) return
    const obs = new ResizeObserver(([e]) => {
      if (!e) return
      const s = e.contentRect.width / INNER_W
      scaleRef.current = s
      setScale(s)
    })
    obs.observe(wrapperRef.current)
    return () => obs.disconnect()
  }, [])

  /* Dynamic cursor targeting via refs */
  const getPos = useCallback((el: HTMLElement | null) => {
    if (!el || !innerRef.current) return { x: 300, y: 60 }
    const ir = innerRef.current.getBoundingClientRect()
    const er = el.getBoundingClientRect()
    const s  = scaleRef.current || 1
    return {
      x: (er.left - ir.left + er.width  * 0.5) / s,
      y: (er.top  - ir.top  + er.height * 0.5) / s,
    }
  }, [])

  /* Animation loop */
  useEffect(() => {
    let cancelled = false
    const w = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

    const moveTo = (el: HTMLElement | null) => {
      const p = getPos(el)
      setCursorX(p.x)
      setCursorY(p.y)
    }

    const click = async () => {
      if (cancelled) return
      setClicking(true)
      await w(160)
      if (!cancelled) setClicking(false)
    }

    const loop = async () => {
      while (!cancelled) {
        // ── RESET ───────────────────────────────────────
        setActiveNav('Overview')
        setVisibleRows(0)
        setPanelOpen(false)
        setTyping(false)
        setScoreFill(false)
        setShowSuccess(false)
        setNewRow(false)
        setCursorX(300); setCursorY(60)
        await w(1100)

        // ── MOVE → DISCOVER ─────────────────────────────
        if (cancelled) break
        moveTo(discoverRef.current)
        await w(820)
        await click()
        if (!cancelled) setActiveNav('Discover')
        await w(280)

        // ── ROWS APPEAR ──────────────────────────────────
        for (let i = 1; i <= 4; i++) {
          if (cancelled) break
          await w(230)
          setVisibleRows(i)
        }
        await w(900)

        // ── MOVE → GENERATE ──────────────────────────────
        if (cancelled) break
        moveTo(generateRef.current)
        await w(800)
        await click()
        if (!cancelled) setPanelOpen(true)
        await w(700) // wait for slide-in transition + buffer

        // ── MOVE → INPUT ─────────────────────────────────
        if (cancelled) break
        moveTo(inputRef.current)
        await w(360)
        if (!cancelled) setTyping(true)
        await w(1200) // ~58ms × 17 chars = 986ms, give extra buffer

        // ── SCORE FILL ───────────────────────────────────
        if (cancelled) break
        if (!cancelled) setScoreFill(true)
        await w(1400)

        // ── MOVE → SEND ──────────────────────────────────
        if (cancelled) break
        moveTo(sendRef.current)
        await w(720)
        await click()
        if (!cancelled) setShowSuccess(true)
        await w(360)
        if (!cancelled) setNewRow(true)
        await w(2200)

        // ── COLLAPSE ─────────────────────────────────────
        if (!cancelled) {
          setShowSuccess(false)
          setPanelOpen(false)
          setTyping(false)
          setScoreFill(false)
          setActiveNav('Overview')
        }
        await w(600)
        if (!cancelled) { setVisibleRows(0); setNewRow(false) }
        await w(500)
      }
    }

    loop()
    return () => { cancelled = true }
  }, [getPos])

  const wrapH = Math.round(INNER_H * scale)

  return (
    <div
      ref={wrapperRef}
      style={{
        width: '100%',
        height: `${wrapH}px`,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow:
          '0 0 0 1px rgba(255,255,255,0.03), ' +
          '0 40px 100px rgba(0,0,0,0.8), ' +
          '0 0 60px rgba(195,1,1,0.03)',
        background: '#060609',
      }}
    >
      {/* ── FIXED INNER ── */}
      <div
        ref={innerRef}
        style={{
          position: 'absolute', top: 0, left: 0,
          width: INNER_W, height: INNER_H,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          background: '#060609',
        }}
      >
        {/* Cursor lives at the top level — can float over any element */}
        <Cursor x={cursorX} y={cursorY} clicking={clicking} />

        {/* ── BROWSER CHROME ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          height: '30px', padding: '0 14px',
          background: '#09090E',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          flexShrink: 0,
        }}>
          {[0.14, 0.09, 0.06].map((o, i) => (
            <div key={i} style={{ width: '9px', height: '9px', borderRadius: '50%', background: `rgba(255,255,255,${o})` }} />
          ))}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '2px 14px',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '4px',
              fontSize: '10px', color: '#3A3A4A',
              fontFamily: 'JetBrains Mono, monospace',
            }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#00C9A7', flexShrink: 0, display: 'inline-block' }} />
              app.freelanceos.io/discover
            </div>
          </div>
        </div>

        {/* ── MAIN GRID ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '168px 1fr',
          height: `${INNER_H - 30}px`,
        }}>

          {/* ── SIDEBAR ── */}
          <aside style={{
            background: '#060609',
            borderRight: '1px solid rgba(255,255,255,0.05)',
            display: 'flex', flexDirection: 'column',
            padding: '16px 10px', gap: '1px',
          }}>
            {/* Logo */}
            <div style={{
              padding: '2px 8px 13px',
              fontSize: '12px', fontWeight: 800,
              letterSpacing: '-0.04em', color: '#F0EEF8',
            }}>
              Freelance<span style={{ color: '#c30101' }}>OS</span>
            </div>

            {/* AI Status */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '6px 8px', marginBottom: '10px',
              background: 'rgba(0,201,167,0.05)',
              borderRadius: '4px',
              border: '1px solid rgba(0,201,167,0.1)',
            }}>
              <span style={{
                width: '5px', height: '5px', borderRadius: '50%',
                background: '#00C9A7', display: 'inline-block', flexShrink: 0,
                animation: 'ai-pulse 2s ease-in-out infinite',
              }} />
              <span style={{ fontSize: '9px', fontWeight: 600, color: '#00C9A7', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                AI Active
              </span>
            </div>

            {/* Nav section header */}
            <div style={{ padding: '0 8px 4px', fontSize: '9px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#2A2A35' }}>
              Workspace
            </div>

            {/* Nav items */}
            {NAV_ITEMS.map(item => {
              const active = item.name === activeNav
              return (
                <div
                  key={item.name}
                  ref={item.name === 'Discover' ? discoverRef : undefined}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '7px 8px',
                    borderRadius: '4px',
                    borderLeft: `2px solid ${active ? '#c30101' : 'transparent'}`,
                    paddingLeft: active ? '10px' : '8px',
                    background: active ? 'rgba(255,255,255,0.05)' : 'transparent',
                    transition: 'all 0.22s ease',
                    cursor: 'default',
                  }}
                >
                  <span style={{
                    width: '5px', height: '5px', borderRadius: '1px',
                    background: active ? item.dot : 'rgba(255,255,255,0.12)',
                    flexShrink: 0, transition: 'background 0.2s ease',
                  }} />
                  <span style={{
                    fontSize: '12px',
                    fontWeight: active ? 600 : 400,
                    color: active ? '#F0EEF8' : '#3A3A4A',
                    transition: 'all 0.2s ease',
                  }}>
                    {item.name}
                  </span>
                  {item.name === 'Pitches' && (
                    <span style={{
                      marginLeft: 'auto', fontSize: '9px', fontWeight: 700,
                      color: '#c30101',
                      background: 'rgba(195,1,1,0.12)',
                      padding: '1px 5px', borderRadius: '3px',
                    }}>23</span>
                  )}
                </div>
              )
            })}

            {/* Bottom stat */}
            <div style={{
              marginTop: 'auto',
              padding: '12px 8px 4px',
              borderTop: '1px solid rgba(255,255,255,0.04)',
            }}>
              <div style={{ fontSize: '9px', color: '#2A2A35', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '3px' }}>Monthly Revenue</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#F0EEF8', letterSpacing: '-0.04em', lineHeight: 1 }}>$48K</div>
              <div style={{ fontSize: '9px', color: '#00C9A7', marginTop: '3px' }}>↑ 32% vs last month</div>
            </div>
          </aside>

          {/* ── MAIN PANEL ── */}
          <main style={{ position: 'relative', background: '#06060A', overflow: 'hidden' }}>

            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 18px',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
            }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#F0EEF8', letterSpacing: '-0.025em' }}>
                  {activeNav}
                </div>
                <div style={{ fontSize: '10px', color: '#2A2A35', marginTop: '1px' }}>
                  {activeNav === 'Discover' ? '1,284 potential clients • AI updated 2m ago' : 'Welcome back — your AI is running'}
                </div>
              </div>

              {/* Generate Pitch button — cursor targets this */}
              <div
                ref={generateRef}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '7px 14px',
                  background: '#c30101',
                  borderRadius: '4px',
                  fontSize: '11px', fontWeight: 700,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  color: '#fff', cursor: 'default',
                  boxShadow: '0 0 14px rgba(195,1,1,0.22)',
                  transition: 'all 0.12s ease',
                }}
              >
                <svg width="9" height="9" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 1L10.2 6.8L16 8L10.2 9.2L8 15L5.8 9.2L0 8L5.8 6.8L8 1Z"/>
                </svg>
                Generate Pitch
              </div>
            </div>

            {/* Metrics row */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
              gap: '1px', background: 'rgba(255,255,255,0.03)',
            }}>
              {[
                { label: 'Clients Found', value: '1,284', delta: '+47 today',  spark: SPARKLINES.clients, color: '#4F9EF0' },
                { label: 'Pitches Sent',  value: '3,841', delta: '+12 today',  spark: SPARKLINES.pitches, color: '#9B6FEB' },
                { label: 'Active Deals',  value: '24',    delta: '$72K value', spark: SPARKLINES.deals,   color: '#00C9A7' },
              ].map(m => (
                <div key={m.label} style={{ padding: '12px 16px', background: '#06060A', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '9px', color: '#2A2A35', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '5px' }}>{m.label}</div>
                    <div style={{ fontSize: '22px', fontWeight: 700, color: '#F0EEF8', letterSpacing: '-0.04em', lineHeight: 1 }}>{m.value}</div>
                    <div style={{ fontSize: '9px', color: '#3A4A48', marginTop: '4px' }}>{m.delta}</div>
                  </div>
                  <Sparkline values={m.spark} color={m.color} />
                </div>
              ))}
            </div>

            {/* Table header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '24px 1fr 72px 60px 64px',
              gap: '10px',
              padding: '9px 18px',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
              fontSize: '9px',
              color: '#2A2A35',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}>
              <span />
              <span>Company</span>
              <span>Industry</span>
              <span>Score</span>
              <span style={{ textAlign: 'right' }}>Status</span>
            </div>

            {/* Table rows */}
            {TABLE_ROWS.map((row, i) => {
              const visible = i < visibleRows
              const st = STATUS[row.status]
              return (
                <div key={row.company} style={{
                  display: 'grid',
                  gridTemplateColumns: '24px 1fr 72px 60px 64px',
                  gap: '10px',
                  alignItems: 'center',
                  padding: '8px 18px',
                  borderBottom: '1px solid rgba(255,255,255,0.025)',
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0)' : 'translateY(6px)',
                  transition: `opacity 0.28s ease ${i * 0.04}s, transform 0.28s ease ${i * 0.04}s`,
                }}>
                  {/* Avatar */}
                  <div style={{
                    width: '20px', height: '20px', borderRadius: '3px',
                    background: row.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '8px', fontWeight: 800, color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.01em',
                    flexShrink: 0,
                  }}>
                    {row.abbr}
                  </div>
                  <span style={{ fontSize: '12px', color: '#C8C6DA', fontWeight: 500 }}>{row.company}</span>
                  <span style={{ fontSize: '10px', color: '#3A3A4A',
                    background: 'rgba(255,255,255,0.04)', padding: '2px 6px', borderRadius: '3px',
                    fontWeight: 500, justifySelf: 'start',
                  }}>{row.industry}</span>
                  <span style={{ fontSize: '11px', color: '#00C9A7', fontWeight: 600 }}>{row.score}%</span>
                  <span style={{
                    padding: '2px 7px', borderRadius: '3px', fontSize: '9px',
                    fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                    background: st.bg, color: st.txt, textAlign: 'center', justifySelf: 'end',
                  }}>{row.status}</span>
                </div>
              )
            })}

            {/* New row */}
            {newRow && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: '24px 1fr 72px 60px 64px',
                gap: '10px', alignItems: 'center',
                padding: '8px 18px',
                borderBottom: '1px solid rgba(255,255,255,0.025)',
                opacity: 1, background: 'rgba(195,1,1,0.03)',
                transition: 'opacity 0.4s ease',
              }}>
                <div style={{
                  width: '20px', height: '20px', borderRadius: '3px',
                  background: '#881010', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '8px', fontWeight: 800, color: 'rgba(255,255,255,0.9)',
                }}>AD</div>
                <span style={{ fontSize: '12px', color: '#C8C6DA', fontWeight: 500 }}>{COMPANY}</span>
                <span style={{ fontSize: '10px', color: '#3A3A4A', background: 'rgba(255,255,255,0.04)', padding: '2px 6px', borderRadius: '3px' }}>SaaS</span>
                <span style={{ fontSize: '11px', color: '#00C9A7', fontWeight: 600 }}>94%</span>
                <span style={{ padding: '2px 7px', borderRadius: '3px', fontSize: '9px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', background: 'rgba(195,1,1,0.14)', color: '#FF4A58', textAlign: 'center', justifySelf: 'end' }}>Sent</span>
              </div>
            )}

            {/* ── SLIDE-IN PITCH PANEL ── */}
            <div style={{
              position: 'absolute', top: 0, right: 0, bottom: 0, width: '272px',
              background: '#08080D',
              borderLeft: '1px solid rgba(255,255,255,0.07)',
              transform: panelOpen ? 'translateX(0)' : 'translateX(100%)',
              transition: 'transform 0.42s cubic-bezier(0.33, 1, 0.68, 1)',
              display: 'flex', flexDirection: 'column', padding: '16px', gap: '12px',
            }}>
              {/* Panel header */}
              <div style={{ marginBottom: '2px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <svg width="9" height="9" viewBox="0 0 16 16" fill="#c30101">
                    <path d="M8 1L10.2 6.8L16 8L10.2 9.2L8 15L5.8 9.2L0 8L5.8 6.8L8 1Z"/>
                  </svg>
                  <span style={{ fontSize: '9px', fontWeight: 700, color: '#c30101', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    AI Pitch Generator
                  </span>
                </div>
                <div style={{ fontSize: '10px', color: '#2A2A35', marginTop: '3px' }}>Generating personalized outreach</div>
              </div>

              {/* Company field — cursor targets this */}
              <div>
                <div style={{ fontSize: '9px', color: '#2A2A35', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '5px', fontWeight: 600 }}>Company</div>
                <div
                  ref={inputRef}
                  style={{
                    padding: '7px 10px',
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${typing ? 'rgba(195,1,1,0.35)' : 'rgba(255,255,255,0.07)'}`,
                    borderRadius: '4px',
                    fontSize: '12px', color: '#C8C6DA',
                    minHeight: '30px',
                    transition: 'border-color 0.2s ease',
                  }}
                >
                  <Typewriter active={typing} text={COMPANY} />
                </div>
              </div>

              {/* Pitch type */}
              <div>
                <div style={{ fontSize: '9px', color: '#2A2A35', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '5px', fontWeight: 600 }}>Pitch Type</div>
                <div style={{
                  padding: '7px 10px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '4px',
                  fontSize: '12px', color: typing ? '#C8C6DA' : '#2A2A35',
                  transition: 'color 0.3s ease',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  {typing ? 'Cold Email' : '—'}
                  {typing && (
                    <svg width="9" height="9" viewBox="0 0 16 16" fill="#3A3A4A">
                      <path d="M4 6l4 4 4-4"/>
                    </svg>
                  )}
                </div>
              </div>

              {/* Score */}
              <ScoreBar fill={scoreFill} />

              {/* Preview snippet */}
              <div style={{
                padding: '9px',
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '4px',
                fontSize: '10px', color: '#3A3A4A', lineHeight: 1.65,
                opacity: scoreFill ? 1 : 0, transition: 'opacity 0.5s ease',
                fontStyle: 'italic',
              }}>
                &ldquo;Hi, I noticed Apex Digital is scaling their SaaS growth — I help companies like yours...&rdquo;
              </div>

              {/* Send button — cursor targets this */}
              <button
                ref={sendRef}
                style={{
                  marginTop: 'auto', padding: '10px',
                  background: '#c30101',
                  borderRadius: '4px', border: 'none',
                  fontSize: '11px', fontWeight: 700,
                  letterSpacing: '0.07em', textTransform: 'uppercase',
                  color: '#fff', cursor: 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                  transition: 'all 0.12s ease',
                  boxShadow: '0 0 18px rgba(195,1,1,0.2)',
                }}
              >
                <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M1 1l14 7L1 15V9l10-1L1 7V1z"/>
                </svg>
                Send Pitch
              </button>
            </div>

            {/* ── SUCCESS NOTIFICATION ── */}
            <div style={{
              position: 'absolute', top: '12px', right: panelOpen ? '284px' : '16px',
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '8px 12px',
              background: 'rgba(0,201,167,0.08)',
              border: '1px solid rgba(0,201,167,0.18)',
              borderRadius: '4px',
              fontSize: '11px', fontWeight: 500, color: '#00C9A7',
              opacity: showSuccess ? 1 : 0,
              transform: showSuccess ? 'translateY(0)' : 'translateY(-10px)',
              transition: 'opacity 0.3s ease, transform 0.3s ease, right 0.42s cubic-bezier(0.33,1,0.68,1)',
              zIndex: 60, pointerEvents: 'none',
              backdropFilter: 'blur(8px)', whiteSpace: 'nowrap',
            }}>
              <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm3.7 6.3L7.1 10.9c-.4.4-1 .4-1.4 0L3.3 8.5c-.4-.4-.4-1 0-1.4.4-.4 1-.4 1.4 0L6.4 8.8l3.9-3.9c.4-.4 1-.4 1.4 0 .4.4.4 1 0 1.4z"/>
              </svg>
              Pitch sent to {COMPANY}
            </div>
          </main>
        </div>

        {/* Subtle bottom fade */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px',
          background: 'linear-gradient(to top, #060609 0%, transparent 100%)',
          pointerEvents: 'none',
        }} />
      </div>
    </div>
  )
}
