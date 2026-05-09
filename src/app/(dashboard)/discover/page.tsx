'use client'

import { useState, useEffect } from 'react'
import { motion, type Easing } from 'framer-motion'
import { Search, ClipboardPaste, ArrowRight, Check, Globe, Share2, Video, Terminal } from 'lucide-react'

/* ─── types ──────────────────────────────────────── */
interface Client {
  id: string
  businessName: string
  industry: string
  location: string
  email: string
  phone: string
  website: string
  socials: Record<string, string>
  detectedGaps: string[]
  source: string
  rating?: number | null
  reviewCount?: number | null
}

/* ─── constants ──────────────────────────────────── */
const EASE: Easing = 'easeOut'

const GAP_LABELS: Record<string, { label: string; icon: typeof Globe }> = {
  'no-website': { label: 'NO WEBSITE', icon: Globe },
  'no-social':  { label: 'NO SOCIAL',  icon: Share2 },
  'no-video':   { label: 'NO VIDEO',   icon: Video },
}

const QUICK_PILLS = [
  { label: 'Dentists in LA',      type: 'dentists',     location: 'Los Angeles' },
  { label: 'Restaurants in NYC',  type: 'restaurants',  location: 'New York' },
  { label: 'Lawyers in Chicago',  type: 'lawyers',      location: 'Chicago' },
]

/* ─── terminal loading lines ─────────────────────── */
function TerminalLoader({ bizType, location }: { bizType: string; location: string }) {
  const lines = [
    '> connecting to business database...',
    `> scanning ${location || '...'}...`,
    `> searching for ${bizType || '...'}...`,
    '> analyzing digital presence...',
    '> detecting gaps...',
  ]
  const [shown, setShown] = useState(1)

  useEffect(() => {
    const id = setInterval(() => setShown(p => Math.min(p + 1, lines.length)), 2200)
    return () => clearInterval(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div style={{ background:'#060608', border:'1px solid rgba(255,255,255,0.06)', borderRadius:8, padding:24, fontFamily:"'JetBrains Mono',monospace" }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
        <Terminal size={14} style={{ color:'#E5484D' }} />
        <span style={{ fontSize:11, color:'rgba(255,255,255,0.3)', letterSpacing:'0.06em', textTransform:'uppercase' }}>FreelanceOS — Scanning</span>
      </div>
      {lines.slice(0, shown).map((line, i) => (
        <motion.p
          key={i}
          initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
          transition={{ duration:0.3, ease:EASE }}
          style={{ fontSize:13, color: i === shown - 1 ? '#E5484D' : 'rgba(255,255,255,0.4)', marginBottom:8, letterSpacing:'-0.01em' }}
        >
          {line}
          {i === shown - 1 && <span style={{ animation:'blink 0.9s step-end infinite', display:'inline-block', width:2, height:'1em', background:'#E5484D', marginLeft:4, verticalAlign:'text-bottom' }} />}
        </motion.p>
      ))}
      <p style={{ fontSize:12, color:'rgba(255,255,255,0.2)', marginTop:12 }}>This takes 20–30 seconds for real data.</p>
    </div>
  )
}

/* ─── skeleton card ──────────────────────────────── */
function SkeletonCard() {
  return (
    <div style={{ background:'linear-gradient(135deg,#0D0D12 0%,#0A0A0F 100%)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:8, padding:20, height:190 }}>
      {[60, 40, 72, 60, 50, 45].map((w, i) => (
        <div key={i} className="fo-shimmer" style={{ height: i === 0 ? 16 : i === 2 ? 20 : 12, width:`${w}%`, borderRadius:4, marginBottom: i === 1 ? 16 : i === 2 ? 6 : 8 }} />
      ))}
    </div>
  )
}

/* ─── result card ────────────────────────────────── */
function ResultCard({ client, index, saved, onSave }: {
  client: Client; index: number; saved: boolean; onSave: () => void
}) {
  return (
    <motion.div
      initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
      transition={{ duration:0.4, delay: index * 0.06, ease:EASE }}
      className="fo-result-card"
      style={{ background:'linear-gradient(135deg,#0D0D12 0%,#0A0A0F 100%)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:8, padding:20, display:'flex', flexDirection:'column', gap:12, boxShadow:'inset 0 1px 0 rgba(255,255,255,0.06)' }}
    >
      {/* Top row */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8 }}>
        <p style={{ fontSize:15, fontWeight:600, color:'#FAFAFA', letterSpacing:'-0.02em', margin:0, lineHeight:1.3 }}>
          {client.businessName}
        </p>
        <span style={{ fontSize:10, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:4, padding:'2px 7px', flexShrink:0 }}>
          {client.source}
        </span>
      </div>

      {/* Tags */}
      <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
        {[client.industry, client.location].filter(Boolean).map(tag => (
          <span key={tag} style={{ fontSize:11, fontFamily:"'JetBrains Mono',monospace", color:'rgba(255,255,255,0.4)', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:4, padding:'2px 8px' }}>
            {tag}
          </span>
        ))}
        {client.rating && (
          <span style={{ fontSize:11, fontFamily:"'JetBrains Mono',monospace", color:'#F59E0B', background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:4, padding:'2px 8px' }}>
            ★ {client.rating.toFixed(1)}
          </span>
        )}
      </div>

      {/* Gap badges */}
      {client.detectedGaps.length > 0 && (
        <motion.div
          initial={{ scale:0.92, opacity:0 }} animate={{ scale:1, opacity:1 }}
          transition={{ duration:0.2, delay: index * 0.06 + 0.15, ease:EASE }}
          style={{ display:'flex', gap:5, flexWrap:'wrap' }}
        >
          {client.detectedGaps.map(gap => {
            const g = GAP_LABELS[gap]
            if (!g) return null
            const Icon = g.icon
            return (
              <span key={gap} style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:10, fontWeight:700, letterSpacing:'0.08em', color:'#E5484D', background:'rgba(229,72,77,0.1)', border:'1px solid rgba(229,72,77,0.3)', borderRadius:4, padding:'2px 7px' }}>
                <Icon size={9} strokeWidth={2.5} />{g.label}
              </span>
            )
          })}
        </motion.div>
      )}

      {/* Contact */}
      <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
        {client.email && <span style={{ fontSize:12, fontFamily:"'JetBrains Mono',monospace", color:'rgba(255,255,255,0.3)' }}>{client.email}</span>}
        {client.phone && <span style={{ fontSize:12, fontFamily:"'JetBrains Mono',monospace", color:'rgba(255,255,255,0.3)' }}>{client.phone}</span>}
      </div>

      {/* Actions */}
      <div style={{ display:'flex', gap:8, marginTop:'auto' }}>
        <button
          onClick={onSave}
          style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'8px 0', fontSize:11, fontWeight:600, color: saved ? '#10B981' : 'rgba(255,255,255,0.5)', background:'transparent', border:`1px solid ${saved ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius:6, cursor:'pointer', transition:'all 0.15s' }}
        >
          {saved ? <><Check size={11} />Saved</> : 'Save Client'}
        </button>
        <button
          style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'8px 0', fontSize:11, fontWeight:600, color:'#fff', background:'#E5484D', border:'none', borderRadius:6, cursor:'pointer', transition:'opacity 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.opacity='0.85')}
          onMouseLeave={e => (e.currentTarget.style.opacity='1')}
        >
          Pitch <ArrowRight size={11} />
        </button>
      </div>
    </motion.div>
  )
}

/* ─── page ───────────────────────────────────────── */
export default function DiscoverPage() {
  const [bizType,    setBizType]   = useState('')
  const [location,   setLocation]  = useState('')
  const [status,     setStatus]    = useState<'idle'|'loading'|'results'|'error'>('idle')
  const [results,    setResults]   = useState<Client[]>([])
  const [errorMsg,   setErrorMsg]  = useState('')
  const [saved,      setSaved]     = useState<Set<string>>(new Set())
  const [pasteOpen,  setPasteOpen] = useState(false)
  const [pasteText,  setPasteText] = useState('')

  async function handleSearch(e?: React.FormEvent) {
    e?.preventDefault()
    const biz = bizType.trim(); const loc = location.trim()
    if (!biz || !loc) return
    setStatus('loading'); setResults([]); setErrorMsg('')

    try {
      const res = await fetch('/api/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessType: biz, location: loc }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Search failed')
      setResults(data.clients ?? [])
      setStatus('results')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Search failed. Check your connection.'
      setErrorMsg(msg)
      setStatus('error')
    }
  }

  function fillPill(type: string, loc: string) {
    setBizType(type); setLocation(loc)
  }

  function toggleSave(id: string) {
    setSaved(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  const inputStyle: React.CSSProperties = {
    width:'100%', background:'#0D0D12', border:'1px solid rgba(255,255,255,0.06)',
    borderRadius:6, padding:'12px 16px', color:'#FAFAFA', fontSize:14,
    fontFamily:'Inter,sans-serif', outline:'none', transition:'border-color 0.15s',
  }

  return (
    <>
      <style>{`
        @keyframes fo-shimmer { 0%{background-position:200% 0}100%{background-position:-200% 0} }
        @keyframes blink { 0%,100%{opacity:1}50%{opacity:0} }
        .fo-shimmer { background:linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.09) 50%,rgba(255,255,255,0.04) 75%); background-size:400% 100%; animation:fo-shimmer 1.5s infinite linear; }
        .fo-result-card { transition:border-color 0.2s,transform 0.2s; }
        .fo-result-card:hover { border-color:rgba(229,72,77,0.35)!important; transform:translateY(-2px); }
        .fo-pill { transition:border-color 0.15s,transform 0.15s,background 0.15s; cursor:pointer; }
        .fo-pill:hover { border-color:rgba(229,72,77,0.4)!important; background:rgba(229,72,77,0.05)!important; transform:scale(1.02); }
        .fo-input:focus { border-color:rgba(229,72,77,0.5)!important; }
        @media(max-width:900px){ .fo-grid3{grid-template-columns:repeat(2,1fr)!important} }
        @media(max-width:600px){ .fo-grid3{grid-template-columns:1fr!important} .fo-form-row{flex-direction:column!important} }
      `}</style>

      <div style={{ maxWidth:1200, margin:'0 auto' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:0.4, ease:EASE }}
          style={{ marginBottom:28 }}
        >
          <h1 style={{ fontSize:28, fontWeight:700, color:'#FAFAFA', letterSpacing:'-0.03em', margin:0 }}>
            Discover Clients
          </h1>
          <p style={{ marginTop:6, fontSize:14, color:'var(--color-text-secondary)', letterSpacing:'-0.01em' }}>
            Find businesses missing digital presence in any location.
          </p>
        </motion.div>

        {/* Search card */}
        <motion.div
          initial={{ opacity:0, scale:0.98 }} animate={{ opacity:1, scale:1 }}
          transition={{ duration:0.3, delay:0.1, ease:EASE }}
          style={{ background:'linear-gradient(135deg,#0D0D12 0%,#0A0A0F 100%)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:8, padding:24, marginBottom:20, boxShadow:'inset 0 1px 0 rgba(255,255,255,0.06)' }}
        >
          <form onSubmit={handleSearch}>
            <div className="fo-form-row" style={{ display:'flex', gap:12, marginBottom:16 }}>
              <input className="fo-input" style={inputStyle} placeholder="Business type — dentists, restaurants, lawyers..." value={bizType} onChange={e => setBizType(e.target.value)} />
              <input className="fo-input" style={inputStyle} placeholder="Location — Los Angeles, New York, Mumbai..." value={location} onChange={e => setLocation(e.target.value)} />
              <button
                type="submit"
                disabled={status === 'loading'}
                style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'12px 22px', background: status === 'loading' ? 'rgba(229,72,77,0.5)' : '#E5484D', color:'#fff', fontSize:14, fontWeight:600, letterSpacing:'-0.01em', border:'none', borderRadius:6, cursor: status === 'loading' ? 'not-allowed' : 'pointer', whiteSpace:'nowrap', flexShrink:0, transition:'opacity 0.15s', boxShadow:'0 0 20px rgba(229,72,77,0.2)' }}
              >
                <Search size={14} />{status === 'loading' ? 'Searching...' : 'Search Clients'}
              </button>
            </div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {QUICK_PILLS.map(p => (
                <button
                  key={p.label} type="button" className="fo-pill"
                  onClick={() => fillPill(p.type, p.location)}
                  style={{ fontSize:12, fontWeight:500, color:'rgba(255,255,255,0.5)', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:6, padding:'6px 14px', cursor:'pointer' }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </form>
        </motion.div>

        {/* Results area */}
        {status === 'idle' && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.5 }}
            style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'80px 24px', gap:12, textAlign:'center' }}
          >
            <Search size={64} style={{ color:'rgba(255,255,255,0.06)' }} />
            <p style={{ fontSize:18, fontWeight:600, color:'rgba(255,255,255,0.15)', letterSpacing:'-0.02em' }}>Search for businesses above</p>
            <p style={{ fontSize:13, color:'var(--color-text-muted)' }}>We&apos;ll find real businesses with gaps you can fill</p>
          </motion.div>
        )}

        {status === 'loading' && (
          <div>
            <div style={{ marginBottom:20 }}>
              <TerminalLoader bizType={bizType} location={location} />
            </div>
            <div className="fo-grid3" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
              {Array.from({ length:6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </div>
        )}

        {status === 'error' && (
          <div style={{ background:'rgba(229,72,77,0.06)', border:'1px solid rgba(229,72,77,0.2)', borderRadius:8, padding:24, textAlign:'center' }}>
            <p style={{ fontSize:14, color:'#E5484D', fontWeight:600 }}>{errorMsg}</p>
            <p style={{ fontSize:12, color:'rgba(255,255,255,0.3)', marginTop:6 }}>Check your Apify token in .env.local or try again.</p>
          </div>
        )}

        {status === 'results' && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.3 }}>
            <p style={{ fontSize:13, color:'var(--color-text-muted)', marginBottom:16, letterSpacing:'-0.01em' }}>
              Found <span style={{ color:'#FAFAFA', fontWeight:600 }}>{results.length}</span> businesses in {location}
            </p>
            {results.length === 0 ? (
              <div style={{ textAlign:'center', padding:'60px 24px', color:'rgba(255,255,255,0.2)', fontSize:14 }}>
                No results found. Try a different search.
              </div>
            ) : (
              <div className="fo-grid3" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
                {results.map((c, i) => (
                  <ResultCard key={c.id} client={c} index={i} saved={saved.has(c.id)} onSave={() => toggleSave(c.id)} />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Manual paste */}
        <div style={{ marginTop:32 }}>
          <button
            onClick={() => setPasteOpen(o => !o)}
            style={{ display:'flex', alignItems:'center', gap:8, padding:'12px 20px', width:'100%', background:'linear-gradient(135deg,#0D0D12 0%,#0A0A0F 100%)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:8, color:'rgba(255,255,255,0.4)', fontSize:13, fontWeight:500, cursor:'pointer', textAlign:'left', transition:'border-color 0.15s,color 0.15s', boxShadow:'inset 0 1px 0 rgba(255,255,255,0.04)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.12)'; e.currentTarget.style.color='rgba(255,255,255,0.7)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.06)'; e.currentTarget.style.color='rgba(255,255,255,0.4)' }}
          >
            <ClipboardPaste size={15} strokeWidth={1.8} />
            Paste Client Data Manually
            <span style={{ marginLeft:'auto', fontSize:11 }}>{pasteOpen ? '▲' : '▼'}</span>
          </button>

          {pasteOpen && (
            <motion.div
              initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
              transition={{ duration:0.2, ease:EASE }}
              style={{ background:'#0D0D12', border:'1px solid rgba(255,255,255,0.06)', borderTopWidth:0, borderRadius:'0 0 8px 8px', padding:20 }}
            >
              <textarea
                value={pasteText} onChange={e => setPasteText(e.target.value)}
                placeholder="Paste business info from Google Maps, Manta, or anywhere..."
                style={{ width:'100%', minHeight:120, background:'#060608', border:'1px solid rgba(255,255,255,0.06)', borderRadius:6, padding:'12px 16px', color:'#FAFAFA', fontSize:14, fontFamily:'Inter,sans-serif', resize:'vertical', outline:'none', transition:'border-color 0.15s', boxSizing:'border-box' }}
                onFocus={e => (e.currentTarget.style.borderColor='rgba(229,72,77,0.5)')}
                onBlur={e => (e.currentTarget.style.borderColor='rgba(255,255,255,0.06)')}
              />
              <div style={{ marginTop:12 }}>
                <button
                  style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'10px 20px', background:'#E5484D', color:'#fff', fontSize:13, fontWeight:600, border:'none', borderRadius:6, cursor:'pointer', transition:'opacity 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity='0.85')}
                  onMouseLeave={e => (e.currentTarget.style.opacity='1')}
                >
                  Parse with AI <ArrowRight size={13} />
                </button>
              </div>
            </motion.div>
          )}
        </div>

      </div>
    </>
  )
}
