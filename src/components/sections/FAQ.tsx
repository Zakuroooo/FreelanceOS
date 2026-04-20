'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, X } from 'lucide-react'

const FAQS = [
  {
    q: 'How does FreelanceOS find clients automatically?',
    a: 'FreelanceOS connects to Upwork, LinkedIn, and other platforms via our n8n automation layer. It monitors job postings in real-time, scores them against your skills profile, and fires personalized AI-generated pitches — all without you lifting a finger.',
  },
  {
    q: 'Is the AI pitch quality good enough to actually win jobs?',
    a: 'Yes. Our pitch engine is trained on tens of thousands of winning proposals. It adapts tone, length, and positioning based on job type. Most users report a 3–5× increase in response rates within the first week.',
  },
  {
    q: 'How does the Stripe escrow protection work?',
    a: 'Every Pro project activates a Stripe-managed contract flow. Funds are held in escrow at the start of the project and released only on milestone completion — confirmed by both parties. No more ghosting or unpaid invoices.',
  },
  {
    q: 'Can I white-label the client portal for my agency?',
    a: 'Absolutely — this is an Agency tier feature. Your clients see your brand, your domain, and your portal. FreelanceOS runs invisibly in the background as your operations engine.',
  },
  {
    q: 'What platforms do the outreach automations support?',
    a: 'Email, LinkedIn DMs, Instagram DMs, Upwork, and Fiverr are all supported out of the box on the Pro plan. Custom webhook integrations are available on Agency for any additional platform.',
  },
  {
    q: 'Is there a free trial for the Pro plan?',
    a: 'Yes. You get a full 14-day Pro trial on signup, no credit card required. If you decide to upgrade, your existing pipeline and pitch history carry over seamlessly.',
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const toggle = (i: number) => setOpenIndex(prev => (prev === i ? null : i))

  return (
    <section id="faq" style={{
      padding: '120px 0',
      background: 'var(--color-bg)', // matches the site
      position: 'relative',
    }}>
      {/* Very subtle glow behind */}
      <div style={{
        position: 'absolute', top: '30%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px', height: '400px',
        background: 'radial-gradient(ellipse, rgba(196,20,37,0.04) 0%, transparent 70%)',
        filter: 'blur(80px)', pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: 800, color: '#FAFAFA',
            letterSpacing: '-0.04em', marginBottom: '16px',
          }}>
            Frequently asked questions.
          </h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65 }}>
            Can&apos;t find the answer you&apos;re looking for?{' '}
            <a href="/contact" style={{ color: '#c41425', textDecoration: 'none' }}>Talk to our team.</a>
          </p>
        </div>

        {/* Glass Panel wrapping the accordion */}
        <div style={{
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '12px',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          overflow: 'hidden',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
        }}>
          {FAQS.map((item, i) => {
            const isOpen = openIndex === i
            const isLast = i === FAQS.length - 1
            return (
              <div
                key={i}
                style={{
                  borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <button
                  onClick={() => toggle(i)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '24px',
                    padding: '22px 28px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.2s ease',
                  }}
                  onMouseOver={e => !isOpen && (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  onMouseOut={e => (e.currentTarget.style.background = 'none')}
                >
                  <span style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: isOpen ? '#FAFAFA' : 'rgba(255,255,255,0.75)',
                    lineHeight: 1.4,
                    transition: 'color 0.2s ease',
                  }}>
                    {item.q}
                  </span>
                  <div style={{
                    flexShrink: 0,
                    width: '22px', height: '22px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: isOpen ? '#c41425' : 'rgba(255,255,255,0.4)',
                    transition: 'color 0.2s ease',
                  }}>
                    {isOpen ? <X size={13} strokeWidth={2.5} /> : <Plus size={13} strokeWidth={2.5} />}
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.25, 0, 0, 1] }}
                      style={{ overflow: 'hidden' }}
                    >
                      <p style={{
                        fontSize: '13px',
                        color: 'rgba(255,255,255,0.5)',
                        lineHeight: 1.75,
                        padding: '0 28px 22px',
                        margin: 0,
                      }}>
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
