'use client'

import { useEffect, useState } from 'react'
import { Search, MapPin } from 'lucide-react'

type DiscoverMode = 'coverage' | 'priority' | 'gold' | 'role-match'
type DiscoverSort = 'score' | 'newest' | 'contactability' | 'gold-first'

const PRESETS = ['Dentists', 'Salons', 'Gyms', 'Realtors', 'Cafes', 'Law Firms', 'Coaches', 'Agencies']
const BUSINESS_PLACEHOLDERS = ['dentists', 'plumbers', 'realtors', 'gyms', 'cafes', 'salons']
const LOCALITY_PLACEHOLDERS  = ['Brooklyn, NY', 'London, UK', 'Austin, TX', 'Sydney, AU', 'Berlin, DE']

export function DiscoverFilters({
  businessType, locality,
  onBusinessTypeChange, onLocalityChange,
  onSearch, loading,
  activePreset, onPreset,
  radius, onRadius,
  mode, onMode,
  sort, onSort,
  showIgnored, onShowIgnored,
}: {
  businessType: string
  locality: string
  onBusinessTypeChange: (v: string) => void
  onLocalityChange: (v: string) => void
  onSearch: () => void
  loading: boolean
  activePreset: string | null
  onPreset: (p: string) => void
  radius?: string
  onRadius?: (r: string) => void
  mode?: DiscoverMode
  onMode?: (m: DiscoverMode) => void
  sort: DiscoverSort
  onSort: (s: DiscoverSort) => void
  showIgnored: boolean
  onShowIgnored: (v: boolean) => void
  onToggleHelp?: () => void
}) {
  const [pidx, setPidx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setPidx(i => (i + 1) % BUSINESS_PLACEHOLDERS.length), 3000)
    return () => clearInterval(t)
  }, [])

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') onSearch()
  }

  const inputBase: React.CSSProperties = {
    width: '100%', height: 42,
    border: '1px solid var(--color-border)',
    borderRadius: 8,
    background: 'rgba(255,255,255,0.02)',
    color: 'var(--color-text-primary)',
    fontSize: 13,
    letterSpacing: '-0.01em',
    outline: 'none',
    transition: 'border-color 0.15s, background 0.15s',
  }

  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 10,
      padding: '16px 20px 14px',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      background: 'rgba(0,0,0,0.96)',
      backdropFilter: 'blur(16px)',
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      {/* Search row */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'stretch' }}>
        {/* Business type */}
        <div style={{ position: 'relative', flex: '1 1 0' }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
          <input
            value={businessType}
            onChange={e => onBusinessTypeChange(e.target.value)}
            onKeyDown={onKey}
            placeholder={`Business type, e.g. ${BUSINESS_PLACEHOLDERS[pidx]}`}
            style={{ ...inputBase, paddingLeft: 36, paddingRight: 14 }}
            onFocus={e => { e.target.style.borderColor = 'rgba(255,255,255,0.15)'; e.target.style.background = 'rgba(255,255,255,0.04)' }}
            onBlur={e  => { e.target.style.borderColor = 'var(--color-border)';     e.target.style.background = 'rgba(255,255,255,0.02)' }}
          />
        </div>

        {/* Locality + Radius */}
        <div style={{ position: 'relative', flex: '1 1 0', display: 'flex' }}>
          <MapPin size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
          <input
            value={locality}
            onChange={e => onLocalityChange(e.target.value)}
            onKeyDown={onKey}
            placeholder={`Location, e.g. ${LOCALITY_PLACEHOLDERS[pidx]}`}
            style={{ ...inputBase, flex: 1, paddingLeft: 36, paddingRight: 60, borderRadius: '8px 0 0 8px' }}
            onFocus={e => { e.target.style.borderColor = 'rgba(255,255,255,0.15)'; e.target.style.background = 'rgba(255,255,255,0.04)' }}
            onBlur={e  => { e.target.style.borderColor = 'var(--color-border)';     e.target.style.background = 'rgba(255,255,255,0.02)' }}
          />
          <div style={{
            position: 'absolute', right: 0, top: 0, bottom: 0,
            width: 50, borderLeft: '1px solid var(--color-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <select
              value={radius ?? '5'}
              onChange={e => onRadius?.(e.target.value)}
              style={{
                width: '100%', height: '100%', background: 'transparent', border: 'none', outline: 'none',
                color: '#fff', fontSize: 13, fontFamily: "'JetBrains Mono',monospace",
                cursor: 'pointer', appearance: 'none', textAlign: 'center', padding: '0 4px',
              }}
            >
              <option value="CITY">City</option>
              <option value="1">1mi</option>
              <option value="5">5mi</option>
              <option value="10">10mi</option>
              <option value="25">25mi</option>
              <option value="50">50mi</option>
            </select>
          </div>
        </div>

        {/* Scan button */}
        <button
          type="button"
          onClick={onSearch}
          disabled={loading}
          style={{
            height: 42, padding: '0 20px',
            borderRadius: 8,
            border: 'none',
            background: loading ? '#C93D42' : '#E5484D',
            color: '#FFFFFF',
            fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em',
            cursor: loading ? 'default' : 'pointer',
            whiteSpace: 'nowrap', flexShrink: 0,
            transition: 'background 0.15s, opacity 0.15s',
            opacity: loading ? 0.7 : 1,
          }}
          onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = '#C93D42' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#E5484D' }}
        >
          {loading ? 'Scanning…' : 'Scan →'}
        </button>
      </div>

      {/* Presets row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
        {PRESETS.map(p => {
          const active = activePreset === p
          return (
            <button key={p} type="button" onClick={() => onPreset(p)} style={{
              height: 26, padding: '0 10px',
              border: 'none',
              background: 'transparent',
              color: active ? '#FFFFFF' : 'rgba(255,255,255,0.4)',
              fontSize: 12, fontWeight: active ? 600 : 400, letterSpacing: '0.01em',
              cursor: 'pointer', whiteSpace: 'nowrap', transition: 'color 0.15s',
            }}>
              {p}
            </button>
          )
        })}
      </div>

      {/* Mode toggles + sort row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['coverage','priority','gold','role-match'] as const).map(m => {
            const labels: Record<string, string> = { coverage: 'COVERAGE', priority: 'PRIORITY', gold: 'GOLD', 'role-match': 'ROLE MATCH' }
            const active = (mode ?? 'coverage') === m
            return (
              <button key={m} type="button" onClick={() => onMode?.(m)} style={{
                height: 26, padding: '0 10px',
                border: 'none',
                background: 'transparent',
                color: active ? '#E5484D' : 'rgba(255,255,255,0.3)',
                fontSize: 10, fontFamily: "'JetBrains Mono',monospace", fontWeight: active ? 700 : 500, letterSpacing: '0.07em',
                cursor: 'pointer', whiteSpace: 'nowrap', transition: 'color 0.15s',
              }}>{labels[m]}</button>
            )
          })}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <select
            value={sort}
            onChange={e => onSort(e.target.value as DiscoverSort)}
            style={{
              height: 26, padding: '0 10px',
              border: 'none',
              background: 'transparent',
              color: 'rgba(255,255,255,0.5)',
              fontSize: 10, fontFamily: "'JetBrains Mono',monospace", outline: 'none', cursor: 'pointer',
            }}
          >
            <option value="score">SORT: SCORE</option>
            <option value="newest">SORT: NEWEST</option>
            <option value="contactability">SORT: CONTACT</option>
            <option value="gold-first">SORT: GOLD</option>
          </select>

          <button
            type="button"
            onClick={() => onShowIgnored(!showIgnored)}
            style={{
              height: 26, padding: '0 10px',
              border: 'none',
              background: 'transparent',
              color: showIgnored ? '#FFFFFF' : 'rgba(255,255,255,0.3)',
              fontSize: 10, fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
              transition: 'color 0.15s',
            }}
          >
            {showIgnored ? 'HIDE IGNORED' : 'SHOW IGNORED'}
          </button>
        </div>
      </div>
    </div>
  )
}
