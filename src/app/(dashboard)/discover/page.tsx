'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Globe, Share2, Video, Mail, Phone,
  AtSign, ExternalLink, Check, ArrowRight, Terminal,
  ChevronDown, Download, MapPin, ChevronRight, Briefcase, Activity, Target, Lock, Smartphone
} from 'lucide-react'
import { toast } from 'sonner'

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

const GAP_MAP: Record<string, { label: string; Icon: typeof Globe }> = {
  'no-website': { label: 'NO WEBSITE', Icon: Globe   },
  'no-social':  { label: 'NO SOCIAL',  Icon: Share2  },
  'no-video':   { label: 'NO VIDEO',   Icon: Video   },
  'no-ssl':     { label: 'NO SSL',     Icon: Lock    },
  'no-mobile':  { label: 'NO MOBILE',  Icon: Smartphone },
}

/* ─── page ───────────────────────────────────────── */
export default function DiscoverPage() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'idle'|'loading'|'results'|'error'>('idle')
  const [results, setResults] = useState<Client[]>([])
  const [errMsg, setErrMsg] = useState('')
  const [saved, setSaved] = useState<Set<string>>(new Set())
  const [savingId, setSavingId] = useState<string | null>(null)
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  
  // Pitches
  const [pitches, setPitches] = useState<Record<string, { loading: boolean; content: string | null; error: string | null }>>({})
  
  // Filters
  const [sort, setSort] = useState<SortKey>('score')
  const [gapFilters, setGapFilters] = useState<Set<string>>(new Set())
  const [minScore, setMinScore] = useState<number>(0)
  const [industryFilter, setIndustryFilter] = useState<string>('All')

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

  async function toggleSave(client: Client, e?: React.MouseEvent) {
    e?.stopPropagation()
    const id = client.id
    if (saved.has(id)) return // Already saved
    
    setSavingId(id)
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(client),
      })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to save')
      }
      setSaved(prev => { const n = new Set(prev); n.add(id); return n })
      toast.success(`${client.businessName} saved to clients`)
    } catch (err) {
      console.error('Save error:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to save client')
    } finally {
      setSavingId(null)
    }
  }

  async function generatePitch(client: Client, e?: React.MouseEvent) {
    e?.stopPropagation()
    const id = client.id
    
    setPitches(prev => ({ ...prev, [id]: { loading: true, content: null, error: null } }))
    
    try {
      const res = await fetch('/api/pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientData: client }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate pitch')
      
      setPitches(prev => ({ ...prev, [id]: { loading: false, content: data.pitch, error: null } }))
      toast.success('Pitch generated successfully')
    } catch (err) {
      console.error('Pitch error:', err)
      setPitches(prev => ({ ...prev, [id]: { loading: false, content: null, error: err instanceof Error ? err.message : 'Failed to generate' } }))
      toast.error('Failed to generate pitch')
    }
  }
  
  function toggleGapFilter(gap: string) {
    setGapFilters(prev => {
      const n = new Set(prev)
      if (n.has(gap)) n.delete(gap)
      else n.add(gap)
      return n
    })
  }

  // extract unique industries/categories
  const industries = useMemo(() => {
    const set = new Set<string>()
    results.forEach(r => {
      const c = r.category || r.industry
      if (c) set.add(c)
    })
    return ['All', ...Array.from(set).sort()]
  }, [results])

  const displayResults = useMemo(() => {
    let list = [...results]
    
    // gap filter: client must have ALL selected gaps
    if (gapFilters.size > 0) {
      list = list.filter(c => Array.from(gapFilters).every(g => c.detectedGaps.includes(g)))
    }
    
    // industry filter
    if (industryFilter !== 'All') {
      list = list.filter(c => (c.category || c.industry) === industryFilter)
    }
    
    // score filter
    if (minScore > 0) {
      list = list.filter(c => c.opportunityScore >= minScore)
    }

    if (sort === 'score')   list.sort((a, b) => b.opportunityScore - a.opportunityScore)
    else if (sort === 'reviews') list.sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0))
    else if (sort === 'alpha')   list.sort((a, b) => a.businessName.localeCompare(b.businessName))

    return list
  }, [results, sort, gapFilters, minScore, industryFilter])

  const highOppCount = displayResults.filter(c => c.opportunityScore >= 80).length

  return (
    <>
      <style>{`
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        .row-hover:hover { background: rgba(255,255,255,0.02); }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>
      
      <div style={{ display:'flex', height:'calc(100vh - 64px)', background:'#060608', fontFamily:'Inter, sans-serif' }}>
        
        {/* Left Panel */}
        <div style={{ width:280, flexShrink:0, borderRight:'1px solid rgba(255,255,255,0.08)', display:'flex', flexDirection:'column', background:'#09090B' }}>
          
          {/* Search Box */}
          <div style={{ padding:16, borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ position:'relative', display:'flex', alignItems:'center' }}>
              <Search size={14} style={{ position:'absolute', left:10, color:'rgba(255,255,255,0.4)' }} />
              <input 
                value={query} onChange={e => setQuery(e.target.value)} onKeyDown={handleKey}
                placeholder="dentists in NYC..."
                style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:6, padding:'8px 10px 8px 30px', fontSize:13, color:'#fff', outline:'none' }}
              />
            </div>
            <button onClick={() => runSearch(query)} disabled={status==='loading'}
              style={{ width:'100%', marginTop:8, background:status==='loading'?'rgba(229,72,77,0.5)':'#E5484D', color:'#fff', border:'none', padding:'8px', borderRadius:6, fontSize:12, fontWeight:600, cursor:status==='loading'?'default':'pointer' }}>
              {status === 'loading' ? 'Searching...' : 'Run Pipeline'}
            </button>
          </div>

          {/* Filters */}
          <div style={{ padding:16, flex:1, overflowY:'auto' }}>
            <div style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:16 }}>Pipeline Filters</div>
            
            <div style={{ marginBottom:24 }}>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.7)', marginBottom:8 }}>Required Gaps</div>
              {['no-website', 'no-social', 'no-video', 'no-ssl', 'no-mobile'].map(gap => (
                <label key={gap} style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'rgba(255,255,255,0.5)', marginBottom:8, cursor:'pointer' }}>
                  <input type="checkbox" checked={gapFilters.has(gap)} onChange={() => toggleGapFilter(gap)} style={{ accentColor:'#E5484D', cursor:'pointer' }} />
                  {GAP_MAP[gap].label}
                </label>
              ))}
            </div>

            <div style={{ marginBottom:24 }}>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.7)', marginBottom:8 }}>Industry</div>
              <select value={industryFilter} onChange={e => setIndustryFilter(e.target.value)}
                style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:4, padding:'6px 8px', fontSize:12, color:'rgba(255,255,255,0.8)', outline:'none' }}>
                {industries.map(ind => <option key={ind} value={ind} style={{background:'#0D0D12'}}>{ind}</option>)}
              </select>
            </div>

            <div style={{ marginBottom:24 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'rgba(255,255,255,0.7)', marginBottom:8 }}>
                <span>Min Opp Score</span>
                <span>{minScore}+</span>
              </div>
              <input type="range" min="0" max="100" step="5" value={minScore} onChange={e => setMinScore(parseInt(e.target.value))}
                style={{ width:'100%', accentColor:'#E5484D', cursor:'pointer' }} />
            </div>
          </div>

          {/* Stats */}
          <div style={{ padding:16, borderTop:'1px solid rgba(255,255,255,0.08)', background:'rgba(0,0,0,0.2)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
              <Activity size={14} color="rgba(255,255,255,0.4)" />
              <span style={{ fontSize:12, color:'rgba(255,255,255,0.8)' }}>{displayResults.length} leads in view</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <Target size={14} color="#E5484D" />
              <span style={{ fontSize:12, color:'rgba(255,255,255,0.6)' }}>{highOppCount} high priority</span>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
          
          {/* Top Bar */}
          <div style={{ height:48, borderBottom:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', padding:'0 24px', gap:16, background:'#060608', zIndex:10 }}>
            <span style={{ fontSize:13, fontWeight:500, color:'#FAFAFA' }}>Discovery Pipeline</span>
            <div style={{ width:1, height:16, background:'rgba(255,255,255,0.1)' }} />
            <select value={sort} onChange={e => setSort(e.target.value as SortKey)}
              style={{ background:'transparent', border:'none', color:'rgba(255,255,255,0.5)', fontSize:12, outline:'none', cursor:'pointer' }}>
              <option value="score" style={{background:'#0D0D12'}}>Sort: Score</option>
              <option value="reviews" style={{background:'#0D0D12'}}>Sort: Reviews</option>
              <option value="alpha" style={{background:'#0D0D12'}}>Sort: Alpha</option>
            </select>
          </div>

          {/* Table Container */}
          <div style={{ flex:1, overflow:'auto' }}>
            
            {status === 'idle' && (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', color:'rgba(255,255,255,0.3)' }}>
                <Terminal size={32} style={{ marginBottom:16, opacity:0.5 }} />
                <div style={{ fontSize:13, fontFamily:"'JetBrains Mono',monospace" }}>Awaiting pipeline query...</div>
              </div>
            )}

            {status === 'loading' && (
              <div style={{ padding:24 }}>
                <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:'rgba(255,255,255,0.4)', display:'flex', flexDirection:'column', gap:8 }}>
                  <div>&gt; Connecting to remote data sources...</div>
                  <div>&gt; Extracting maps data...</div>
                  <div>&gt; Checking website HEAD status...<span style={{ animation:'blink 1s step-end infinite' }}>_</span></div>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div style={{ padding:24, color:'#E5484D', fontSize:13, fontFamily:"'JetBrains Mono',monospace" }}>
                Error: {errMsg}
              </div>
            )}

            {status === 'results' && (
              <div style={{ minWidth: 800 }}>
                {/* Table Header */}
                <div style={{ display:'grid', gridTemplateColumns:'2fr 1.5fr 1fr 60px 1.5fr 100px', padding:'12px 24px', borderBottom:'1px solid rgba(255,255,255,0.08)', fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.05em', position:'sticky', top:0, background:'#060608', zIndex:5 }}>
                  <div>Business</div>
                  <div>Location</div>
                  <div>Gaps</div>
                  <div>Score</div>
                  <div>Contact</div>
                  <div style={{ textAlign:'right' }}>Actions</div>
                </div>

                {/* Rows */}
                {displayResults.length === 0 ? (
                  <div style={{ padding:24, textAlign:'center', color:'rgba(255,255,255,0.3)', fontSize:13 }}>No businesses match filters.</div>
                ) : (
                  displayResults.map(client => {
                    const isExpanded = expandedRow === client.id;
                    const sc = scoreLabel(client.opportunityScore)
                    
                    return (
                      <div key={client.id} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                        {/* Main Row */}
                        <div className="row-hover" onClick={() => setExpandedRow(isExpanded ? null : client.id)}
                          style={{ display:'grid', gridTemplateColumns:'2fr 1.5fr 1fr 60px 1.5fr 100px', padding:'12px 24px', alignItems:'center', cursor:'pointer', transition:'background 0.1s', background: isExpanded ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                          
                          {/* Business */}
                          <div style={{ display:'flex', alignItems:'center', gap:10, minWidth:0, paddingRight:16 }}>
                            <ChevronRight size={14} style={{ color:'rgba(255,255,255,0.3)', transform: isExpanded ? 'rotate(90deg)' : 'none', transition:'transform 0.2s', flexShrink:0 }} />
                            <div style={{ whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', fontSize:13, fontWeight:500, color:'#FAFAFA' }}>
                              {client.businessName}
                            </div>
                          </div>

                          {/* Location */}
                          <div style={{ whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', fontSize:12, color:'rgba(255,255,255,0.5)', paddingRight:16 }}>
                            {client.location}
                          </div>

                          {/* Gaps */}
                          <div style={{ display:'flex', gap:4, paddingRight:16 }}>
                            {client.detectedGaps.slice(0,2).map(g => (
                              <div key={g} title={GAP_MAP[g]?.label} style={{ width:16, height:16, borderRadius:4, background:'rgba(229,72,77,0.1)', display:'flex', alignItems:'center', justifyContent:'center', color:'#E5484D' }}>
                                {GAP_MAP[g] && (() => { const Icon = GAP_MAP[g].Icon; return <Icon size={10} />; })()}
                              </div>
                            ))}
                            {client.detectedGaps.length > 2 && (
                              <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', display:'flex', alignItems:'center' }}>+{client.detectedGaps.length-2}</div>
                            )}
                          </div>

                          {/* Score */}
                          <div style={{ fontSize:12, fontWeight:600, color:sc.color }}>
                            {client.opportunityScore}
                          </div>

                          {/* Contact quick */}
                          <div style={{ display:'flex', gap:10, color:'rgba(255,255,255,0.3)', paddingRight:16 }}>
                            {client.website && <Globe size={13} color={client.websiteLive === false ? '#E5484D' : client.websiteLive === true ? '#10B981' : 'currentColor'} />}
                            {client.email && <Mail size={13} />}
                            {client.phone && <Phone size={13} />}
                          </div>

                          {/* Actions */}
                          <div style={{ display:'flex', justifyContent:'flex-end' }}>
                            <button onClick={e => { e.stopPropagation(); setExpandedRow(client.id); generatePitch(client, e); }}
                              style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', padding:'4px 10px', borderRadius:4, fontSize:11, fontWeight:500, cursor:'pointer', transition:'background 0.15s' }}
                              onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.06)'}>
                              Pitch
                            </button>
                          </div>
                        </div>

                        {/* Expanded Section */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }} style={{ overflow:'hidden' }}>
                              <div style={{ padding:'20px 24px 24px 58px', background:'rgba(0,0,0,0.2)', borderTop:'1px solid rgba(255,255,255,0.02)', display:'flex', gap:48 }}>
                                
                                <div style={{ flex:1 }}>
                                  <div style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', marginBottom:12, letterSpacing:'0.05em' }}>Contact Data</div>
                                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                                    {client.website && (
                                      <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:12 }}>
                                        <Globe size={13} color="rgba(255,255,255,0.4)" />
                                        <a href={client.website} target="_blank" rel="noreferrer" style={{ color:'#60A5FA', textDecoration:'none' }}>{client.website}</a>
                                        {client.websiteLive === false && <span style={{ fontSize:10, color:'#E5484D', background:'rgba(229,72,77,0.1)', padding:'2px 6px', borderRadius:4 }}>DEAD LINK</span>}
                                      </div>
                                    )}
                                    {client.email && (
                                      <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:12 }}>
                                        <Mail size={13} color="rgba(255,255,255,0.4)" />
                                        <a href={`mailto:${client.email}`} style={{ color:'#FAFAFA', textDecoration:'none' }}>{client.email}</a>
                                      </div>
                                    )}
                                    {client.phone && (
                                      <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:12 }}>
                                        <Phone size={13} color="rgba(255,255,255,0.4)" />
                                        <a href={`tel:${client.phone}`} style={{ color:'#FAFAFA', textDecoration:'none' }}>{client.phone}</a>
                                      </div>
                                    )}
                                    {client.location && (
                                      <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:12 }}>
                                        <MapPin size={13} color="rgba(255,255,255,0.4)" />
                                        <span style={{ color:'rgba(255,255,255,0.7)' }}>{client.location}</span>
                                        {client.googleMapsUrl && <a href={client.googleMapsUrl} target="_blank" rel="noreferrer" style={{ color:'#60A5FA', fontSize:11, marginLeft:4, textDecoration:'none' }}>Map ↗</a>}
                                      </div>
                                    )}
                                  </div>

                                  {/* Socials */}
                                  {(client.socials.instagram || client.socials.facebook || client.socials.linkedin) && (
                                    <div style={{ marginTop:16, display:'flex', gap:16 }}>
                                      {client.socials.instagram && <a href={client.socials.instagram} target="_blank" rel="noreferrer" style={{ fontSize:12, color:'#FAFAFA', display:'flex', alignItems:'center', gap:6, textDecoration:'none' }}><AtSign size={13} color="#E5484D" /> IG</a>}
                                      {client.socials.linkedin && <a href={client.socials.linkedin} target="_blank" rel="noreferrer" style={{ fontSize:12, color:'#FAFAFA', display:'flex', alignItems:'center', gap:6, textDecoration:'none' }}><ExternalLink size={13} color="#3B82F6" /> IN</a>}
                                      {client.socials.facebook && <a href={client.socials.facebook} target="_blank" rel="noreferrer" style={{ fontSize:12, color:'#FAFAFA', display:'flex', alignItems:'center', gap:6, textDecoration:'none' }}><Share2 size={13} color="#3B82F6" /> FB</a>}
                                    </div>
                                  )}
                                </div>

                                <div style={{ flex:1 }}>
                                  <div style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', marginBottom:12, letterSpacing:'0.05em' }}>Insights</div>
                                  {client.metaDescription && (
                                    <div style={{ fontSize:12, color:'rgba(255,255,255,0.6)', lineHeight:1.5, marginBottom:16, fontStyle:'italic' }}>
                                      "{client.metaDescription}"
                                    </div>
                                  )}
                                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                                    {client.detectedGaps.map(gap => (
                                      <span key={gap} style={{ fontSize:10, color:'#E5484D', border:'1px solid rgba(229,72,77,0.3)', background:'rgba(229,72,77,0.05)', padding:'2px 6px', borderRadius:4 }}>
                                        {GAP_MAP[gap]?.label || gap}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                <div style={{ width:180, display:'flex', flexDirection:'column', gap:10 }}>
                                  <button onClick={(e) => generatePitch(client, e)} disabled={pitches[client.id]?.loading} style={{ width:'100%', padding:'10px', background:'#E5484D', color:'#fff', border:'none', borderRadius:6, fontSize:12, fontWeight:600, cursor:pitches[client.id]?.loading ? 'default' : 'pointer', transition:'opacity 0.15s', opacity: pitches[client.id]?.loading ? 0.7 : 1 }} onMouseEnter={e=>e.currentTarget.style.opacity='0.85'} onMouseLeave={e=>{if(!pitches[client.id]?.loading)e.currentTarget.style.opacity='1'}}>
                                    {pitches[client.id]?.loading ? 'Generating...' : 'Generate Pitch'}
                                  </button>
                                  <button onClick={e => toggleSave(client, e)} disabled={savingId === client.id || saved.has(client.id)} style={{ width:'100%', padding:'10px', background:'transparent', border:`1px solid ${saved.has(client.id) ? '#10B981' : 'rgba(255,255,255,0.2)'}`, color:saved.has(client.id) ? '#10B981' : '#fff', borderRadius:6, fontSize:12, fontWeight:500, cursor:(savingId === client.id || saved.has(client.id)) ? 'default' : 'pointer', transition:'all 0.15s', opacity: savingId === client.id ? 0.5 : 1 }} onMouseEnter={e=>{if(!saved.has(client.id) && savingId !== client.id)e.currentTarget.style.borderColor='rgba(255,255,255,0.4)'}} onMouseLeave={e=>{if(!saved.has(client.id) && savingId !== client.id)e.currentTarget.style.borderColor='rgba(255,255,255,0.2)'}}>
                                    {savingId === client.id ? 'Saving...' : saved.has(client.id) ? 'Saved to Clients' : 'Save to Clients'}
                                  </button>
                                </div>

                              </div>
                              
                              {/* Pitch Display Area */}
                              {pitches[client.id] && (pitches[client.id].content || pitches[client.id].error) && (
                                <div style={{ padding:'0 24px 24px 58px', background:'rgba(0,0,0,0.2)' }}>
                                  <div style={{ padding: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8 }}>
                                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                                      <div style={{ fontSize:11, fontWeight:600, color:'#E5484D', textTransform:'uppercase', letterSpacing:'0.05em' }}>AI Generated Pitch</div>
                                      {pitches[client.id].content && (
                                        <button onClick={() => { navigator.clipboard.writeText(pitches[client.id].content!); toast.success('Pitch copied to clipboard'); }} style={{ background:'transparent', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.6)', padding:'4px 8px', borderRadius:4, fontSize:10, cursor:'pointer' }}>
                                          Copy text
                                        </button>
                                      )}
                                    </div>
                                    {pitches[client.id].error ? (
                                      <div style={{ fontSize: 12, color: '#E5484D' }}>{pitches[client.id].error}</div>
                                    ) : (
                                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                                        {pitches[client.id].content}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
