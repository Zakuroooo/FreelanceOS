'use client'

import { useRef, useState } from 'react'
import { motion, useSpring } from 'framer-motion'

interface WobbleCardProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

const MAX_TILT = 3 // degrees — subtle, not dramatic

export default function WobbleCard({ children, className = '', style }: WobbleCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const rotateX = useSpring(0, { stiffness: 300, damping: 40 })
  const rotateY = useSpring(0, { stiffness: 300, damping: 40 })

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const dx = e.clientX - centerX
    const dy = e.clientY - centerY
    rotateX.set(-(dy / (rect.height / 2)) * MAX_TILT)
    rotateY.set((dx / (rect.width / 2)) * MAX_TILT)
  }

  function handleMouseLeave() {
    rotateX.set(0)
    rotateY.set(0)
  }

  return (
    <div style={{ perspective: '1200px' }} className={className}>
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '4px', // sharp
          transition: 'border-color 0.2s ease',
          ...style,
        }}
        whileHover={{ borderColor: 'var(--color-border-hover)' }}
      >
        {children}
      </motion.div>
    </div>
  )
}
