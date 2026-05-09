'use client'

import { useState } from 'react'
import { motion, type Easing } from 'framer-motion'
import { Search, ClipboardPaste, ArrowRight, Check, Globe, Share2, Video } from 'lucide-react'

/* ─── types ─────────────────────────────────────── */
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
}

/* ─── mock data ─────────────────────────────────── */
const MOCK: Client[] = [
  { id:'1', businessName:'Bright Smile Dental', industry:'Dentistry', location:'Los Angeles, CA', email:'info@brightsmile.com', phone:'+1 (310) 555-0182', website:'', socials:{}, detectedGaps:['no-website','no-social'], source:'scraped' },
  { id:'2', businessName:'Peak Performance Gym', industry:'Fitness', location:'Los Angeles, CA', email:'hello@peakgym.com', phone:'+1 (323) 555-0147', website:'peakgym.com', socials:{}, detectedGaps:['no-social','no-video'], source:'scraped' },
  { id:'3', businessName:'Nexus Law Group', industry:'Legal', location:'Los Angeles, CA', email:'contact@nexuslaw.com', phone:'+1 (213) 555-0093', website:'nexuslaw.com', socials:{linkedin:'nexuslaw'}, detectedGaps:['no-video'], source:'scraped' },
  { id:'4', businessName:'Sakura Japanese Restaurant', industry:'Food & Beverage', location:'Los Angeles, CA', email:'', phone:'+1 (310) 555-0234', website:'', socials:{}, detectedGaps:['no-website','no-social','no-video'], source:'scraped' },
  { id:'5', businessName:'BlueSky Realty', industry:'Real Estate', location:'Los Angeles, CA', email:'info@blueskyrealty.com', phone:'+1 (818) 555-0071', website:'blueskyrealty.com', socials:{instagram:'blueskyrealty'}, detectedGaps:['no-video'], source:'scraped' },
  { id:'6', businessName:'Metro Auto Repair', industry:'Automotive', location:'Los Angeles, CA', email:'metro@autorepair.com', phone:'+1 (323) 555-0189', website:'', socials:{}, detectedGaps:['no-website','no-social'], source:'scraped' },
]

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

/* ─── skeleton card ─────────────────────────────── */
function SkeletonCard() {
  return (
    <div style={{ background:'#0D0D12', border:'1px solid rgba(255,255,255,0.06)', borderRadius:8, padding:20, height:180 }}>
      <div className="fo-shimmer" style={{ height:16, width:'60%', borderRadius:4, marginBottom:12 }} />
      <div className="fo-shimmer" style={{ height:12, width:'40%', borderRadius:4, marginBottom:16 }} />
      <div style={{ display:'flex', gap:6, marginBottom:16 }}>
        <div className="fo-shimmer" style={{ height:20, width:72, borderRadius:4 }} />
        <div className="fo-shimmer" style={{ height:20, width:60, borderRadius:4 }} />
      </div>
      <div className="fo-shimmer" style={{ height:12, width:'50%', borderRadius:4, marginBottom:8 }} />
      <div className="fo-shimmer" style={{ height:12, width:'45%', borderRadius:4 }} />
    </div>
  )
}

/* ─── result card ───────────────────────────────── */
function ResultCard({ client, index, saved, onSave }: {
  client: Client; index: number; saved: boolean; onSave: () => void
}) {
  return (
    <motion.div
      initial={{ opacity:0, y:16 }}
      animate={{ opacity:1, y:0 }}
      transition={{ duration:0.4, delay: index * 0.06, ease: EASE }}
      className="fo-result-card"
      style={{ background:'#0D0D12', border:'1px solid rgba(255,255,255,0.06)', borderRadius:8, padding:20, display:'flex', flexDirection:'column', gap:12 }}
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

      {/* Tags row */}
      <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
        {[client.industry, client.location].map(tag => (
          <span key={tag} style={{ fontSize:11, fontFamily:"'JetBrains Mono',monospace", color:'rgba(255,255,255,0.4)', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:4, padding:'2px 8px' }}>
            {tag}
          </span>
        ))}
      </div>

      {/* Gap badges */}
      {client.detectedGaps.length > 0 && (
        <motion.div
          initial={{ scale:0.92, opacity:0 }}
          animate={{ scale:1, opacity:1 }}
          transition={{ duration:0.2, delay: index * 0.06 + 0.15, ease: EASE }}
          style={{ display:'flex', gap:5, flexWrap:'wrap' }}
        >
          {client.detectedGaps.map(gap => {
            const g = GAP_LABELS[gap]
            if (!g) return null
            const Icon = g.icon
            return (
              <span key={gap} style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:10, fontWeight:700, letterSpacing:'0.08em', color:'#c30101', background:'rgba(196,20,37,0.1)', border:'1px solid rgba(196,20,37,0.3)', borderRadius:4, padding:'2px 7px' }}>
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

      {/* Action row */}
      <div style={{ display:'flex', gap:8, marginTop:'auto' }}>
        <button
          onClick={onSave}
          style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'8px 0', fontSize:11, fontWeight:600, letterSpacing:'-0.01em', color: saved ? '#00C9A7' : 'rgba(255,255,255,0.5)', background:'transparent', border:`1px solid ${saved ? 'rgba(0,201,167,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius:6, cursor:'pointer', transition:'all 0.15s' }}
        >
          {saved ? <><Check size={11} />Saved</> : 'Save Client'}
        </button>
        <button
          style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'8px 0', fontSize:11, fontWeight:600, letterSpacing:'-0.01em', color:'#fff', background:'#c30101', border:'none', borderRadius:6, cursor:'pointer', transition:'opacity 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.opacity='0.85')}
          onMouseLeave={e => (e.currentTarget.style.opacity='1')}
        >
          Pitch <ArrowRight size={11} />
        </button>
      </div>
    </motion.div>
  )
}

/* ─── page ──────────────────────────────────────── */
export default function DiscoverPage() {
  const [bizType,   setBizType]   = useState('')
  const [location,  setLocation]  = useState('')
  const [status,    setStatus]    = useState<'idle'|'loading'|'results'>('idle')
  const [results,   setResults]   = useState<Client[]>([])
  const [saved,     setSaved]     = useState<Set<string>>(new Set())
  const [pasteOpen, setPasteOpen] = useState(false)
  const [pasteText, setPasteText] = useState('')

  function handleSearch(e?: React.FormEvent) {
    e?.preventDefault()
    if (!bizType.trim() && !location.trim()) return
    setStatus('loading')
    setResults([])
    setTimeout(() => { setResults(MOCK); setStatus('results') }, 1500)
  }

  function fillPill(type: string, loc: string) {
    setBizType(type); setLocation(loc)
    setTimeout(() => handleSearch(), 50)
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
        @keyframes fo-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .fo-shimmer { background:linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.09) 50%,rgba(255,255,255,0.04) 75%); background-size:400% 100%; animation:fo-shimmer 1.5s infinite linear; }
        .fo-result-card { transition:border-color 0.2s,transform 0.2s; }
        .fo-result-card:hover { border-color:rgba(196,20,37,0.35)!important; transform:translateY(-2px); }
        .fo-pill { transition:border-color 0.15s,transform 0.15s,background 0.15s; cursor:pointer; }
        .fo-pill:hover { border-color:rgba(196,20,37,0.4)!important; background:rgba(196,20,37,0.05)!important; transform:scale(1.02); }
        .fo-input:focus { border-color:rgba(196,20,37,0.5)!important; }
        @media(max-width:900px){ .fo-grid3{grid-template-columns:repeat(2,1fr)!important} }
        @media(max-width:600px){ .fo-grid3{grid-template-columns:1fr!important} .fo-form-row{flex-direction:column!important} }
      `}</style>

      <div style={{ maxWidth:1200, margin:'0 auto' }}>

        {/* ── Header ───────────────────────────────── */}
        <motion.div
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:0.4, ease:EASE }}
          style={{ marginBottom:28 }}
        >
          <h1 style={{ fontSize:28, fontWeight:700, color:'#FAFAFA', letterSpacing:'-0.03em', margin:0, lineHeight:1.2 }}>
            Discover Clients
          </h1>
          <p style={{ marginTop:6, fontSize:14, color:'var(--color-text-secondary)', letterSpacing:'-0.01em' }}>
            Find businesses missing digital presence in any location.
          </p>
        </motion.div>

        {/* ── Search card ──────────────────────────── */}
        <motion.div
          initial={{ opacity:0, scale:0.98 }} animate={{ opacity:1, scale:1 }}
          transition={{ duration:0.3, delay:0.1, ease:EASE }}
          style={{ background:'#0D0D12', border:'1px solid rgba(255,255,255,0.06)', borderRadius:8, padding:24, marginBottom:20 }}
        >
          <form onSubmit={handleSearch}>
            <div className="fo-form-row" style={{ display:'flex', gap:12, marginBottom:16 }}>
              <input
                className="fo-input"
                style={inputStyle}
                placeholder="Business type — dentists, restaurants, lawyers..."
                value={bizType}
                onChange={e => setBizType(e.target.value)}
              />
              <input
                className="fo-input"
                style={inputStyle}
                placeholder="Location — Los Angeles, New York, Mumbai..."
                value={location}
                onChange={e => setLocation(e.target.value)}
              />
              <button
                type="submit"
                style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'12px 22px', background:'#c30101', color:'#fff', fontSize:14, fontWeight:600, letterSpacing:'-0.01em', border:'none', borderRadius:6, cursor:'pointer', whiteSpace:'nowrap', flexShrink:0, transition:'opacity 0.15s', boxShadow:'0 0 20px rgba(196,20,37,0.2)' }}
                onMouseEnter={e => (e.currentTarget.style.opacity='0.85')}
                onMouseLeave={e => (e.currentTarget.style.opacity='1')}
              >
                <Search size={14} />Search Clients
              </button>
            </div>

            {/* Quick pills */}
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {QUICK_PILLS.map(p => (
                <button
                  key={p.label} type="button"
                  className="fo-pill"
                  onClick={() => fillPill(p.type, p.location)}
                  style={{ fontSize:12, fontWeight:500, color:'rgba(255,255,255,0.5)', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:6, padding:'6px 14px', cursor:'pointer' }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </form>
        </motion.div>

        {/* ── Results area ─────────────────────────── */}
        {status === 'idle' && (
          <motion.div
            initial={{ opacity:0 }} animate={{ opacity:1 }}
            transition={{ duration:0.5, ease:EASE }}
            style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'80px 24px', gap:12, textAlign:'center' }}
          >
            <Search size={64} style={{ color:'rgba(255,255,255,0.06)' }} />
            <p style={{ fontSize:18, fontWeight:600, color:'rgba(255,255,255,0.15)', letterSpacing:'-0.02em' }}>
              Search for businesses above
            </p>
            <p style={{ fontSize:13, color:'var(--color-text-muted)' }}>
              We&apos;ll find real businesses with gaps you can fill
            </p>
          </motion.div>
        )}

        {status === 'loading' && (
          <div>
            <div style={{ height:20, width:200, borderRadius:4, marginBottom:16 }} className="fo-shimmer" />
            <div className="fo-grid3" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
              {Array.from({ length:6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </div>
        )}

        {status === 'results' && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.3 }}>
            <p style={{ fontSize:13, color:'var(--color-text-muted)', marginBottom:16, letterSpacing:'-0.01em' }}>
              Found <span style={{ color:'#FAFAFA', fontWeight:600 }}>{results.length}</span> businesses in {location || 'your search'}
            </p>
            <div className="fo-grid3" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
              {results.map((c, i) => (
                <ResultCard key={c.id} client={c} index={i} saved={saved.has(c.id)} onSave={() => toggleSave(c.id)} />
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Manual paste panel ───────────────────── */}
        <div style={{ marginTop:32 }}>
          <button
            onClick={() => setPasteOpen(o => !o)}
            style={{ display:'flex', alignItems:'center', gap:8, padding:'12px 20px', width:'100%', background:'#0D0D12', border:'1px solid rgba(255,255,255,0.06)', borderRadius:8, color:'rgba(255,255,255,0.4)', fontSize:13, fontWeight:500, cursor:'pointer', textAlign:'left', transition:'border-color 0.15s,color 0.15s' }}
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
                value={pasteText}
                onChange={e => setPasteText(e.target.value)}
                placeholder="Paste business info from Google Maps, Manta, or anywhere..."
                style={{ width:'100%', minHeight:120, background:'#060608', border:'1px solid rgba(255,255,255,0.06)', borderRadius:6, padding:'12px 16px', color:'#FAFAFA', fontSize:14, fontFamily:'Inter,sans-serif', resize:'vertical', outline:'none', transition:'border-color 0.15s', boxSizing:'border-box' }}
                onFocus={e => (e.currentTarget.style.borderColor='rgba(196,20,37,0.5)')}
                onBlur={e => (e.currentTarget.style.borderColor='rgba(255,255,255,0.06)')}
              />
              <div style={{ marginTop:12, display:'flex', gap:10 }}>
                <button
                  style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'10px 20px', background:'#c30101', color:'#fff', fontSize:13, fontWeight:600, border:'none', borderRadius:6, cursor:'pointer', transition:'opacity 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity='0.85')}
                  onMouseLeave={e => (e.currentTarget.style.opacity='1')}
                >
                  Parse with AI <ArrowRight size={13} />
                </button>
                {pasteText && (
                  <div style={{ flex:1, background:'rgba(196,20,37,0.06)', border:'1px solid rgba(196,20,37,0.2)', borderRadius:6, padding:'10px 16px', fontSize:12, color:'rgba(255,255,255,0.5)', fontFamily:"'JetBrains Mono',monospace" }}>
                    {pasteText.slice(0, 80)}…
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>

      </div>
    </>
  )
}
