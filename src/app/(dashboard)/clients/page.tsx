/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Globe, Share2, Video, Mail, Phone,
  AtSign, ExternalLink, Check, ArrowRight, Terminal,
  ChevronDown, Download, MapPin, ChevronRight, Briefcase, Activity, Target, Lock, Smartphone, Trash2
} from 'lucide-react'
import { toast } from 'sonner'

interface Client {
  _id: string
  businessName: string
  industry: string
  location: string
  email: string
  phone: string
  website: string
  socials?: { instagram?: string; linkedin?: string; facebook?: string }
  detectedGaps: string[]
  source: string
  status: string
  createdAt: string
}

const GAP_MAP: Record<string, { label: string; Icon: typeof Globe }> = {
  'no-website': { label: 'NO WEBSITE', Icon: Globe   },
  'no-social':  { label: 'NO SOCIAL',  Icon: Share2  },
  'no-video':   { label: 'NO VIDEO',   Icon: Video   },
  'no-ssl':     { label: 'NO SSL',     Icon: Lock    },
  'no-mobile':  { label: 'NO MOBILE',  Icon: Smartphone },
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [pitches, setPitches] = useState<Record<string, { loading: boolean; content: string | null; error: string | null }>>({})

  useEffect(() => {
    fetchClients()
  }, [])

  async function fetchClients() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/clients')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch clients')
      setClients(data.clients || [])
    } catch (err: any) {
      setError(err.message)
      toast.error('Failed to load clients')
    } finally {
      setLoading(false)
    }
  }

  async function removeClient(id: string, e?: React.MouseEvent) {
    e?.stopPropagation()
    if (!confirm('Are you sure you want to remove this client?')) return
    
    setRemovingId(id)
    try {
      const res = await fetch(`/api/clients?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setClients(prev => prev.filter(c => c._id !== id))
      toast.success('Client removed')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setRemovingId(null)
    }
  }

  async function generatePitch(client: Client, e?: React.MouseEvent) {
    e?.stopPropagation()
    const id = client._id
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
    } catch (err: any) {
      setPitches(prev => ({ ...prev, [id]: { loading: false, content: null, error: err.message || 'Failed' } }))
      toast.error('Failed to generate pitch')
    }
  }

  const filteredClients = clients.filter(c => 
    c.businessName.toLowerCase().includes(query.toLowerCase()) || 
    c.location?.toLowerCase().includes(query.toLowerCase()) ||
    c.industry?.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <>
      <style>{`
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        .row-hover:hover { background: rgba(255,255,255,0.02); }
      `}</style>
      
      <div style={{ display:'flex', height:'calc(100vh - 64px)', background:'#060608', fontFamily:'Inter, sans-serif' }}>
        
        {/* Left Panel */}
        <div style={{ width:280, flexShrink:0, borderRight:'1px solid rgba(255,255,255,0.08)', display:'flex', flexDirection:'column', background:'#09090B' }}>
          <div style={{ padding:16, borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ position:'relative', display:'flex', alignItems:'center' }}>
              <Search size={14} style={{ position:'absolute', left:10, color:'rgba(255,255,255,0.4)' }} />
              <input 
                value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Search saved clients..."
                style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:6, padding:'8px 10px 8px 30px', fontSize:13, color:'#fff', outline:'none' }}
              />
            </div>
          </div>
          
          <div style={{ padding:16, flex:1, overflowY:'auto' }}>
            <div style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:16 }}>Overview</div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
              <Briefcase size={14} color="rgba(255,255,255,0.4)" />
              <span style={{ fontSize:13, color:'rgba(255,255,255,0.8)' }}>Total Leads: {clients.length}</span>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
          
          {/* Top Bar */}
          <div style={{ height:48, borderBottom:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', padding:'0 24px', gap:16, background:'#060608', zIndex:10 }}>
            <span style={{ fontSize:13, fontWeight:500, color:'#FAFAFA' }}>Saved Clients</span>
          </div>

          {/* Table Container */}
          <div style={{ flex:1, overflow:'auto' }}>
            {loading ? (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', color:'rgba(255,255,255,0.3)' }}>
                <Terminal size={32} style={{ marginBottom:16, opacity:0.5 }} />
                <div style={{ fontSize:13, fontFamily:"'JetBrains Mono',monospace" }}>Loading client data...</div>
              </div>
            ) : error ? (
              <div style={{ padding:24, color:'#E5484D', fontSize:13, fontFamily:"'JetBrains Mono',monospace" }}>
                Error: {error}
              </div>
            ) : (
              <div style={{ minWidth: 800 }}>
                {/* Table Header */}
                <div style={{ display:'grid', gridTemplateColumns:'2.5fr 1.5fr 1.5fr 1fr 100px', padding:'12px 24px', borderBottom:'1px solid rgba(255,255,255,0.08)', fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.05em', position:'sticky', top:0, background:'#060608', zIndex:5 }}>
                  <div>Business</div>
                  <div>Industry</div>
                  <div>Location</div>
                  <div>Status</div>
                  <div style={{ textAlign:'right' }}>Date</div>
                </div>

                {/* Rows */}
                {filteredClients.length === 0 ? (
                  <div style={{ padding:24, textAlign:'center', color:'rgba(255,255,255,0.3)', fontSize:13 }}>No clients found.</div>
                ) : (
                  filteredClients.map(client => {
                    const isExpanded = expandedRow === client._id;
                    
                    return (
                      <div key={client._id} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                        {/* Main Row */}
                        <div className="row-hover" onClick={() => setExpandedRow(isExpanded ? null : client._id)}
                          style={{ display:'grid', gridTemplateColumns:'2.5fr 1.5fr 1.5fr 1fr 100px', padding:'12px 24px', alignItems:'center', cursor:'pointer', transition:'background 0.1s', background: isExpanded ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                          
                          {/* Business */}
                          <div style={{ display:'flex', alignItems:'center', gap:10, minWidth:0, paddingRight:16 }}>
                            <ChevronRight size={14} style={{ color:'rgba(255,255,255,0.3)', transform: isExpanded ? 'rotate(90deg)' : 'none', transition:'transform 0.2s', flexShrink:0 }} />
                            <div style={{ whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', fontSize:13, fontWeight:500, color:'#FAFAFA' }}>
                              {client.businessName}
                            </div>
                          </div>

                          {/* Industry */}
                          <div style={{ whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', fontSize:12, color:'rgba(255,255,255,0.5)', paddingRight:16 }}>
                            {client.industry || '—'}
                          </div>

                          {/* Location */}
                          <div style={{ whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', fontSize:12, color:'rgba(255,255,255,0.5)', paddingRight:16 }}>
                            {client.location || '—'}
                          </div>

                          {/* Status */}
                          <div style={{ paddingRight:16 }}>
                             <span style={{ fontSize:10, color:'#10B981', border:'1px solid rgba(16,185,129,0.3)', background:'rgba(16,185,129,0.05)', padding:'2px 6px', borderRadius:4, textTransform:'uppercase' }}>
                              {client.status || 'SAVED'}
                            </span>
                          </div>

                          {/* Date */}
                          <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', textAlign:'right' }}>
                            {new Date(client.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
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
                                        <a href={client.website} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()} style={{ color:'#60A5FA', textDecoration:'none' }}>{client.website}</a>
                                      </div>
                                    )}
                                    {client.email && (
                                      <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:12 }}>
                                        <Mail size={13} color="rgba(255,255,255,0.4)" />
                                        <a href={`mailto:${client.email}`} onClick={e=>e.stopPropagation()} style={{ color:'#FAFAFA', textDecoration:'none' }}>{client.email}</a>
                                      </div>
                                    )}
                                    {client.phone && (
                                      <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:12 }}>
                                        <Phone size={13} color="rgba(255,255,255,0.4)" />
                                        <a href={`tel:${client.phone}`} onClick={e=>e.stopPropagation()} style={{ color:'#FAFAFA', textDecoration:'none' }}>{client.phone}</a>
                                      </div>
                                    )}
                                  </div>

                                  {/* Socials */}
                                  {(client.socials?.instagram || client.socials?.facebook || client.socials?.linkedin) && (
                                    <div style={{ marginTop:16, display:'flex', gap:16 }}>
                                      {client.socials?.instagram && <a href={client.socials.instagram} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()} style={{ fontSize:12, color:'#FAFAFA', display:'flex', alignItems:'center', gap:6, textDecoration:'none' }}><AtSign size={13} color="#E5484D" /> IG</a>}
                                      {client.socials?.linkedin && <a href={client.socials.linkedin} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()} style={{ fontSize:12, color:'#FAFAFA', display:'flex', alignItems:'center', gap:6, textDecoration:'none' }}><ExternalLink size={13} color="#3B82F6" /> IN</a>}
                                      {client.socials?.facebook && <a href={client.socials.facebook} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()} style={{ fontSize:12, color:'#FAFAFA', display:'flex', alignItems:'center', gap:6, textDecoration:'none' }}><Share2 size={13} color="#3B82F6" /> FB</a>}
                                    </div>
                                  )}
                                </div>

                                <div style={{ flex:1 }}>
                                  <div style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', marginBottom:12, letterSpacing:'0.05em' }}>Insights</div>
                                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                                    {client.detectedGaps && client.detectedGaps.length > 0 ? client.detectedGaps.map(gap => (
                                      <span key={gap} style={{ fontSize:10, color:'#E5484D', border:'1px solid rgba(229,72,77,0.3)', background:'rgba(229,72,77,0.05)', padding:'2px 6px', borderRadius:4 }}>
                                        {GAP_MAP[gap]?.label || gap}
                                      </span>
                                    )) : (
                                      <span style={{ fontSize:12, color:'rgba(255,255,255,0.4)' }}>No gaps recorded</span>
                                    )}
                                  </div>
                                </div>
                                
                                <div style={{ width:180, display:'flex', flexDirection:'column', gap:10 }}>
                                  <button onClick={(e) => generatePitch(client, e)} disabled={pitches[client._id]?.loading} style={{ width:'100%', padding:'10px', background:'#E5484D', color:'#fff', border:'none', borderRadius:6, fontSize:12, fontWeight:600, cursor:pitches[client._id]?.loading ? 'default' : 'pointer', transition:'opacity 0.15s', opacity: pitches[client._id]?.loading ? 0.7 : 1 }} onMouseEnter={e=>e.currentTarget.style.opacity='0.85'} onMouseLeave={e=>{if(!pitches[client._id]?.loading)e.currentTarget.style.opacity='1'}}>
                                    {pitches[client._id]?.loading ? 'Generating...' : 'Generate Pitch'}
                                  </button>
                                  <button onClick={(e) => removeClient(client._id, e)} disabled={removingId === client._id} style={{ width:'100%', padding:'10px', background:'transparent', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.6)', borderRadius:6, fontSize:12, fontWeight:500, cursor:removingId === client._id ? 'default' : 'pointer', transition:'all 0.15s', display:'flex', justifyContent:'center', alignItems:'center', gap:8, opacity: removingId === client._id ? 0.5 : 1 }} onMouseEnter={e=>{if(removingId !== client._id){e.currentTarget.style.borderColor='rgba(229,72,77,0.4)'; e.currentTarget.style.color='#E5484D'}}} onMouseLeave={e=>{if(removingId !== client._id){e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'; e.currentTarget.style.color='rgba(255,255,255,0.6)'}}}>
                                    <Trash2 size={14} /> {removingId === client._id ? 'Removing...' : 'Remove'}
                                  </button>
                                </div>
                              </div>
                              
                              {/* Pitch Display Area */}
                              {pitches[client._id] && (pitches[client._id].content || pitches[client._id].error) && (
                                <div style={{ padding:'0 24px 24px 58px', background:'rgba(0,0,0,0.2)' }}>
                                  <div style={{ padding: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8 }}>
                                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                                      <div style={{ fontSize:11, fontWeight:600, color:'#E5484D', textTransform:'uppercase', letterSpacing:'0.05em' }}>AI Generated Pitch</div>
                                      {pitches[client._id].content && (
                                        <button onClick={() => { navigator.clipboard.writeText(pitches[client._id].content!); toast.success('Pitch copied to clipboard'); }} style={{ background:'transparent', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.6)', padding:'4px 8px', borderRadius:4, fontSize:10, cursor:'pointer' }}>
                                          Copy text
                                        </button>
                                      )}
                                    </div>
                                    {pitches[client._id].error ? (
                                      <div style={{ fontSize: 12, color: '#E5484D' }}>{pitches[client._id].error}</div>
                                    ) : (
                                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                                        {pitches[client._id].content}
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
