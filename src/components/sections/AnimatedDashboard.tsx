'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS — strictly #5A0D0C / white / deep black ONLY
════════════════════════════════════════════════════════════════ */
const C = {
  bg:        '#050508',
  surface:   'rgba(255,255,255,0.03)',
  border:    'rgba(255,255,255,0.07)',
  borderDim: 'rgba(255,255,255,0.04)',
  white:     '#F5F5F8',        // primary text
  mid:       'rgba(255,255,255,0.38)',  // secondary text
  muted:     'rgba(255,255,255,0.18)', // muted labels
  dim:       'rgba(255,255,255,0.1)',   // very muted
  accent:    '#5A0D0C',        // brand maroon
  accentDim: 'rgba(90,13,12,0.18)',
  accentGlow:'rgba(90,13,12,0.6)',
}

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
════════════════════════════════════════════════════════════════ */
const INNER_W   = 940
const INNER_H   = 478
const COMPANY   = 'Apex Digital Co.'

const TABLE_ROWS = [
  { abbr: 'WC', company: 'Wave Commerce',   industry: 'E-commerce', score: 91, status: 'Replied' },
  { abbr: 'BS', company: 'Bright Studio',   industry: 'Design',     score: 87, status: 'Sent' },
  { abbr: 'PD', company: 'Peak Digital',    industry: 'SaaS',       score: 95, status: 'Deal' },
  { abbr: 'NC', company: 'Nova Collective', industry: 'Marketing',  score: 84, status: 'Queued' },
]

// Monochromatic status badges
const STATUS: Record<string, { bg: string; txt: string }> = {
  Deal:    { bg: 'rgba(255,255,255,0.09)', txt: 'rgba(255,255,255,0.78)' },
  Replied: { bg: 'rgba(255,255,255,0.06)', txt: 'rgba(255,255,255,0.55)' },
  Sent:    { bg: 'rgba(90,13,12,0.22)',    txt: 'rgba(200,80,75,1)' },
  Queued:  { bg: 'rgba(255,255,255,0.03)', txt: 'rgba(255,255,255,0.28)' },
}

const NAV_ITEMS = [
  'Overview', 'Discover', 'Clients', 'Pitches', 'Outreach', 'Deals',
]

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
════════════════════════════════════════════════════════════════ */

function Cursor({ x, y, clicking }: { x: number; y: number; clicking: boolean }) {
  return (
    <>
      <style>{`
        @keyframes ripple-dash {
          from { transform: translate(-3px,-3px) scale(0.4); opacity: 0.7; }
          to   { transform: translate(-3px,-3px) scale(2.8); opacity: 0; }
        }
        @keyframes blink-caret {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes accent-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(90,13,12,0.5); }
          50%       { box-shadow: 0 0 0 5px rgba(90,13,12,0); }
        }
      `}</style>

      {/* Arrow cursor */}
      <div style={{
        position: 'absolute', left: 0, top: 0,
        transform: `translate(${x}px, ${y}px)`,
        transition: 'transform 0.7s cubic-bezier(0.33, 1, 0.68, 1)',
        pointerEvents: 'none', zIndex: 999, willChange: 'transform',
      }}>
        <svg width="18" height="22" viewBox="0 0 18 22" fill="none"
          style={{
            transform: clicking ? 'scale(0.8)' : 'scale(1)',
            transition: 'transform 0.1s ease',
            filter: 'drop-shadow(0 2px 12px rgba(0,0,0,0.95))',
            display: 'block',
          }}
        >
          <path d="M2.5 2L2.5 17.5L7 12.8L10.2 19.5L12.2 18.6L9 11.8L16 11.8L2.5 2Z"
            fill="white"
            stroke="rgba(0,0,0,0.6)"
            strokeWidth="1"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Click ripple */}
      {clicking && (
        <div key={Math.random()} style={{
          position: 'absolute', left: x - 10, top: y - 10,
          width: '20px', height: '20px',
          borderRadius: '50%',
          border: `1.5px solid rgba(90,13,12,0.55)`,
          animation: 'ripple-dash 0.4s ease-out forwards',
          pointerEvents: 'none', zIndex: 998,
        }} />
      )}
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
    }, 56)
    return () => clearInterval(id)
  }, [active, text])
  return (
    <>
      {shown}
      {active && shown.length < text.length && (
        <span style={{
          display: 'inline-block', width: '1.5px', height: '11px',
          background: C.accent, marginLeft: '1px',
          verticalAlign: 'text-bottom',
          animation: 'blink-caret 0.7s step-end infinite',
        }} />
      )}
    </>
  )
}

function ScoreBar({ fill }: { fill: boolean }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
        <span style={{ fontSize: '9px', color: C.muted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          AI Score
        </span>
        <span style={{ fontSize: '11px', fontWeight: 700, color: fill ? C.white : C.dim, transition: 'color 0.3s' }}>
          {fill ? '94%' : '—'}
        </span>
      </div>
      <div style={{ height: '1.5px', background: C.dim, borderRadius: '1px', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: fill ? '94%' : '0%',
          background: C.accent,
          transition: 'width 1.2s cubic-bezier(0.22, 1, 0.36, 1)',
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

  /* ── ResizeObserver keeps inner canvas scaled to wrapper ── */
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

  /* ── Dynamic cursor targeting from refs ── */
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

  /* ── Animation loop ── */
  useEffect(() => {
    let cancelled = false
    const w = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

    const moveTo = (el: HTMLElement | null) => {
      const p = getPos(el)
      setCursorX(p.x); setCursorY(p.y)
    }
    const click = async () => {
      if (cancelled) return
      setClicking(true)
      await w(160)
      if (!cancelled) setClicking(false)
    }

    const loop = async () => {
      while (!cancelled) {
        // RESET
        setActiveNav('Overview'); setVisibleRows(0)
        setPanelOpen(false); setTyping(false)
        setScoreFill(false); setShowSuccess(false); setNewRow(false)
        setCursorX(300); setCursorY(60)
        await w(1100)
        if (cancelled) break

        // → Discover nav
        moveTo(discoverRef.current)
        await w(820)
        await click()
        if (!cancelled) setActiveNav('Discover')
        await w(300)

        // Rows appear
        for (let i = 1; i <= 4; i++) {
          if (cancelled) break
          await w(240); setVisibleRows(i)
        }
        await w(900)
        if (cancelled) break

        // → Generate Pitch button
        moveTo(generateRef.current)
        await w(820)
        await click()
        if (!cancelled) setPanelOpen(true)
        await w(700) // wait for panel transition
        if (cancelled) break

        // → Company input
        moveTo(inputRef.current)
        await w(380)
        if (!cancelled) setTyping(true)
        await w(1250)

        // Score fills
        if (!cancelled) setScoreFill(true)
        await w(1350)
        if (cancelled) break

        // → Send button
        moveTo(sendRef.current)
        await w(720)
        await click()
        if (!cancelled) setShowSuccess(true)
        await w(380)
        if (!cancelled) setNewRow(true)
        await w(2200)

        // Collapse
        if (!cancelled) {
          setShowSuccess(false); setPanelOpen(false)
          setTyping(false); setScoreFill(false); setActiveNav('Overview')
        }
        await w(620)
        if (!cancelled) { setVisibleRows(0); setNewRow(false) }
        await w(500)
      }
    }

    loop()
    return () => { cancelled = true }
  }, [getPos])

  const wrapH = Math.round(INNER_H * scale)

  return (
    /* ── ATMOSPHERIC OUTER WRAPPER ── */
    <div
      ref={wrapperRef}
      style={{
        width: '100%',
        height: `${wrapH}px`,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow:
          '0 0 0 1px rgba(255,255,255,0.03), ' +
          '0 60px 140px rgba(0,0,0,0.92), ' +
          '0 0 80px rgba(90,13,12,0.05)',
      }}
    >
      {/* Atmospheric background — deep maroon glow, Raycast-style */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0, background: C.bg, zIndex: 0,
      }} />
      {/* Top-right crimson atmosphere */}
      <div aria-hidden style={{
        position: 'absolute',
        top: '-100px', right: '-80px',
        width: '55%', height: '120%',
        background: `radial-gradient(ellipse at 70% 30%, ${C.accentGlow} 0%, rgba(90,13,12,0.2) 40%, transparent 68%)`,
        pointerEvents: 'none', zIndex: 0,
      }} />
      {/* Subtle vignette */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(0,0,0,0.6) 100%)',
        pointerEvents: 'none', zIndex: 1,
      }} />

      {/* ── FIXED-WIDTH INNER — gets scaled to fill wrapper ── */}
      <div
        ref={innerRef}
        style={{
          position: 'absolute', top: 0, left: 0,
          width: INNER_W, height: INNER_H,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          zIndex: 2,
        }}
      >
        {/* Cursor lives at top level — floats over sidebar + main */}
        <Cursor x={cursorX} y={cursorY} clicking={clicking} />

        {/* ── BROWSER CHROME ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          height: '30px', padding: '0 14px',
          background: 'rgba(0,0,0,0.65)',
          borderBottom: `1px solid ${C.borderDim}`,
          backdropFilter: 'blur(8px)',
        }}>
          {[0.18, 0.11, 0.07].map((o, i) => (
            <div key={i} style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: `rgba(255,255,255,${o})`,
            }} />
          ))}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '2px 14px',
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${C.borderDim}`,
              borderRadius: '4px',
              fontSize: '10px', color: C.dim,
              fontFamily: 'JetBrains Mono, monospace',
            }}>
              <span style={{
                width: '5px', height: '5px', borderRadius: '50%',
                background: C.accent, display: 'inline-block',
                animation: 'accent-pulse 2.5s ease-in-out infinite',
              }} />
              app.freelanceos.io
            </div>
          </div>
        </div>

        {/* ── DASHBOARD GRID ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '164px 1fr',
          height: `${INNER_H - 30}px`,
        }}>

          {/* ─────── SIDEBAR ─────── */}
          <aside style={{
            background: 'rgba(0,0,0,0.5)',
            borderRight: `1px solid ${C.borderDim}`,
            display: 'flex', flexDirection: 'column',
            padding: '14px 8px', gap: '1px',
            backdropFilter: 'blur(10px)',
          }}>
            {/* Logo */}
            <div style={{
              padding: '2px 8px 13px',
              fontSize: '12px', fontWeight: 800,
              letterSpacing: '-0.04em', color: C.white,
            }}>
              Freelance<span style={{ color: C.accent }}>OS</span>
            </div>

            {/* AI Status */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '5px 8px', marginBottom: '9px',
              background: C.accentDim,
              border: `1px solid rgba(90,13,12,0.25)`,
              borderRadius: '4px',
            }}>
              <span style={{
                width: '5px', height: '5px', borderRadius: '50%',
                background: C.accent, display: 'inline-block', flexShrink: 0,
                animation: 'accent-pulse 2s ease-in-out infinite',
              }} />
              <span style={{
                fontSize: '9px', fontWeight: 700,
                color: 'rgba(200,80,75,1)',
                letterSpacing: '0.09em', textTransform: 'uppercase',
              }}>
                AI Active
              </span>
            </div>

            {/* Nav section label */}
            <div style={{
              padding: '0 8px 4px',
              fontSize: '8.5px', fontWeight: 600,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: C.dim,
            }}>
              Workspace
            </div>

            {/* Nav items */}
            {NAV_ITEMS.map(item => {
              const active = item === activeNav
              return (
                <div
                  key={item}
                  ref={item === 'Discover' ? discoverRef : undefined}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '7px 8px',
                    borderRadius: '4px',
                    borderLeft: `2px solid ${active ? C.accent : 'transparent'}`,
                    paddingLeft: active ? '9px' : '8px',
                    background: active
                      ? 'linear-gradient(90deg, rgba(90,13,12,0.14) 0%, rgba(90,13,12,0.04) 100%)'
                      : 'transparent',
                    transition: 'all 0.22s ease',
                    cursor: 'default',
                  }}
                >
                  <span style={{
                    width: '4px', height: '4px', borderRadius: '1px',
                    background: active ? C.accent : 'rgba(255,255,255,0.14)',
                    flexShrink: 0, transition: 'background 0.22s ease',
                  }} />
                  <span style={{
                    fontSize: '12px',
                    fontWeight: active ? 600 : 400,
                    color: active ? C.white : C.muted,
                    transition: 'all 0.22s ease',
                  }}>
                    {item}
                  </span>
                  {item === 'Pitches' && (
                    <span style={{
                      marginLeft: 'auto', fontSize: '9px', fontWeight: 700,
                      color: 'rgba(200,80,75,1)',
                      background: C.accentDim,
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
              borderTop: `1px solid ${C.borderDim}`,
            }}>
              <div style={{
                fontSize: '8.5px', color: C.dim,
                letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '3px',
              }}>
                Monthly Revenue
              </div>
              <div style={{
                fontSize: '20px', fontWeight: 700,
                color: C.white, letterSpacing: '-0.04em', lineHeight: 1,
              }}>
                $48K
              </div>
              <div style={{ fontSize: '9px', color: C.mid, marginTop: '3px' }}>
                ↑ 32%
              </div>
            </div>
          </aside>

          {/* ─────── MAIN ─────── */}
          <main style={{
            position: 'relative',
            background: 'rgba(5,5,8,0.7)',
            backdropFilter: 'blur(10px)',
            overflow: 'hidden',
          }}>

            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 18px',
              borderBottom: `1px solid ${C.borderDim}`,
            }}>
              <div>
                <div style={{
                  fontSize: '13px', fontWeight: 600,
                  color: C.white, letterSpacing: '-0.025em',
                }}>
                  {activeNav}
                </div>
                <div style={{ fontSize: '10px', color: C.dim, marginTop: '1px' }}>
                  {activeNav === 'Discover'
                    ? '1,284 potential clients · AI-filtered'
                    : 'Freelance automation dashboard'}
                </div>
              </div>

              {/* Generate Pitch — cursor target */}
              <div
                ref={generateRef}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '7px 14px',
                  background: C.accent,
                  borderRadius: '4px',
                  fontSize: '10.5px', fontWeight: 700,
                  letterSpacing: '0.07em', textTransform: 'uppercase',
                  color: C.white, cursor: 'default',
                  boxShadow: '0 0 20px rgba(90,13,12,0.35)',
                }}
              >
                <svg width="9" height="9" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 1L10.2 6.8L16 8L10.2 9.2L8 15L5.8 9.2L0 8L5.8 6.8L8 1Z"/>
                </svg>
                Generate Pitch
              </div>
            </div>

            {/* Metrics row — no sparklines, clean monochromatic */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
              borderBottom: `1px solid ${C.borderDim}`,
            }}>
              {[
                { label: 'Clients Found', value: '1,284', delta: '+47 today' },
                { label: 'Pitches Sent',  value: '3,841', delta: '+12 today' },
                { label: 'Active Deals',  value: '24',    delta: '$72K value' },
              ].map((m, i) => (
                <div key={m.label} style={{
                  padding: '12px 18px',
                  borderRight: i < 2 ? `1px solid ${C.borderDim}` : 'none',
                }}>
                  <div style={{
                    fontSize: '9px', color: C.dim,
                    letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '5px',
                  }}>
                    {m.label}
                  </div>
                  <div style={{
                    fontSize: '22px', fontWeight: 700,
                    color: C.white, letterSpacing: '-0.04em', lineHeight: 1,
                  }}>
                    {m.value}
                  </div>
                  <div style={{ fontSize: '10px', color: C.muted, marginTop: '4px' }}>
                    {m.delta}
                  </div>
                </div>
              ))}
            </div>

            {/* Table header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '20px 1fr 76px 52px 70px',
              gap: '12px', padding: '8px 18px',
              borderBottom: `1px solid ${C.borderDim}`,
              fontSize: '8.5px', color: C.dim,
              letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600,
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
                  gridTemplateColumns: '20px 1fr 76px 52px 70px',
                  gap: '12px', alignItems: 'center',
                  padding: '8px 18px',
                  borderBottom: `1px solid ${C.borderDim}`,
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0)' : 'translateY(6px)',
                  transition: `opacity 0.28s ease ${i * 0.05}s, transform 0.28s ease ${i * 0.05}s`,
                }}>
                  {/* Abbr avatar — monochromatic only */}
                  <div style={{
                    width: '20px', height: '20px', borderRadius: '3px',
                    background: 'rgba(255,255,255,0.08)',
                    border: `1px solid ${C.borderDim}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '8px', fontWeight: 800, color: C.mid,
                    letterSpacing: '-0.02em', flexShrink: 0,
                  }}>
                    {row.abbr}
                  </div>
                  <span style={{ fontSize: '12px', color: C.white, fontWeight: 500 }}>
                    {row.company}
                  </span>
                  <span style={{
                    fontSize: '10px', color: C.muted,
                    background: C.surface, padding: '2px 6px', borderRadius: '3px',
                    border: `1px solid ${C.borderDim}`, justifySelf: 'start',
                  }}>
                    {row.industry}
                  </span>
                  <span style={{ fontSize: '11px', color: C.mid, fontWeight: 600 }}>
                    {row.score}%
                  </span>
                  <span style={{
                    padding: '2px 7px', borderRadius: '3px',
                    fontSize: '9px', fontWeight: 700,
                    letterSpacing: '0.07em', textTransform: 'uppercase',
                    background: st.bg, color: st.txt, textAlign: 'center',
                    justifySelf: 'end', border: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    {row.status}
                  </span>
                </div>
              )
            })}

            {/* New row after send */}
            {newRow && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: '20px 1fr 76px 52px 70px',
                gap: '12px', alignItems: 'center',
                padding: '8px 18px',
                borderBottom: `1px solid ${C.borderDim}`,
                background: 'rgba(90,13,12,0.06)',
              }}>
                <div style={{
                  width: '20px', height: '20px', borderRadius: '3px',
                  background: C.accentDim,
                  border: `1px solid rgba(90,13,12,0.25)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '8px', fontWeight: 800, color: 'rgba(200,80,75,0.9)',
                }}>AD</div>
                <span style={{ fontSize: '12px', color: C.white, fontWeight: 500 }}>{COMPANY}</span>
                <span style={{ fontSize: '10px', color: C.muted, background: C.surface, padding: '2px 6px', borderRadius: '3px', border: `1px solid ${C.borderDim}`, justifySelf: 'start' }}>SaaS</span>
                <span style={{ fontSize: '11px', color: C.mid, fontWeight: 600 }}>94%</span>
                <span style={{ padding: '2px 7px', borderRadius: '3px', fontSize: '9px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', background: 'rgba(90,13,12,0.22)', color: 'rgba(200,80,75,1)', textAlign: 'center', justifySelf: 'end', border: '1px solid rgba(90,13,12,0.2)' }}>Sent</span>
              </div>
            )}

            {/* ── SLIDE-IN PITCH PANEL (glassmorphism) ── */}
            <div style={{
              position: 'absolute', top: 0, right: 0, bottom: 0, width: '268px',
              background: 'rgba(4,4,8,0.88)',
              backdropFilter: 'blur(24px) saturate(140%)',
              WebkitBackdropFilter: 'blur(24px) saturate(140%)',
              borderLeft: `1px solid ${C.border}`,
              transform: panelOpen ? 'translateX(0)' : 'translateX(100%)',
              transition: 'transform 0.44s cubic-bezier(0.33, 1, 0.68, 1)',
              display: 'flex', flexDirection: 'column', padding: '16px', gap: '12px',
            }}>
              {/* Panel header */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
                  <svg width="8" height="8" viewBox="0 0 16 16" fill={C.accent}>
                    <path d="M8 1L10.2 6.8L16 8L10.2 9.2L8 15L5.8 9.2L0 8L5.8 6.8L8 1Z"/>
                  </svg>
                  <span style={{
                    fontSize: '9px', fontWeight: 700, color: 'rgba(200,80,75,1)',
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                  }}>
                    AI Pitch Generator
                  </span>
                </div>
                <div style={{ fontSize: '10px', color: C.dim }}>
                  Generating personalized outreach
                </div>
              </div>

              {/* Company field — cursor target */}
              <div>
                <div style={{
                  fontSize: '9px', color: C.dim,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  marginBottom: '5px', fontWeight: 600,
                }}>
                  Company
                </div>
                <div
                  ref={inputRef}
                  style={{
                    padding: '7px 10px',
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${typing ? 'rgba(90,13,12,0.4)' : C.border}`,
                    borderRadius: '4px',
                    fontSize: '12px', color: C.white,
                    minHeight: '30px',
                    transition: 'border-color 0.2s ease',
                  }}
                >
                  <Typewriter active={typing} text={COMPANY} />
                </div>
              </div>

              {/* Pitch type */}
              <div>
                <div style={{
                  fontSize: '9px', color: C.dim,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  marginBottom: '5px', fontWeight: 600,
                }}>
                  Pitch Type
                </div>
                <div style={{
                  padding: '7px 10px',
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${C.border}`,
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: typing ? C.white : C.dim,
                  transition: 'color 0.3s ease',
                }}>
                  {typing ? 'Cold Email' : '—'}
                </div>
              </div>

              {/* Score bar */}
              <ScoreBar fill={scoreFill} />

              {/* Preview fragment */}
              <div style={{
                padding: '9px',
                background: 'rgba(255,255,255,0.025)',
                border: `1px solid ${C.borderDim}`,
                borderRadius: '4px',
                fontSize: '10px', color: C.muted, lineHeight: 1.65,
                fontStyle: 'italic',
                opacity: scoreFill ? 1 : 0,
                transition: 'opacity 0.5s ease',
              }}>
                &ldquo;Hi, I noticed Apex Digital is scaling rapidly — I help companies like yours...&rdquo;
              </div>

              {/* Send — cursor target */}
              <button
                ref={sendRef}
                style={{
                  marginTop: 'auto', padding: '10px',
                  background: C.accent,
                  borderRadius: '4px', border: 'none',
                  fontSize: '11px', fontWeight: 700,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: C.white, cursor: 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                  boxShadow: '0 0 20px rgba(90,13,12,0.3)',
                  transition: 'all 0.12s ease',
                }}
              >
                <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M1 1l14 7L1 15V9l10-1L1 7V1z"/>
                </svg>
                Send Pitch
              </button>
            </div>

            {/* ── SUCCESS TOAST ── */}
            <div style={{
              position: 'absolute', top: '12px',
              right: panelOpen ? '280px' : '16px',
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '7px 12px',
              background: 'rgba(255,255,255,0.06)',
              border: `1px solid ${C.border}`,
              borderRadius: '4px',
              backdropFilter: 'blur(12px)',
              fontSize: '11px', fontWeight: 500, color: C.white,
              opacity: showSuccess ? 1 : 0,
              transform: showSuccess ? 'translateY(0)' : 'translateY(-10px)',
              transition: 'opacity 0.3s ease, transform 0.3s ease, right 0.44s cubic-bezier(0.33,1,0.68,1)',
              zIndex: 60, pointerEvents: 'none', whiteSpace: 'nowrap',
            }}>
              <div style={{
                width: '5px', height: '5px', borderRadius: '50%',
                background: C.accent, flexShrink: 0,
              }} />
              Pitch sent to {COMPANY}
            </div>
          </main>
        </div>

        {/* Bottom fade */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '50px',
          background: 'linear-gradient(to top, rgba(5,5,8,0.8) 0%, transparent 100%)',
          pointerEvents: 'none', zIndex: 3,
        }} />
      </div>
    </div>
  )
}
