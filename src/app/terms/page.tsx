'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { FileText, Mail, Zap, ShieldAlert, UserCheck } from 'lucide-react'
import Logo from '@/components/ui/Logo'

const SECTIONS = [
  {
    Icon: UserCheck,
    title: 'Your account',
    body: 'You are responsible for the leads you contact and for complying with applicable anti-spam and telemarketing laws in your jurisdiction (such as TCPA, CAN-SPAM or GDPR). FreelanceOS is a tool; you are the sender of every message.',
  },
  {
    Icon: Zap,
    title: 'AI-generated content',
    body: 'Pitches are drafted by AI models based on the data you provide. Review before sending — you own what goes out under your name.',
  },
  {
    Icon: Mail,
    title: 'Sending limits',
    body: 'Sending runs through your own connected mailbox (Gmail or SMTP). Your provider&apos;s rate limits and acceptable-use policy apply. FreelanceOS adds no bulk-spam features by design.',
  },
  {
    Icon: ShieldAlert,
    title: 'Availability',
    body: 'The service is provided as-is. We aim for high availability but do not guarantee uninterrupted operation of third-party dependencies (search providers, AI models, mail servers).',
  },
  {
    Icon: FileText,
    title: 'Fair use',
    body: 'One account per person. Do not resell access, scrape the application, or use it to harass or deceive. Violations end access immediately.',
  },
]

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#060608', color: '#FAFAFA' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 96px' }}>
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <Link href="/" style={{ display: 'inline-flex' }}><Logo /></Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          style={{ marginTop: 56 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <FileText size={20} color="#E5484D" />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#E5484D' }}>
              Terms of Service
            </span>
          </div>
          <h1 style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 10 }}>
            Simple terms, no traps.
          </h1>
          <p style={{ color: '#8A8A9A', fontSize: 15, marginBottom: 44 }}>
            By using FreelanceOS you agree to the following. Plain language on purpose.
          </p>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {SECTIONS.map(({ Icon, title, body }, i) => (
            <motion.section
              key={title}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14 + i * 0.06 }}
              style={{
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 14,
                padding: '22px 24px',
                background: 'linear-gradient(135deg, #0D0D12 0%, #0A0A0F 100%)',
                display: 'flex', gap: 16,
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: 'rgba(229,72,77,0.09)', border: '1px solid rgba(229,72,77,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={16} color="#E5484D" />
              </div>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>{title}</h2>
                <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#8A8A9A' }}>{body}</p>
              </div>
            </motion.section>
          ))}
        </div>
      </div>
    </div>
  )
}
