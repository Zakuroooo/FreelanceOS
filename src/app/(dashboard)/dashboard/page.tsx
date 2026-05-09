'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, type Variants, type Easing } from 'framer-motion'
import {
  Users,
  Send,
  Handshake,
  DollarSign,
  ArrowRight,
  TrendingUp,
  Search,
  Zap,
} from 'lucide-react'
import AnimatedCounter from '@/components/ui/AnimatedCounter'

/* ─── types ──────────────────────────────────────────────── */
interface StatsData {
  totalClients: number
  pitchesSent:  number
  activeDeals:  number
  totalEarned:  number
}

/* ─── animation helpers ──────────────────────────────────── */
const fadeDown: Variants = {
  hidden:  { opacity: 0, y: -12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

const EASE_OUT: Easing = 'easeOut'

function fadeUpProps(delay = 0) {
  return {
    initial:    { opacity: 0, y: 20 } as const,
    animate:    { opacity: 1, y: 0 }  as const,
    transition: { duration: 0.5, delay, ease: EASE_OUT },
  }
}

/* ─── stat card config ───────────────────────────────────── */
const STAT_CARDS = [
  {
    key:        'totalClients' as keyof StatsData,
    label:      'CLIENTS FOUND',
    icon:       Users,
    isCurrency: false,
    trend:      '+12% vs last month',
    iconColor:  '#c30101',
    iconBg:     'rgba(196,20,37,0.10)',
  },
  {
    key:        'pitchesSent' as keyof StatsData,
    label:      'PITCHES SENT',
    icon:       Send,
    isCurrency: false,
    trend:      '+8% vs last month',
    iconColor:  '#c30101',
    iconBg:     'rgba(196,20,37,0.10)',
  },
  {
    key:        'activeDeals' as keyof StatsData,
    label:      'ACTIVE DEALS',
    icon:       Handshake,
    isCurrency: false,
    trend:      '+3 new this week',
    iconColor:  '#c30101',
    iconBg:     'rgba(196,20,37,0.10)',
  },
  {
    key:        'totalEarned' as keyof StatsData,
    label:      'TOTAL EARNED',
    icon:       DollarSign,
    isCurrency: true,
    trend:      '+24% vs last month',
    iconColor:  '#c30101',
    iconBg:     'rgba(196,20,37,0.10)',
  },
]

/* ─── quick actions ──────────────────────────────────────── */
const QUICK_ACTIONS = [
  {
    icon:  Search,
    title: 'Find Clients',
    sub:   'Search businesses by location + type',
    href:  '/discover',
  },
  {
    icon:  Zap,
    title: 'Generate Pitch',
    sub:   'AI pitch for any client in 10 seconds',
    href:  '/pitches',
  },
  {
    icon:  Handshake,
    title: 'View Deals',
    sub:   'Track active deals and escrow',
    href:  '/deals',
  },
]

/* ─── shimmer skeleton ───────────────────────────────────── */
function Skeleton({ width = '60%', height = 32 }: { width?: string | number; height?: number }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 4,
        background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 75%)',
        backgroundSize: '400% 100%',
        animation: 'shimmer 1.5s infinite linear',
      }}
    />
  )
}

/* ─── main page ──────────────────────────────────────────── */
export default function DashboardOverviewPage() {
  const router                    = useRouter()
  const [stats,    setStats]      = useState<StatsData | null>(null)
  const [loading,  setLoading]    = useState(true)
  const [userName, setUserName]   = useState('there')

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/stats')
        if (res.ok) { const data = await res.json(); setStats(data) }
      } catch (err) {
        console.error('Stats fetch failed:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()

    fetch('/api/auth/session')
      .then(r => r.json())
      .then(s => { if (s?.user?.name) setUserName(s.user.name.split(' ')[0]) })
      .catch(() => {})
  }, [])

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .stat-card {
          transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
        }
        .stat-card:hover {
          border-color: rgba(255,255,255,0.12) !important;
          box-shadow: 0 0 0 1px rgba(196,20,37,0.15);
          transform: translateY(-2px);
        }
        .action-card {
          transition: border-color 0.15s ease, transform 0.15s ease, background 0.15s ease;
          cursor: pointer;
        }
        .action-card:hover {
          border-color: rgba(196,20,37,0.35) !important;
          background: rgba(196,20,37,0.04) !important;
          transform: translateX(2px);
        }
        @media (max-width: 900px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .two-col    { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* ── Section 1: Hero greeting bar ─────────────── */}
        <motion.div
          variants={fadeDown}
          initial="hidden"
          animate="visible"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
            paddingBottom: 28,
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            marginBottom: 32,
          }}
        >
          <div>
            <h1 style={{
              fontSize: 28,
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.03em',
              lineHeight: 1.2,
              margin: 0,
            }}>
              {greeting}, {userName}.
            </h1>
            <p style={{
              marginTop: 6,
              fontSize: 14,
              color: 'var(--color-text-secondary)',
              letterSpacing: '-0.01em',
            }}>
              Here&apos;s your business at a glance.
            </p>
          </div>

          <Link
            href="/discover"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '10px 20px',
              background: '#C41425',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '-0.01em',
              textDecoration: 'none',
              borderRadius: 6,
              boxShadow: '0 0 20px rgba(196,20,37,0.25)',
              transition: 'opacity 0.15s ease, transform 0.15s ease',
              flexShrink: 0,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.opacity = '0.85'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.opacity = '1'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            Find New Clients <ArrowRight size={13} />
          </Link>
        </motion.div>

        {/* ── Section 2: Stats row (4 cards) ───────────── */}
        <div
          className="stats-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12,
            marginBottom: 32,
          }}
        >
          {STAT_CARDS.map((card, i) => {
            const Icon  = card.icon
            const value = stats?.[card.key] ?? 0
            return (
              <motion.div
                key={card.key}
                className="stat-card"
                {...fadeUpProps(i * 0.08)}
                style={{
                  background: '#0D0D12',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 8,
                  padding: 24,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Top: label + icon */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: 16,
                }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'var(--color-text-muted)',
                  }}>
                    {card.label}
                  </span>
                  <div style={{
                    width: 32,
                    height: 32,
                    background: card.iconBg,
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: card.iconColor,
                    flexShrink: 0,
                  }}>
                    <Icon size={15} strokeWidth={2} />
                  </div>
                </div>

                {/* Middle: animated big number */}
                <div style={{ marginBottom: 12 }}>
                  {loading ? (
                    <Skeleton height={40} width="55%" />
                  ) : (
                    <AnimatedCounter
                      target={value}
                      prefix={card.isCurrency ? '$' : ''}
                      decimals={card.isCurrency ? 2 : 0}
                      duration={1800}
                      style={{
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        fontSize: 'clamp(28px, 4vw, 44px)',
                        fontWeight: 700,
                        color: '#FAFAFA',
                        letterSpacing: '-0.03em',
                        lineHeight: 1,
                        display: 'block',
                      }}
                    />
                  )}
                </div>

                {/* Bottom: trend */}
                {loading ? (
                  <Skeleton height={14} width="70%" />
                ) : (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 11,
                    color: 'var(--color-success)',
                    fontWeight: 500,
                  }}>
                    <TrendingUp size={11} />
                    {card.trend}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* ── Section 3: Two-column layout ──────────────── */}
        <div
          className="two-col"
          style={{
            display: 'grid',
            gridTemplateColumns: '60fr 40fr',
            gap: 16,
            marginBottom: 32,
          }}
        >
          {/* Left: Recent Activity */}
          <motion.div
            {...fadeUpProps(0.32)}
            style={{
              background: '#0D0D12',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 8,
              padding: 24,
            }}
          >
            <p style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
              marginBottom: 20,
            }}>
              Recent Activity
            </p>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '48px 24px',
              textAlign: 'center',
              gap: 12,
            }}>
              <p style={{
                fontSize: 32,
                fontWeight: 700,
                color: 'rgba(255,255,255,0.06)',
                letterSpacing: '-0.04em',
                lineHeight: 1,
              }}>
                No activity yet.
              </p>
              <p style={{
                fontSize: 13,
                color: 'var(--color-text-muted)',
                letterSpacing: '-0.01em',
              }}>
                Start by finding clients →
              </p>
              <Link
                href="/discover"
                style={{
                  marginTop: 8,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '9px 18px',
                  background: 'transparent',
                  color: '#C41425',
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: 'none',
                  borderRadius: 4,
                  border: '1px solid rgba(196,20,37,0.3)',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(196,20,37,0.6)'
                  e.currentTarget.style.background = 'rgba(196,20,37,0.06)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(196,20,37,0.3)'
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                Find Clients
              </Link>
            </div>
          </motion.div>

          {/* Right: Quick Actions */}
          <motion.div
            {...fadeUpProps(0.40)}
            style={{
              background: '#0D0D12',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 8,
              padding: 24,
            }}
          >
            <p style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
              marginBottom: 16,
            }}>
              Quick Actions
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {QUICK_ACTIONS.map((action, i) => {
                const Icon = action.icon
                return (
                  <motion.div
                    key={action.href}
                    className="action-card"
                    {...fadeUpProps(0.40 + i * 0.05)}
                    onClick={() => router.push(action.href)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      padding: 16,
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 8,
                      background: 'transparent',
                    }}
                  >
                    <div style={{
                      width: 36,
                      height: 36,
                      background: 'rgba(196,20,37,0.08)',
                      borderRadius: 6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#C41425',
                      flexShrink: 0,
                    }}>
                      <Icon size={16} strokeWidth={2} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--color-text-primary)',
                        letterSpacing: '-0.01em',
                        margin: 0,
                      }}>
                        {action.title}
                      </p>
                      <p style={{
                        fontSize: 12,
                        color: 'var(--color-text-muted)',
                        marginTop: 2,
                        letterSpacing: '-0.01em',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {action.sub}
                      </p>
                    </div>
                    <ArrowRight size={14} style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>

        {/* ── Section 4: Upgrade bottom banner ──────────── */}
        <motion.div
          {...fadeUpProps(0.56)}
          style={{
            position: 'relative',
            overflow: 'hidden',
            background: '#0D0D12',
            border: '1px solid rgba(196,20,37,0.2)',
            borderRadius: 8,
            padding: '20px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          {/* Crimson glow behind */}
          <div aria-hidden style={{
            position: 'absolute',
            right: '10%',
            top: '50%',
            transform: 'translateY(-50%)',
            width: 300,
            height: 200,
            background: 'radial-gradient(ellipse, rgba(196,20,37,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
            filter: 'blur(24px)',
          }} />

          {/* Left: brand label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32,
              height: 32,
              background: 'rgba(196,20,37,0.12)',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#C41425',
            }}>
              <Zap size={15} strokeWidth={2.2} />
            </div>
            <span style={{
              fontSize: 14,
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.02em',
            }}>
              FreelanceOS Pro
            </span>
          </div>

          {/* Center: feature copy */}
          <p style={{
            fontSize: 13,
            color: 'var(--color-text-secondary)',
            letterSpacing: '-0.01em',
            flex: 1,
            textAlign: 'center',
          }}>
            Unlock unlimited pitches, all channels, priority support
          </p>

          {/* Right: CTA */}
          <Link
            href="/#pricing"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '10px 22px',
              background: '#C41425',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '-0.01em',
              textDecoration: 'none',
              borderRadius: 4,
              boxShadow: '0 0 20px rgba(196,20,37,0.25)',
              transition: 'opacity 0.15s, transform 0.15s',
              flexShrink: 0,
              position: 'relative',
              zIndex: 1,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.opacity = '0.85'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.opacity = '1'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            Upgrade Now
          </Link>
        </motion.div>

      </div>
    </>
  )
}
