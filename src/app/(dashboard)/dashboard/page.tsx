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

/* ─── types ────────────────────────────────────────── */
interface StatsData {
  totalClients: number
  pitchesSent:  number
  activeDeals:  number
  totalEarned:  number
}

/* ─── animation constants ──────────────────────────── */
const EASE_OUT: Easing  = 'easeOut'
const SPRING: Easing    = [0.16, 1, 0.3, 1] as unknown as Easing

const fadeDown: Variants = {
  hidden:  { opacity: 0, y: -12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

function fadeUp(delay = 0) {
  return {
    initial:    { opacity: 0, y: 16, scale: 0.98 } as const,
    animate:    { opacity: 1, y: 0,  scale: 1 }    as const,
    transition: { duration: 0.45, delay, ease: SPRING },
  }
}

/* ─── stat cards config ─────────────────────────────── */
const STAT_CARDS = [
  {
    key:         'totalClients' as keyof StatsData,
    label:       'CLIENTS FOUND',
    icon:        Users,
    isCurrency:  false,
    trend:       '+12% vs last month',
    iconColor:   '#3B82F6',
    iconBg:      'rgba(59,130,246,0.10)',
    trendColor:  '#3B82F6',
    hoverBorder: 'rgba(59,130,246,0.25)',
    hoverGlow:   '0 0 0 1px rgba(59,130,246,0.15)',
  },
  {
    key:         'pitchesSent' as keyof StatsData,
    label:       'PITCHES SENT',
    icon:        Send,
    isCurrency:  false,
    trend:       '+8% vs last month',
    iconColor:   '#E5484D',
    iconBg:      'rgba(229,72,77,0.10)',
    trendColor:  '#E5484D',
    hoverBorder: 'rgba(229,72,77,0.25)',
    hoverGlow:   '0 0 0 1px rgba(229,72,77,0.15)',
  },
  {
    key:         'activeDeals' as keyof StatsData,
    label:       'ACTIVE DEALS',
    icon:        Handshake,
    isCurrency:  false,
    trend:       '+3 new this week',
    iconColor:   '#F59E0B',
    iconBg:      'rgba(245,158,11,0.10)',
    trendColor:  '#F59E0B',
    hoverBorder: 'rgba(245,158,11,0.25)',
    hoverGlow:   '0 0 0 1px rgba(245,158,11,0.15)',
  },
  {
    key:         'totalEarned' as keyof StatsData,
    label:       'TOTAL EARNED',
    icon:        DollarSign,
    isCurrency:  true,
    trend:       '+24% vs last month',
    iconColor:   '#10B981',
    iconBg:      'rgba(16,185,129,0.10)',
    trendColor:  '#10B981',
    hoverBorder: 'rgba(16,185,129,0.25)',
    hoverGlow:   '0 0 0 1px rgba(16,185,129,0.15)',
  },
]

/* ─── quick actions config ─────────────────────────── */
const QUICK_ACTIONS = [
  { icon: Search,   title: 'Find Clients',    sub: 'Search businesses by location + type', href: '/discover', color: '#3B82F6', hoverBorder: 'rgba(59,130,246,0.35)', hoverBg: 'rgba(59,130,246,0.04)' },
  { icon: Zap,      title: 'Generate Pitch',  sub: 'AI pitch for any client in 10 seconds', href: '/pitches', color: '#E5484D', hoverBorder: 'rgba(229,72,77,0.35)',   hoverBg: 'rgba(229,72,77,0.04)' },
  { icon: Handshake,title: 'View Deals',      sub: 'Track active deals and escrow',         href: '/deals',   color: '#10B981', hoverBorder: 'rgba(16,185,129,0.35)', hoverBg: 'rgba(16,185,129,0.04)' },
]

/* ─── skeleton ──────────────────────────────────────── */
function Skeleton({ width = '60%', height = 32 }: { width?: string | number; height?: number }) {
  return (
    <div style={{ width, height, borderRadius: 4, background: 'linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.09) 50%,rgba(255,255,255,0.04) 75%)', backgroundSize: '400% 100%', animation: 'shimmer 1.5s infinite linear' }} />
  )
}

/* ─── typing name hook ─────────────────────────────── */
function useTypingEffect(fullText: string, msPerChar = 80) {
  const [displayed, setDisplayed] = useState('')
  useEffect(() => {
    if (!fullText) return
    let i = 0
    const id = setInterval(() => {
      i++
      setDisplayed(fullText.slice(0, i))
      if (i >= fullText.length) clearInterval(id)
    }, msPerChar)
    return () => clearInterval(id)
  }, [fullText, msPerChar])
  return displayed
}

/* ─── page ──────────────────────────────────────────── */
export default function DashboardOverviewPage() {
  const router                  = useRouter()
  const [stats,   setStats]     = useState<StatsData | null>(null)
  const [loading, setLoading]   = useState(true)
  const [rawName, setRawName]   = useState('')
  const [cursor,  setCursor]    = useState(true)
  const typedName               = useTypingEffect(rawName, 80)
  const bellRef                 = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/stats')
        if (res.ok) { const data = await res.json(); setStats(data) }
      } catch { /* silent */ } finally { setLoading(false) }
    }
    fetchStats()

    fetch('/api/auth/session')
      .then(r => r.json())
      .then(s => { if (s?.user?.name) setRawName(s.user.name.split(' ')[0]) })
      .catch(() => {})

    // hide cursor after typing + 1.2s
    const t = setTimeout(() => setCursor(false), rawName.length * 80 + 1200)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawName])

  // bell shake on mount
  useEffect(() => {
    if (!bellRef.current) return
    bellRef.current.classList.add('bell-shake')
    const t = setTimeout(() => bellRef.current?.classList.remove('bell-shake'), 700)
    return () => clearTimeout(t)
  }, [])

  const hour     = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <>
      <style>{`
        @keyframes shimmer  { 0%{background-position:200% 0}100%{background-position:-200% 0} }
        @keyframes pulse-icon { 0%,100%{opacity:0.08}50%{opacity:0.14} }
        @keyframes bell-shake {
          0%,100%{transform:rotate(0)}
          20%{transform:rotate(12deg)}
          40%{transform:rotate(-10deg)}
          60%{transform:rotate(8deg)}
          80%{transform:rotate(-6deg)}
        }
        @keyframes blink { 0%,100%{opacity:1}50%{opacity:0} }
        .stat-card { transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease; }
        .action-card { transition: border-color 0.15s ease, transform 0.15s ease, background 0.15s ease, box-shadow 0.15s ease; cursor:pointer; }
        .bell-shake { animation: bell-shake 0.7s ease; }
        .cursor-blink { animation: blink 0.9s step-end infinite; }
        .pulse-icon { animation: pulse-icon 3s ease-in-out infinite; }
        @media(max-width:900px){ .stats-grid{grid-template-columns:repeat(2,1fr)!important} .two-col{grid-template-columns:1fr!important} }
        @media(max-width:600px){ .stats-grid{grid-template-columns:1fr!important} }
      `}</style>

      {/* Dot-grid background layer */}
      <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none', backgroundImage:'radial-gradient(circle,rgba(255,255,255,0.025) 1px,transparent 1px)', backgroundSize:'28px 28px' }} />

      <div style={{ position:'relative', zIndex:1, maxWidth:1200, margin:'0 auto' }}>

        {/* ── Section 1: Hero greeting ─────────────────── */}
        <motion.div
          variants={fadeDown} initial="hidden" animate="visible"
          style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16, paddingBottom:28, borderBottom:'1px solid rgba(255,255,255,0.06)', marginBottom:32 }}
        >
          <div>
            <h1 style={{ fontSize:28, fontWeight:700, color:'#FAFAFA', letterSpacing:'-0.03em', lineHeight:1.2, margin:0 }}>
              {greeting},{' '}
              <span>
                {typedName || (rawName ? '' : 'there')}
                {cursor && rawName && <span className="cursor-blink" style={{ display:'inline-block', width:2, height:'1em', background:'#E5484D', marginLeft:2, verticalAlign:'text-bottom' }} />}
              </span>
              .
            </h1>
            <p style={{ marginTop:6, fontSize:14, color:'var(--color-text-secondary)', letterSpacing:'-0.01em' }}>
              Here&apos;s your business at a glance.
            </p>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            {/* Bell icon */}
            <div ref={bellRef} style={{ width:36, height:36, borderRadius:6, border:'1px solid rgba(255,255,255,0.06)', background:'#0D0D12', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'rgba(255,255,255,0.4)' }}>
              <Bell size={15} strokeWidth={1.8} />
            </div>

            <Link
              href="/discover"
              style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'10px 20px', background:'#E5484D', color:'#fff', fontSize:13, fontWeight:600, letterSpacing:'-0.01em', textDecoration:'none', borderRadius:6, boxShadow:'0 0 20px rgba(229,72,77,0.25)', transition:'opacity 0.15s, transform 0.15s', flexShrink:0 }}
              onMouseEnter={e => { e.currentTarget.style.opacity='0.85'; e.currentTarget.style.transform='translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.opacity='1'; e.currentTarget.style.transform='translateY(0)' }}
            >
              Find New Clients <ArrowRight size={13} />
            </Link>
          </div>
        </motion.div>

        {/* ── Section 2: Stats row ─────────────────────── */}
        <div className="stats-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:32 }}>
          {STAT_CARDS.map((card, i) => {
            const Icon  = card.icon
            const value = stats?.[card.key] ?? 0
            return (
              <motion.div
                key={card.key}
                className="stat-card"
                {...fadeUp(i * 0.08)}
                style={{ background:'linear-gradient(135deg,#0D0D12 0%,#0A0A0F 100%)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:8, padding:24, position:'relative', overflow:'hidden', boxShadow:'inset 0 1px 0 rgba(255,255,255,0.06)' }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = card.hoverBorder
                  e.currentTarget.style.boxShadow   = `inset 0 1px 0 rgba(255,255,255,0.06), ${card.hoverGlow}`
                  e.currentTarget.style.transform    = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                  e.currentTarget.style.boxShadow   = 'inset 0 1px 0 rgba(255,255,255,0.06)'
                  e.currentTarget.style.transform    = 'translateY(0)'
                }}
              >
                {/* Label + icon */}
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16 }}>
                  <span style={{ fontSize:11, fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--color-text-muted)' }}>
                    {card.label}
                  </span>
                  <div style={{ width:32, height:32, background:card.iconBg, borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', color:card.iconColor, flexShrink:0 }}>
                    <Icon size={15} strokeWidth={2} />
                  </div>
                </div>

                {/* Big number */}
                <div style={{ marginBottom:12 }}>
                  {loading ? <Skeleton height={40} width="55%" /> : (
                    <AnimatedCounter
                      target={value}
                      prefix={card.isCurrency ? '$' : ''}
                      decimals={card.isCurrency ? 2 : 0}
                      duration={1500}
                      style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'clamp(28px,4vw,44px)', fontWeight:700, color:'#FAFAFA', letterSpacing:'-0.03em', lineHeight:1, display:'block' }}
                    />
                  )}
                </div>

                {/* Trend */}
                {loading ? <Skeleton height={14} width="70%" /> : (
                  <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:card.trendColor, fontWeight:500 }}>
                    <TrendingUp size={11} />{card.trend}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* ── Section 3: Two-column layout ─────────────── */}
        <div className="two-col" style={{ display:'grid', gridTemplateColumns:'60fr 40fr', gap:16, marginBottom:32 }}>

          {/* Left: Recent Activity */}
          <motion.div
            {...fadeUp(0.32)}
            style={{ background:'linear-gradient(135deg,#0D0D12 0%,#0A0A0F 100%)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:8, padding:24, boxShadow:'inset 0 1px 0 rgba(255,255,255,0.06)' }}
          >
            <p style={{ fontSize:11, fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--color-text-muted)', marginBottom:20 }}>
              Recent Activity
            </p>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'48px 24px', textAlign:'center', gap:12 }}>
              <p className="pulse-icon" style={{ fontSize:32, fontWeight:700, color:'rgba(59,130,246,0.08)', letterSpacing:'-0.04em' }}>
                ◈
              </p>
              <p style={{ fontSize:14, fontWeight:500, color:'rgba(255,255,255,0.2)', letterSpacing:'-0.01em' }}>
                No activity yet
              </p>
              <p style={{ fontSize:13, color:'var(--color-text-muted)' }}>
                Find clients and send your first pitch to get started.
              </p>
              <Link
                href="/discover"
                style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 16px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:6, fontSize:12, fontWeight:500, color:'rgba(255,255,255,0.5)', textDecoration:'none', marginTop:4, transition:'border-color 0.15s,color 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.16)'; e.currentTarget.style.color='rgba(255,255,255,0.8)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; e.currentTarget.style.color='rgba(255,255,255,0.5)' }}
              >
                Discover clients <ArrowRight size={11} />
              </Link>
            </div>
          </motion.div>

          {/* Right: Quick actions */}
          <motion.div
            {...fadeUp(0.40)}
            style={{ background:'linear-gradient(135deg,#0D0D12 0%,#0A0A0F 100%)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:8, padding:24, boxShadow:'inset 0 1px 0 rgba(255,255,255,0.06)' }}
          >
            <p style={{ fontSize:11, fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--color-text-muted)', marginBottom:16 }}>
              Quick Actions
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {QUICK_ACTIONS.map((action, i) => {
                const Icon = action.icon
                return (
                  <motion.div
                    key={action.href}
                    {...fadeUp(0.46 + i * 0.05)}
                    className="action-card"
                    onClick={() => router.push(action.href)}
                    style={{ display:'flex', alignItems:'center', gap:12, padding:14, border:'1px solid rgba(255,255,255,0.06)', borderRadius:6, background:'rgba(255,255,255,0.01)', boxShadow:'inset 0 1px 0 rgba(255,255,255,0.04),0 1px 3px rgba(0,0,0,0.4)' }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = action.hoverBorder
                      e.currentTarget.style.background  = action.hoverBg
                      e.currentTarget.style.transform   = 'translateX(3px)'
                      e.currentTarget.style.boxShadow   = `inset 0 1px 0 rgba(255,255,255,0.06),2px 0 0 ${action.color} inset`
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                      e.currentTarget.style.background  = 'rgba(255,255,255,0.01)'
                      e.currentTarget.style.transform   = 'translateX(0)'
                      e.currentTarget.style.boxShadow   = 'inset 0 1px 0 rgba(255,255,255,0.04),0 1px 3px rgba(0,0,0,0.4)'
                    }}
                  >
                    <div style={{ width:32, height:32, borderRadius:6, background:`rgba(${action.color === '#3B82F6' ? '59,130,246' : action.color === '#E5484D' ? '229,72,77' : '16,185,129'},0.10)`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:action.color }}>
                      <Icon size={14} strokeWidth={2} />
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:13, fontWeight:600, color:'#FAFAFA', margin:0, letterSpacing:'-0.01em' }}>{action.title}</p>
                      <p style={{ fontSize:11, color:'var(--color-text-muted)', margin:0, marginTop:2 }}>{action.sub}</p>
                    </div>
                    <ArrowRight size={13} style={{ color:'rgba(255,255,255,0.2)', flexShrink:0 }} />
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>

        {/* ── Section 4: Upgrade banner ─────────────────── */}
        <motion.div
          {...fadeUp(0.52)}
          style={{ position:'relative', overflow:'hidden', background:'linear-gradient(135deg,#0D0D12 0%,#0A0A0F 100%)', border:'1px solid rgba(229,72,77,0.2)', borderRadius:8, padding:'28px 32px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16, boxShadow:'inset 0 1px 0 rgba(255,255,255,0.06)' }}
        >
          {/* Radial glow behind */}
          <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:400, height:200, background:'radial-gradient(ellipse,rgba(229,72,77,0.12) 0%,transparent 70%)', pointerEvents:'none' }} />

          <div style={{ position:'relative' }}>
            <p style={{ fontSize:16, fontWeight:700, color:'#FAFAFA', letterSpacing:'-0.02em', margin:0 }}>
              Upgrade to Pro — unlock real scraping, AI pitches & escrow.
            </p>
            <p style={{ fontSize:13, color:'var(--color-text-secondary)', margin:'6px 0 0', letterSpacing:'-0.01em' }}>
              Everything you need to run a 6-figure freelance business.
            </p>
          </div>
          <Link
            href="/#pricing"
            style={{ position:'relative', display:'inline-flex', alignItems:'center', gap:7, padding:'11px 22px', background:'#E5484D', color:'#fff', fontSize:13, fontWeight:600, letterSpacing:'-0.01em', textDecoration:'none', borderRadius:6, boxShadow:'0 0 24px rgba(229,72,77,0.35)', flexShrink:0, transition:'opacity 0.15s,transform 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.opacity='0.85'; e.currentTarget.style.transform='translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.opacity='1'; e.currentTarget.style.transform='translateY(0)' }}
          >
            <Zap size={13} strokeWidth={2.5} /> Upgrade Now
          </Link>
        </motion.div>

      </div>
    </>
  )
}
