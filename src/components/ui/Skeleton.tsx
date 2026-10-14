'use client'

import type { CSSProperties } from 'react'

/**
 * One shimmer language for every loading state.
 * Usage: <Skel h={14} w="60%" /> or rows via <SkeletonRows />
 */
export function Skel({ w = '100%', h = 12, style }: { w?: string | number; h?: number; style?: CSSProperties }) {
  return (
    <div className="skel" style={{ width: w, height: h, borderRadius: 6, ...style }} />
  )
}

/** Generic list skeleton — cards, tables, feeds. */
export function SkeletonRows({ rows = 5, height = 52 }: { rows?: number; height?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: `${height > 48 ? 14 : 10}px 18px`,
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: 12,
            background: 'rgba(255,255,255,0.015)',
          }}
        >
          <Skel w={34} h={34} style={{ borderRadius: '50%', flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
            <Skel w={`${70 - i * 6}%`} h={11} />
            <Skel w={`${40 - i * 4}%`} h={9} />
          </div>
          <Skel w={54} h={22} style={{ borderRadius: 20 }} />
        </div>
      ))}
    </div>
  )
}

/** Full-page skeleton matching the PageHeader + content rhythm. */
export function PageSkeleton() {
  return (
    <div style={{ minHeight: '60vh' }}>
      <div style={{ marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Skel w={90} h={10} style={{ marginBottom: 12 }} />
        <Skel w={260} h={26} style={{ marginBottom: 8 }} />
        <Skel w={340} h={11} />
      </div>
      <SkeletonRows rows={5} />
      <style>{`
        .skel {
          background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 75%);
          background-size: 400% 100%;
          animation: skel-shimmer 1.4s infinite linear;
        }
        @keyframes skel-shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }
      `}</style>
    </div>
  )
}
