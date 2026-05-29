'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, MapPin, Star, ExternalLink, AlertTriangle, Check, ArrowRight, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { ScoreRing } from './ScoreRing'
import './discover-row.css'

/* ── Brand SVGs ── */
const SVGS = {
  Instagram: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>,
  Twitter: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  Facebook: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>,
  LinkedIn: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>,
  WhatsApp: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>,
  Mail: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>,
  Phone: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>,
  Globe: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
}

export type LeadState = 'new'|'seen'|'saved'|'pitched'|'ignored'|'won'|'lost'|'responded'
export type IntelStatus = 'light_scan'|'prefetching'|'ready'|'stale'
export type SourceConfidence = 'verified'|'scraped'|'guessed'
export interface Client {
  id: string; businessName: string; industry: string; location: string
  email?: string; phone?: string; website?: string; websiteLive?: boolean
  metaDescription?: string
  socials: { instagram?: string; linkedin?: string; facebook?: string; twitter?: string; youtube?: string; whatsapp?: string }
  detectedGaps: string[]; source?: string; sourceOrigin?: string
  opportunityScore: number; rating?: number|null; reviewCount?: number|null
  googleMapsUrl?: string; category?: string; socialCount?: number
  emailConfidence?: 'confirmed'|'guessed'|'none'|null
  leadState?: LeadState; intelStatus?: IntelStatus; sourceConfidence?: SourceConfidence
}

/* ── Helpers ── */
function cleanHandleText(h: string): string {
  if (!h) return ''
  try { h = decodeURIComponent(h) } catch {}
  h = h.split(/[?#]/)[0].replace(/^@/, '').replace(/\d+/g, '')
  const BAD = new Set(['p','people','pages','profile','company','groups','home','posts','about','photos','watch','story','reel','reels','explore','tags','tv','share','status','intent'])
  const words = h.split(/[-_.]+/).filter(w => w.length > 0 && !BAD.has(w.toLowerCase()))
  return [...new Set(words.map(w => w.toLowerCase()))].join('')
}

function extractHandle(raw: string|undefined, platform: 'instagram'|'facebook'|'linkedin'|'twitter'): string {
  if (!raw) return ''
  const s = raw.trim()
  if (s.startsWith('@')) return s
  try {
    const url = new URL(s.startsWith('http') ? s : `https://${s}`)
    const parts = url.pathname.toLowerCase().replace(/^\/+|\/+$/g,'').split('/').filter(Boolean)
    if (platform === 'instagram') {
      if (!parts.length || ['p','reel','reels','stories','explore','tags','tv'].includes(parts[0])) return ''
      const h = cleanHandleText(parts[0]); return h ? `@${h}` : ''
    }
    if (platform === 'twitter') {
      if (!parts.length || ['intent','share','status'].includes(parts[0])) return ''
      const h = cleanHandleText(parts[0]); return h ? `@${h}` : ''
    }
    if (platform === 'facebook') {
      if (raw.includes('profile.php')) return ''
      let h = ''
      if (['pages','people','p','groups','watch','story'].includes(parts[0])) {
        h = parts[0]==='people' ? (parts[1]||'') : parts[0]==='pages' ? (parts[parts.length-1]||'') : ''
      } else { h = parts[0] || '' }
      return cleanHandleText(h)
    }
    if (platform === 'linkedin') {
      const inIdx = parts.indexOf('in'), coIdx = parts.indexOf('company')
      let h = inIdx>=0 ? parts[inIdx+1] : coIdx>=0 ? parts[coIdx+1] : parts[parts.length-1] || ''
      return cleanHandleText(h)
    }
  } catch {
    const h = cleanHandleText(s)
    if (!h) return ''
    return platform==='instagram'||platform==='twitter' ? `@${h}` : h
  }
  return ''
}

function cleanDomain(u: string|undefined) {
  if (!u) return ''
  try { return new URL(u.startsWith('http')?u:`https://${u}`).hostname.replace('www.','') } catch { return u }
}

function shortLocation(loc: string|undefined): string {
  if (!loc) return ''
  const p = loc.split(',').map(s=>s.trim()).filter(Boolean)
  if (p.length >= 3) return `${p[p.length-3]}, ${p[p.length-2]}`
  if (p.length === 2) return `${p[0]}, ${p[1]}`
  return p[0] ?? loc
}

const STATE_STYLES: Record<LeadState, { label: string; bg: string; text: string; border: string }> = {
  new:       { label: 'NEW',     bg: 'transparent', text: 'rgba(255,255,255,0.4)', border: 'transparent' },
  seen:      { label: 'SEEN',    bg: 'transparent', text: 'rgba(255,255,255,0.4)', border: 'transparent' },
  saved:     { label: 'SAVED',   bg: 'transparent', text: '#FFFFFF', border: 'transparent' },
  pitched:   { label: 'PITCHED', bg: 'transparent', text: '#FFFFFF', border: 'transparent' },
  ignored:   { label: 'IGNORED', bg: 'transparent', text: '#E5484D', border: 'transparent' },
  won:       { label: 'WON',     bg: 'transparent', text: '#FFFFFF', border: 'transparent' },
  lost:      { label: 'LOST',    bg: 'transparent', text: '#E5484D', border: 'transparent' },
  responded: { label: 'REPLIED', bg: 'transparent', text: '#FFFFFF', border: 'transparent' },
}

const GAP_STYLES: Record<string, { label: string; className: string }> = {
  'no-website': { label: 'NO WEBSITE', className: 'gap-red' },
  'no-social':  { label: 'WEAK SOCIAL', className: 'gap-amber' },
  'no-video':   { label: 'NO VIDEO',   className: 'gap-red' },
  'no-ssl':     { label: 'NO SSL',     className: 'gap-amber' },
  'no-email':   { label: 'NO EMAIL',   className: 'gap-red' },
}

/* extract a displayable WhatsApp number from raw value (URL or raw number) */
function extractWaDisplay(raw: string | undefined): string {
  if (!raw) return ''
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  // strip country code if long enough, show last 10 digits grouped
  const d = digits.length > 10 ? digits.slice(-10) : digits
  return `+${digits.slice(0, digits.length - 10)} ${d.slice(0,5)} ${d.slice(5)}`
}

function waHref(raw: string | undefined): string {
  if (!raw) return ''
  const digits = raw.replace(/\D/g, '')
  return digits ? `https://wa.me/${digits}` : ''
}


interface Props {
  client: Client; localLeadState?: LeadState; index: number; expanded: boolean; focused: boolean; selected: boolean
  onToggle: () => void; onIntel: () => void; onSave: () => void; onIgnore: () => void
  onPitch: () => void; onSimilar: () => void; onToggleSelect: () => void
  onHover: (client: Client) => void; onSeen: (client: Client) => void
  pitch?: { loading: boolean; content: string | null; error: string | null }
}

export function DiscoverRow({ client, localLeadState, index, expanded, focused, selected, onToggle, onIntel, onSave, onIgnore, onPitch, onSimilar, onToggleSelect, onHover, onSeen, pitch }: Props) {
  const rowRef = useRef<HTMLDivElement | null>(null)
  const hoverTmr = useRef<number | null>(null)

  const leadState = localLeadState ?? client.leadState ?? 'new'
  const stateStyle = STATE_STYLES[leadState]

  useEffect(() => {
    if (!rowRef.current) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) onSeen(client) }, { threshold: 0.5 })
    obs.observe(rowRef.current)
    return () => obs.disconnect()
  }, [client, onSeen])

  useEffect(() => { if (focused) rowRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }) }, [focused])

  const ig = client.socials?.instagram
  const fb = client.socials?.facebook
  const li = client.socials?.linkedin
  const tw = client.socials?.twitter
  const wa = client.socials?.whatsapp
  const igH = extractHandle(ig, 'instagram')
  const fbH = extractHandle(fb, 'facebook')
  const liH = extractHandle(li, 'linkedin')
  const twH = extractHandle(tw, 'twitter')
  const domainLabel = cleanDomain(client.website)

  const gapChips = client.detectedGaps.map(g => GAP_STYLES[g]).filter(Boolean).slice(0, 3)

  const isGold = (client.reviewCount ?? 0) >= 12 && client.detectedGaps.length >= 2 && client.opportunityScore >= 35
  const isGoodFit = (client.reviewCount ?? 0) >= 5 && client.opportunityScore >= 50

  const confDot: Record<string, string> = {
    verified: '#00C9A7', scraped: 'rgba(255,255,255,0.28)', inferred: '#F59E0B', guessed: 'rgba(229,72,77,0.6)'
  }
  const confColor = confDot[client.sourceConfidence ?? 'scraped'] ?? confDot.scraped
  const confLabel = (client.sourceConfidence ?? 'scraped').toUpperCase()

  const intelDot: Record<string, { color: string; label: string; pulse: boolean }> = {
    light_scan:  { color: 'rgba(255,255,255,0.25)', label: 'LIGHT SCAN', pulse: false },
    prefetching: { color: '#F59E0B', label: 'FETCHING', pulse: true },
    ready:       { color: '#00C9A7', label: 'INTEL READY', pulse: false },
    stale:       { color: '#F59E0B', label: 'STALE', pulse: false },
  }
  const intel = intelDot[client.intelStatus ?? 'light_scan'] ?? intelDot.light_scan

  return (
      <motion.div
        ref={rowRef}
        className={`dr-row${expanded ? ' is-expanded' : ''}${isGold ? ' gold-row' : ''}`}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(index * 0.015, 0.25), duration: 0.25 }}
        style={{
          background: expanded ? '#000000' : selected ? 'rgba(229,72,77,0.03)' : '#000000',
          position: 'relative',
        }}
        onMouseEnter={() => { hoverTmr.current = window.setTimeout(() => onHover(client), 600) }}
        onMouseLeave={() => { if (hoverTmr.current) { clearTimeout(hoverTmr.current); hoverTmr.current = null } }}
      >
        {/* ── Collapsed Row ── */}
        <div
          role="button" tabIndex={0} onClick={onToggle} onKeyDown={e => e.key === 'Enter' && onToggle()}
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', cursor: 'pointer' }}
        >
          {/* Checkbox */}
          <button
            type="button" aria-label={selected ? 'Deselect' : 'Select'}
            onClick={e => { e.stopPropagation(); onToggleSelect() }}
            className="dr-chk"
            style={{
              borderColor: selected ? 'var(--color-accent)' : 'rgba(255,255,255,0.15)',
              background: selected ? 'var(--color-accent)' : 'transparent',
              marginTop: 0,
            }}
          >
            <Check size={8} strokeWidth={3} color="#fff" style={{ opacity: selected ? 1 : 0 }} />
          </button>

          {/* Main info */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5, justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 260 }}>
                {client.businessName}
              </span>

              {/* Lead state — hidden for new/seen, visible for actioned states */}
              {leadState !== 'new' && leadState !== 'seen' && (
                <span style={{ padding: '1px 6px', fontSize: 9, fontFamily: "'JetBrains Mono',monospace", letterSpacing: '0.07em', textTransform: 'uppercase', color: stateStyle.text, flexShrink: 0 }}>
                  {stateStyle.label}
                </span>
              )}

              {/* Good fit — no box, just colored text */}
              {isGoodFit && (
                <span style={{ fontSize: 9, fontFamily: "'JetBrains Mono',monospace", color: 'rgba(16,185,129,0.75)', letterSpacing: '0.06em', flexShrink: 0 }}>✓ FIT</span>
              )}

              {/* Source confidence — dot + text, no border */}
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 9, fontFamily: "'JetBrains Mono',monospace", color: confColor, letterSpacing: '0.04em', opacity: 0.8, flexShrink: 0 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: confColor, display: 'inline-block', flexShrink: 0 }} />
                {confLabel}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {client.rating != null && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 600, color: 'rgb(251,191,36)', fontFamily: "'JetBrains Mono',monospace" }}>
                  <Star size={9} fill="currentColor" />
                  {client.rating.toFixed(1)}
                  <span style={{ color: 'rgba(251,191,36,0.4)', fontWeight: 400 }}>({client.reviewCount})</span>
                </span>
              )}

              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {client.category || client.industry}
              </span>

              {client.location && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, color: 'rgba(255,255,255,0.22)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  <MapPin size={9} style={{ flexShrink: 0 }} />{shortLocation(client.location)}
                </span>
              )}
            </div>
          </div>

          {/* Gap chips */}
          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
            {gapChips.map((c, i) => (
              <span key={i} className={`dr-gap ${c.className}`}>
                <AlertTriangle size={8} strokeWidth={2.5} />{c.label}
              </span>
            ))}
          </div>

          {/* Contacts inline */}
          <div style={{ display: 'flex', gap: 4, flexShrink: 0, alignItems: 'center' }} onClick={e => e.stopPropagation()}>
            <a href={client.website} target="_blank" rel="noreferrer"
              className={`dr-chip${!client.website ? ' missing' : ''}`}
              onClick={e => { if (!client.website) e.preventDefault() }}>
              <SVGS.Globe />{domainLabel || 'web'}
            </a>
            <a href={client.email ? `mailto:${client.email}` : undefined}
              className={`dr-chip${!client.email ? ' missing' : ''}`}>
              <SVGS.Mail />{client.email ? client.email.split('@')[0] : 'email'}
            </a>
            <span className={`dr-chip${!igH ? ' missing' : ''}`}>
              <SVGS.Instagram />{igH || 'ig'}
            </span>
          </div>

          {/* Intel status — dot + text, no box */}
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, fontFamily: "'JetBrains Mono',monospace", color: intel.color, letterSpacing: '0.05em', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
            <span className={intel.pulse ? 'dr-dot-pulse' : ''} style={{ width: 5, height: 5, borderRadius: '50%', background: intel.color, display: 'inline-block', flexShrink: 0 }} />
            {intel.label}
          </span>

          {/* Score + actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0, paddingLeft: 12 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.6)', marginRight: 4 }}>
              <ScoreRing score={client.opportunityScore} />
            </div>
            <button className={`dr-btn sec${client.intelStatus === 'ready' ? ' intel-ready' : ''}`} style={client.intelStatus === 'ready' ? { color: 'rgba(0,201,167,0.85)' } : {}} onClick={onIntel}>Intel</button>
            <button className={`dr-btn${leadState === 'saved' ? ' sec' : ' pri'}`} onClick={onSave}>
              {leadState === 'saved' ? 'Saved' : 'Save'}
            </button>
            {leadState === 'ignored'
              ? <button className="dr-btn sec" onClick={onIgnore}>Unignore</button>
              : <button className="dr-btn danger" onClick={onIgnore}>Ignore</button>}
            <button className="dr-btn sec" onClick={e => { e.stopPropagation(); onSimilar() }} style={{ color: 'rgba(255,255,255,0.25)' }}>~Similar</button>
            <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.18 }}
              style={{ color: 'rgba(255,255,255,0.3)', display: 'flex', cursor: 'pointer', marginLeft: 8 }} onClick={onToggle}>
              <ChevronDown size={14} />
            </motion.div>
          </div>
        </div>

        {/* ── Expanded Panel ── */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              style={{ overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,0.05)', background: '#000000' }}
            >
              <div style={{ padding: '20px 16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 28 }}>

                {/* Contact */}
                <div>
                  <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, letterSpacing: '0.1em', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Contact</div>
                  {([
                    { icon: SVGS.Phone, label: 'Phone', val: client.phone, href: client.phone ? `tel:${client.phone}` : undefined },
                    { icon: SVGS.Mail, label: 'Email', val: client.email, href: client.email ? `mailto:${client.email}` : undefined },
                    { icon: SVGS.Globe, label: 'Website', val: domainLabel || client.website, href: client.website },
                  ] as const).map(({ icon: Icon, label, val, href }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.025)' }}>
                      <span style={{ width: 60, fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>{label}</span>
                      {val && href ? (
                        <a href={href} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                          style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                          onMouseEnter={e => e.currentTarget.style.color='#fff'}
                          onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.6)'}>
                          {val}
                        </a>
                      ) : (
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.15)', fontStyle: 'italic' }}>—</span>
                      )}
                    </div>
                  ))}
                  {client.googleMapsUrl && (
                    <a href={client.googleMapsUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 8, fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: 'rgb(96,165,250)', textDecoration: 'none', letterSpacing: '0.03em' }}>
                      <ExternalLink size={9} /> Maps
                    </a>
                  )}
                </div>

                {/* Socials — always show all 5 */}
                <div>
                  <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, letterSpacing: '0.1em', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Socials</div>
                  {([
                    { icon: SVGS.Instagram, label: 'Instagram', val: igH,                  href: ig },
                    { icon: SVGS.Facebook,  label: 'Facebook',  val: fbH,                  href: fb },
                    { icon: SVGS.Twitter,   label: 'Twitter',   val: twH,                  href: tw },
                    { icon: SVGS.LinkedIn,  label: 'LinkedIn',  val: liH,                  href: li },
                    { icon: SVGS.WhatsApp,  label: 'WhatsApp',  val: extractWaDisplay(wa), href: waHref(wa) },
                  ] as const).map(({ icon: Icon, label, val, href }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.025)' }}>
                      <span style={{ width: 60, fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>{label}</span>
                      {val && href ? (
                        <a href={href} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                          style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                          onMouseEnter={e => e.currentTarget.style.color='#fff'}
                          onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.6)'}>
                          {val}
                        </a>
                      ) : (
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.15)', fontStyle: 'italic' }}>—</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Intel / Pitch */}
                <div>
                  <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, letterSpacing: '0.1em', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Intel</div>
                  
                  {client.metaDescription ? (
                    <p style={{ fontSize: 11, lineHeight: 1.55, color: 'rgba(255,255,255,0.4)', margin: '0 0 12px', fontStyle: 'italic' }}>
                      {client.metaDescription}
                    </p>
                  ) : (
                    <div style={{ background: 'rgba(0,201,167,0.05)', border: '1px solid rgba(0,201,167,0.1)', borderRadius: 4, padding: '10px 12px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Zap size={14} color="#00C9A7" />
                      <div>
                        <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: '#00C9A7', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Unlock Deep Intel</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Click the <strong>Intel</strong> button above to scrape this website and generate a comprehensive AI profile, read gaps, and evaluate readiness.</div>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 9, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase' }}>AI Pitch</span>
                    {pitch?.content && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(pitch.content!); toast.success('Copied') }}
                          style={{ fontSize: 9, fontFamily: "'JetBrains Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.3)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
                          Copy
                        </button>
                        <button onClick={e => { e.stopPropagation(); onPitch() }}
                          style={{ fontSize: 9, fontFamily: "'JetBrains Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(0,201,167,0.6)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
                          ↻ Regenerate
                        </button>
                      </div>
                    )}
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 3, padding: 12, minHeight: 72 }}>
                    {pitch?.loading ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <span style={{ fontSize: 11, color: 'rgba(0,201,167,0.95)', fontFamily: "'JetBrains Mono',monospace", fontWeight: 600 }}>⟳ Generating pitch with 4-step AI pipeline...</span>
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.03em' }}>Researching → Drafting → Critiquing → Perfecting</span>
                      </div>
                    ) : pitch?.error ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <span style={{ fontSize: 11, color: 'rgba(229,72,77,0.8)', lineHeight: 1.5 }}>
                          {pitch.error}
                        </span>
                        <button onClick={e => { e.stopPropagation(); onPitch() }}
                          className="dr-btn sec" style={{ gap: 6, alignSelf: 'flex-start' }}>
                          Retry <ArrowRight size={9} />
                        </button>
                      </div>
                    ) : pitch?.content ? (
                      <p style={{ fontSize: 11, lineHeight: 1.7, color: 'rgba(255,255,255,0.75)', whiteSpace: 'pre-wrap', margin: 0 }}>{pitch.content}</p>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 48 }}>
                        <button onClick={e => { e.stopPropagation(); onPitch() }}
                          className="dr-btn sec" style={{ gap: 6 }}>
                          Generate Pitch <ArrowRight size={9} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
  )
}

