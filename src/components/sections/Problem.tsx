'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import { EncryptedText } from '@/components/ui/encrypted-text'

/* ══════════════════════════════════════════════════
   PROBLEM SECTION — Animated Bento Grid
   3 pain-point cards, each with a unique micro-animation
══════════════════════════════════════════════════ */

/* ── Card 1: Endless Scrolling — animated scrolling feed ── */
function ScrollingFeed() {
  const jobs = [
    'Build React dashboard — $500',
    'WordPress site migration — $200',
    'Logo redesign ASAP — $50',
    'E-commerce full stack — $800',
    'Mobile app MVP — $1,200',
    'Fix CSS bugs urgent — $30',
    'API integration — $400',
    'Landing page design — $150',
  ]

  return (
    <div style={{
      height: '160px',
      overflow: 'hidden',
      position: 'relative',
      maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 75%, transparent 100%)',
      WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 75%, transparent 100%)',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        animation: 'scroll-feed 12s linear infinite',
      }}>
        {[...jobs, ...jobs].map((job, i) => (
          <div key={i} style={{
            padding: '8px 12px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '4px',
            fontSize: '11px',
            color: 'rgba(255,255,255,0.3)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {job}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes scroll-feed {
          0%   { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
      `}</style>
    </div>
  )
}

/* ── Card 2: Generic Proposals — scrambled text ── */
function ScrambledProposals() {
  const [hovering, setHovering] = useState(false)
  const lines = [
    'Dear Sir/Madam, I am a passionate developer...',
    'I have 10 years of experience in everything...',
    'Please hire me I can do any job for cheap...',
  ]

  return (
    <div
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      style={{
        height: '160px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        justifyContent: 'center',
        padding: '0 4px',
        cursor: 'default',
      }}
    >
      {lines.map((line, i) => (
        <div key={i} style={{
          padding: '8px 12px',
          background: hovering ? 'rgba(196,20,37,0.06)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${hovering ? 'rgba(196,20,37,0.15)' : 'rgba(255,255,255,0.05)'}`,
          borderRadius: '4px',
          fontSize: '11px',
          fontFamily: "'JetBrains Mono', monospace",
          transition: 'all 0.3s ease',
          lineHeight: 1.4,
        }}>
          <EncryptedText
            text={line}
            triggerOnView={false}
            revealDelayMs={40 + i * 10}
            encryptedClassName="text-[rgba(255,255,255,0.15)]"
            revealedClassName="text-[rgba(255,255,255,0.35)]"
          />
        </div>
      ))}
      <div style={{
        fontSize: '9px',
        color: 'rgba(196,20,37,0.5)',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        fontWeight: 600,
        textAlign: 'center',
        marginTop: '4px',
      }}>
        Hover to decrypt
      </div>
    </div>
  )
}

/* ── Card 3: Chasing Invoices — money counter going down ── */
function InvoiceCounter() {
  const [amount, setAmount] = useState(5000)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    const interval = setInterval(() => {
      setAmount((prev) => {
        const next = prev - Math.floor(Math.random() * 120 + 30)
        if (next <= 0) {
          // Reset after hitting zero
          setTimeout(() => setAmount(5000), 1500)
          return 0
        }
        return next
      })
    }, 350)
    return () => clearInterval(interval)
  }, [inView])

  const isLow = amount < 1500
  const isZero = amount === 0

  return (
    <div
      ref={ref}
      style={{
        height: '160px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
      }}
    >
      <div style={{
        fontSize: '10px',
        color: 'rgba(255,255,255,0.2)',
        fontWeight: 600,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
      }}>
        Outstanding Invoice
      </div>
      <div style={{
        fontSize: '42px',
        fontWeight: 800,
        letterSpacing: '-0.04em',
        fontFamily: "'JetBrains Mono', monospace",
        color: isZero ? 'rgba(196,20,37,0.9)' : isLow ? 'rgba(196,20,37,0.7)' : 'rgba(255,255,255,0.25)',
        transition: 'color 0.3s ease',
        textShadow: isLow ? '0 0 20px rgba(196,20,37,0.2)' : 'none',
      }}>
        ${amount.toLocaleString()}
      </div>
      <div style={{
        width: '120px',
        height: '3px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '2px',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${(amount / 5000) * 100}%`,
          height: '100%',
          background: isLow ? '#C41425' : 'rgba(255,255,255,0.12)',
          borderRadius: '2px',
          transition: 'width 0.3s ease, background 0.3s ease',
        }} />
      </div>
      <div style={{
        fontSize: '10px',
        color: isZero ? 'rgba(196,20,37,0.6)' : 'rgba(255,255,255,0.15)',
        fontWeight: 500,
      }}>
        {isZero ? 'Payment lost.' : '60+ days overdue'}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════
   MAIN SECTION
══════════════════════════════════════════════════ */

const CARDS = [
  {
    title: 'Endless Scrolling',
    description: 'Hours wasted on job boards, sifting through low-quality leads that go nowhere.',
    visual: <ScrollingFeed />,
  },
  {
    title: 'Generic Proposals',
    description: 'Copy-paste pitches that blend in with hundreds of others. Zero personalization.',
    visual: <ScrambledProposals />,
  },
  {
    title: 'Chasing Invoices',
    description: "Completed work, no payment. The freelancer's worst nightmare, on repeat.",
    visual: <InvoiceCounter />,
  },
]

export default function Problem() {
  const sectionRef = useRef(null)
  const inView = useInView(sectionRef, { once: true, margin: '-80px' })

  return (
    <section
      id="problem"
      ref={sectionRef}
      style={{
        background: '#050507',
        padding: '100px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Dotted glow background effect */}
      <div aria-hidden style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(196,20,37,0.06) 0%, transparent 60%)',
        borderRadius: '50%',
        filter: 'blur(80px)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ textAlign: 'center', marginBottom: '56px' }}
        >
          <span className="section-badge" style={{ marginBottom: '16px', display: 'inline-flex' }}>
            The Problem
          </span>
          <h2 style={{
            fontSize: 'clamp(32px, 4vw, 52px)',
            fontWeight: 700,
            color: '#FAFAFA',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            marginTop: '16px',
          }}>
            Freelancing is <span style={{ color: '#C41425' }}>broken</span>.
          </h2>
          <p style={{
            marginTop: '16px',
            fontSize: 'clamp(15px, 1.6vw, 18px)',
            color: 'rgba(255,255,255,0.35)',
            maxWidth: '520px',
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: 1.6,
          }}>
            Every freelancer faces the same three nightmares. We built FreelanceOS to kill them.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '16px',
        }}>
          {CARDS.map((card, idx) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: idx * 0.12, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '8px',
                padding: '24px',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
                cursor: 'default',
              }}
              whileHover={{
                y: -6,
                borderColor: 'rgba(196,20,37,0.2)',
                boxShadow: '0 8px 32px rgba(196,20,37,0.08), 0 0 0 1px rgba(196,20,37,0.1)',
              }}
            >
              {/* Top: animated visual */}
              <div style={{ marginBottom: '20px' }}>
                {card.visual}
              </div>

              {/* Bottom: text */}
              <h3 style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#FAFAFA',
                letterSpacing: '-0.02em',
                marginBottom: '8px',
              }}>
                {card.title}
              </h3>
              <p style={{
                fontSize: '13px',
                color: 'rgba(255,255,255,0.3)',
                lineHeight: 1.6,
              }}>
                {card.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
