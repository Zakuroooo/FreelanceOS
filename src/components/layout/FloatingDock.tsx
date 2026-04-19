'use client'

import { useRef, useState } from 'react'
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  AnimatePresence,
  type MotionValue,
} from 'framer-motion'
import { Home, Sparkles, DollarSign, LayoutDashboard } from 'lucide-react'

const DOCK_ITEMS = [
  { title: 'Home',      icon: Home,            href: '#hero' },
  { title: 'Features',  icon: Sparkles,        href: '#features' },
  { title: 'Pricing',   icon: DollarSign,      href: '#pricing' },
  { title: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
]

function DockIcon({
  item,
  mouseX,
}: {
  item: typeof DOCK_ITEMS[0]
  mouseX: MotionValue<number>
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(false)

  const distance = useTransform(mouseX, (val: number) => {
    const rect = ref.current?.getBoundingClientRect()
    return rect ? val - rect.x - rect.width / 2 : Infinity
  })

  const size = useSpring(
    useTransform(distance, [-120, 0, 120], [48, 68, 48]),
    { mass: 0.1, stiffness: 170, damping: 14 }
  )

  const iconSize = useSpring(
    useTransform(distance, [-120, 0, 120], [22, 32, 22]),
    { mass: 0.1, stiffness: 170, damping: 14 }
  )

  const Icon = item.icon

  return (
    <a href={item.href} style={{ textDecoration: 'none' }}>
      <motion.div
        ref={ref}
        style={{ width: size, height: size }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        whileHover={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
        className="dock-icon-container"
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 8, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: 4, x: '-50%' }}
              style={{
                position: 'absolute',
                left: '50%',
                top: '-32px',
                padding: '3px 8px',
                borderRadius: '4px',
                background: 'rgba(13,13,18,0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#FAFAFA',
                fontSize: '11px',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
              }}
            >
              {item.title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          style={{ width: iconSize, height: iconSize }}
          className="dock-icon-inner"
        >
          <Icon style={{ width: '100%', height: '100%', color: 'rgba(255,255,255,0.55)' }} />
        </motion.div>
      </motion.div>
    </a>
  )
}

export default function PageFloatingDock() {
  const mouseX = useMotionValue(Infinity)

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 90,
      }}
    >
      <motion.div
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        style={{
          display: 'flex',
          height: '64px',
          gap: '6px',
          alignItems: 'flex-end',
          padding: '0 16px 10px',
          borderRadius: '20px',
          background: 'rgba(6, 6, 12, 0.35)',
          backdropFilter: 'blur(32px) saturate(190%)',
          WebkitBackdropFilter: 'blur(32px) saturate(190%)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 12px 48px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      >
        {DOCK_ITEMS.map((item) => (
          <DockIcon key={item.title} item={item} mouseX={mouseX} />
        ))}
      </motion.div>

      <style>{`
        .dock-icon-container {
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          position: relative;
          cursor: pointer;
          aspect-ratio: 1;
        }
        .dock-icon-inner {
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  )
}
