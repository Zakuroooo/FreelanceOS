'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, useMotionValue, useAnimationFrame, AnimatePresence } from 'framer-motion'
import { ArrowRight, X } from 'lucide-react'

// 8 Short, punchy testimonials
const TESTIMONIALS = [
  {
    quote: "A designer's dream.",
    text: "Stopped using 4 different tools. Billable hours up 30%.",
    name: "Sarah Jenkins",
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop',
    radius: 240,
    speed: 0.6,
    startAngle: 0,
  },
  {
    quote: "AI is scary good.",
    text: "Scored 3 interviews this week using automated sequences.",
    name: "Marcus Chen",
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
    radius: 360,
    speed: 0.4,
    startAngle: 1.2,
  },
  {
    quote: "Saves me 10hr/week.",
    text: "Log in, hit 'Send Sequence', look at pipeline. Insane.",
    name: "Elena Rostova",
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop',
    radius: 280,
    speed: -0.5,
    startAngle: 2.5,
  },
  {
    quote: "Insane ROI.",
    text: "Invoicing helped me land a $12k retainer. Paid for itself.",
    name: "David O'Reilly",
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop',
    radius: 400,
    speed: 0.45,
    startAngle: 3.8,
  },
  {
    quote: "One gorgeous dashboard.",
    text: "No more Notion + DocuSign. Raycast vibes for sure.",
    name: "Amira Khan",
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=150&auto=format&fit=crop',
    radius: 320,
    speed: -0.65,
    startAngle: 5.0,
  },
  {
    quote: "Native Mac app feel.",
    text: "Fast, no lag, and the pipeline view is beautiful.",
    name: "Tom Mitchell",
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=150&auto=format&fit=crop',
    radius: 440,
    speed: 0.35,
    startAngle: 6.0,
  },
  {
    quote: "Actually saved a deal.",
    text: "The auto-follow-up triggered before I even remembered.",
    name: "Chloe Dubois",
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop',
    radius: 200,
    speed: -0.8,
    startAngle: 0.8,
  },
  {
    quote: "Game-changing analytics.",
    text: "Open tracking makes cold outreach much less blinding.",
    name: "James W.",
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop',
    radius: 380,
    speed: 0.55,
    startAngle: 4.2,
  },
]

// Reusable static UI for the cards
function CardTemplate({ t }: { t: typeof TESTIMONIALS[0] }) {
  return (
    <>
      <div style={{ fontSize: '13px', fontWeight: 700, color: '#FAFAFA', letterSpacing: '-0.01em' }}>
        "{t.quote}"
      </div>
      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>
        {t.text}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', pointerEvents: 'none' }}>
        <img src={t.avatar} alt={t.name} style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }} />
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{t.name}</span>
      </div>
    </>
  )
}

function OrbitCard({ t, index }: { t: typeof TESTIMONIALS[0]; index: number }) {
  const initialX = Math.cos(t.startAngle) * t.radius
  const initialY = Math.sin(t.startAngle) * t.radius

  const x = useMotionValue(initialX - 110)
  const y = useMotionValue(initialY - 70)
  
  const isHovered = useMotionValue(false)
  const isDragging = useMotionValue(false)

  // Mathematically deduce radius and angle from current coordinates frame-by-frame
  useAnimationFrame((time, delta) => {
    if (isHovered.get() || isDragging.get()) return;

    const cx = x.get() + 110;
    const cy = y.get() + 70;

    const currentAngle = Math.atan2(cy, cx);
    const currentRadius = Math.sqrt(cx * cx + cy * cy);

    // Dynamic speed based on distance for realism
    const nextAngle = currentAngle + (delta * 0.0005 * t.speed);

    x.set(Math.cos(nextAngle) * currentRadius - 110);
    y.set(Math.sin(nextAngle) * currentRadius - 70);
  })

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.2, filter: 'blur(10px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 0.2, filter: 'blur(10px)' }}
      transition={{ duration: 0.6, type: 'spring', bounce: 0.3, delay: index * 0.05 }}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        x,
        y,
        zIndex: 10,
      }}
    >
      <motion.div
        drag
        dragConstraints={undefined}
        dragMomentum={false}
        onHoverStart={() => isHovered.set(true)}
        onHoverEnd={() => isHovered.set(false)}
        onDragStart={() => isDragging.set(true)}
        onDragEnd={() => isDragging.set(false)}
        whileDrag={{ scale: 1.05, cursor: 'grabbing' }}
        style={{
          width: '240px',
          background: 'linear-gradient(135deg, rgba(25,25,30,0.9) 0%, rgba(10,10,12,0.9) 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '16px',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          cursor: 'grab',
          textAlign: 'left'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.borderColor = 'rgba(196,20,37,0.4)'
          e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
        }}
      >
        <CardTemplate t={t} />
      </motion.div>
    </motion.div>
  )
}

export default function Testimonials() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Interactive Expansion Engine
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  // Auto-cycle the central card while collapsed
  useEffect(() => {
    if (isExpanded) return;
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % TESTIMONIALS.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [isExpanded])

  return (
    <section id="testimonials" style={{ padding: '80px 0', background: '#040408', position: 'relative', overflow: 'hidden' }}>
      
      <div 
        ref={containerRef}
        style={{ 
          maxWidth: '1000px', 
          margin: '0 auto', 
          position: 'relative', 
          minHeight: '600px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
      >
        
        {/* Massive Ambient Background Glow */}
        <div 
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(196,20,37,0.15) 0%, transparent 70%)',
            filter: 'blur(60px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        {/* Central Hub */}
        <div style={{
          position: 'relative',
          zIndex: 5,
          textAlign: 'center',
          maxWidth: '360px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          
          {/* Dynamic Top Element: Cycles Card -> Or Explodes into Logo */}
          <div style={{ height: '180px', width: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px', position: 'relative' }}>
            <AnimatePresence mode="wait">
              {!isExpanded ? (
                // State 1: Collapsed Single Card
                <motion.div
                  key={`single-${activeIndex}`}
                  initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
                  transition={{ duration: 0.5 }}
                  style={{
                    position: 'absolute',
                    width: '100%',
                    background: 'linear-gradient(135deg, rgba(25,25,30,0.9) 0%, rgba(10,10,12,0.9) 100%)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
                    borderRadius: '12px',
                    padding: '16px',
                    backdropFilter: 'blur(12px)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    textAlign: 'left'
                  }}
                >
                  <CardTemplate t={TESTIMONIALS[activeIndex]} />
                </motion.div>
              ) : (
                // State 2: Expanded Red Core Hub
                <motion.div
                  key="logo-core"
                  initial={{ opacity: 0, scale: 0.2, rotate: -90, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, scale: 1, rotate: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.2, filter: 'blur(10px)' }}
                  transition={{ type: 'spring', bounce: 0.5, duration: 0.8 }}
                  style={{ position: 'absolute' }}
                >
                  <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #C41425 0%, #7a0c16 100%)', boxShadow: '0 0 40px rgba(196,20,37,0.6), inset 0 2px 0 rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <h2 style={{
            fontSize: 'clamp(32px, 4vw, 42px)',
            fontWeight: 800,
            color: '#FAFAFA',
            letterSpacing: '-0.04em',
            lineHeight: 1.1,
            textShadow: '0 4px 12px rgba(0,0,0,0.5)',
            marginBottom: '12px'
          }}>
            Loved by<br />thousands.
          </h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, textShadow: '0 2px 4px rgba(0,0,0,0.8)', marginBottom: '16px' }}>
            Hear from our community of builders and freelancers who trust us to power their projects.
          </p>
          
          <AnimatePresence mode="wait">
            {!isExpanded ? (
               <motion.button 
                 key="btn-expand"
                 onClick={() => setIsExpanded(true)}
                 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                 style={{
                   background: 'rgba(255,255,255,0.05)',
                   border: '1px solid rgba(255,255,255,0.1)',
                   padding: '10px 20px',
                   borderRadius: '20px',
                   color: '#FAFAFA',
                   fontSize: '13px',
                   fontWeight: 600,
                   display: 'flex',
                   alignItems: 'center',
                   gap: '6px',
                   backdropFilter: 'blur(8px)',
                   cursor: 'pointer',
                   transition: 'background 0.2s',
                   margin: '0 auto',
                 }}
                 onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                 onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
               >
                 Read all reviews <ArrowRight size={14} />
               </motion.button>
            ) : (
               <motion.button 
                 key="btn-collapse"
                 onClick={() => setIsExpanded(false)}
                 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                 style={{
                   background: 'transparent',
                   border: '1px solid rgba(196,20,37,0.4)',
                   padding: '10px 20px',
                   borderRadius: '20px',
                   color: '#FAFAFA',
                   fontSize: '13px',
                   fontWeight: 600,
                   display: 'flex',
                   alignItems: 'center',
                   gap: '6px',
                   cursor: 'pointer',
                   transition: 'background 0.2s',
                   margin: '0 auto',
                 }}
                 onMouseOver={(e) => {
                   e.currentTarget.style.background = 'rgba(196,20,37,0.1)';
                   e.currentTarget.style.borderColor = 'rgba(196,20,37,0.8)';
                 }}
                 onMouseOut={(e) => {
                   e.currentTarget.style.background = 'transparent';
                   e.currentTarget.style.borderColor = 'rgba(196,20,37,0.4)';
                 }}
               >
                 Collapse ecosystem <X size={14} />
               </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Orbit Cards System powered by Framer Motion Physics */}
        <AnimatePresence>
          {isExpanded && TESTIMONIALS.map((t, idx) => (
            <OrbitCard key={`orbit-${idx}`} t={t} index={idx} />
          ))}
        </AnimatePresence>

      </div>

      <style>{`
        /* Responsive scaling */
        @media (max-width: 800px) {
          #testimonials > div {
            transform: scale(0.65);
          }
        }
        @media (max-width: 480px) {
          #testimonials > div {
            transform: scale(0.45);
          }
        }
      `}</style>
    </section>
  )
}
