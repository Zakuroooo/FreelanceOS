'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  Search, Sparkles, Send, Calendar, BarChart3, Wallet,
} from 'lucide-react'

/* ══════════════════════════════════════════════════
   FEATURES — 3-column animated cards
   Each card has an animated visual + title + desc
══════════════════════════════════════════════════ */

const FEATURES = [
  {
    icon: <Search size={20} />,
    title: 'AI Client Discovery',
    desc: 'Scan thousands of platforms and surface high-fit leads in your niche with AI scoring.',
    visual: <DiscoveryVisual />,
  },
  {
    icon: <Sparkles size={20} />,
    title: 'Pitch Automation',
    desc: 'Generate hyper-personalized outreach in seconds. Each pitch crafted to their pain points.',
    visual: <PitchVisual />,
  },
  {
    icon: <Send size={20} />,
    title: 'Multi-Channel Outreach',
    desc: 'Email, LinkedIn, and cold DM — all from one dashboard. No switching, no lost leads.',
    visual: <OutreachVisual />,
  },
  {
    icon: <Calendar size={20} />,
    title: 'Smart Sequences',
    desc: 'Auto follow-up sequences triggered by client behaviour. Stay top of mind effortlessly.',
    visual: <SequenceVisual />,
  },
  {
    icon: <BarChart3 size={20} />,
    title: 'Deal Pipeline',
    desc: 'Track every opportunity from first message to signed contract in a visual pipeline.',
    visual: <PipelineVisual />,
  },
  {
    icon: <Wallet size={20} />,
    title: 'Revenue Analytics',
    desc: 'See what converts. Know your best pitches, channels, and reply times at a glance.',
    visual: <RevenueVisual />,
  },
]

/* ── Card Visuals ── */

function DiscoveryVisual() {
  const items = ['Wave Commerce — 91%', 'Bright Studio — 87%', 'Peak Digital — 95%', 'Nova Collective — 83%']
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {items.map((item, i) => (
        <motion.div
          key={item}
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 + 0.3, duration: 0.4 }}
          style={{
            padding: '6px 10px',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '3px',
            fontSize: '10px',
            fontFamily: "'JetBrains Mono', monospace",
            color: 'rgba(255,255,255,0.35)',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>{item.split(' — ')[0]}</span>
          <span style={{ color: '#C41425', fontWeight: 700 }}>{item.split(' — ')[1]}</span>
        </motion.div>
      ))}
    </div>
  )
}

function PitchVisual() {
  return (
    <div style={{
      padding: '10px 12px',
      background: 'rgba(255,255,255,0.03)',
      borderRadius: '4px',
      border: '1px solid rgba(255,255,255,0.05)',
    }}>
      <div style={{ fontSize: '8px', fontWeight: 700, color: 'rgba(196,20,37,0.7)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>
        AI GENERATING
      </div>
      <div style={{
        fontSize: '10px',
        color: 'rgba(255,255,255,0.3)',
        lineHeight: 1.6,
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Hi Sarah, I noticed Bright Studio is scaling their product portfolio...
        </motion.span>
      </div>
    </div>
  )
}

function OutreachVisual() {
  const channels = [
    { name: 'Email', sent: 24, color: '#C41425' },
    { name: 'LinkedIn', sent: 18, color: 'rgba(196,20,37,0.6)' },
    { name: 'DM', sent: 12, color: 'rgba(196,20,37,0.3)' },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {channels.map((ch) => (
        <div key={ch.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', width: '48px', fontWeight: 600 }}>{ch.name}</span>
          <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: '2px', overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${(ch.sent / 24) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              style={{ height: '100%', background: ch.color, borderRadius: '2px' }}
            />
          </div>
          <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', fontFamily: "'JetBrains Mono', monospace" }}>{ch.sent}</span>
        </div>
      ))}
    </div>
  )
}

function SequenceVisual() {
  const steps = ['Day 1: Initial pitch', 'Day 3: Follow-up', 'Day 7: Value add', 'Day 14: Final']
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      {steps.map((step, i) => (
        <div key={step} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: i === 0 ? '#C41425' : 'rgba(255,255,255,0.1)',
              flexShrink: 0, marginTop: '3px',
            }} />
            {i < steps.length - 1 && (
              <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.06)' }} />
            )}
          </div>
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', lineHeight: 1.2, paddingBottom: '6px' }}>{step}</span>
        </div>
      ))}
    </div>
  )
}

function PipelineVisual() {
  const stages = [
    { name: 'Lead', count: 12 },
    { name: 'Pitched', count: 8 },
    { name: 'Replied', count: 5 },
    { name: 'Closed', count: 3 },
  ]
  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', height: '50px' }}>
      {stages.map((s, i) => (
        <div key={s.name} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <motion.div
            initial={{ height: 0 }}
            whileInView={{ height: `${(s.count / 12) * 40}px` }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.1 + 0.3 }}
            style={{
              width: '100%',
              background: `rgba(196,20,37,${0.15 + i * 0.15})`,
              borderRadius: '2px 2px 0 0',
            }}
          />
          <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.2)', fontWeight: 600 }}>{s.name}</span>
        </div>
      ))}
    </div>
  )
}

function RevenueVisual() {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.04em', color: 'rgba(196,20,37,0.8)', fontFamily: "'JetBrains Mono', monospace" }}>
        $4,500
      </div>
      <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', marginTop: '4px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        This Month
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '8px' }}>
        <span style={{ fontSize: '9px', color: 'rgba(0,201,167,0.6)' }}>↑ 23%</span>
        <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.15)' }}>vs last month</span>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════
   MAIN SECTION
══════════════════════════════════════════════════ */

export default function Features() {
  const sectionRef = useRef(null)
  const inView = useInView(sectionRef, { once: true, margin: '-80px' })

  return (
    <section
      id="features"
      ref={sectionRef}
      style={{
        background: '#040408',
        padding: '120px 24px 140px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top separator */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'rgba(255,255,255,0.05)' }} />

      {/* Ambient glow */}
      <div aria-hidden style={{
        position: 'absolute', top: '0', right: '-100px',
        width: '500px', height: '400px',
        background: 'radial-gradient(ellipse, rgba(196,20,37,0.06) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: '64px' }}
        >
          <span className="section-badge" style={{ marginBottom: '16px', display: 'inline-flex' }}>
            Features
          </span>
          <h2 style={{
            fontSize: 'clamp(32px, 4vw, 52px)',
            fontWeight: 800,
            color: '#FAFAFA',
            letterSpacing: '-0.04em',
            lineHeight: 1.06,
            marginTop: '16px',
          }}>
            Built for serious<br />
            freelancers.
          </h2>
          <p style={{
            fontSize: '15px',
            color: 'rgba(255,255,255,0.36)',
            marginTop: '14px',
            letterSpacing: '-0.01em',
            maxWidth: '380px',
            lineHeight: 1.6,
          }}>
            One platform to find clients, pitch, follow up, and get paid — without the grind.
          </p>
        </motion.div>

        {/* 3-Column Card Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
        }}>
          {FEATURES.map((feat, idx) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07)',
                borderRadius: '12px',
                padding: '24px',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'default',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}
              whileHover={{
                y: -4,
                borderColor: 'transparent',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 0 0 1px rgba(196,20,37,0.3), 0 12px 40px rgba(0,0,0,0.4)',
              }}
            >
              {/* Icon */}
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '6px',
                background: 'rgba(196,20,37,0.08)',
                border: '1px solid rgba(196,20,37,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#C41425',
                marginBottom: '16px',
              }}>
                {feat.icon}
              </div>

              {/* Title */}
              <h3 style={{
                fontSize: '16px',
                fontWeight: 700,
                color: '#FAFAFA',
                letterSpacing: '-0.02em',
                marginBottom: '8px',
              }}>
                {feat.title}
              </h3>

              {/* Description */}
              <p style={{
                fontSize: '13px',
                color: 'rgba(255,255,255,0.3)',
                lineHeight: 1.6,
                marginBottom: '20px',
              }}>
                {feat.desc}
              </p>

              {/* Visual */}
              <div style={{
                borderTop: '1px solid rgba(255,255,255,0.04)',
                paddingTop: '16px',
              }}>
                {feat.visual}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 1024px) {
          #features > div > div:last-child { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          #features > div > div:last-child { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
