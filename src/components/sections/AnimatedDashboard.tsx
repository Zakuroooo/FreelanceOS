'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

/* ═══════════════════════════════════════════════════════════════
   TOKENS — strictly #5A0D0C / white / deep black only
════════════════════════════════════════════════════════════════ */
const C = {
  bg:         '#040407',
  panel:      'rgba(10,10,18,0.97)',
  panelLight: 'rgba(14,14,22,0.97)',
  border:     'rgba(255,255,255,0.1)',
  borderDim:  'rgba(255,255,255,0.06)',
  white:      '#F5F5F8',
  mid:        'rgba(255,255,255,0.45)',
  muted:      'rgba(255,255,255,0.25)',
  dim:        'rgba(255,255,255,0.13)',
  accent:     '#5A0D0C',
  accentTxt:  'rgba(190,72,68,1)',
  accentDim:  'rgba(90,13,12,0.2)',
}

const INNER_W = 880
const INNER_H = 452

const SEARCH_TEXT = 'fintech startups US'
const PITCH_TEXT  = 'Hi Sarah, I noticed Bright Studio is scaling — I help design-led brands automate client acquisition at 3× the speed...'

const CLIENTS = [
  { abbr: 'WC', company: 'Wave Commerce',   cat: 'E-commerce',  score: 91 },
  { abbr: 'BS', company: 'Bright Studio',   cat: 'Design Lab',  score: 87 },
  { abbr: 'PD', company: 'Peak Digital',    cat: 'SaaS',        score: 95 },
  { abbr: 'NC', company: 'Nova Collective', cat: 'Marketing',   score: 83 },
]

const CTX_ACTIONS = [
  { label: 'Generate Pitch',     keys: ['↵'],        ref: true },
  { label: 'Save to CRM',        keys: ['⌘', 'S'],   ref: false },
  { label: 'Cold Email Draft',   keys: ['⌘', 'E'],   ref: false },
  { label: 'Schedule Follow-up', keys: ['⌘', 'F'],   ref: false },
]

/* ─── KBD tag ─────────────────────────────────────────────── */
function Kbd({ s }: { s: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      minWidth: '16px', height: '16px', padding: '0 3px',
      background: 'rgba(255,255,255,0.07)',
      border: '1px solid rgba(255,255,255,0.13)',
      borderRadius: '3px',
      fontSize: '8px', fontWeight: 700, color: C.muted,
      letterSpacing: 0,
    }}>
      {s}
    </span>
  )
}

/* ─── Typewriter ──────────────────────────────────────────── */
function Typewriter({ active, text, speed = 65 }: { active: boolean; text: string; speed?: number }) {
  const [shown, setShown] = useState('')
  useEffect(() => {
    if (!active) { setShown(''); return }
    let i = 0
    const id = setInterval(() => {
      i++; setShown(text.slice(0, i))
      if (i >= text.length) clearInterval(id)
    }, speed)
    return () => clearInterval(id)
  }, [active, text, speed])
  return (
    <>
      {shown}
      {active && shown.length < text.length && (
        <span style={{ width: '1.5px', height: '13px', background: C.white, display: 'inline-block', marginLeft: '1px', verticalAlign: 'text-bottom', animation: 'tw-blink 0.65s step-end infinite' }} />
      )}
    </>
  )
}

/* ─── Cursor ──────────────────────────────────────────────── */
function Cursor({ x, y, clicking }: { x: number; y: number; clicking: boolean }) {
  const [ripple, setRipple] = useState(false)
  useEffect(() => {
    if (!clicking) return
    setRipple(true)
    const t = setTimeout(() => setRipple(false), 420)
    return () => clearTimeout(t)
  }, [clicking])

  return (
    <>
      <style>{`
        @keyframes tw-blink   { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes c-ripple   { from{transform:translate(-4px,-4px)scale(0.3);opacity:0.85} to{transform:translate(-4px,-4px)scale(3.2);opacity:0} }
        @keyframes pitch-in   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ctx-in     { from{opacity:0;transform:scale(0.94) translateY(-4px)} to{opacity:1;transform:scale(1) translateY(0)} }
      `}</style>

      {/* Arrow */}
      <div style={{ position: 'absolute', left: 0, top: 0, transform: `translate(${x}px,${y}px)`, transition: 'transform 0.7s cubic-bezier(0.33,1,0.68,1)', pointerEvents: 'none', zIndex: 999, willChange: 'transform' }}>
        <svg width="17" height="21" viewBox="0 0 17 21" fill="none"
          style={{ transform: clicking ? 'scale(0.8)' : 'scale(1)', transition: 'transform 0.1s', filter: 'drop-shadow(0 2px 14px rgba(0,0,0,0.99))', display: 'block' }}>
          <path d="M2 2L2 17L6.5 12.5L9.5 19L11.5 18.2L8.5 11.8L15.5 11.8L2 2Z"
            fill="white" stroke="rgba(0,0,0,0.55)" strokeWidth="0.8" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Ripple */}
      {ripple && (
        <div style={{ position: 'absolute', left: x, top: y, width: '18px', height: '18px', borderRadius: '50%', border: '1.5px solid rgba(90,13,12,0.55)', animation: 'c-ripple 0.42s ease-out forwards', pointerEvents: 'none', zIndex: 998 }} />
      )}
    </>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MAIN
════════════════════════════════════════════════════════════════ */
export default function AnimatedDashboard() {
  const wrapperRef   = useRef<HTMLDivElement>(null)
  const innerRef     = useRef<HTMLDivElement>(null)
  const searchRef    = useRef<HTMLDivElement>(null)
  const row1Ref      = useRef<HTMLDivElement>(null)   // Bright Studio
  const genRef       = useRef<HTMLDivElement>(null)   // "Generate Pitch" in ctx menu
  const sendRef      = useRef<HTMLButtonElement>(null)
  const scaleRef     = useRef(1)

  const [scale,       setScale]       = useState(1)
  const [cx,          setCx]          = useState(240)
  const [cy,          setCy]          = useState(90)
  const [clicking,    setClicking]    = useState(false)
  const [typing,      setTyping]      = useState(false)
  const [rows,        setRows]        = useState(0)
  const [selRow,      setSelRow]      = useState(-1)
  const [showCtx,     setShowCtx]     = useState(false)
  const [showPitch,   setShowPitch]   = useState(false)
  const [pitchTyping, setPitchTyping] = useState(false)
  const [showOk,      setShowOk]      = useState(false)

  /* ResizeObserver */
  useEffect(() => {
    if (!wrapperRef.current) return
    const obs = new ResizeObserver(([e]) => {
      if (!e) return
      const s = e.contentRect.width / INNER_W
      scaleRef.current = s; setScale(s)
    })
    obs.observe(wrapperRef.current)
    return () => obs.disconnect()
  }, [])

  const getPos = useCallback((el: HTMLElement | null) => {
    if (!el || !innerRef.current) return { x: 240, y: 90 }
    const ir = innerRef.current.getBoundingClientRect()
    const er = el.getBoundingClientRect()
    const s  = scaleRef.current || 1
    return { x: (er.left - ir.left + er.width * 0.5) / s, y: (er.top - ir.top + er.height * 0.5) / s }
  }, [])

  /* Animation loop */
  useEffect(() => {
    let cancelled = false
    const w = (ms: number) => new Promise<void>(r => setTimeout(r, ms))
    const mov = (el: HTMLElement | null) => { const p = getPos(el); setCx(p.x); setCy(p.y) }
    const clk = async () => { if (cancelled) return; setClicking(true); await w(160); if (!cancelled) setClicking(false) }

    const loop = async () => {
      while (!cancelled) {
        // RESET
        setTyping(false); setRows(0); setSelRow(-1)
        setShowCtx(false); setShowPitch(false); setPitchTyping(false); setShowOk(false)
        setCx(280); setCy(90)
        await w(1100); if (cancelled) break

        // → Search box
        mov(searchRef.current)
        await w(820)
        await clk()
        await w(300)
        if (!cancelled) setTyping(true)
        await w(1350) // typing "fintech startups US" ≈19 chars × 65ms

        // Results appear
        for (let i = 1; i <= 4; i++) { if (cancelled) break; await w(230); setRows(i) }
        await w(800); if (cancelled) break

        // → Row 1 (Bright Studio)
        mov(row1Ref.current)
        await w(820)
        if (!cancelled) setSelRow(1)
        await w(300)
        await clk()
        if (!cancelled) setShowCtx(true)
        await w(260); if (cancelled) break

        // → Generate Pitch in context menu
        mov(genRef.current)
        await w(720)
        await clk()
        if (!cancelled) { setShowCtx(false); setShowPitch(true) }
        await w(420)
        if (!cancelled) setPitchTyping(true)
        await w(2200) // typing pitch ≈113 chars × 28ms

        // → Send
        mov(sendRef.current)
        await w(760)
        await clk()
        if (!cancelled) setShowOk(true)
        await w(2400)

        // Teardown
        if (!cancelled) { setShowOk(false); setShowPitch(false); setPitchTyping(false) }
        await w(500)
        if (!cancelled) { setRows(0); setSelRow(-1); setTyping(false) }
        await w(400)
      }
    }
    loop()
    return () => { cancelled = true }
  }, [getPos])

  const wrapH = Math.round(INNER_H * scale)

  return (
    <div ref={wrapperRef} style={{ width: '100%', height: `${wrapH}px`, position: 'relative', overflow: 'hidden', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.09)', boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 60px 140px rgba(0,0,0,0.94)' }}>

      {/* Atmospheric background */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, background: C.bg, zIndex: 0 }} />
      {/* Bottom-left crimson glow — like Raycast screenshot */}
      <div aria-hidden style={{ position: 'absolute', bottom: '-80px', left: '-60px', width: '65%', height: '130%', background: 'radial-gradient(ellipse at 15% 85%, rgba(90,13,12,0.8) 0%, rgba(55,8,8,0.3) 38%, transparent 62%)', pointerEvents: 'none', zIndex: 0 }} />
      {/* Top right subtle hint */}
      <div aria-hidden style={{ position: 'absolute', top: '-30px', right: '-30px', width: '28%', height: '55%', background: 'radial-gradient(ellipse, rgba(90,13,12,0.1) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* INNER SCALED CANVAS */}
      <div ref={innerRef} style={{ position: 'absolute', top: 0, left: 0, width: INNER_W, height: INNER_H, transform: `scale(${scale})`, transformOrigin: 'top left', zIndex: 2 }}>

        <Cursor x={cx} y={cy} clicking={clicking} />

        {/* Browser chrome */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '30px', padding: '0 14px', background: 'rgba(0,0,0,0.72)', borderBottom: `1px solid ${C.borderDim}` }}>
          {[0.22, 0.13, 0.07].map((o, i) => <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: `rgba(255,255,255,${o})` }} />)}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '2px 14px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.borderDim}`, borderRadius: '4px', fontSize: '10px', color: C.dim, fontFamily: 'JetBrains Mono, monospace' }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: C.accent, display: 'inline-block' }} />
              app.freelanceos.io/discover
            </div>
          </div>
        </div>

        {/* Main canvas */}
        <div style={{ position: 'relative', height: `${INNER_H - 30}px` }}>

          {/* ── COMMAND PALETTE PANEL ── */}
          <div style={{
            position: 'absolute',
            left: '140px', top: '44px',
            width: '600px',
            background: C.panel,
            border: `1px solid ${C.border}`,
            borderRadius: '10px',
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            boxShadow: '0 48px 96px rgba(0,0,0,0.72), 0 0 0 1px rgba(255,255,255,0.05)',
            overflow: 'hidden',
          }}>
            {/* Search bar */}
            <div ref={searchRef} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 18px', height: '54px', borderBottom: `1px solid ${C.borderDim}` }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M10 3L5 8L10 13" stroke={C.muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ flex: 1, fontSize: '15px', fontWeight: 400, color: C.white, letterSpacing: '-0.01em', minHeight: '20px', display: 'block' }}>
                <Typewriter active={typing} text={SEARCH_TEXT} />
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 10px', background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.border}`, borderRadius: '5px', fontSize: '11px', color: C.mid, whiteSpace: 'nowrap', flexShrink: 0 }}>
                All Clients
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5L5 6.5L8 3.5" stroke={C.muted} strokeWidth="1.2" strokeLinecap="round"/></svg>
              </div>
            </div>

            {/* Section label */}
            <div style={{ padding: '8px 18px 3px', fontSize: '9px', fontWeight: 700, color: C.dim, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Clients
            </div>

            {/* Results */}
            {CLIENTS.map((cl, idx) => {
              const visible = idx < rows
              const selected = selRow === idx
              return (
                <div
                  key={cl.company}
                  ref={idx === 1 ? row1Ref : undefined}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '11px',
                    padding: '8px 18px',
                    background: selected ? 'rgba(255,255,255,0.07)' : 'transparent',
                    borderLeft: `2px solid ${selected ? C.accent : 'transparent'}`,
                    paddingLeft: selected ? '16px' : '18px',
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateY(0)' : 'translateY(6px)',
                    transition: `opacity 0.24s ease ${idx * 0.06}s, transform 0.24s ease ${idx * 0.06}s, background 0.15s`,
                    cursor: 'default',
                  }}
                >
                  <div style={{ width: '26px', height: '26px', borderRadius: '5px', background: 'rgba(255,255,255,0.08)', border: `1px solid ${C.borderDim}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8.5px', fontWeight: 800, color: C.mid, flexShrink: 0 }}>
                    {cl.abbr}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: selected ? 500 : 400, color: selected ? C.white : 'rgba(255,255,255,0.72)', letterSpacing: '-0.01em' }}>{cl.company}</div>
                    <div style={{ fontSize: '10px', color: C.dim, marginTop: '1px' }}>{cl.cat}</div>
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: C.muted }}>{cl.score}%</div>
                </div>
              )
            })}

            {/* Bottom bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', height: '38px', borderTop: `1px solid ${C.borderDim}`, marginTop: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="9" height="9" viewBox="0 0 16 16" fill={C.accent}><path d="M8 1L10.2 6.8L16 8L10.2 9.2L8 15L5.8 9.2L0 8L5.8 6.8L8 1Z"/></svg>
                <span style={{ fontSize: '10px', color: C.muted, fontWeight: 500 }}>FreelanceOS</span>
                <span style={{ fontSize: '10px', color: C.dim }}>· {rows} clients found</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '10px', color: C.dim, marginRight: '3px' }}>Actions</span>
                <Kbd s="⌘" /><Kbd s="K" />
              </div>
            </div>
          </div>

          {/* ── CONTEXT MENU ── */}
          <div style={{
            position: 'absolute',
            left: '516px', top: '166px',
            width: '232px',
            background: C.panelLight,
            border: `1px solid rgba(255,255,255,0.14)`,
            borderRadius: '8px',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            boxShadow: '0 28px 64px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.07)',
            overflow: 'hidden',
            opacity: showCtx ? 1 : 0,
            transform: showCtx ? 'scale(1) translateY(0)' : 'scale(0.94) translateY(-5px)',
            transformOrigin: 'top left',
            transition: 'opacity 0.18s ease, transform 0.18s ease',
            pointerEvents: showCtx ? 'auto' : 'none',
          }}>
            {CTX_ACTIONS.map((action, idx) => (
              <div
                key={action.label}
                ref={action.ref ? genRef : undefined}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '9px 12px',
                  background: idx === 0 ? 'rgba(255,255,255,0.07)' : 'transparent',
                  borderBottom: idx < CTX_ACTIONS.length - 1 ? `1px solid rgba(255,255,255,0.05)` : 'none',
                  cursor: 'default',
                }}
              >
                <span style={{ fontSize: '12px', color: idx === 0 ? C.white : C.mid, fontWeight: idx === 0 ? 500 : 400 }}>
                  {action.label}
                </span>
                <div style={{ display: 'flex', gap: '3px' }}>
                  {action.keys.map(k => <Kbd key={k} s={k} />)}
                </div>
              </div>
            ))}
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '3px 0' }} />
            <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '7px' }}>
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke={C.dim} strokeWidth="1.5"/><path d="M11 11L14 14" stroke={C.dim} strokeWidth="1.5" strokeLinecap="round"/></svg>
              <span style={{ fontSize: '11px', color: C.dim }}>Search actions...</span>
            </div>
          </div>

          {/* ── PITCH PANEL (overlays command palette) ── */}
          {showPitch && (
            <div style={{
              position: 'absolute', left: '140px', top: '44px', width: '600px',
              background: C.panel,
              border: `1px solid ${C.border}`,
              borderRadius: '10px',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
              boxShadow: '0 48px 96px rgba(0,0,0,0.72), 0 0 0 1px rgba(255,255,255,0.05)',
              animation: 'pitch-in 0.3s ease forwards',
              overflow: 'hidden',
            }}>
              {/* Panel header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 18px', borderBottom: `1px solid ${C.borderDim}` }}>
                <svg width="9" height="9" viewBox="0 0 16 16" fill={C.accent}><path d="M8 1L10.2 6.8L16 8L10.2 9.2L8 15L5.8 9.2L0 8L5.8 6.8L8 1Z"/></svg>
                <span style={{ fontSize: '12px', fontWeight: 600, color: C.white, letterSpacing: '-0.01em' }}>
                  Pitch for Bright Studio
                </span>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '9px', fontWeight: 700, color: C.accentTxt, letterSpacing: '0.08em', textTransform: 'uppercase' }}>94% match</span>
                  <div style={{ width: '48px', height: '2px', background: 'rgba(255,255,255,0.08)', borderRadius: '1px', overflow: 'hidden' }}>
                    <div style={{ width: '94%', height: '100%', background: C.accent }} />
                  </div>
                </div>
              </div>

              {/* Pitch text */}
              <div style={{ padding: '18px 18px 12px', minHeight: '80px' }}>
                <div style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.78, letterSpacing: '-0.005em' }}>
                  <Typewriter active={pitchTyping} text={PITCH_TEXT} speed={28} />
                </div>
              </div>

              {/* Channels */}
              <div style={{ display: 'flex', gap: '6px', padding: '0 18px 14px' }}>
                {['Cold Email', 'LinkedIn DM', 'Sequence'].map(ch => (
                  <span key={ch} style={{ padding: '3px 8px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.borderDim}`, borderRadius: '4px', fontSize: '10px', color: C.muted }}>
                    {ch}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px 14px', borderTop: `1px solid ${C.borderDim}` }}>
                <button ref={sendRef} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: C.accent, borderRadius: '4px', border: 'none', fontSize: '11px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: C.white, cursor: 'default', boxShadow: '0 0 22px rgba(90,13,12,0.35)', flexShrink: 0 }}>
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor"><path d="M1 1l14 7L1 15V9l10-1L1 7V1z"/></svg>
                  Send Pitch
                </button>
                <button style={{ padding: '8px 12px', background: 'transparent', border: `1px solid ${C.borderDim}`, borderRadius: '4px', fontSize: '11px', fontWeight: 500, color: C.muted, cursor: 'default' }}>
                  Edit Draft
                </button>
                <button style={{ padding: '8px 12px', background: 'transparent', border: `1px solid ${C.borderDim}`, borderRadius: '4px', fontSize: '11px', fontWeight: 500, color: C.muted, cursor: 'default', marginLeft: 'auto' }}>
                  Regenerate
                </button>
              </div>
            </div>
          )}

          {/* ── SUCCESS TOAST ── */}
          <div style={{
            position: 'absolute', top: '14px', right: '16px',
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '9px 14px',
            background: 'rgba(255,255,255,0.07)',
            border: `1px solid ${C.border}`,
            borderRadius: '6px',
            backdropFilter: 'blur(20px)',
            fontSize: '11px', fontWeight: 500, color: C.white,
            opacity: showOk ? 1 : 0,
            transform: showOk ? 'translateY(0)' : 'translateY(-12px)',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
            pointerEvents: 'none', zIndex: 60, whiteSpace: 'nowrap',
          }}>
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: C.accent, flexShrink: 0 }} />
            Pitch sent to Bright Studio
          </div>
        </div>
      </div>

      {/* Bottom gradient */}
      <div aria-hidden style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '55px', background: 'linear-gradient(to top, rgba(4,4,7,0.88) 0%, transparent 100%)', pointerEvents: 'none', zIndex: 3 }} />
    </div>
  )
}
