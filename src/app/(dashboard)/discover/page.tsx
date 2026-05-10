'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Search, Globe, Share2, Video, Mail, Phone,
  AtSign, ExternalLink, Check, ArrowRight, Terminal,
  ChevronDown, Download,
} from 'lucide-react'

/* ─── types ──────────────────────────────────────── */
interface Client {
  id: string
  businessName: string
  industry: string
  location: string
  email: string
  phone: string
  website: string
  websiteLive?: boolean
  metaDescription?: string
  socials: { instagram: string; linkedin: string; facebook: string }
  detectedGaps: string[]
  source: string
  opportunityScore: number
  rating?: number | null
  reviewCount?: number | null
  googleMapsUrl?: string
  category?: string
}

type SortKey = 'score' | 'reviews' | 'alpha'
type FilterGap = 'all' | 'no-website' | 'no-social' | 'no-video' | 'any-gap'

/* ─── helpers ────────────────────────────────────── */
function parseQuery(q: string): { biz: string; loc: string } {
  const match = q.match(/^(.+?)\s+in\s+(.+)$/i)
  if (match) return { biz: match[1].trim(), loc: match[2].trim() }
  return { biz: q.trim(), loc: '' }
}

function scoreLabel(s: number): { label: string; color: string; bg: string } {
  if (s >= 85) return { label: 'HIGH', color: '#E5484D', bg: 'rgba(229,72,77,0.10)' }
  if (s >= 60) return { label: 'MED',  color: '#F59E0B', bg: 'rgba(245,158,11,0.10)' }
  return          { label: 'LOW',  color: 'rgba(255,255,255,0.3)', bg: 'rgba(255,255,255,0.05)' }
}

/* ─── terminal loader ────────────────────────────── */
function TerminalLoader({ biz, loc }: { biz: string; loc: string }) {
  const lines = [
    '> Connecting to business database...',
    `> Scanning ${loc || '...'} for ${biz || '...'}...`,
    '> Analyzing digital presence...',
    '> Detecting missing assets...',
    '> Ranking by opportunity score...',
  ]
  const [shown, setShown] = useState(1)
  useEffect(() => {
    const id = setInterval(() => setShown(p => Math.min(p + 1, lines.length)), 1800)
    return () => clearInterval(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div style={{ background:'#060608', border:'1px solid rgba(255,255,255,0.06)',
      borderRadius:8, padding:24, fontFamily:"'JetBrains Mono',monospace" }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
        <Terminal size={13} style={{ color:'#E5484D' }} />
        <span style={{ fontSize:11, letterSpacing:'0.08em', textTransform:'uppercase',
          color:'rgba(255,255,255,0.25)' }}>FreelanceOS — Scanning</span>
      </div>
      {lines.slice(0, shown).map((line, i) => (
        <motion.p key={i} initial={{ opacity:0, x:-6 }} animate={{ opacity:1, x:0 }}
          transition={{ duration:0.25 }}
          style={{ fontSize:13, marginBottom:8, letterSpacing:'-0.01em',
            color: i === shown - 1 ? '#E5484D' : 'rgba(255,255,255,0.35)' }}>
          {line}
          {i === shown - 1 && (
            <span style={{ display:'inline-block', width:7, height:13, background:'#E5484D',
              marginLeft:4, verticalAlign:'text-bottom', animation:'dc-blink 0.9s step-end infinite' }} />
          )}
        </motion.p>
      ))}
      <p style={{ fontSize:11, color:'rgba(255,255,255,0.2)', marginTop:16 }}>
        This takes 20–30 s for real data.
      </p>
    </div>
  )
}

/* ─── result row ─────────────────────────────────── */
function ResultRow({ client, index, isFirst, isLast, saved, onSave }:{
  client: Client; index: number; isFirst: boolean; isLast: boolean; saved: boolean; onSave: ()=>void
}) {
  const initial = (client.businessName || '?')[0].toUpperCase()
  const sc      = scoreLabel(client.opportunityScore)

  const GAP_MAP: Record<string, { label: string; Icon: typeof Globe }> = {
    'no-website': { label: 'NO WEBSITE', Icon: Globe   },
    'no-social':  { label: 'NO SOCIAL',  Icon: Share2  },
    'no-video':   { label: 'NO VIDEO',   Icon: Video   },
  }

  const radius = isFirst && isLast ? '8px'
    : isFirst ? '8px 8px 0 0'
    : isLast  ? '0 0 8px 8px'
    : '0'

  return (
    <motion.div
      initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
      transition={{ duration:0.35, delay: index * 0.05 }}
      style={{ display:'grid', gridTemplateColumns:'40px 1fr auto', gap:16,
        padding:'16px 20px', borderRadius: radius,
        background:'#0D0D12',
        borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.04)',
        transition:'background 0.15s' }}
      onMouseEnter={e => { e.currentTarget.style.background = '#111118' }}
      onMouseLeave={e => { e.currentTarget.style.background = '#0D0D12' }}
    >
      {/* Initial square */}
      <div style={{ width:40, height:40, borderRadius:6, background:'rgba(255,255,255,0.06)',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:16, fontWeight:600, color:'rgba(255,255,255,0.7)', flexShrink:0 }}>
        {initial}
      </div>

      {/* Middle */}
      <div style={{ minWidth:0 }}>
        {/* Row 1 — name + tags + score */}
        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:6 }}>
          <span style={{ fontSize:14, fontWeight:600, color:'#FAFAFA', letterSpacing:'-0.02em' }}>
            {client.businessName}
          </span>
          {client.industry && (
            <span style={{ fontSize:11, fontFamily:"'JetBrains Mono',monospace",
              color:'rgba(255,255,255,0.3)', background:'rgba(255,255,255,0.04)',
              border:'1px solid rgba(255,255,255,0.07)', borderRadius:4, padding:'1px 7px' }}>
              {client.industry}
            </span>
          )}
          {client.location && (
            <span style={{ fontSize:11, fontFamily:"'JetBrains Mono',monospace",
              color:'rgba(255,255,255,0.3)', background:'rgba(255,255,255,0.04)',
              border:'1px solid rgba(255,255,255,0.07)', borderRadius:4, padding:'1px 7px' }}>
              {client.location}
            </span>
          )}
          {/* Score pill */}
          <span style={{ fontSize:10, fontWeight:700, letterSpacing:'0.08em',
            color: sc.color, background: sc.bg,
            border:`1px solid ${sc.color}33`, borderRadius:4, padding:'1px 7px' }}>
            {sc.label} {client.opportunityScore}
          </span>
        </div>

        {/* Row 2 — gap badges */}
        {client.detectedGaps.length > 0 && (
          <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:6 }}>
            {client.detectedGaps.map(gap => {
              const g = GAP_MAP[gap]; if (!g) return null
              return (
                <span key={gap} style={{ display:'inline-flex', alignItems:'center', gap:4,
                  fontSize:10, fontWeight:700, letterSpacing:'0.07em',
                  color:'#E5484D', background:'rgba(229,72,77,0.09)',
                  border:'1px solid rgba(229,72,77,0.28)', borderRadius:4, padding:'2px 7px' }}>
                  <g.Icon size={9} strokeWidth={2.5} />{g.label}
                </span>
              )
            })}
          </div>
        )}

        {/* Row 3 — contact info */}
        <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
          {client.email && (
            <span style={{ display:'inline-flex', alignItems:'center', gap:5,
              fontSize:12, fontFamily:"'JetBrains Mono',monospace", color:'rgba(255,255,255,0.35)' }}>
              <Mail size={11} />{client.email}
            </span>
          )}
          {client.phone && (
            <span style={{ display:'inline-flex', alignItems:'center', gap:5,
              fontSize:12, fontFamily:"'JetBrains Mono',monospace", color:'rgba(255,255,255,0.35)' }}>
              <Phone size={11} />{client.phone}
            </span>
          )}
          {client.website && (
            <span style={{ display:'inline-flex', alignItems:'center', gap:5,
              fontSize:12, fontFamily:"'JetBrains Mono',monospace",
              color: client.websiteLive === false ? 'rgba(229,72,77,0.6)' : 'rgba(255,255,255,0.35)' }}>
              <span style={{ width:6, height:6, borderRadius:'50%', flexShrink:0,
                background: client.websiteLive === true  ? '#10B981'
                          : client.websiteLive === false ? '#E5484D'
                          : 'rgba(255,255,255,0.2)' }} />
              <Globe size={11} />{client.website.replace(/^https?:\/\//, '').slice(0, 30)}
            </span>
          )}
          {client.socials?.linkedin && (
            <span style={{ display:'inline-flex', alignItems:'center', gap:5,
              fontSize:12, fontFamily:"'JetBrains Mono',monospace", color:'rgba(255,255,255,0.35)' }}>
              <ExternalLink size={11} />{client.socials.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\//, '').slice(0, 24)}
            </span>
          )}
          {client.socials?.instagram && (
            <span style={{ display:'inline-flex', alignItems:'center', gap:5,
              fontSize:12, fontFamily:"'JetBrains Mono',monospace", color:'rgba(255,255,255,0.35)' }}>
              <AtSign size={11} />{client.socials.instagram.replace(/.*instagram\.com\//, '').replace(/\/$/, '').slice(0, 20)}
            </span>
          )}
        </div>

        {/* Row 4 — meta description */}
        {client.metaDescription && (
          <p style={{ margin:'6px 0 0', fontSize:11, color:'rgba(255,255,255,0.22)',
            letterSpacing:'-0.01em', lineHeight:1.5,
            overflow:'hidden', display:'-webkit-box',
            WebkitLineClamp:1, WebkitBoxOrient:'vertical' }}>
            {client.metaDescription}
          </p>
        )}
      </div>

      {/* Right — action buttons */}
      <div style={{ display:'flex', flexDirection:'column', gap:6, alignItems:'flex-end', flexShrink:0 }}>
        <button onClick={onSave}
          style={{ display:'inline-flex', alignItems:'center', gap:5,
            padding:'6px 14px', fontSize:11, fontWeight:600,
            color: saved ? '#10B981' : 'rgba(255,255,255,0.5)',
            background:'transparent',
            border:`1px solid ${saved ? 'rgba(16,185,129,0.35)' : 'rgba(255,255,255,0.10)'}`,
            borderRadius:6, cursor:'pointer', whiteSpace:'nowrap',
            transition:'all 0.2s' }}>
          {saved ? <><Check size={11} />Saved</> : 'Save'}
        </button>
        <button
          style={{ display:'inline-flex', alignItems:'center', gap:5,
            padding:'6px 14px', fontSize:11, fontWeight:600,
            color:'#fff', background:'#E5484D', border:'none',
            borderRadius:6, cursor:'pointer', whiteSpace:'nowrap',
            transition:'opacity 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
          Pitch <ArrowRight size={11} />
        </button>
      </div>
    </motion.div>
  )
}

/* ─── page ───────────────────────────────────────── */
export default function DiscoverPage() {
  const [query,   setQuery]   = useState('')
  const [status,  setStatus]  = useState<'idle'|'loading'|'results'|'error'>('idle')
  const [results, setResults] = useState<Client[]>([])
  const [errMsg,  setErrMsg]  = useState('')
  const [saved,   setSaved]   = useState<Set<string>>(new Set())
  const [sort,    setSort]    = useState<SortKey>('score')
  const [filter,  setFilter]  = useState<FilterGap>('all')
  const [focused, setFocused] = useState(false)

  async function runSearch(q: string) {
    const { biz, loc } = parseQuery(q)
    if (!biz) return
    setStatus('loading'); setResults([]); setErrMsg('')

    try {
      const res  = await fetch('/api/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessType: biz, location: loc || 'United States' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Search failed')
      setResults(data.clients ?? [])
      setStatus('results')
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : 'Search failed')
      setStatus('error')
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') runSearch(query)
  }

  function toggleSave(id: string) {
    setSaved(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  function exportCSV() {
    const header = 'Name,Location,Email,Phone,Website,Score,Gaps'
    const rows   = displayResults.map(c =>
      `"${c.businessName}","${c.location}","${c.email}","${c.phone}","${c.website}",${c.opportunityScore},"${c.detectedGaps.join(';')}"`)
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a'); a.href = url; a.download = 'clients.csv'; a.click()
  }

  /* filter + sort */
  const displayResults = useMemo(() => {
    let list = [...results]
    if (filter === 'no-website') list = list.filter(c => c.detectedGaps.includes('no-website'))
    else if (filter === 'no-social') list = list.filter(c => c.detectedGaps.includes('no-social'))
    else if (filter === 'no-video')  list = list.filter(c => c.detectedGaps.includes('no-video'))
    else if (filter === 'any-gap')   list = list.filter(c => c.detectedGaps.length > 0)

    if (sort === 'score')   list.sort((a, b) => b.opportunityScore - a.opportunityScore)
    else if (sort === 'reviews') list.sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0))
    else if (sort === 'alpha')   list.sort((a, b) => a.businessName.localeCompare(b.businessName))

    return list
  }, [results, sort, filter])

  const { biz: parsedBiz, loc: parsedLoc } = parseQuery(query)

  const PILLS: { key: FilterGap; label: string }[] = [
    { key:'all', label:'All' },
    { key:'no-website', label:'No Website' },
    { key:'no-social', label:'No Social' },
    { key:'no-video', label:'No Video' },
    { key:'any-gap', label:'All Gaps' },
  ]

  return (
    <>
      <style>{`
        @keyframes dc-blink { 0%,100%{opacity:1}50%{opacity:0} }
        @keyframes dc-shimmer { 0%{background-position:200% 0}100%{background-position:-200% 0} }
        .dc-skel { background: linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.09) 50%,rgba(255,255,255,0.04) 75%); background-size:400% 100%; animation:dc-shimmer 1.5s infinite linear; border-radius:4px; }
      `}</style>

      <div style={{ maxWidth:900, margin:'0 auto' }}>

        {/* Header */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:0.4 }} style={{ marginBottom:24 }}>
          <h1 style={{ fontSize:28, fontWeight:700, color:'#FAFAFA',
            letterSpacing:'-0.03em', margin:0 }}>Discover Clients</h1>
          <p style={{ marginTop:6, fontSize:14, color:'var(--color-text-secondary)', letterSpacing:'-0.01em' }}>
            Find businesses missing digital presence in any location.
          </p>
        </motion.div>

        {/* ── Raycast-style command bar ─────────────────── */}
        <motion.div initial={{ opacity:0, scale:0.98 }} animate={{ opacity:1, scale:1 }}
          transition={{ duration:0.3, delay:0.08 }} style={{ marginBottom:12 }}>
          <div style={{ position:'relative', display:'flex', alignItems:'center',
            height:52, background:'#0D0D12',
            border:`1px solid ${focused ? 'rgba(229,72,77,0.4)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius:8,
            boxShadow: focused ? '0 0 0 3px rgba(229,72,77,0.08)' : 'none',
            transition:'border-color 0.15s,box-shadow 0.15s' }}>
            <Search size={16} style={{ position:'absolute', left:18, color:'rgba(255,255,255,0.3)', flexShrink:0 }} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKey}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder='Search dentists in Los Angeles...'
              style={{ flex:1, background:'transparent', border:'none', outline:'none',
                paddingLeft:48, paddingRight:140, height:'100%',
                fontSize:15, color:'#FAFAFA', fontFamily:'Inter,sans-serif',
                letterSpacing:'-0.01em' }}
            />
            <button onClick={() => runSearch(query)}
              disabled={status === 'loading'}
              style={{ position:'absolute', right:8, display:'inline-flex', alignItems:'center',
                gap:6, padding:'8px 16px', height:36,
                background: status === 'loading' ? 'rgba(229,72,77,0.45)' : '#E5484D',
                color:'#fff', fontSize:13, fontWeight:600, border:'none', borderRadius:6,
                cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                transition:'opacity 0.15s', whiteSpace:'nowrap' }}
              onMouseEnter={e => { if (status !== 'loading') e.currentTarget.style.opacity = '0.85' }}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
              {status === 'loading' ? 'Searching...' : <>Search <ArrowRight size={12} /></>}
            </button>
          </div>

          {/* Parsed hint */}
          {query && (
            <p style={{ fontSize:12, color:'rgba(255,255,255,0.25)', marginTop:8, paddingLeft:4, letterSpacing:'-0.01em' }}>
              {parsedBiz && <><span style={{ color:'rgba(255,255,255,0.5)' }}>{parsedBiz}</span> in </>}
              <span style={{ color:'rgba(255,255,255,0.5)' }}>{parsedLoc || 'any location'}</span>
            </p>
          )}
        </motion.div>

        {/* ── Filter pills ──────────────────────────────── */}
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:24 }}>
          {PILLS.map(p => (
            <button key={p.key} onClick={() => setFilter(p.key)}
              style={{ fontSize:12, fontWeight:500, padding:'6px 14px', borderRadius:6, cursor:'pointer',
                border: filter === p.key ? '1px solid rgba(229,72,77,0.4)' : '1px solid rgba(255,255,255,0.08)',
                background: filter === p.key ? 'rgba(229,72,77,0.10)' : 'rgba(255,255,255,0.04)',
                color: filter === p.key ? '#E5484D' : 'rgba(255,255,255,0.5)',
                transition:'all 0.15s' }}>
              {p.label}
            </button>
          ))}
        </div>

        {/* ── States ───────────────────────────────────── */}
        {status === 'idle' && (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center',
            padding:'80px 24px', gap:12, textAlign:'center' }}>
            <Search size={56} style={{ color:'rgba(255,255,255,0.06)' }} />
            <p style={{ fontSize:17, fontWeight:600, color:'rgba(255,255,255,0.15)', letterSpacing:'-0.02em' }}>
              Search for businesses above
            </p>
            <p style={{ fontSize:13, color:'var(--color-text-muted)' }}>
              Try &quot;restaurants in New York&quot; or &quot;lawyers in Chicago&quot;
            </p>
          </div>
        )}

        {status === 'loading' && (
          <div>
            <div style={{ marginBottom:16 }}>
              <TerminalLoader biz={parsedBiz} loc={parsedLoc} />
            </div>
            <div style={{ border:'1px solid rgba(255,255,255,0.06)', borderRadius:8, overflow:'hidden' }}>
              {Array.from({ length:5 }).map((_, i) => (
                <div key={i} style={{ display:'grid', gridTemplateColumns:'40px 1fr auto',
                  gap:16, padding:'16px 20px',
                  borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  background:'#0D0D12' }}>
                  <div className="dc-skel" style={{ width:40, height:40, borderRadius:6 }} />
                  <div>
                    <div className="dc-skel" style={{ width:'40%', height:14, marginBottom:10 }} />
                    <div className="dc-skel" style={{ width:'25%', height:11, marginBottom:8 }} />
                    <div className="dc-skel" style={{ width:'60%', height:11 }} />
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                    <div className="dc-skel" style={{ width:64, height:28, borderRadius:6 }} />
                    <div className="dc-skel" style={{ width:64, height:28, borderRadius:6 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {status === 'error' && (
          <div style={{ background:'rgba(229,72,77,0.06)', border:'1px solid rgba(229,72,77,0.2)',
            borderRadius:8, padding:24, textAlign:'center' }}>
            <p style={{ fontSize:14, color:'#E5484D', fontWeight:600, margin:0 }}>{errMsg}</p>
            <p style={{ fontSize:12, color:'rgba(255,255,255,0.3)', marginTop:8 }}>
              Add APIFY_API_TOKEN to .env.local — or check your connection.
            </p>
          </div>
        )}

        {status === 'results' && (
          <div>
            {/* Results header */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
              flexWrap:'wrap', gap:12, marginBottom:12 }}>
              <p style={{ fontSize:13, color:'var(--color-text-muted)', letterSpacing:'-0.01em', margin:0 }}>
                Found{' '}
                <span style={{ color:'#FAFAFA', fontWeight:600 }}>{displayResults.length}</span>
                {' '}businesses · sorted by opportunity
              </p>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                {/* Sort dropdown */}
                <div style={{ position:'relative' }}>
                  <select
                    value={sort}
                    onChange={e => setSort(e.target.value as SortKey)}
                    style={{ appearance:'none', background:'#0D0D12',
                      border:'1px solid rgba(255,255,255,0.08)', borderRadius:6,
                      padding:'7px 32px 7px 12px', fontSize:12, color:'rgba(255,255,255,0.6)',
                      cursor:'pointer', outline:'none' }}>
                    <option value="score">Highest Gap Score</option>
                    <option value="reviews">Most Reviews</option>
                    <option value="alpha">Alphabetical</option>
                  </select>
                  <ChevronDown size={12} style={{ position:'absolute', right:10, top:'50%',
                    transform:'translateY(-50%)', color:'rgba(255,255,255,0.4)', pointerEvents:'none' }} />
                </div>
                <button onClick={exportCSV}
                  style={{ display:'inline-flex', alignItems:'center', gap:6,
                    padding:'7px 14px', fontSize:12, fontWeight:500,
                    color:'rgba(255,255,255,0.5)', background:'transparent',
                    border:'1px solid rgba(255,255,255,0.08)', borderRadius:6,
                    cursor:'pointer', transition:'border-color 0.15s,color 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.18)'; e.currentTarget.style.color='rgba(255,255,255,0.8)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; e.currentTarget.style.color='rgba(255,255,255,0.5)' }}>
                  <Download size={12} /> Export CSV
                </button>
              </div>
            </div>

            {/* Results list */}
            {displayResults.length === 0 ? (
              <div style={{ textAlign:'center', padding:'60px 24px', color:'rgba(255,255,255,0.2)', fontSize:14 }}>
                No results match this filter.
              </div>
            ) : (
              <div style={{ border:'1px solid rgba(255,255,255,0.06)', borderRadius:8, overflow:'hidden' }}>
                {displayResults.map((c, i) => (
                  <ResultRow
                    key={c.id} client={c} index={i}
                    isFirst={i === 0} isLast={i === displayResults.length - 1}
                    saved={saved.has(c.id)} onSave={() => toggleSave(c.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
