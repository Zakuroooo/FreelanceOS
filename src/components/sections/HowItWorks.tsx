'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, useInView } from 'framer-motion'
import { Search, Sparkles, Send, Kanban, DollarSign } from 'lucide-react'

const TAB_DURATION = 8000

const STEPS = [
  {
    id: 0,
    title: 'Discover Clients',
    desc: 'Instantly find high-intent businesses missing key digital assets.',
    icon: Search,
  },
  {
    id: 1,
    title: 'Generate Pitch',
    desc: 'AI synthesizes their gaps into a hyper-personalized proposal.',
    icon: Sparkles,
  },
  {
    id: 2,
    title: 'Send Outreach',
    desc: 'Deliver across Email, LinkedIn, and DMs through one dashboard.',
    icon: Send,
  },
  {
    id: 3,
    title: 'Track Deals',
    desc: 'Visual pipeline tracking every prospect from first touch to close.',
    icon: Kanban,
  },
  {
    id: 4,
    title: 'Get Paid',
    desc: 'Automated escrow and secure payouts via Stripe Connect.',
    icon: DollarSign,
  },
]

// ─────────────────────────────────────────────────────────────
// SOUND ENGINE — Web Audio API synthesized typewriter click
// Sound only plays when the section is in view
// ─────────────────────────────────────────────────────────────

let audioCtx: AudioContext | null = null
let soundEnabled = false // Global flag — only true when HIW section is visible

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    } catch {
      return null
    }
  }
  return audioCtx
}

function playKeystroke() {
  // Only play if the HowItWorks section is currently visible
  if (!soundEnabled) return

  const ctx = getAudioContext()
  if (!ctx) return

  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {})
  }

  const now = ctx.currentTime
  const duration = 0.04
  const bufferSize = Math.floor(ctx.sampleRate * duration)
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)

  for (let i = 0; i < bufferSize; i++) {
    const t = i / bufferSize
    const envelope = Math.exp(-t * 40)
    data[i] = (Math.random() * 2 - 1) * envelope * 0.3
  }

  const source = ctx.createBufferSource()
  source.buffer = buffer

  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 3000 + Math.random() * 1500
  filter.Q.value = 1.2

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.12, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

  source.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)

  source.start(now)
  source.stop(now + duration)
}

// ─────────────────────────────────────────────────────────────
// TYPEWRITER
// ─────────────────────────────────────────────────────────────

function Typewriter({
  text,
  active,
  delay = 0,
  speed = 35,
  className = '',
  onComplete,
}: {
  text: string
  active: boolean
  delay?: number
  speed?: number
  className?: string
  onComplete?: () => void
}) {
  const [displayed, setDisplayed] = useState('')
  const [isDone, setIsDone] = useState(false)

  useEffect(() => {
    let cancelled = false

    if (!active) {
      setDisplayed('')
      setIsDone(false)
      return
    }

    ;(async () => {
      await new Promise((r) => setTimeout(r, delay))
      if (cancelled) return

      for (let i = 0; i <= text.length; i++) {
        if (cancelled) return
        setDisplayed(text.substring(0, i))
        if (i < text.length && i % 3 === 0 && text[i] !== ' ') {
          playKeystroke()
        }
        await new Promise((r) => setTimeout(r, speed))
      }

      if (!cancelled) {
        setIsDone(true)
        onComplete?.()
      }
    })()

    return () => {
      cancelled = true
    }
  }, [text, active, delay, speed])

  return (
    <span className={className}>
      {displayed}
      {active && !isDone && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 0.7 }}
          className="inline-block w-[7px] h-[1.1em] bg-[#c30101] ml-1 align-middle rounded-[1px]"
        />
      )}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────
// SHARED STYLES — matching Problem card aesthetic
// ─────────────────────────────────────────────────────────────

// Card-like row: same bg/border/radius/padding as Problem section cards
const cardRow: React.CSSProperties = {
  padding: '14px 18px',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '6px',
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '12px',
  lineHeight: 1.5,
  color: 'rgba(255,255,255,0.35)',
  transition: 'all 0.3s ease',
}

// ─────────────────────────────────────────────────────────────
// MOCKUPS — Problem-card styled, proper breathing room
// ─────────────────────────────────────────────────────────────

function DiscoverMockup({ active }: { active: boolean }) {
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    if (!active) setShowResults(false)
  }, [active])

  return (
    <div className="flex flex-col gap-4">
      {/* Search bar card */}
      <div style={{
        ...cardRow,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: 'rgba(255,255,255,0.55)',
      }}>
        <Search size={14} className="text-[#c30101] shrink-0" />
        <Typewriter
          text="Dental clinics in Austin, TX missing SEO tags"
          active={active}
          delay={600}
          speed={38}
          onComplete={() => setTimeout(() => setShowResults(true), 500)}
        />
        <span className="ml-auto shrink-0 text-[10px] text-gray-600 bg-[rgba(255,255,255,0.06)] px-2 py-1 rounded">⌘K</span>
      </div>

      {/* Result cards */}
      <div className={`flex flex-col gap-3 transition-all duration-700 ${showResults ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {[
          { name: 'Smile Studio', gap: 'NO WEBSITE', score: '98%' },
          { name: 'Austin Dental Care', gap: 'POOR SEO', score: '85%' },
          { name: 'Bright Teeth Co.', gap: 'NO SOCIALS', score: '82%' },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: showResults ? 1 : 0, x: showResults ? 0 : -8 }}
            transition={{ delay: i * 0.15, duration: 0.4 }}
            style={{
              ...cardRow,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
            }}
            className="hover:!bg-[rgba(255,255,255,0.05)] hover:!border-[rgba(196,20,37,0.15)]"
          >
            <div className="flex flex-col gap-1.5">
              <span style={{ color: '#FAFAFA', fontWeight: 600, fontSize: '13px' }}>{item.name}</span>
              <span style={{ color: '#c30101', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '10px' }}>{item.gap}</span>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Match <span style={{ color: '#4ade80', fontWeight: 700, fontSize: '14px' }}>{item.score}</span>
            </div>
          </motion.div>
        ))}
        <div className={`text-center text-[10px] mt-1 transition-opacity duration-500 ${showResults ? 'opacity-60' : 'opacity-0'}`} style={{ color: 'rgba(255,255,255,0.2)' }}>
          Showing 3 of 42 results · Sorted by match score
        </div>
      </div>
    </div>
  )
}

function PitchMockup({ active }: { active: boolean }) {
  return (
    <div className="flex flex-col gap-4">
      {/* AI Generator header card */}
      <div style={{
        ...cardRow,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(255,255,255,0.04)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}>
        <div className="flex items-center gap-3">
          <Sparkles size={14} className="text-[#c30101]" />
          <span style={{ color: '#FAFAFA', fontWeight: 700, letterSpacing: '0.1em', fontSize: '11px', textTransform: 'uppercase' }}>AI Pitch Generator</span>
        </div>
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.06)', padding: '4px 10px', borderRadius: '4px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Tone: Bold</span>
      </div>

      {/* Subject line card */}
      <div style={{
        ...cardRow,
        color: 'rgba(255,255,255,0.55)',
      }}>
        <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Subject</span>
        <div style={{ marginTop: '6px', color: '#FAFAFA', fontWeight: 600, fontSize: '13px' }}>
          <Typewriter text="Found a major gap in your SEO strategy" active={active} delay={500} speed={38} />
        </div>
      </div>

      {/* Email body card */}
      <div style={{
        ...cardRow,
        lineHeight: 1.7,
        color: 'rgba(255,255,255,0.35)',
        fontSize: '12px',
        minHeight: '120px',
      }}>
        <Typewriter
          text="Hi Michael, I noticed Smile Studio is actively running Google Ads, but your landing page is taking 6.4s to load — driving up your bounce rate significantly."
          active={active}
          delay={2800}
          speed={25}
          className="block mb-3"
        />
        <Typewriter
          text="I'm a Frontend Specialist in Next.js performance. I can drop that load time to under 1s, which typically boosts ad conversions by ~15%."
          active={active}
          delay={8000}
          speed={25}
          className="block mb-3"
        />
        <Typewriter
          text="Are you open to a quick 5-minute chat?"
          active={active}
          delay={13000}
          speed={35}
          className="block"
        />
      </div>

      {/* Action buttons — proper padding & spacing */}
      <div className="flex gap-4">
        <button style={{
          background: '#c30101',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          border: 'none',
          cursor: 'pointer',
          transition: 'background 0.2s',
        }}>
          Approve & Send
        </button>
        <button style={{
          background: 'rgba(255,255,255,0.04)',
          color: 'rgba(255,255,255,0.4)',
          padding: '10px 20px',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          border: '1px solid rgba(255,255,255,0.06)',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}>
          Regenerate
        </button>
      </div>
    </div>
  )
}

function OutreachMockup({ active }: { active: boolean }) {
  const [showBars, setShowBars] = useState(false)

  useEffect(() => {
    if (!active) setShowBars(false)
  }, [active])

  return (
    <div className="flex flex-col gap-4">
      {/* Status header card */}
      <div style={{
        ...cardRow,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        color: '#c30101',
        fontWeight: 700,
        letterSpacing: '0.1em',
        fontSize: '11px',
        textTransform: 'uppercase',
      }}>
        <span className="w-2 h-2 rounded-full bg-[#c30101] animate-pulse shrink-0" />
        <Typewriter
          text="Deploying campaigns across all channels..."
          active={active}
          delay={400}
          speed={40}
          onComplete={() => setTimeout(() => setShowBars(true), 600)}
        />
      </div>

      {/* Channel cards — each in its own Problem-style card */}
      {[
        { channel: 'Email Sequence', progress: '85%', sent: 124, replies: 18, color: '#c30101' },
        { channel: 'LinkedIn DMs', progress: '40%', sent: 45, replies: 2, color: 'rgba(255,255,255,0.4)' },
        { channel: 'Instagram DMs', progress: '100%', sent: 10, replies: 4, color: 'rgba(196,20,37,0.6)' },
      ].map((camp, i) => (
        <div
          key={i}
          style={{
            ...cardRow,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            transition: `all 0.7s ease ${i * 250}ms`,
            opacity: showBars ? 1 : 0,
            transform: showBars ? 'translateY(0)' : 'translateY(8px)',
          }}
        >
          <div className="flex justify-between items-center">
            <span style={{ color: '#FAFAFA', fontWeight: 600, fontSize: '13px' }}>{camp.channel}</span>
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px' }}>
              {camp.replies} Replies / {camp.sent} Sent
            </span>
          </div>
          <div style={{ height: '6px', width: '100%', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
            <motion.div
              style={{ height: '100%', borderRadius: '3px', backgroundColor: camp.color }}
              initial={{ width: 0 }}
              animate={{ width: showBars ? camp.progress : '0%' }}
              transition={{ duration: 1.8, delay: 0.8 + i * 0.3, ease: 'easeOut' }}
            />
          </div>
        </div>
      ))}

      {/* Summary card */}
      <div style={{
        ...cardRow,
        textAlign: 'center',
        fontSize: '11px',
        color: 'rgba(255,255,255,0.2)',
        transition: 'opacity 0.7s ease',
        opacity: showBars ? 1 : 0,
      }}>
        Total: 179 sent · 24 replies · 13.4% response rate
      </div>
    </div>
  )
}

function PipelineMockup({ active }: { active: boolean }) {
  const [showCards, setShowCards] = useState(false)

  useEffect(() => {
    if (!active) setShowCards(false)
  }, [active])

  return (
    <div className="flex flex-col gap-4">
      {/* Header card */}
      <div style={{
        ...cardRow,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        color: 'rgba(255,255,255,0.55)',
        fontWeight: 600,
        fontSize: '13px',
      }}>
        <Kanban size={14} className="text-[#c30101]" />
        <Typewriter
          text="Syncing pipeline data..."
          active={active}
          delay={300}
          speed={40}
          onComplete={() => setTimeout(() => setShowCards(true), 400)}
        />
      </div>

      {/* Kanban columns */}
      <div className={`flex gap-3 transition-all duration-700 ${showCards ? 'opacity-100 blur-none' : 'opacity-0 blur-sm'}`}>
        {[
          { title: 'PROPOSED', count: 3, items: [{ name: 'Bright Teeth Co.', val: '$1,200' }, { name: 'Apex Digital', val: '$4,500' }, { name: 'Nexus Labs', val: '$800' }] },
          { title: 'IN PROGRESS', count: 1, items: [{ name: 'Zenith UI', val: '$1,200' }] },
          { title: 'CLOSED', count: 2, items: [{ name: 'Smile Studio', val: '$3,450' }] },
        ].map((col, i) => (
          <div key={i} style={{
            flex: 1,
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '6px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{
              padding: '10px 14px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ fontWeight: 700, fontSize: '10px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{col.title}</span>
              <span style={{ background: 'rgba(255,255,255,0.08)', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', color: 'white', fontSize: '10px', fontWeight: 700 }}>{col.count}</span>
            </div>
            <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
              {col.items.map((item, j) => (
                <motion.div
                  key={j}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: showCards ? 1 : 0, y: showCards ? 0 : 6 }}
                  transition={{ delay: 0.6 + i * 0.2 + j * 0.1 }}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    padding: '10px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  className="hover:!bg-[rgba(255,255,255,0.06)]"
                >
                  <div style={{ color: '#FAFAFA', fontWeight: 600, fontSize: '11px', marginBottom: '4px' }}>{item.name}</div>
                  <div style={{ color: '#c30101', fontWeight: 700, fontSize: '11px' }}>{item.val}</div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PaidMockup({ active }: { active: boolean }) {
  const [showBal, setShowBal] = useState(false)

  useEffect(() => {
    if (!active) setShowBal(false)
  }, [active])

  return (
    <div className="flex flex-col gap-4">
      {/* Escrow status card */}
      <div style={{
        ...cardRow,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div className="flex items-center gap-3">
          <DollarSign size={14} className="text-[#c30101]" />
          <Typewriter
            text="Securing payment via Stripe Integration..."
            active={active}
            delay={500}
            speed={40}
            onComplete={() => setTimeout(() => setShowBal(true), 500)}
          />
        </div>
        <div style={{
          background: 'rgba(196,20,37,0.1)',
          color: '#c30101',
          border: '1px solid rgba(196,20,37,0.25)',
          padding: '4px 10px',
          borderRadius: '4px',
          fontSize: '9px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <div className="w-1.5 h-1.5 rounded-full bg-[#c30101] animate-pulse" />
          Escrow
        </div>
      </div>

      {/* Amount display card */}
      <div style={{
        ...cardRow,
        textAlign: 'center',
        padding: '32px 20px',
        transition: 'all 0.7s ease',
        opacity: showBal ? 1 : 0,
        transform: showBal ? 'translateY(0)' : 'translateY(8px)',
      }}>
        <DollarSign
          size={36}
          className={`text-[#c30101] mx-auto mb-4 transition-all duration-1000 ${showBal ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}
        />
        <div style={{
          fontSize: '40px',
          color: 'white',
          fontWeight: 700,
          letterSpacing: '-0.03em',
          marginBottom: '8px',
          textShadow: '0 0 20px rgba(196,20,37,0.3)',
        }}>
          $3,450<span style={{ fontSize: '28px', color: 'rgba(255,255,255,0.25)' }}>.00</span>
        </div>
        <div style={{
          color: 'rgba(255,255,255,0.25)',
          fontSize: '11px',
          lineHeight: 1.6,
          maxWidth: '240px',
          margin: '0 auto',
        }}>
          Payment from Smile Studio has been fully secured and placed into escrow.
        </div>
      </div>

      {/* Release button */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button style={{
          background: showBal ? 'white' : 'rgba(255,255,255,0.04)',
          color: showBal ? 'black' : 'rgba(255,255,255,0.2)',
          padding: '12px 28px',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          border: 'none',
          cursor: showBal ? 'pointer' : 'default',
          boxShadow: showBal ? '0 0 24px rgba(255,255,255,0.15)' : 'none',
          transition: 'all 0.5s ease',
        }}>
          Release to Bank
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────

export default function HowItWorks() {
  const [activeTab, setActiveTab] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [progressKey, setProgressKey] = useState(0)
  const sectionRef = useRef(null)
  const inView = useInView(sectionRef, { once: true, margin: '-100px' })

  // Track section visibility for sound control
  // Sound visibility — observe the section element directly
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        soundEnabled = entry.isIntersecting
      },
      { threshold: 0.1 }
    )

    observer.observe(el)

    // Resume AudioContext on first user interaction (browser autoplay policy)
    const resumeAudio = () => {
      const ctx = getAudioContext()
      if (ctx && ctx.state === 'suspended') ctx.resume()
    }
    document.addEventListener('click', resumeAudio, { once: true })
    document.addEventListener('scroll', resumeAudio, { once: true })

    return () => {
      observer.disconnect()
      soundEnabled = false
      document.removeEventListener('click', resumeAudio)
      document.removeEventListener('scroll', resumeAudio)
    }
  }, [])

  // Auto-cycle tabs
  useEffect(() => {
    if (isHovered) return
    const interval = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % STEPS.length)
      setProgressKey((prev) => prev + 1)
    }, TAB_DURATION)
    return () => clearInterval(interval)
  }, [isHovered])

  const handleTabClick = useCallback((index: number) => {
    setActiveTab(index)
    setProgressKey((prev) => prev + 1)
  }, [])

  const getMockup = () => {
    switch (activeTab) {
      case 0: return <DiscoverMockup active />
      case 1: return <PitchMockup active />
      case 2: return <OutreachMockup active />
      case 3: return <PipelineMockup active />
      case 4: return <PaidMockup active />
      default: return <DiscoverMockup active />
    }
  }

  return (
    <section id="how-it-works" ref={sectionRef} style={{ padding: '128px 0', position: 'relative', overflow: 'hidden' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10 }}>
        
        {/* ── Section Header — explicit spacing ────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '80px' }}
        >
          <div className="section-badge" style={{ marginBottom: '28px' }}>HOW IT WORKS</div>
          <h2 style={{
            fontSize: 'clamp(32px, 4vw, 52px)',
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            color: '#FAFAFA',
            marginBottom: '24px',
            maxWidth: '800px',
          }}>
            Three steps to your next client.
          </h2>
          <p style={{
            fontSize: 'clamp(16px, 2vw, 20px)',
            fontWeight: 400,
            lineHeight: 1.7,
            color: 'rgba(255,255,255,0.35)',
            maxWidth: '560px',
          }}>
            Stop switching between five different tools. We consolidated the entire lifecycle of a freelance deal into one fluid workflow.
          </p>
        </motion.div>

        {/* ── 40/60 Layout ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col lg:flex-row gap-10 items-start"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* ── Left: Tab List (40%) — card-styled like right panel ── */}
          <div className="w-full lg:w-[40%] flex flex-col gap-2">
            {STEPS.map((step, index) => {
              const isActive = index === activeTab
              const Icon = step.icon
              return (
                <div
                  key={step.id}
                  onClick={() => handleTabClick(index)}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '16px 20px',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    background: isActive ? 'rgba(255,255,255,0.03)' : 'transparent',
                    borderTop: isActive ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
                    borderRight: isActive ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
                    borderBottom: isActive ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
                    borderLeft: isActive ? '3px solid #c30101' : '3px solid transparent',
                    boxShadow: isActive ? 'inset 0 0 24px rgba(196,20,37,0.05), -4px 0 16px rgba(196,20,37,0.08)' : 'none',
                    opacity: isActive ? 1 : 0.45,
                    backdropFilter: isActive ? 'blur(16px)' : 'none',
                    transition: 'all 0.3s ease',
                  }}
                  className="hover:!bg-[rgba(255,255,255,0.015)]"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                    <div style={{
                      padding: '8px',
                      borderRadius: '8px',
                      flexShrink: 0,
                      background: isActive ? 'rgba(196,20,37,0.15)' : 'rgba(255,255,255,0.05)',
                      color: isActive ? '#c30101' : 'rgba(255,255,255,0.35)',
                      transition: 'all 0.3s ease',
                    }}>
                      <Icon size={18} />
                    </div>
                    <h3 style={{
                      fontSize: '15px',
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? '#FAFAFA' : 'rgba(255,255,255,0.4)',
                    }}>
                      {step.title}
                    </h3>
                  </div>
                  <p style={{
                    fontSize: '13px',
                    lineHeight: 1.6,
                    color: isActive ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.2)',
                    marginLeft: '46px',
                    paddingRight: '8px',
                    transition: 'color 0.3s ease',
                  }}>
                    {step.desc}
                  </p>

                  {/* Progress bar */}
                  {isActive && (
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '2px',
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: '0 0 8px 8px',
                      overflow: 'hidden',
                    }}>
                      <div
                        key={progressKey}
                        className={`tab-progress-bar h-full ${!isHovered ? 'running' : ''}`}
                        style={{ '--tab-duration': `${TAB_DURATION}ms` } as React.CSSProperties}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* ── Right: Mockup Panel (60%) — glassmorphism + macOS header ── */}
          <div className="w-full lg:w-[60%] lg:sticky lg:top-24">
            <div
              style={{
                width: '100%',
                position: 'relative',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.08)',
                overflow: 'hidden',
                background: 'rgba(255,255,255,0.02)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 24px 80px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.4)',
              }}
              className="group"
            >
              {/* macOS traffic lights */}
              <div style={{
                display: 'flex',
                height: '44px',
                alignItems: 'center',
                gap: '8px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(0,0,0,0.3)',
                padding: '0 20px',
                flexShrink: 0,
              }}>
                <div className="h-3 w-3 rounded-full bg-[#ff5f56]" />
                <div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                <div className="h-3 w-3 rounded-full bg-[#27c93f]" />
              </div>

              {/* Mockup body */}
              <div style={{
                position: 'relative',
                minHeight: '380px',
                background: 'rgba(10,10,12,0.5)',
                zIndex: 10,
                overflow: 'hidden',
              }}>
                {STEPS.map((step, index) => (
                  <div
                    key={`${step.id}-${progressKey}`}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      padding: '24px 28px',
                      overflowY: 'auto',
                      transition: 'opacity 0.5s ease',
                      opacity: activeTab === index ? 1 : 0,
                      pointerEvents: activeTab === index ? 'auto' : 'none',
                    }}
                  >
                    {activeTab === index && getMockup()}
                  </div>
                ))}
              </div>

              {/* Deep ambient red glow behind glass */}
              <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#c30101] rounded-full blur-[140px] opacity-[0.12] pointer-events-none group-hover:opacity-[0.22] transition-opacity duration-700 z-0" />
            </div>
          </div>
        </motion.div>

        {/* Background section glow */}
        <div className="absolute left-[25%] top-[35%] w-[600px] h-[600px] rounded-full bg-[rgba(196,20,37,0.03)] blur-[120px] pointer-events-none -z-10" />
      </div>
    </section>
  )
}

