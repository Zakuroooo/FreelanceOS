'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, type Variants, type Easing } from 'framer-motion'
import {
  Users, Send, Handshake, DollarSign,
  ArrowRight, TrendingUp, Search, Zap, Bell,
} from 'lucide-react'
import AnimatedCounter from '@/components/ui/AnimatedCounter'

/* ─── types ──────────────────────────────────────────── */
interface StatsData {
  totalClients: number
  pitchesSent:  number
  activeDeals:  number
  totalEarned:  number
}

/* ─── animation ──────────────────────────────────────── */
const SPRING: Easing = [0.16, 1, 0.3, 1] as unknown as Easing

const fadeDown: Variants = {
  hidden:  { opacity: 0, y: -12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

function fadeUp(delay = 0) {
  return {
    initial:    { opacity: 0, y: 16, scale: 0.98 } as const,
    animate:    { opacity: 1, y: 0,  scale: 1    } as const,
    transition: { duration: 0.45, delay, ease: SPRING },
  }
}

/* ─── ACCENT — single color, no rainbows ─────────────── */
const ACCENT        = '#E5484D'
const ACCENT_BG     = 'rgba(229,72,77,0.10)'
const ACCENT_BORDER = 'rgba(229,72,77,0.22)'

/* ─── stat cards ─────────────────────────────────────── */
const STAT_CARDS = [
  { key: 'totalClients' as keyof StatsData, label: 'CLIENTS FOUND',  icon: Users,     isCurrency: false, trend: '+12% vs last month' },
  { key: 'pitchesSent'  as keyof StatsData, label: 'PITCHES SENT',   icon: Send,      isCurrency: false, trend: '+8% vs last month'  },
  { key: 'activeDeals'  as keyof StatsData, label: 'ACTIVE DEALS',   icon: Handshake, isCurrency: false, trend: '+3 new this week'    },
  { key: 'totalEarned'  as keyof StatsData, label: 'TOTAL EARNED',   icon: DollarSign,isCurrency: true,  trend: '+24% vs last month'  },
]

/* ─── quick actions ─────────────────────────────────── */
const QUICK_ACTIONS = [
  { icon: Search,    title: 'Find Clients',   sub: 'Search businesses by location + type',   href: '/discover' },
  { icon: Zap,       title: 'Generate Pitch', sub: 'AI pitch for any client in 10 seconds',  href: '/pitches'  },
  { icon: Handshake, title: 'View Deals',     sub: 'Track active deals and escrow',           href: '/deals'    },
]

/* ─── skeleton ───────────────────────────────────────── */
function Skeleton({ width = '60%', height = 32 }: { width?: string | number; height?: number }) {
  return (
    <div style={{
      width, height, borderRadius: 4,
      background: 'linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.09) 50%,rgba(255,255,255,0.04) 75%)',
      backgroundSize: '400% 100%',
      animation: 'shimmer 1.5s infinite linear',
    }} />
  )
}

/* ─── typing name ────────────────────────────────────── */
function useTypingEffect(text: string, ms = 75) {
  const [out, setOut] = useState('')
  useEffect(() => {
    if (!text) return
    let i = 0
    const id = setInterval(() => { i++; setOut(text.slice(0, i)); if (i >= text.length) clearInterval(id) }, ms)
    return () => clearInterval(id)
  }, [text, ms])
  return out
}

/* ─── page ───────────────────────────────────────────── */
export default function DashboardOverviewPage() {
  const router                = useRouter()
  const [stats, setStats]     = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [rawName, setRawName] = useState('')
  const [cursor, setCursor]   = useState(true)
  const typedName             = useTypingEffect(rawName, 75)
  const bellRef               = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/stats')
        if (res.ok) setStats(await res.json())
      } catch { /* silent */ } finally { setLoading(false) }
    }
    load()
    fetch('/api/auth/session').then(r => r.json())
      .then(s => { if (s?.user?.name) setRawName(s.user.name.split(' ')[0]) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!rawName) return
    const t = setTimeout(() => setCursor(false), rawName.length * 75 + 1200)
    return () => clearTimeout(t)
  }, [rawName])

  useEffect(() => {
    if (!bellRef.current) return
    bellRef.current.classList.add('dash-bell-shake')
    const t = setTimeout(() => bellRef.current?.classList.remove('dash-bell-shake'), 700)
    return () => clearTimeout(t)
  }, [])

  const h        = new Date().getHours()
  const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <>
      <style>{`
        @keyframes shimmer    { 0%{background-position:200% 0}100%{background-position:-200% 0} }
        @keyframes dash-blink { 0%,100%{opacity:1}50%{opacity:0} }
        @keyframes dash-bell  {
          0%,100%{transform:rotate(0)}20%{transform:rotate(12deg)}
          40%{transform:rotate(-10deg)}60%{transform:rotate(8deg)}80%{transform:rotate(-6deg)}
        }
        .dash-bell-shake { animation: dash-bell 0.7s ease; }
        .dash-stat-card  { transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s; }
        .dash-stat-card:hover {
          border-color: rgba(255,255,255,0.12) !important;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 0 0 1px rgba(255,255,255,0.06) !important;
          transform: translateY(-2px);
        }
        .dash-action-card { transition: border-color 0.15s, transform 0.15s, background 0.15s, box-shadow 0.15s; cursor: pointer; }
        .dash-action-card:hover {
          border-color: ${ACCENT_BORDER} !important;
          background: rgba(229,72,77,0.04) !important;
          transform: translateX(3px);
          box-shadow: inset 2px 0 0 ${ACCENT} !important;
        }
        @media(max-width:900px){ .dash-grid-4{grid-template-columns:repeat(2,1fr)!important} .dash-two-col{grid-template-columns:1fr!important} }
        @media(max-width:600px){ .dash-grid-4{grid-template-columns:1fr!important} }
      `}</style>

      {/* Dot-grid background */}
      <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none',
        backgroundImage:'radial-gradient(circle,rgba(255,255,255,0.025) 1px,transparent 1px)',
        backgroundSize:'28px 28px' }} />

      <div style={{ position:'relative', zIndex:1, maxWidth:1200, margin:'0 auto' }}>

        {/* ── Greeting bar ───────────────────────────────── */}
        <motion.div
          variants={fadeDown} initial="hidden" animate="visible"
          style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
            flexWrap:'wrap', gap:16, paddingBottom:28,
            borderBottom:'1px solid rgba(255,255,255,0.06)', marginBottom:32 }}
        >
          <div>
            <h1 style={{ fontSize:28, fontWeight:700, color:'var(--color-text-primary)',
              letterSpacing:'-0.03em', lineHeight:1.2, margin:0 }}>
              {greeting},{' '}
              {typedName || (rawName ? '' : 'there')}
              {cursor && rawName && (
                <span style={{ display:'inline-block', width:2, height:'1em', background:ACCENT,
                  marginLeft:2, verticalAlign:'text-bottom', animation:'dash-blink 0.9s step-end infinite' }} />
              )}
              .
            </h1>
            <p style={{ marginTop:6, fontSize:14, color:'var(--color-text-secondary)', letterSpacing:'-0.01em' }}>
              Here&apos;s your business at a glance.
            </p>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div ref={bellRef} style={{ width:36, height:36, borderRadius:6,
              border:'1px solid rgba(255,255,255,0.06)', background:'#0D0D12',
              display:'flex', alignItems:'center', justifyContent:'center',
              cursor:'pointer', color:'rgba(255,255,255,0.35)', flexShrink:0 }}>
              <Bell size={15} strokeWidth={1.8} />
            </div>
            <Link
              href="/discover"
              style={{ display:'inline-flex', alignItems:'center', gap:7,
                padding:'10px 20px', background:ACCENT, color:'#fff',
                fontSize:13, fontWeight:600, letterSpacing:'-0.01em',
                textDecoration:'none', borderRadius:6,
                boxShadow:'0 0 20px rgba(229,72,77,0.25)',
                transition:'opacity 0.15s,transform 0.15s', flexShrink:0 }}
              onMouseEnter={e => { e.currentTarget.style.opacity='0.85'; e.currentTarget.style.transform='translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.opacity='1';    e.currentTarget.style.transform='translateY(0)' }}
            >
              Find New Clients <ArrowRight size={13} />
            </Link>
          </div>
        </motion.div>

        {/* ── Stats grid ────────────────────────────────── */}
        <div className="dash-grid-4" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:32 }}>
          {STAT_CARDS.map((card, i) => {
            const Icon  = card.icon
            const value = stats?.[card.key] ?? 0
            return (
              <motion.div
                key={card.key}
                className="dash-stat-card"
                {...fadeUp(i * 0.08)}
                style={{ background:'linear-gradient(135deg,#0D0D12 0%,#0A0A0F 100%)',
                  border:'1px solid rgba(255,255,255,0.06)', borderRadius:8, padding:24,
                  position:'relative', overflow:'hidden',
                  boxShadow:'inset 0 1px 0 rgba(255,255,255,0.06)' }}
              >
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16 }}>
                  <span style={{ fontSize:11, fontWeight:600, letterSpacing:'0.12em',
                    textTransform:'uppercase', color:'var(--color-text-muted)' }}>
                    {card.label}
                  </span>
                  <div style={{ width:32, height:32, background:ACCENT_BG, borderRadius:6,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    color:ACCENT, flexShrink:0 }}>
                    <Icon size={15} strokeWidth={2} />
                  </div>
                </div>

                <div style={{ marginBottom:12 }}>
                  {loading ? <Skeleton height={40} width="55%" /> : (
                    <AnimatedCounter
                      target={value}
                      prefix={card.isCurrency ? '$' : ''}
                      decimals={card.isCurrency ? 2 : 0}
                      duration={1500}
                      style={{ fontFamily:"'JetBrains Mono',monospace",
                        fontSize:'clamp(28px,4vw,44px)', fontWeight:700,
                        color:'var(--color-text-primary)', letterSpacing:'-0.03em',
                        lineHeight:1, display:'block' }}
                    />
                  )}
                </div>

                {loading ? <Skeleton height={14} width="70%" /> : (
                  <div style={{ display:'flex', alignItems:'center', gap:5,
                    fontSize:11, color:'rgba(255,255,255,0.4)', fontWeight:500 }}>
                    <TrendingUp size={11} />{card.trend}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* ── Two-column ────────────────────────────────── */}
        <div className="dash-two-col" style={{ display:'grid', gridTemplateColumns:'60fr 40fr', gap:16, marginBottom:32 }}>

          {/* Recent Activity */}
          <motion.div
            {...fadeUp(0.32)}
            style={{ background:'linear-gradient(135deg,#0D0D12 0%,#0A0A0F 100%)',
              border:'1px solid rgba(255,255,255,0.06)', borderRadius:8, padding:24,
              boxShadow:'inset 0 1px 0 rgba(255,255,255,0.06)' }}
          >
            <p style={{ fontSize:11, fontWeight:600, letterSpacing:'0.12em',
              textTransform:'uppercase', color:'var(--color-text-muted)', marginBottom:20 }}>
              Recent Activity
            </p>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center',
              justifyContent:'center', padding:'48px 24px', textAlign:'center', gap:12 }}>
              <p style={{ fontSize:36, fontWeight:700, color:'rgba(255,255,255,0.05)',
                letterSpacing:'-0.04em', lineHeight:1 }}>◈</p>
              <p style={{ fontSize:14, fontWeight:500, color:'rgba(255,255,255,0.18)', letterSpacing:'-0.01em' }}>
                No activity yet
              </p>
              <p style={{ fontSize:13, color:'var(--color-text-muted)' }}>
                Find clients and send your first pitch to get started.
              </p>
              <Link
                href="/discover"
                style={{ display:'inline-flex', alignItems:'center', gap:6,
                  padding:'8px 16px', background:'rgba(255,255,255,0.04)',
                  border:'1px solid rgba(255,255,255,0.08)', borderRadius:6,
                  fontSize:12, fontWeight:500, color:'rgba(255,255,255,0.45)',
                  textDecoration:'none', marginTop:4, transition:'border-color 0.15s,color 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.16)'; e.currentTarget.style.color='rgba(255,255,255,0.8)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; e.currentTarget.style.color='rgba(255,255,255,0.45)' }}
              >
                Discover clients <ArrowRight size={11} />
              </Link>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            {...fadeUp(0.40)}
            style={{ background:'linear-gradient(135deg,#0D0D12 0%,#0A0A0F 100%)',
              border:'1px solid rgba(255,255,255,0.06)', borderRadius:8, padding:24,
              boxShadow:'inset 0 1px 0 rgba(255,255,255,0.06)' }}
          >
            <p style={{ fontSize:11, fontWeight:600, letterSpacing:'0.12em',
              textTransform:'uppercase', color:'var(--color-text-muted)', marginBottom:16 }}>
              Quick Actions
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {QUICK_ACTIONS.map((action, i) => {
                const Icon = action.icon
                return (
                  <motion.div
                    key={action.href}
                    {...fadeUp(0.46 + i * 0.05)}
                    className="dash-action-card"
                    onClick={() => router.push(action.href)}
                    style={{ display:'flex', alignItems:'center', gap:12, padding:14,
                      border:'1px solid rgba(255,255,255,0.06)', borderRadius:6,
                      background:'rgba(255,255,255,0.01)',
                      boxShadow:'inset 0 1px 0 rgba(255,255,255,0.04),0 1px 3px rgba(0,0,0,0.4)' }}
                  >
                    <div style={{ width:32, height:32, borderRadius:6, background:ACCENT_BG,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      flexShrink:0, color:ACCENT }}>
                      <Icon size={14} strokeWidth={2} />
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:13, fontWeight:600, color:'var(--color-text-primary)',
                        margin:0, letterSpacing:'-0.01em' }}>{action.title}</p>
                      <p style={{ fontSize:11, color:'var(--color-text-muted)', margin:0, marginTop:2 }}>
                        {action.sub}
                      </p>
                    </div>
                    <ArrowRight size={13} style={{ color:'rgba(255,255,255,0.18)', flexShrink:0 }} />
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>

        {/* ── Upgrade banner ────────────────────────────── */}
        <motion.div
          {...fadeUp(0.52)}
          style={{ position:'relative', overflow:'hidden',
            background:'linear-gradient(135deg,#0D0D12 0%,#0A0A0F 100%)',
            border:`1px solid ${ACCENT_BORDER}`, borderRadius:8,
            padding:'28px 32px', display:'flex', alignItems:'center',
            justifyContent:'space-between', flexWrap:'wrap', gap:16,
            boxShadow:'inset 0 1px 0 rgba(255,255,255,0.06)' }}
        >
          <div style={{ position:'absolute', top:'50%', left:'50%',
            transform:'translate(-50%,-50%)', width:400, height:200,
            background:'radial-gradient(ellipse,rgba(229,72,77,0.10) 0%,transparent 70%)',
            pointerEvents:'none' }} />
          <div style={{ position:'relative' }}>
            <p style={{ fontSize:16, fontWeight:700, color:'var(--color-text-primary)',
              letterSpacing:'-0.02em', margin:0 }}>
              Upgrade to Pro — unlock real scraping, AI pitches &amp; escrow.
            </p>
            <p style={{ fontSize:13, color:'var(--color-text-secondary)', margin:'6px 0 0', letterSpacing:'-0.01em' }}>
              Everything you need to run a 6-figure freelance business.
            </p>
          </div>
          <Link
            href="/#pricing"
            style={{ position:'relative', display:'inline-flex', alignItems:'center', gap:7,
              padding:'11px 22px', background:ACCENT, color:'#fff', fontSize:13, fontWeight:600,
              letterSpacing:'-0.01em', textDecoration:'none', borderRadius:6,
              boxShadow:'0 0 24px rgba(229,72,77,0.3)', flexShrink:0,
              transition:'opacity 0.15s,transform 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.opacity='0.85'; e.currentTarget.style.transform='translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.opacity='1';    e.currentTarget.style.transform='translateY(0)' }}
          >
            <Zap size={13} strokeWidth={2.5} /> Upgrade Now
          </Link>
        </motion.div>

      </div>
    </>
  )
}
