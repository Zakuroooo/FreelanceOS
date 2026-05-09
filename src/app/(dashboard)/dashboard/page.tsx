'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import AnimatedCounter from '@/components/ui/AnimatedCounter'
import { Users, FileText, Handshake, DollarSign } from 'lucide-react'

interface StatsData {
  totalClients: number
  pitchesSent: number
  activeDeals: number
  totalEarned: number
}

const STAT_CARDS = [
  { key: 'totalClients', label: 'Total Clients', icon: Users },
  { key: 'pitchesSent',  label: 'Pitches Sent',  icon: FileText },
  { key: 'activeDeals',  label: 'Active Deals',  icon: Handshake },
  { key: 'totalEarned',  label: 'Total Earned',  icon: DollarSign, isCurrency: true },
]

export default function DashboardOverviewPage() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/stats')
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Overview</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>Here's what's happening in your business.</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '24px',
        marginBottom: '40px'
      }}>
        {STAT_CARDS.map((card, index) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
              style={{
                background: 'rgba(6, 6, 8, 0.4)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '8px',
                padding: '24px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
                  {card.label}
                </span>
                <div style={{ 
                  background: 'rgba(255,255,255,0.03)', 
                  padding: '8px', 
                  borderRadius: '6px',
                  color: 'var(--color-accent)'
                }}>
                  <Icon size={18} />
                </div>
              </div>

              {loading ? (
                <div className="shimmer-skeleton" style={{ height: '32px', width: '60%', borderRadius: '4px' }} />
              ) : (
                <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  <AnimatedCounter 
                    target={stats?.[card.key as keyof StatsData] || 0} 
                    prefix={card.isCurrency ? '$' : ''}
                    decimals={card.isCurrency ? 2 : 0}
                  />
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      <style>{`
        .shimmer-skeleton {
          background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%);
          background-size: 400% 100%;
          animation: shimmer 1.5s infinite linear;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}
