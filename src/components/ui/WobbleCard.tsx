'use client'

import { useRef, useState } from 'react'
import { motion, useSpring } from 'framer-motion'

interface WobbleCardProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

const MAX_TILT = 8 // degrees, as per CLAUDE.md

export default function WobbleCard({ children, className = '', style }: WobbleCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  const rotateX = useSpring(0, { stiffness: 400, damping: 30 })
  const rotateY = useSpring(0, { stiffness: 400, damping: 30 })
  const [glowX, setGlowX] = useState(50)
  const [glowY, setGlowY] = useState(50)

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const dx = e.clientX - centerX
    const dy = e.clientY - centerY
    const tiltY = (dx / (rect.width / 2)) * MAX_TILT
    const tiltX = -(dy / (rect.height / 2)) * MAX_TILT
    rotateX.set(tiltX)
    rotateY.set(tiltY)
    setGlowX(((e.clientX - rect.left) / rect.width) * 100)
    setGlowY(((e.clientY - rect.top) / rect.height) * 100)
  }

  function handleMouseLeave() {
    rotateX.set(0)
    rotateY.set(0)
  }

  return (
    <div
      style={{ perspective: '1000px' }}
      className={className}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '16px',
          cursor: 'default',
          ...style,
        }}
      >
        {/* Spotlight glow */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(255,255,255,0.06) 0%, transparent 60%)`,
            pointerEvents: 'none',
            transition: 'background 0.1s ease',
            borderRadius: '16px',
          }}
        />
        {children}
      </motion.div>
    </div>
  )
}
