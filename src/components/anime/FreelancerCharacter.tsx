'use client'

import { useRef } from 'react'
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

// Speech bubbles for each state
const speeches = [
  { key: 'lost',      text: 'Spending all day finding clients...' },
  { key: 'searching', text: 'Wait... I can automate this?!' },
  { key: 'sending',   text: 'Pitches sent!' },
  { key: 'paid',      text: 'Client paid! 💸' },
]

export default function FreelancerCharacter({ heroRef }: FreelancerCharacterProps) {
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end end'],
  })

  // Smooth spring
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 30,
  })

  // Body color: #444 → #888 → rgba(255,45,45,0.6) → #FF2D2D
  const bodyColor = useTransform(
    smoothProgress,
    [0, 0.25, 0.5, 0.75, 1],
    ['#444444', '#666666', '#888888', 'rgba(255,45,45,0.7)', '#FF2D2D']
  )

  // Glow opacity
  const glowOpacity = useTransform(
    smoothProgress,
    [0, 0.5, 1],
    [0, 0.06, 0.15]
  )

  // Scale
  const scale = useTransform(
    smoothProgress,
    [0, 0.75, 1],
    [1.0, 1.0, 1.05]
  )

  // Head rotation: down → up
  const headRotate = useTransform(
    smoothProgress,
    [0, 0.25, 0.5, 1],
    [20, 0, -5, 0]
  )

  // Speech index
  const speechIndex = useTransform(
    smoothProgress,
    [0, 0.25, 0.5, 0.75],
    [0, 1, 2, 3]
  )

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
      {/* Glow behind character */}
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
          <motion.rect
            x="50"
            y="110"
            width="80"
            height="110"
            rx="12"
            style={{ fill: bodyColor }}
          />

          {/* Left arm — raised or down based on state */}
          <motion.rect
            x="20"
            y="120"
            width="32"
            height="14"
            rx="7"
            style={{ fill: bodyColor }}
            animate={{ rotate: 0 }}
          />

          {/* Right arm */}
          <motion.rect
            x="128"
            y="120"
            width="32"
            height="14"
            rx="7"
            style={{ fill: bodyColor }}
          />

          {/* Legs */}
          <motion.rect
            x="60"
            y="214"
            width="22"
            height="52"
            rx="11"
            style={{ fill: bodyColor }}
          />
          <motion.rect
            x="98"
            y="214"
            width="22"
            height="52"
            rx="11"
            style={{ fill: bodyColor }}
          />

          {/* Neck */}
          <motion.rect
            x="80"
            y="96"
            width="20"
            height="20"
            rx="4"
            style={{ fill: bodyColor }}
          />

          {/* Head */}
          <motion.g style={{ originX: '90px', originY: '80px', rotate: headRotate }}>
            {/* Head shape */}
            <motion.rect
              x="55"
              y="44"
              width="70"
              height="66"
              rx="24"
              style={{ fill: bodyColor }}
            />

            {/* Eyes — wide or normal */}
            <motion.circle cx="75" cy="68" r="7" fill="var(--color-bg)" />
            <motion.circle cx="105" cy="68" r="7" fill="var(--color-bg)" />
            {/* Pupils */}
            <motion.circle cx="77" cy="68" r="3.5" fill="var(--color-text-primary)" />
            <motion.circle cx="107" cy="68" r="3.5" fill="var(--color-text-primary)" />

            {/* Mouth */}
            <motion.path
              d="M 76 84 Q 90 94 104 84"
              stroke="var(--color-bg)"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />

            {/* Hair */}
            <motion.rect
              x="55"
              y="36"
              width="70"
              height="18"
              rx="12"
              style={{ fill: bodyColor }}
            />
          </motion.g>

          {/* Laptop on lap (visible from state 3+) */}
          <motion.g
            style={{
              opacity: useTransform(smoothProgress, [0.45, 0.55], [0, 1]),
            }}
          >
            <rect x="44" y="185" width="92" height="56" rx="6" fill="var(--color-surface-2)" />
            <rect x="48" y="189" width="84" height="46" rx="4" fill="var(--color-accent)" opacity="0.15" />
            {/* Screen glow */}
            <rect x="48" y="189" width="84" height="5" rx="2" fill="var(--color-accent)" opacity="0.5" />
          </motion.g>

          {/* Stars in eyes (state 4) */}
          <motion.g
            style={{
              opacity: useTransform(smoothProgress, [0.78, 0.88], [0, 1]),
            }}
          >
            <text x="68" y="72" fontSize="12" textAnchor="middle" fill="var(--color-warning)">★</text>
            <text x="112" y="72" fontSize="12" textAnchor="middle" fill="var(--color-warning)">★</text>
          </motion.g>
        </svg>
      </motion.div>

      {/* Floating elements — CSS @keyframes only (per CLAUDE.md) */}

      {/* STATE 1: Papers flying (chaos) — visible 0–25% */}
      <motion.div
        style={{
          position: 'absolute',
          top: '60px',
          right: '-10px',
          opacity: useTransform(smoothProgress, [0, 0.2, 0.3], [1, 1, 0]),
          pointerEvents: 'none',
        }}
      >
        <div className="animate-float-chaos" style={{ fontSize: '20px' }}>📄</div>
      </motion.div>
      <motion.div
        style={{
          position: 'absolute',
          top: '90px',
          left: '-5px',
          opacity: useTransform(smoothProgress, [0, 0.2, 0.3], [0.8, 0.8, 0]),
          pointerEvents: 'none',
        }}
      >
        <div className="animate-float-chaos" style={{ fontSize: '16px', animationDelay: '0.5s' }}>📋</div>
      </motion.div>

      {/* Sweat drop STATE 1 */}
      <motion.div
        style={{
          position: 'absolute',
          top: '50px',
          right: '30px',
          opacity: useTransform(smoothProgress, [0, 0.22, 0.32], [1, 1, 0]),
          pointerEvents: 'none',
          fontSize: '14px',
        }}
        className="animate-sweat-drop"
      >
        💧
      </motion.div>

      {/* STATE 2: Location pin bounce + question mark — 25–50% */}
      <motion.div
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          opacity: useTransform(smoothProgress, [0.22, 0.3, 0.48, 0.55], [0, 1, 1, 0]),
          pointerEvents: 'none',
        }}
      >
        <div className="animate-pin-bounce" style={{ fontSize: '22px' }}>📍</div>
      </motion.div>
      <motion.div
        style={{
          position: 'absolute',
          top: '10px',
          left: '20px',
          opacity: useTransform(smoothProgress, [0.22, 0.3, 0.48, 0.55], [0, 1, 1, 0]),
          pointerEvents: 'none',
        }}
      >
        <div className="animate-float-bob" style={{ fontSize: '20px' }}>❓</div>
      </motion.div>

      {/* STATE 3: Envelopes fly right — 50–75% */}
      <motion.div
        style={{
          position: 'absolute',
          top: '80px',
          left: '0px',
          opacity: useTransform(smoothProgress, [0.48, 0.55, 0.73, 0.8], [0, 1, 1, 0]),
          pointerEvents: 'none',
        }}
      >
        <div className="animate-fly-right" style={{ fontSize: '18px' }}>✉️</div>
      </motion.div>
      <motion.div
        style={{
          position: 'absolute',
          top: '110px',
          left: '10px',
          opacity: useTransform(smoothProgress, [0.5, 0.58, 0.73, 0.8], [0, 1, 1, 0]),
          pointerEvents: 'none',
        }}
      >
        <div className="animate-fly-right" style={{ fontSize: '18px', animationDelay: '0.6s' }}>✉️</div>
      </motion.div>

      {/* STATE 4: Dollar signs + confetti  — 75–100% */}
      <motion.div
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          opacity: useTransform(smoothProgress, [0.73, 0.82], [0, 1]),
          pointerEvents: 'none',
        }}
      >
        <div className="animate-float-up" style={{ fontSize: '20px', color: 'var(--color-warning)' }}>$</div>
      </motion.div>
      <motion.div
        style={{
          position: 'absolute',
          top: '0px',
          right: '30px',
          opacity: useTransform(smoothProgress, [0.78, 0.88], [0, 1]),
          pointerEvents: 'none',
        }}
      >
        <div className="animate-float-up" style={{ fontSize: '20px', color: 'var(--color-warning)', animationDelay: '0.4s' }}>$</div>
      </motion.div>
      <motion.div
        style={{
          position: 'absolute',
          top: '-10px',
          left: '50%',
          opacity: useTransform(smoothProgress, [0.8, 0.9], [0, 1]),
          pointerEvents: 'none',
        }}
      >
        <div className="animate-confetti-fall" style={{ fontSize: '14px' }}>🎊</div>
      </motion.div>

      {/* Speech bubble */}
      <motion.div
        style={{
          position: 'absolute',
          bottom: '-10px',
          left: '50%',
          transform: 'translateX(-50%)',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}
      >
        <AnimatePresence mode="wait">
          {speeches.map((s, i) => (
            <motion.div
              key={s.key}
              style={{
                display: useTransform(
                  speechIndex,
                  (v) => (Math.round(v) === i ? 'block' : 'none')
                ) as unknown as string,
              }}
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
                {s.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
