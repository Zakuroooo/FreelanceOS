'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'

/* ── Logo SVGs at proper sizes ── */
const LOGOS: { name: string; icon: React.ReactNode }[] = [
  {
    name: 'Stripe',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 26, height: 26 }}><path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-7.076-2.19l-.897 5.555C5.185 22.83 8.283 24 11.726 24c2.582 0 4.717-.636 6.226-1.856 1.614-1.305 2.384-3.26 2.384-5.604 0-4.06-2.534-5.768-6.36-7.39z"/></svg>,
  },
  {
    name: 'GitHub',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 24, height: 24 }}><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>,
  },
  {
    name: 'Upwork',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 26, height: 26 }}><path d="M18.561 13.158c-1.102 0-2.135-.467-3.074-1.227l.228-1.076.008-.042c.207-1.143.849-3.06 2.839-3.06 1.492 0 2.703 1.212 2.703 2.703s-1.212 2.703-2.703 2.703zm0-7.463c-2.457 0-4.273 1.588-5.016 4.171-.92-1.373-1.623-3.025-2.029-4.406H8.464v6.932c0 1.374-1.117 2.492-2.492 2.492s-2.492-1.117-2.492-2.492V5.46H.428v6.932c0 2.777 2.261 5.038 5.038 5.038s5.038-2.261 5.038-5.038V10.9a14.847 14.847 0 001.463 2.496l-1.242 5.854h3.111l.897-4.174c1.058.717 2.277 1.152 3.612 1.152 3.052 0 5.529-2.477 5.529-5.529s-2.477-5.529-5.529-5.529z"/></svg>,
  },
  {
    name: 'LinkedIn',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 22, height: 22 }}><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
  },
  {
    name: 'Slack',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 22, height: 22 }}><path d="M5.042 15.165a2.528 2.528 0 01-2.52 2.523A2.528 2.528 0 010 15.165a2.527 2.527 0 012.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 012.521-2.52 2.527 2.527 0 012.521 2.52v6.313A2.528 2.528 0 018.834 24a2.528 2.528 0 01-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 01-2.521-2.52A2.528 2.528 0 018.834 0a2.528 2.528 0 012.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 012.521 2.521 2.528 2.528 0 01-2.521 2.521H2.522A2.528 2.528 0 010 8.834a2.528 2.528 0 012.522-2.521h6.312zm10.122 2.521a2.528 2.528 0 012.522-2.521A2.528 2.528 0 0124 8.834a2.528 2.528 0 01-2.522 2.521h-2.522V8.834zm-1.268 0a2.528 2.528 0 01-2.523 2.521 2.527 2.527 0 01-2.52-2.521V2.522A2.527 2.527 0 0115.165 0a2.528 2.528 0 012.523 2.522v6.312zm-2.523 10.122a2.528 2.528 0 012.523 2.522A2.528 2.528 0 0115.165 24a2.527 2.527 0 01-2.52-2.522v-2.522h2.52zm0-1.268a2.527 2.527 0 01-2.52-2.523 2.526 2.526 0 012.52-2.52h6.313A2.527 2.527 0 0124 15.165a2.528 2.528 0 01-2.522 2.523h-6.313z"/></svg>,
  },
  {
    name: 'Vercel',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 22, height: 22 }}><path d="M24 22.525H0l12-21.05 12 21.05z"/></svg>,
  },
]

function BlurFlipLogo({ name, icon, delay }: { name: string; icon: React.ReactNode; delay: number }) {
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      const interval = setInterval(() => setFlipped(f => !f), 5000)
      return () => clearInterval(interval)
    }, delay * 700)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px',
      perspective: '600px',
    }}>
      <motion.div
        animate={{
          rotateX: flipped ? 360 : 0,
          filter: flipped ? 'blur(3px)' : 'blur(0px)',
        }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(255,255,255,0.45)',
          transformStyle: 'preserve-3d',
        }}
      >
        {icon}
      </motion.div>
      <span style={{
        fontSize: '11px',
        fontWeight: 500,
        color: 'rgba(255,255,255,0.2)',
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap',
      }}>
        {name}
      </span>
    </div>
  )
}

export default function LogoCloud() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <section
      id="logo-cloud"
      ref={ref}
      style={{
        background: '#050507',
        padding: '48px 24px 56px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        style={{
          textAlign: 'center',
          fontSize: '12px',
          fontWeight: 500,
          color: 'rgba(255,255,255,0.15)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase' as const,
          marginBottom: '36px',
        }}
      >
        Works with your entire stack
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.15 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '56px',
          flexWrap: 'nowrap',
          maxWidth: '740px',
          margin: '0 auto',
          maskImage: 'linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)',
          overflowX: 'auto',
        }}
      >
        {LOGOS.map((logo, idx) => (
          <BlurFlipLogo key={logo.name} name={logo.name} icon={logo.icon} delay={idx} />
        ))}
      </motion.div>
    </section>
  )
}
