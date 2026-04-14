'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

/* ══════════════════════════════════════════════════
   DESIGN TOKENS
══════════════════════════════════════════════════ */
const C = {
  bg:          '#03030A',
  menu:        'rgba(0,0,0,0.86)',
  panelDark:   'rgba(6,6,15,0.75)',   // outer palette — lower opacity → glass visible
  panelRight:  'rgba(4,4,12,0.55)',   // right glass pane — even lower opacity = more glass
  ctxBg:       'rgba(14,14,26,0.96)',
  border:      'rgba(255,255,255,0.1)',
  borderDim:   'rgba(255,255,255,0.06)',
  white:       '#F5F5F8',
  mid:         'rgba(255,255,255,0.48)',
  muted:       'rgba(255,255,255,0.26)',
  dim:         'rgba(255,255,255,0.14)',
  accent:      '#5A0D0C',
  accentTxt:   'rgba(195,72,68,0.95)',
  accentDim:   'rgba(90,13,12,0.22)',
}

const INNER_W   = 920
const INNER_H   = 520
const PITCH_TEXT = "Hi Sarah, I noticed Bright Studio is scaling their product portfolio — I help design-led brands build automated client pipelines that convert at 3× the speed of manual outreach..."

const CLIENTS = [
  { abbr: 'WC', company: 'Wave Commerce',   cat: 'E-commerce', score: 91, detail: 'B2C Platform · NYC',    dir: 'New York, US' },
  { abbr: 'BS', company: 'Bright Studio',   cat: 'Design Lab',  score: 87, detail: 'Product Design · SF',  dir: 'San Francisco, US' },
  { abbr: 'PD', company: 'Peak Digital',    cat: 'SaaS',        score: 95, detail: 'B2B SaaS · Austin',    dir: 'Austin, US' },
  { abbr: 'NC', company: 'Nova Collective', cat: 'Marketing',   score: 83, detail: 'Growth Agency · LA',   dir: 'Los Angeles, US' },
]

const CTX = [
  { label: 'Generate Pitch',     keys: ['↵'],         ref: true  },
  { label: 'Save to CRM',        keys: ['⌘', 'S'],    ref: false },
  { label: 'Cold Email Draft',   keys: ['⌘', 'E'],    ref: false },
  { label: 'Schedule Follow-up', keys: ['⌘', 'F'],    ref: false },
]

/* ── Kbd ─────────────────────────────────────── */
function Kbd({ s }: { s: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      minWidth: '16px', height: '16px', padding: '0 3px',
      background: 'rgba(255,255,255,0.08)',
      border: '1px solid rgba(255,255,255,0.13)',
      borderRadius: '3px', fontSize: '8px', fontWeight: 700, color: C.muted,
    }}>{s}</span>
  )
}

/* ── Typewriter ──────────────────────────────── */
function Typewriter({ active, text, speed = 65 }: { active: boolean; text: string; speed?: number }) {
  const [shown, setShown] = useState('')
  useEffect(() => {
    if (!active) { setShown(''); return }
    let i = 0
    const id = setInterval(() => { i++; setShown(text.slice(0, i)); if (i >= text.length) clearInterval(id) }, speed)
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

/* ── Cursor ──────────────────────────────────── */
function Cursor({ x, y, clicking }: { x: number; y: number; clicking: boolean }) {
  const [ripple, setRipple] = useState(false)
  useEffect(() => {
    if (!clicking) return
    setRipple(true)
    const t = setTimeout(() => setRipple(false), 440)
    return () => clearTimeout(t)
  }, [clicking])

  return (
    <>
      <style>{`
        @keyframes tw-blink  { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes c-ripple  { from{transform:translate(-4px,-4px)scale(0.3);opacity:.85} to{transform:translate(-4px,-4px)scale(3.4);opacity:0} }
        @keyframes fade-up   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ctx-in    { from{opacity:0;transform:scale(0.93)translateY(-5px)} to{opacity:1;transform:scale(1)translateY(0)} }
      `}</style>
      <div style={{ position: 'absolute', left: 0, top: 0, transform: `translate(${x}px,${y}px)`, transition: 'transform 0.72s cubic-bezier(0.33,1,0.68,1)', pointerEvents: 'none', zIndex: 999, willChange: 'transform' }}>
        <svg width="18" height="22" viewBox="0 0 18 22" fill="none" style={{ transform: clicking ? 'scale(0.8)' : 'scale(1)', transition: 'transform .1s', filter: 'drop-shadow(0 3px 18px rgba(0,0,0,1))', display: 'block' }}>
          <path d="M2.5 2L2.5 17.5L7 12.8L10.2 19.5L12.2 18.6L9 12L16 12L2.5 2Z" fill="white" stroke="rgba(0,0,0,.55)" strokeWidth=".9" strokeLinejoin="round"/>
        </svg>
      </div>
      {ripple && <div key="r" style={{ position: 'absolute', left: x, top: y, width: '18px', height: '18px', borderRadius: '50%', border: '1.5px solid rgba(90,13,12,.55)', animation: 'c-ripple .44s ease-out forwards', pointerEvents: 'none', zIndex: 998 }} />}
    </>
  )
}

/* ── Apple logo SVG ──────────────────────────── */
function AppleLogo() {
  return (
    <svg width="12" height="14" viewBox="0 0 20 24" fill="rgba(255,255,255,0.82)">
      <path d="M16.4 12.5c0-2.7 2.2-4 2.3-4.1-1.3-1.9-3.2-2.1-3.9-2.1-1.7-.2-3.2 1-4.1 1s-2.1-.9-3.5-.9c-1.8 0-3.5 1-4.4 2.7-1.9 3.3-.5 8.1 1.4 10.8.9 1.3 2 2.7 3.4 2.7s1.9-.9 3.5-.9 2.1.9 3.5.9 2.4-1.3 3.3-2.6 1.5-2.6 1.5-2.7c-.1-.1-2.5-1-2.5-3.8zM13.7 4.6c.8-.9 1.3-2.2 1.1-3.4-1.1 0-2.4.7-3.1 1.6-.7.8-1.3 2.1-1.1 3.4 1.2 0 2.3-.6 3.1-1.6z"/>
    </svg>
  )
}

/* ── macOS Menubar ───────────────────────────── */
function MacMenubar() {
  const MENU_ITEMS = ['Finder', 'File', 'Edit', 'View', 'Go', 'Window', 'Help']
  return (
    <div style={{ display: 'flex', alignItems: 'center', height: '24px', padding: '0 12px', background: C.menu, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: `1px solid ${C.borderDim}`, userSelect: 'none', position: 'relative', zIndex: 10 }}>
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '13px' }}>
        <AppleLogo />
        {MENU_ITEMS.map(item => (
          <span key={item} style={{ fontSize: '11px', fontWeight: item === 'Finder' ? 700 : 400, color: item === 'Finder' ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.7)', letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
            {item}
          </span>
        ))}
      </div>
      {/* Right: status */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Notification bell */}
        <svg width="12" height="13" viewBox="0 0 12 13" fill="none">
          <path d="M6 1C6 1 3 3 3 7V9L2 10H10L9 9V7C9 3 6 1 6 1Z" stroke="rgba(255,255,255,0.65)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5 10C5 10.55 5.45 11 6 11C6.55 11 7 10.55 7 10" stroke="rgba(255,255,255,0.65)" strokeWidth="1"/>
        </svg>
        {/* Wifi */}
        <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
          <path d="M7 8.5C7 8.5 7 8.5 7 8.5" stroke="rgba(255,255,255,0.75)" strokeWidth="1.4" strokeLinecap="round"/>
          <path d="M5 6.5C5.6 5.9 6.27 5.6 7 5.6C7.73 5.6 8.4 5.9 9 6.5" stroke="rgba(255,255,255,0.68)" strokeWidth="1" strokeLinecap="round"/>
          <path d="M2.5 4C3.8 2.7 5.36 2 7 2C8.64 2 10.2 2.7 11.5 4" stroke="rgba(255,255,255,0.55)" strokeWidth="1" strokeLinecap="round"/>
          <path d="M0.5 1.5C2.2 -0.1 4.5 -1 7 -1C9.5 -1 11.8 -0.1 13.5 1.5" stroke="rgba(255,255,255,0.35)" strokeWidth="1" strokeLinecap="round"/>
        </svg>
        {/* Battery */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1px' }}>
          <div style={{ width: '22px', height: '10px', border: '1px solid rgba(255,255,255,0.5)', borderRadius: '2px', display: 'flex', alignItems: 'center', padding: '1.5px 1.5px' }}>
            <div style={{ width: '88%', height: '100%', background: 'rgba(255,255,255,0.72)', borderRadius: '1px' }} />
          </div>
          <div style={{ width: '2px', height: '5px', background: 'rgba(255,255,255,0.4)', borderRadius: '0 1px 1px 0' }} />
        </div>
        {/* Clock */}
        <span style={{ fontSize: '11px', fontWeight: 500, color: 'rgba(255,255,255,0.8)', letterSpacing: '0', whiteSpace: 'nowrap' }}>
          Mon Jun 22&nbsp;&nbsp;9:41 AM
        </span>
      </div>
    </div>
  )
}

/* ── Bottom Dock ─────────────────────────────── */
function Dock() {
  return (
    <div style={{ position: 'absolute', bottom: '14px', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: '3px', padding: '7px 12px', background: 'rgba(16,16,26,0.7)', border: '1px solid rgba(255,255,255,0.11)', borderRadius: '12px', backdropFilter: 'blur(30px) saturate(160%)', WebkitBackdropFilter: 'blur(30px) saturate(160%)', boxShadow: '0 10px 32px rgba(0,0,0,0.65)', zIndex: 5 }}>
      {/* FreelanceOS app icon */}
      <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(90,13,12,0.55)', marginRight: '5px' }}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="white"><path d="M8 1L10.2 6.8L16 8L10.2 9.2L8 15L5.8 9.2L0 8L5.8 6.8L8 1Z"/></svg>
      </div>
      <div style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.08)', marginRight: '5px' }} />
      {/* Action icons */}
      {[
        /* Clipboard */
        <svg key="a" width="17" height="17" viewBox="0 0 17 17" fill="none"><rect x="2.5" y="3.5" width="12" height="12" rx="1.5" stroke="rgba(255,255,255,0.6)" strokeWidth="1.1"/><path d="M5.5 3.5V2.5C5.5 2.22 5.72 2 6 2H11C11.28 2 11.5 2.22 11.5 2.5V3.5" stroke="rgba(255,255,255,0.6)" strokeWidth="1.1"/><path d="M5.5 7.5H11.5M5.5 10H9.5" stroke="rgba(255,255,255,0.38)" strokeWidth="1"/></svg>,
        /* Move arrows */
        <svg key="b" width="17" height="17" viewBox="0 0 17 17" fill="none"><path d="M8.5 2V15M2 8.5H15M5.5 5.5L2 8.5L5.5 11.5M11.5 5.5L15 8.5L11.5 11.5" stroke="rgba(255,255,255,0.6)" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/></svg>,
        /* Emoji */
        <svg key="c" width="17" height="17" viewBox="0 0 17 17" fill="none"><circle cx="8.5" cy="8.5" r="6" stroke="rgba(255,255,255,0.6)" strokeWidth="1.1"/><path d="M6 10C6 10 6.9 11.5 8.5 11.5C10.1 11.5 11 10 11 10" stroke="rgba(255,255,255,0.6)" strokeWidth="1.1" strokeLinecap="round"/><circle cx="6.5" cy="7.5" r=".7" fill="rgba(255,255,255,0.6)"/><circle cx="10.5" cy="7.5" r=".7" fill="rgba(255,255,255,0.6)"/></svg>,
        /* Grid */
        <svg key="d" width="17" height="17" viewBox="0 0 17 17" fill="none"><rect x="2" y="2" width="5.5" height="5.5" rx="1" stroke="rgba(255,255,255,0.6)" strokeWidth="1.1"/><rect x="9.5" y="2" width="5.5" height="5.5" rx="1" stroke="rgba(255,255,255,0.6)" strokeWidth="1.1"/><rect x="2" y="9.5" width="5.5" height="5.5" rx="1" stroke="rgba(255,255,255,0.6)" strokeWidth="1.1"/><rect x="9.5" y="9.5" width="5.5" height="5.5" rx="1" stroke="rgba(255,255,255,0.6)" strokeWidth="1.1"/></svg>,
      ].map((icon, i) => (
        <div key={i} style={{ width: '34px', height: '34px', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.06)' }}>
          {icon}
        </div>
      ))}
    </div>
  )
}

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════ */
export default function AnimatedDashboard() {
  const wrapperRef  = useRef<HTMLDivElement>(null)
  const innerRef    = useRef<HTMLDivElement>(null)
  const searchRef   = useRef<HTMLDivElement>(null)
  const row1Ref     = useRef<HTMLDivElement>(null)   // Bright Studio (index 1)
  const genRef      = useRef<HTMLDivElement>(null)   // "Generate Pitch"
  const sendRef     = useRef<HTMLButtonElement>(null)
  const scaleRef    = useRef(1)

  const [scale,       setScale]       = useState(1)
  const [cx,          setCx]          = useState(300)
  const [cy,          setCy]          = useState(100)
  const [clicking,    setClicking]    = useState(false)
  const [typing,      setTyping]      = useState(false)
  const [rows,        setRows]        = useState(0)
  const [selRow,      setSelRow]      = useState(-1)
  const [showCtx,     setShowCtx]     = useState(false)
  const [showPitch,   setShowPitch]   = useState(false)
  const [pitchTyping, setPitchTyping] = useState(false)
  const [showOk,      setShowOk]      = useState(false)

  /* ResizeObserver scales canvas to wrapper width */
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
    if (!el || !innerRef.current) return { x: 300, y: 100 }
    const ir = innerRef.current.getBoundingClientRect()
    const er = el.getBoundingClientRect()
    const s  = scaleRef.current || 1
    return { x: (er.left - ir.left + er.width * 0.5) / s, y: (er.top - ir.top + er.height * 0.5) / s }
  }, [])

  /* Animation loop */
  useEffect(() => {
    let cancelled = false
    const w   = (ms: number) => new Promise<void>(r => setTimeout(r, ms))
    const mov = (el: HTMLElement | null) => { const p = getPos(el); setCx(p.x); setCy(p.y) }
    const clk = async () => { if (cancelled) return; setClicking(true); await w(160); if (!cancelled) setClicking(false) }

    const loop = async () => {
      while (!cancelled) {
        // RESET
        setTyping(false); setRows(0); setSelRow(-1)
        setShowCtx(false); setShowPitch(false); setPitchTyping(false); setShowOk(false)
        setCx(300); setCy(100)
        await w(1200); if (cancelled) break

        // → Search box
        mov(searchRef.current); await w(850)
        await clk(); await w(300)
        if (!cancelled) setTyping(true); await w(1380)

        // Results
        for (let i = 1; i <= 4; i++) { if (cancelled) break; await w(240); setRows(i) }
        await w(800); if (cancelled) break

        // → Row 1 (Bright Studio)
        mov(row1Ref.current); await w(850)
        if (!cancelled) setSelRow(1); await w(300)
        await clk()
        if (!cancelled) setShowCtx(true); await w(270); if (cancelled) break

        // → Generate Pitch in context menu
        mov(genRef.current); await w(740)
        await clk()
        if (!cancelled) { setShowCtx(false); setShowPitch(true) }; await w(440)
        if (!cancelled) setPitchTyping(true); await w(2400)

        // → Send
        mov(sendRef.current); await w(780)
        await clk()
        if (!cancelled) setShowOk(true); await w(2500)

        // Teardown
        if (!cancelled) { setShowOk(false); setShowPitch(false); setPitchTyping(false) }; await w(500)
        if (!cancelled) { setRows(0); setSelRow(-1); setTyping(false) }; await w(400)
      }
    }
    loop()
    return () => { cancelled = true }
  }, [getPos])

  const wrapH = Math.round(INNER_H * scale)
  const sel   = selRow >= 0 ? CLIENTS[selRow] : null

  return (
    /* ── OUTER FRAME ── */
    <div ref={wrapperRef} style={{
      width: '100%', height: `${wrapH}px`, position: 'relative',
      overflow: 'hidden', borderRadius: '12px',
      border: '1px solid rgba(255,255,255,0.1)',
      boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 70px 140px rgba(0,0,0,0.96)',
    }}>

      {/* ── INNER FIXED CANVAS (scaled) ── */}
      <div ref={innerRef} style={{ position: 'absolute', top: 0, left: 0, width: INNER_W, height: INNER_H, transform: `scale(${scale})`, transformOrigin: 'top left' }}>

        {/* ── ATMOSPHERIC DESKTOP BACKGROUND (INSIDE innerRef so backdrop-filter works) ── */}
        <div aria-hidden style={{ position: 'absolute', inset: 0, background: C.bg, zIndex: 0 }} />
        {/* Primary crimson glow — bottom left, like Raycast screenshot */}
        <div aria-hidden style={{ position: 'absolute', bottom: '-100px', left: '-80px', width: '65%', height: '130%', background: 'radial-gradient(ellipse at 15% 80%, rgba(90,13,12,0.88) 0%, rgba(60,8,8,0.4) 36%, transparent 60%)', pointerEvents: 'none', zIndex: 0 }} />
        {/* Secondary warm glow center-right */}
        <div aria-hidden style={{ position: 'absolute', top: '60px', right: '60px', width: '40%', height: '60%', background: 'radial-gradient(ellipse at 60% 40%, rgba(70,10,10,0.3) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 0 }} />

        {/* Cursor */}
        <Cursor x={cx} y={cy} clicking={clicking} />

        {/* ── macOS MENUBAR ── */}
        <MacMenubar />

        {/* ── DESKTOP AREA ── */}
        <div style={{ position: 'absolute', top: '24px', left: 0, right: 0, bottom: 0, zIndex: 1 }}>

          {/* ── COMMAND PALETTE (split view, glassmorphism) ── */}
          <div style={{
            position: 'absolute', left: '100px', top: '48px', width: '720px',
            background: C.panelDark,
            border: `1px solid ${C.border}`,
            borderRadius: '12px',
            backdropFilter: 'blur(48px) saturate(180%)',
            WebkitBackdropFilter: 'blur(48px) saturate(180%)',
            boxShadow: '0 56px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.07)',
            overflow: 'hidden',
            zIndex: 2,
          }}>
            {/* Search bar */}
            <div ref={searchRef} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 18px', height: '54px', borderBottom: `1px solid ${C.borderDim}` }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M10 3L5 8L10 13" stroke={C.muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ flex: 1, fontSize: '15px', fontWeight: 400, color: C.white, letterSpacing: '-0.01em' }}>
                <Typewriter active={typing} text="fintech startups US" />
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 10px', background: 'rgba(255,255,255,0.07)', border: `1px solid ${C.border}`, borderRadius: '6px', fontSize: '11px', color: C.mid, whiteSpace: 'nowrap', flexShrink: 0 }}>
                All Clients
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5L5 6.5L8 3.5" stroke={C.muted} strokeWidth="1.2" strokeLinecap="round"/></svg>
              </div>
            </div>

            {/* Content split */}
            <div style={{ display: 'flex', height: '248px' }}>

              {/* LEFT: Client list */}
              <div style={{ width: '270px', borderRight: `1px solid ${C.borderDim}`, flexShrink: 0, overflow: 'hidden' }}>
                <div style={{ padding: '7px 16px 3px', fontSize: '9px', fontWeight: 700, color: C.dim, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Clients</div>
                {CLIENTS.map((cl, idx) => {
                  const visible  = idx < rows
                  const selected = selRow === idx
                  return (
                    <div
                      key={cl.company}
                      ref={idx === 1 ? row1Ref : undefined}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '9px', padding: '8px 16px',
                        background: selected ? 'rgba(255,255,255,0.11)' : 'transparent',
                        borderLeft: `2px solid ${selected ? C.accent : 'transparent'}`,
                        paddingLeft: selected ? '14px' : '16px',
                        opacity: visible ? 1 : 0,
                        transform: visible ? 'translateY(0)' : 'translateY(6px)',
                        transition: `opacity .24s ease ${idx * .06}s, transform .24s ease ${idx * .06}s, background .15s`,
                        cursor: 'default',
                      }}
                    >
                      {/* File icon */}
                      <div style={{ width: '24px', height: '24px', borderRadius: '5px', background: 'rgba(255,255,255,0.09)', border: `1px solid ${C.borderDim}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: 800, color: C.muted, flexShrink: 0 }}>
                        {cl.abbr}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '12.5px', fontWeight: selected ? 500 : 400, color: selected ? C.white : 'rgba(255,255,255,0.68)', letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cl.company}</div>
                        <div style={{ fontSize: '10px', color: C.dim, marginTop: '1px' }}>{cl.cat}</div>
                      </div>
                      <div style={{ fontSize: '10px', fontWeight: 600, color: C.muted, flexShrink: 0 }}>{cl.score}%</div>
                    </div>
                  )
                })}
              </div>

              {/* RIGHT: Client preview — GLASSMORPHISM PANE */}
              {/* This sits over the atmospheric glow → glass effect is very visible */}
              <div style={{
                flex: 1, position: 'relative', overflow: 'hidden',
                background: C.panelRight,    // LOW opacity = lots of glass
                backdropFilter: 'blur(32px) saturate(150%)',
                WebkitBackdropFilter: 'blur(32px) saturate(150%)',
              }}>
                {/* Red tint overlay to emphasize the glass over glow */}
                <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(90,13,12,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />

                {sel ? (
                  <div style={{ padding: '20px 22px', animation: 'fade-up .3s ease forwards' }}>
                    {/* Large avatar */}
                    <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: 'rgba(255,255,255,0.09)', border: `1px solid ${C.borderDim}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 800, color: C.muted, marginBottom: '14px' }}>
                      {sel.abbr}
                    </div>
                    <div style={{ fontSize: '17px', fontWeight: 700, color: C.white, letterSpacing: '-0.035em', marginBottom: '3px' }}>{sel.company}</div>
                    <div style={{ fontSize: '11px', color: C.muted, marginBottom: '3px' }}>{sel.dir}</div>
                    <div style={{ fontSize: '10px', color: C.dim, marginBottom: '16px' }}>{sel.detail}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                      <span style={{ padding: '3px 9px', background: 'rgba(255,255,255,0.07)', border: `1px solid ${C.borderDim}`, borderRadius: '4px', fontSize: '10px', color: C.muted }}>{sel.cat}</span>
                      <span style={{ padding: '3px 9px', background: C.accentDim, border: `1px solid rgba(90,13,12,0.3)`, borderRadius: '4px', fontSize: '10px', color: C.accentTxt, fontWeight: 700 }}>{sel.score}% match</span>
                    </div>
                    <div style={{ fontSize: '11px', color: C.dim, lineHeight: 1.65 }}>
                      {sel.score >= 90
                        ? 'High priority lead — AI recommends immediate outreach'
                        : 'Strong fit — AI suggests personalized cold email approach'}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '6px' }}>
                    <div style={{ fontSize: '34px', fontWeight: 900, letterSpacing: '-0.05em', color: 'rgba(255,255,255,0.06)', lineHeight: 1 }}>
                      Freelance<span style={{ color: 'rgba(90,13,12,0.18)' }}>OS</span>
                    </div>
                    <div style={{ fontSize: '11px', color: C.dim }}>Select a client to preview</div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', height: '38px', borderTop: `1px solid ${C.borderDim}` }}>
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

          {/* ── CONTEXT MENU (floats over palette) ── */}
          <div style={{
            position: 'absolute', left: '384px', top: '190px', width: '240px',
            background: C.ctxBg,
            border: `1px solid rgba(255,255,255,0.15)`,
            borderRadius: '10px',
            backdropFilter: 'blur(48px) saturate(200%)',
            WebkitBackdropFilter: 'blur(48px) saturate(200%)',
            boxShadow: '0 32px 72px rgba(0,0,0,0.88), 0 0 0 1px rgba(255,255,255,0.08)',
            overflow: 'hidden', zIndex: 5,
            opacity: showCtx ? 1 : 0,
            transform: showCtx ? 'scale(1) translateY(0)' : 'scale(0.93) translateY(-6px)',
            transformOrigin: 'top left',
            transition: 'opacity .18s ease, transform .18s ease',
            pointerEvents: showCtx ? 'auto' : 'none',
          }}>
            {CTX.map((action, idx) => (
              <div
                key={action.label}
                ref={action.ref ? genRef : undefined}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px',
                  background: idx === 0 ? 'rgba(255,255,255,0.1)' : 'transparent',
                  borderBottom: `1px solid rgba(255,255,255,0.05)`,
                  cursor: 'default',
                }}
              >
                <span style={{ fontSize: '12px', color: idx === 0 ? C.white : C.mid, fontWeight: idx === 0 ? 500 : 400 }}>
                  {action.label}
                </span>
                <div style={{ display: 'flex', gap: '3px' }}>{action.keys.map(k => <Kbd key={k} s={k} />)}</div>
              </div>
            ))}
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '3px 0' }} />
            <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '7px' }}>
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke={C.dim} strokeWidth="1.5"/><path d="M11 11L14 14" stroke={C.dim} strokeWidth="1.5" strokeLinecap="round"/></svg>
              <span style={{ fontSize: '11px', color: C.dim }}>Search actions...</span>
            </div>
          </div>

          {/* ── PITCH PANEL (glassmorphism overlay) ── */}
          {showPitch && (
            <div style={{
              position: 'absolute', left: '100px', top: '48px', width: '720px',
              background: C.panelDark,
              border: `1px solid ${C.border}`,
              borderRadius: '12px',
              backdropFilter: 'blur(48px) saturate(180%)',
              WebkitBackdropFilter: 'blur(48px) saturate(180%)',
              boxShadow: '0 56px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.07)',
              animation: 'fade-up .3s ease forwards',
              overflow: 'hidden', zIndex: 4,
            }}>
              <div style={{ display: 'flex', height: '342px' }}>
                {/* Left: pitch editor */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 18px', borderBottom: `1px solid ${C.borderDim}` }}>
                    <svg width="9" height="9" viewBox="0 0 16 16" fill={C.accent}><path d="M8 1L10.2 6.8L16 8L10.2 9.2L8 15L5.8 9.2L0 8L5.8 6.8L8 1Z"/></svg>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: C.white, letterSpacing: '-0.01em' }}>Pitch for Bright Studio</span>
                    <span style={{ marginLeft: 'auto', fontSize: '9px', fontWeight: 700, color: C.accentTxt, letterSpacing: '0.08em', textTransform: 'uppercase' }}>87% match</span>
                  </div>
                  <div style={{ flex: 1, padding: '18px 18px 12px', overflow: 'hidden' }}>
                    <div style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.78, letterSpacing: '-0.005em' }}>
                      <Typewriter active={pitchTyping} text={PITCH_TEXT} speed={28} />
                    </div>
                  </div>
                  <div style={{ padding: '10px 18px 14px', display: 'flex', alignItems: 'center', gap: '8px', borderTop: `1px solid ${C.borderDim}` }}>
                    <button ref={sendRef} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: C.accent, borderRadius: '5px', border: 'none', fontSize: '11px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'white', cursor: 'default', boxShadow: '0 0 22px rgba(90,13,12,0.4)', flexShrink: 0 }}>
                      <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor"><path d="M1 1l14 7L1 15V9l10-1L1 7V1z"/></svg>
                      Send Pitch
                    </button>
                    <button style={{ padding: '8px 12px', background: 'transparent', border: `1px solid ${C.borderDim}`, borderRadius: '4px', fontSize: '11px', color: C.muted, cursor: 'default' }}>Edit</button>
                    <button style={{ padding: '8px 12px', background: 'transparent', border: `1px solid ${C.borderDim}`, borderRadius: '4px', fontSize: '11px', color: C.muted, cursor: 'default', marginLeft: 'auto' }}>Regenerate</button>
                  </div>
                </div>

                {/* Right: glassmorphism preview — crimson bleeds through */}
                <div style={{ width: '230px', flexShrink: 0, borderLeft: `1px solid ${C.borderDim}`, background: C.panelRight, backdropFilter: 'blur(32px) saturate(150%)', WebkitBackdropFilter: 'blur(32px) saturate(150%)', display: 'flex', flexDirection: 'column', padding: '16px', position: 'relative', overflow: 'hidden' }}>
                  <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'linear-gradient(145deg, rgba(90,13,12,0.1) 0%, transparent 50%)', pointerEvents: 'none' }} />
                  <div style={{ fontSize: '9px', fontWeight: 700, color: C.dim, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>Channel</div>
                  {['Cold Email', 'LinkedIn DM', 'Sequence'].map((ch, i) => (
                    <div key={ch} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '7px 8px', background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.borderDim}`, borderRadius: '5px', marginBottom: '4px', fontSize: '11px', color: C.muted }}>
                      <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: i === 0 ? C.accent : 'rgba(255,255,255,0.12)', flexShrink: 0 }} />
                      {ch}
                    </div>
                  ))}
                  {/* Atmospheric ghost text showing through glass */}
                  <div style={{ position: 'absolute', bottom: '14px', left: '16px', right: '16px' }}>
                    <div style={{ fontSize: '26px', fontWeight: 900, letterSpacing: '-0.05em', color: 'rgba(255,255,255,0.05)', lineHeight: 1.05 }}>
                      Bright<br/>Studio
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── SUCCESS TOAST ── */}
          <div style={{
            position: 'absolute', top: '12px', right: '16px',
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '9px 14px',
            background: 'rgba(255,255,255,0.08)',
            border: `1px solid ${C.border}`,
            borderRadius: '7px',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            fontSize: '11px', fontWeight: 500, color: C.white,
            opacity: showOk ? 1 : 0,
            transform: showOk ? 'translateY(0)' : 'translateY(-12px)',
            transition: 'opacity .3s ease, transform .3s ease',
            pointerEvents: 'none', zIndex: 60, whiteSpace: 'nowrap',
          }}>
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: C.accent, flexShrink: 0 }} />
            Pitch sent to Bright Studio
          </div>

          {/* ── DOCK ── */}
          <Dock />
        </div>
      </div>

      {/* Bottom fade */}
      <div aria-hidden style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50px', background: 'linear-gradient(to top, rgba(3,3,10,.85) 0%, transparent 100%)', pointerEvents: 'none', zIndex: 10 }} />
    </div>
  )
}
