'use client'

import { useId } from 'react'

type ScoreRingSize = 'sm' | 'lg'

const SEGMENTS = 8
const GAP_DEGREES = 6

function getScoreColor(score: number) {
  if (score >= 67) return 'var(--color-success)'
  if (score >= 34) return 'rgb(34 211 238)'
  return 'rgba(255, 255, 255, 0.18)'
}

function getRingSize(size: ScoreRingSize) {
  return size === 'lg'
    ? { outer: 74, center: 37, radius: 28, stroke: 5, text: 17, label: 8 }
    : { outer: 28, center: 14, radius: 10, stroke: 2.5, text: 9, label: 5 }
}

export function ScoreRing({ score, size = 'sm' }: { score: number; size?: ScoreRingSize }) {
  const safeScore = Math.max(0, Math.min(100, Math.round(score)))
  const ring = getRingSize(size)
  const activeSegments = Math.round((safeScore / 100) * SEGMENTS)
  const sweep = 360 / SEGMENTS
  const dashKey = useId().replace(/:/g, '')

  return (
    <div
      aria-label={`Opportunity score ${safeScore}`}
      style={{
        position: 'relative',
        width: ring.outer,
        height: ring.outer,
        flexShrink: 0,
      }}
    >
      <style>{`
        @keyframes discover-ring-fill-${dashKey} {
          from { stroke-dashoffset: 1; opacity: 0.45; }
          to { stroke-dashoffset: 0; opacity: 1; }
        }
      `}</style>
      <svg width={ring.outer} height={ring.outer} viewBox={`0 0 ${ring.outer} ${ring.outer}`}>
        {Array.from({ length: SEGMENTS }, (_, index) => {
          const startAngle = -90 + index * sweep + GAP_DEGREES / 2
          const endAngle = -90 + (index + 1) * sweep - GAP_DEGREES / 2
          const startX = ring.center + ring.radius * Math.cos((startAngle * Math.PI) / 180)
          const startY = ring.center + ring.radius * Math.sin((startAngle * Math.PI) / 180)
          const endX = ring.center + ring.radius * Math.cos((endAngle * Math.PI) / 180)
          const endY = ring.center + ring.radius * Math.sin((endAngle * Math.PI) / 180)
          const path = `M ${startX} ${startY} A ${ring.radius} ${ring.radius} 0 0 1 ${endX} ${endY}`
          const isActive = index < activeSegments

          return (
            <path
              key={`${size}-${index}`}
              d={path}
              fill="none"
              stroke={isActive ? getScoreColor(safeScore) : 'rgba(255, 255, 255, 0.08)'}
              strokeWidth={ring.stroke}
              strokeLinecap="round"
              pathLength={1}
              style={
                isActive
                  ? {
                      strokeDasharray: 1,
                      strokeDashoffset: 0,
                      animation: `discover-ring-fill-${dashKey} 0.7s ease-out both`,
                      animationDelay: `${index * 0.04}s`,
                    }
                  : undefined
              }
            />
          )
        })}
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'inherit',
          color: 'var(--color-text-primary)',
          lineHeight: 1,
        }}
      >
        <span style={{ fontSize: ring.text, fontWeight: 700, letterSpacing: '-0.02em' }}>{safeScore}</span>
        {size === 'lg' && (
          <span style={{ marginTop: 3, fontSize: ring.label, color: 'var(--color-text-muted)', letterSpacing: '0.04em' }}>
            score
          </span>
        )}
      </div>
    </div>
  )
}
