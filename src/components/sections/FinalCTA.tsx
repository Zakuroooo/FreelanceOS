'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { CardContainer, CardBody, CardItem } from '@/components/ui/3d-card'

// Avatar data with real photos
const AVATARS = [
  { src: '/avatars/av1.png', name: 'Aryan R.' },
  { src: '/avatars/av2.png', name: 'Kim P.' },
  { src: '/avatars/av3.png', name: 'Marcus S.' },
  { src: '/avatars/av4.png', name: 'Julia L.' },
  { src: '/avatars/av5.png', name: 'Tariq D.' },
]

// Left column cards
const LEFT_CARDS = [
  { img: '/cta/pitch.png', label: 'AI Pitch Generator', delay: 0.1, floatY: -8, floatDuration: 4.2 },
  { img: '/cta/pipeline.png', label: 'Client Pipeline', delay: 0.2, floatY: 8, floatDuration: 5.1 },
]

// Right column cards
const RIGHT_CARDS = [
  { img: '/cta/revenue.png', label: 'Revenue Tracker', delay: 0.15, floatY: -6, floatDuration: 4.8 },
  { img: '/cta/escrow.png', label: 'Escrow Payment', delay: 0.25, floatY: 8, floatDuration: 3.9 },
]

// Aceternity 3D card for each product screenshot
function TiltCard({
  img,
  label,
  delay,
}: {
  img: string
  label: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.92 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6, ease: [0.25, 0, 0, 1] }}
    >
      <CardContainer containerClassName="w-full" className="w-full">
        <CardBody
          style={{
            borderRadius: '12px',
            overflow: 'visible',
            border: '1px solid rgba(255,255,255,0.09)',
            background: '#0a0a0f',
            width: '100%',
            cursor: 'pointer',
            boxShadow: '0 16px 40px rgba(0,0,0,0.7)',
          }}
        >
          {/* Image pops OUT at translateZ=100 */}
          <CardItem translateZ={100} className="w-full" style={{ borderRadius: '12px 12px 0 0', overflow: 'hidden' }}>
            <Image
              src={img}
              alt={label}
              width={300}
              height={220}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </CardItem>

          {/* Label stays closer to the card plane */}
          <CardItem
            translateZ={20}
            style={{
              display: 'block',
              background: 'rgba(8,8,14,0.92)',
              backdropFilter: 'blur(12px)',
              padding: '8px 12px',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '0 0 12px 12px',
            }}
          >
            <span style={{
              fontSize: '10px',
              color: 'rgba(255,255,255,0.4)',
              fontWeight: 500,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>
              {label}
            </span>
          </CardItem>
        </CardBody>
      </CardContainer>
    </motion.div>
  )
}

// Hoverable avatar with zoom
function AvatarCircle({ src, name, index }: { src: string; name: string; index: number }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      title={name}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '34px',
        height: '34px',
        borderRadius: '50%',
        overflow: 'hidden',
        border: `2px solid ${hovered ? 'rgba(196,20,37,0.6)' : 'var(--color-bg)'}`,
        marginLeft: index === 0 ? 0 : '-10px',
        position: 'relative',
        cursor: 'pointer',
        transform: hovered ? 'scale(1.25)' : 'scale(1)',
        transition: 'transform 0.2s ease, border-color 0.2s ease',
        zIndex: hovered ? 99 : AVATARS.length - index,
        boxShadow: hovered ? '0 4px 16px rgba(0,0,0,0.6)' : 'none',
      } as React.CSSProperties}
    >
      <Image
        src={src}
        alt={name}
        width={34}
        height={34}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </div>
  )
}

export default function FinalCTA() {
  return (
    <section style={{
      padding: '100px 0 140px',
      background: 'var(--color-bg)',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Atmospheric glow */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '900px', height: '600px',
        background: 'radial-gradient(ellipse, rgba(196,20,37,0.11) 0%, rgba(196,20,37,0.02) 50%, transparent 70%)',
        filter: 'blur(90px)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 24px',
        position: 'relative',
        zIndex: 1,
      }}>

        {/* 3-column: [left cards] [center] [right cards] */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '220px 1fr 220px',
          gap: '36px',
          alignItems: 'center',
        }}>

          {/* LEFT: 2 stacked 3D tilt cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {LEFT_CARDS.map((c, i) => (
              <TiltCard key={i} img={c.img} label={c.label} delay={c.delay} />
            ))}
          </div>

          {/* CENTER: headline + CTAs */}
          <div style={{ textAlign: 'center' }}>

            {/* Avatar row with real photos + zoom hover */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05, duration: 0.5 }}
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '32px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {AVATARS.map((av, i) => (
                  <AvatarCircle key={i} src={av.src} name={av.name} index={i} />
                ))}
              </div>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>
                2,400+ freelancers on autopilot
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15, duration: 0.6 }}
              style={{
                fontSize: 'clamp(30px, 4vw, 54px)',
                fontWeight: 800,
                color: '#FAFAFA',
                letterSpacing: '-0.04em',
                lineHeight: 1.04,
                marginBottom: '18px',
              }}
            >
              Build the freelance business<br />
              <span style={{ color: 'rgba(255,255,255,0.33)' }}>your clients deserve.</span>
            </motion.h2>

            {/* Subline */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.25, duration: 0.5 }}
              style={{
                fontSize: '15px',
                color: 'rgba(255,255,255,0.42)',
                maxWidth: '380px',
                margin: '0 auto 44px',
                lineHeight: 1.65,
              }}
            >
              Drop in automations, tune your outreach, and close more clients. No wrestling with tools.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.35, duration: 0.5 }}
              style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}
            >
              <Link
                href="/signup"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '13px 32px', borderRadius: '9999px',
                  background: 'linear-gradient(135deg, #c41425 0%, #8b0e1b 100%)',
                  color: 'white', fontWeight: 700, fontSize: '14px',
                  textDecoration: 'none',
                  boxShadow: '0 0 0 1px rgba(196,20,37,0.4), 0 8px 28px rgba(196,20,37,0.3)',
                  transition: 'all 0.25s ease',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.boxShadow = '0 0 0 1px rgba(196,20,37,0.7), 0 10px 36px rgba(196,20,37,0.45)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseOut={e => {
                  e.currentTarget.style.boxShadow = '0 0 0 1px rgba(196,20,37,0.4), 0 8px 28px rgba(196,20,37,0.3)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                Get Started Free →
              </Link>
              <Link
                href="/demo"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '13px 32px', borderRadius: '9999px',
                  background: 'rgba(255,255,255,0.04)',
                  color: 'rgba(255,255,255,0.65)', fontWeight: 600, fontSize: '14px',
                  textDecoration: 'none',
                  border: '1px solid rgba(255,255,255,0.1)',
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                  e.currentTarget.style.color = '#FAFAFA'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                  e.currentTarget.style.color = 'rgba(255,255,255,0.65)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                See Live Demo
              </Link>
            </motion.div>
          </div>

          {/* RIGHT: 2 stacked 3D tilt cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {RIGHT_CARDS.map((c, i) => (
              <TiltCard key={i} img={c.img} label={c.label} delay={c.delay} />
            ))}
          </div>

        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          #cta-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
