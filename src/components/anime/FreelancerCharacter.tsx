'use client'

import { useEffect, useState } from 'react'
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  AnimatePresence,
} from 'framer-motion'

interface FreelancerCharacterProps {
  heroRef: React.RefObject<HTMLElement | null>
}

const speeches = [
  { key: 'lost',      text: 'Spending all day finding clients...' },
  { key: 'searching', text: 'Wait... I can automate this?!' },
  { key: 'sending',   text: 'Pitches sent!' },
  { key: 'paid',      text: 'Client paid!' },
]

function getSpeechIndex(progress: number): number {
  if (progress < 0.25) return 0
  if (progress < 0.5) return 1
  if (progress < 0.75) return 2
  return 3
}

export default function FreelancerCharacter({ heroRef }: FreelancerCharacterProps) {
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end end'],
  })

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 25,
  })

  // Derived motion values
  const bodyColor = useTransform(
    smoothProgress,
    [0, 0.25, 0.5, 0.75, 1],
    ['#444444', '#666666', '#888888', 'rgba(255,45,45,0.7)', '#FF2D2D']
  )
  const glowOpacity = useTransform(smoothProgress, [0, 0.5, 1], [0, 0.06, 0.15])
  const scale       = useTransform(smoothProgress, [0, 0.75, 1], [1.0, 1.0, 1.05])
  const headRotate  = useTransform(smoothProgress, [0, 0.25, 0.5, 1], [12, 0, -3, 0])

  // Opacity gates — simple useTransform returning 0 or 1 range
  const laptopOpacity    = useTransform(smoothProgress, [0.45, 0.55], [0, 1])
  const starEyesOpacity  = useTransform(smoothProgress, [0.78, 0.88], [0, 1])

  const paperOpacity  = useTransform(smoothProgress, [0, 0.2, 0.3], [1, 1, 0])
  const paper2Opacity = useTransform(smoothProgress, [0, 0.2, 0.3], [0.8, 0.8, 0])
  const sweatOpacity  = useTransform(smoothProgress, [0, 0.22, 0.32], [1, 1, 0])
  const pinOpacity    = useTransform(smoothProgress, [0.22, 0.3, 0.48, 0.55], [0, 1, 1, 0])
  const questionOpacity = useTransform(smoothProgress, [0.22, 0.3, 0.48, 0.55], [0, 1, 1, 0])
  const env1Opacity   = useTransform(smoothProgress, [0.48, 0.55, 0.73, 0.8], [0, 1, 1, 0])
  const env2Opacity   = useTransform(smoothProgress, [0.5, 0.58, 0.73, 0.8], [0, 1, 1, 0])
  const dollar1Opacity = useTransform(smoothProgress, [0.73, 0.82], [0, 1])
  const dollar2Opacity = useTransform(smoothProgress, [0.78, 0.88], [0, 1])
  const confettiOpacity = useTransform(smoothProgress, [0.8, 0.9], [0, 1])

  // Speech bubble state — read raw scroll value into React state
  const [speechIdx, setSpeechIdx] = useState(0)
  useEffect(() => {
    const unsub = smoothProgress.on('change', (v) => {
      setSpeechIdx(getSpeechIndex(v))
    })
    return unsub
  }, [smoothProgress])

  return (
    <div
      style={{
        position: 'relative',
        width: '280px',
        height: '380px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
      }}
    >
      {/* Glow */}
      <motion.div
        style={{
          position: 'absolute',
          inset: '-40px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,45,45,1) 0%, transparent 70%)',
          opacity: glowOpacity,
          pointerEvents: 'none',
        }}
      />

      {/* Character SVG */}
      <motion.div style={{ scale, position: 'relative', zIndex: 1 }}>
        <svg
          width="180"
          height="280"
          viewBox="0 0 180 280"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          overflow="visible"
        >
          {/* Body */}
          <motion.rect x="50" y="110" width="80" height="110" rx="12" style={{ fill: bodyColor }} />

          {/* Arms */}
          <motion.rect x="20" y="120" width="32" height="14" rx="7" style={{ fill: bodyColor }} />
          <motion.rect x="128" y="120" width="32" height="14" rx="7" style={{ fill: bodyColor }} />

          {/* Legs */}
          <motion.rect x="60" y="214" width="22" height="52" rx="11" style={{ fill: bodyColor }} />
          <motion.rect x="98" y="214" width="22" height="52" rx="11" style={{ fill: bodyColor }} />

          {/* Neck */}
          <motion.rect x="80" y="96" width="20" height="20" rx="4" style={{ fill: bodyColor }} />

          {/* Head group */}
          <motion.g style={{ originX: '90px', originY: '80px', rotate: headRotate }}>
            <motion.rect x="55" y="44" width="70" height="66" rx="24" style={{ fill: bodyColor }} />
            {/* Eyes */}
            <circle cx="75" cy="68" r="7" fill="var(--color-bg)" />
            <circle cx="105" cy="68" r="7" fill="var(--color-bg)" />
            {/* Pupils */}
            <circle cx="77" cy="68" r="3.5" fill="var(--color-text-primary)" />
            <circle cx="107" cy="68" r="3.5" fill="var(--color-text-primary)" />
            {/* Mouth */}
            <path d="M 76 84 Q 90 94 104 84" stroke="var(--color-bg)" strokeWidth="3" strokeLinecap="round" fill="none" />
            {/* Hair */}
            <motion.rect x="55" y="36" width="70" height="18" rx="12" style={{ fill: bodyColor }} />
          </motion.g>

          {/* Laptop (STATE 3+) */}
          <motion.g style={{ opacity: laptopOpacity }}>
            <rect x="44" y="185" width="92" height="56" rx="6" fill="var(--color-surface-2)" />
            <rect x="48" y="189" width="84" height="46" rx="4" fill="var(--color-accent)" opacity="0.15" />
            <rect x="48" y="189" width="84" height="5" rx="2" fill="var(--color-accent)" opacity="0.5" />
          </motion.g>

          {/* Star eyes (STATE 4) */}
          <motion.g style={{ opacity: starEyesOpacity }}>
            <text x="68" y="72" fontSize="12" textAnchor="middle" fill="var(--color-warning)">★</text>
            <text x="112" y="72" fontSize="12" textAnchor="middle" fill="var(--color-warning)">★</text>
          </motion.g>
        </svg>
      </motion.div>

      {/* Floating — CSS @keyframes only (CLAUDE.md rule 9) */}

      {/* STATE 1: Papers */}
      <motion.div style={{ position: 'absolute', top: '60px', right: '-10px', opacity: paperOpacity, pointerEvents: 'none' }}>
        <div className="animate-float-chaos" style={{ fontSize: '20px' }}>📄</div>
      </motion.div>
      <motion.div style={{ position: 'absolute', top: '90px', left: '-5px', opacity: paper2Opacity, pointerEvents: 'none' }}>
        <div className="animate-float-chaos" style={{ fontSize: '16px', animationDelay: '0.5s' }}>📋</div>
      </motion.div>

      {/* STATE 1: Sweat drop */}
      <motion.div
        style={{ position: 'absolute', top: '50px', right: '30px', opacity: sweatOpacity, pointerEvents: 'none', fontSize: '14px' }}
        className="animate-sweat-drop"
      >
        💧
      </motion.div>

      {/* STATE 2: Pin + question */}
      <motion.div style={{ position: 'absolute', top: '20px', right: '20px', opacity: pinOpacity, pointerEvents: 'none' }}>
        <div className="animate-pin-bounce" style={{ fontSize: '22px' }}>📍</div>
      </motion.div>
      <motion.div style={{ position: 'absolute', top: '10px', left: '20px', opacity: questionOpacity, pointerEvents: 'none' }}>
        <div className="animate-float-bob" style={{ fontSize: '20px' }}>❓</div>
      </motion.div>

      {/* STATE 3: Envelopes */}
      <motion.div style={{ position: 'absolute', top: '80px', left: '0px', opacity: env1Opacity, pointerEvents: 'none' }}>
        <div className="animate-fly-right" style={{ fontSize: '18px' }}>✉️</div>
      </motion.div>
      <motion.div style={{ position: 'absolute', top: '110px', left: '10px', opacity: env2Opacity, pointerEvents: 'none' }}>
        <div className="animate-fly-right" style={{ fontSize: '18px', animationDelay: '0.6s' }}>✉️</div>
      </motion.div>

      {/* STATE 4: Dollar + confetti */}
      <motion.div style={{ position: 'absolute', top: '10px', left: '10px', opacity: dollar1Opacity, pointerEvents: 'none' }}>
        <div className="animate-float-up" style={{ fontSize: '20px', color: 'var(--color-warning)' }}>$</div>
      </motion.div>
      <motion.div style={{ position: 'absolute', top: '0px', right: '30px', opacity: dollar2Opacity, pointerEvents: 'none' }}>
        <div className="animate-float-up" style={{ fontSize: '20px', color: 'var(--color-warning)', animationDelay: '0.4s' }}>$</div>
      </motion.div>
      <motion.div style={{ position: 'absolute', top: '-10px', left: '50%', opacity: confettiOpacity, pointerEvents: 'none' }}>
        <div className="animate-confetti-fall" style={{ fontSize: '14px' }}>🎊</div>
      </motion.div>

      {/* Speech bubble */}
      <div
        style={{
          position: 'absolute',
          bottom: '-10px',
          left: '50%',
          transform: 'translateX(-50%)',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          minHeight: '36px',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={speeches[speechIdx]?.key}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
          >
            <div
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '20px',
                padding: '8px 14px',
                fontSize: '12px',
                color: 'var(--color-text-secondary)',
                fontWeight: 500,
                boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
              }}
            >
              {speeches[speechIdx]?.text}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
