'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import AnimatedCounter from '@/components/ui/AnimatedCounter'

/* ══════════════════════════════════════════════════
   SUCCESS NUMBERS — Pure Raycast metric section
   4 stats, gigantic numbers, ambient crimson back-glow, no borders.
══════════════════════════════════════════════════ */

const METRICS = [
  { value: 2400, suffix: '+', label: 'Pitches Sent' },
  { value: 340, suffix: '+', label: 'Clients Found' },
  { prefix: '$', value: 1.2, suffix: 'M+', label: 'Revenue Earned', decimals: 1 },
  { value: 98, suffix: '%', label: 'Satisfaction' },
]

export default function SuccessNumbers() {
  const sectionRef = useRef(null)
  const inView = useInView(sectionRef, { once: true, margin: '-100px' })

  return (
    <section ref={sectionRef} id="metrics" style={{ padding: '160px 0', position: 'relative', overflow: 'hidden' }}>
      
      {/* ── Massive ambient red glow orb behind the numbers ── */}
      <div 
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80vw',
          height: '400px',
          background: 'rgba(196,20,37,0.12)',
          filter: 'blur(120px)',
          WebkitFilter: 'blur(120px)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10 }}>
        
        {/* ── Flex row of 4 massive stats ── */}
        <div style={{
          display: 'flex',
          flexWrap: 'nowrap',
          justifyContent: 'space-between',
          gap: '24px',
        }}>
          {METRICS.map((metric, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: idx * 0.15, ease: [0.16, 1, 0.3, 1] }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                flex: '1',
                // Keep min-width locked to prevent jumping layout on mobile wrapping
                minWidth: '200px',
                position: 'relative',
              }}
            >
              {/* Massive Metric Number */}
              <div style={{
                fontSize: 'clamp(48px, 6vw, 76px)',
                fontWeight: 800,
                lineHeight: 1,
                letterSpacing: '-0.04em',
                marginBottom: '16px',
                fontFamily: "'Inter', sans-serif",
                background: 'linear-gradient(180deg, #FFFFFF 0%, rgba(255,255,255,0.65) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 4px 24px rgba(255,255,255,0.12)',
                fontVariantNumeric: 'tabular-nums',
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
              }}>
                {inView ? (
                  <AnimatedCounter 
                    target={metric.value} 
                    prefix={metric.prefix} 
                    suffix={metric.suffix} 
                    decimals={metric.decimals}
                    duration={2500 + (idx * 500)} // Stagger duration slightly
                  />
                ) : (
                  // Placeholder before animation starts
                  <span>{metric.prefix}{metric.decimals ? '0.0' : '0'}{metric.suffix}</span>
                )}
              </div>

              {/* Metric Label */}
              <div style={{
                fontSize: '14px',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.4)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}>
                {metric.label}
              </div>

              {/* Vertical Divider (except for last item) */}
              {idx !== METRICS.length - 1 && (
                <div 
                  className="hidden md:block"
                  style={{
                    position: 'absolute',
                    right: '-12px', // perfectly centered in the 24px gap
                    top: '15%',
                    bottom: '15%',
                    width: '1px',
                    background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.1), transparent)'
                  }} 
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
