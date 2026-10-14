'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShieldCheck, Lock, Database, Eye, Trash2, Server } from 'lucide-react'
import Logo from '@/components/ui/Logo'

const SECTIONS = [
  {
    Icon: Database,
    title: 'What we store',
    body: 'Your account details (name, email), the business leads you save, pitches you generate, deals you track, and notification events. Everything you see in your dashboard belongs to your account alone.',
  },
  {
    Icon: Lock,
    title: 'Gmail access',
    body: 'When you connect Gmail, we request exactly two permissions: your email address, and permission to send mail on your behalf (gmail.send). OAuth tokens are encrypted at rest and used exclusively to deliver the emails you explicitly send through FreelanceOS. We never read, scan, or store anything from your inbox.',
  },
  {
    Icon: Eye,
    title: 'What we never do',
    body: 'We do not sell your data. We do not read your email. We do not share your leads or pitches with anyone. We do not use your content to train models.',
  },
  {
    Icon: Server,
    title: 'Third parties',
    body: 'AI pitch generation uses Groq language models; only the business details needed to write a specific pitch are sent. Email delivery goes either directly through Google on your behalf or through your own SMTP provider.',
  },
  {
    Icon: Trash2,
    title: 'Deletion',
    body: 'Deleting a lead, pitch or deal removes it permanently. Disconnecting Gmail revokes and deletes the stored tokens immediately. Requesting full account deletion clears every record tied to you.',
  },
]

export default function PrivacyPage() {
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
            <ShieldCheck size={20} color="#E5484D" />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#E5484D' }}>
              Privacy Policy
            </span>
          </div>
          <h1 style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 10 }}>
            Your data belongs to you.
          </h1>
          <p style={{ color: '#8A8A9A', fontSize: 15, marginBottom: 8 }}>
            FreelanceOS is a client-acquisition workspace for freelancers. This policy explains
            exactly what we store, why, and what we never touch.
          </p>
          <p style={{ color: '#4A4A5A', fontSize: 12, marginBottom: 44 }}>Last updated: August 2026</p>
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

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          style={{ marginTop: 40, fontSize: 13, color: '#8A8A9A' }}
        >
          Questions about your data? Contact us and we will answer within 48 hours.
        </motion.p>
      </div>
    </div>
  )
}
