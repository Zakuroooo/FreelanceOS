'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, X } from 'lucide-react'
import { toast } from 'sonner'

import { BulkActionBar } from '@/components/discover/BulkActionBar'
import { DiscoverEmpty } from '@/components/discover/DiscoverEmpty'
import { DiscoverFilters } from '@/components/discover/DiscoverFilters'
import { DiscoverLoading } from '@/components/discover/DiscoverLoading'
import {
  DiscoverRow,
  type Client,
  type IntelStatus,
  type LeadState,
} from '@/components/discover/DiscoverRow'
import { IntelDrawer } from '@/components/discover/IntelDrawer'
import { useDiscoverKeyboard } from '@/hooks/useDiscoverKeyboard'
import { getContactability } from '@/lib/leads'
import PitchChatModal, { type PitchChatResult } from '@/components/discover/PitchChatModal'

type Status = 'idle' | 'loading' | 'results' | 'error'
type DiscoverMode = 'coverage' | 'priority' | 'gold' | 'role-match'
type DiscoverSort = 'score' | 'newest' | 'contactability' | 'gold-first'

interface PitchAgentMeta {
  grounded?: boolean
  audited?: boolean
  memoryHits?: number
}

interface PitchState {
  loading: boolean
  content: string | null
  error: string | null
  agent?: PitchAgentMeta
}

interface CacheMetrics {
  cacheHits: number
  apiCalls: number
  savedCredits: number
}

const SEARCH_STORAGE_KEY = 'freelanceos_discover_state_v2'

// Hard ceiling so seenIds can't grow unboundedly — it ships to the server with
// every search, and used to be persisted forever.
const SEEN_IDS_CAP = 500

function isHiddenGold(client: Client) {
  return (client.reviewCount ?? 0) >= 12 && client.detectedGaps.length >= 2 && client.opportunityScore >= 35
}

function normalizeClient(client: Client): Client {
  return {
    ...client,
    leadState: client.leadState ?? 'new',
    intelStatus: client.intelStatus ?? 'light_scan',
    sourceConfidence: client.sourceConfidence ?? 'scraped',
    sourceOrigin: client.sourceOrigin ?? client.source ?? 'scraped',
  }
}

export default function DiscoverPage() {
  const [businessType, setBusinessType] = useState('')
  const [locality, setLocality] = useState('')
  const [activePreset, setActivePreset] = useState<string | null>(null)
  const [radius, setRadius] = useState('CITY')
  const [mode, setMode] = useState<DiscoverMode>('coverage')
  const [sort, setSort] = useState<DiscoverSort>('score')
  const [showIgnored, setShowIgnored] = useState(false)

  const [status, setStatus] = useState<Status>('idle')
  const [results, setResults] = useState<Client[]>([])
  const [errMsg, setErrMsg] = useState('')
  const [errDetails, setErrDetails] = useState<string[]>([])
  const [dataSource, setDataSource] = useState<string | undefined>(undefined)
  const [offset, setOffset] = useState(0)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [cacheMetrics, setCacheMetrics] = useState<CacheMetrics | null>(null)

  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [intelDrawerClient, setIntelDrawerClient] = useState<Client | null>(null)
  const [chatClient, setChatClient] = useState<Client | null>(null)
  const [focusedRowId, setFocusedRowId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [saved, setSaved] = useState<Set<string>>(new Set())
  const [savingId, setSavingId] = useState<string | null>(null)
  const [pitches, setPitches] = useState<Record<string, PitchState>>({})
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set())
  const [leadStates, setLeadStates] = useState<Record<string, LeadState>>({})
  const [helpOpen, setHelpOpen] = useState(false)
  const [lastQuery, setLastQuery] = useState('')
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SEARCH_STORAGE_KEY)
      if (!stored) {
        setIsLoaded(true)
        return
      }

      const parsed = JSON.parse(stored) as {
        businessType?: string
        locality?: string
        activePreset?: string | null
        radius?: string
        mode?: DiscoverMode
        sort?: DiscoverSort
        showIgnored?: boolean
        status?: Status
        results?: Client[]
        errMsg?: string
        errDetails?: string[]
        dataSource?: string
        offset?: number
        cacheMetrics?: CacheMetrics | null
        expandedRow?: string | null
        focusedRowId?: string | null
        selectedIds?: string[]
        saved?: string[]
        pitches?: Record<string, PitchState>
        seenIds?: string[]
        leadStates?: Record<string, LeadState>
        lastQuery?: string
      }

      setBusinessType(parsed.businessType ?? '')
      setLocality(parsed.locality ?? '')
      setActivePreset(parsed.activePreset ?? null)
      setRadius(parsed.radius ?? 'CITY')
      setMode(parsed.mode ?? 'coverage')
      setSort(parsed.sort ?? 'score')
      setShowIgnored(parsed.showIgnored ?? false)
      setStatus(parsed.status && parsed.status !== 'loading' ? parsed.status : 'idle')
      setResults((parsed.results ?? []).map(normalizeClient))
      setErrMsg(parsed.errMsg ?? '')
      setErrDetails(parsed.errDetails ?? [])
      setDataSource(parsed.dataSource)
      setOffset(parsed.offset ?? 0)
      setCacheMetrics(parsed.cacheMetrics ?? null)
      setExpandedRow(parsed.expandedRow ?? null)
      setFocusedRowId(parsed.focusedRowId ?? null)
      setSelectedIds(new Set(parsed.selectedIds ?? []))
      setSaved(new Set(parsed.saved ?? []))
      setPitches(parsed.pitches ?? {})
      setSeenIds(new Set(parsed.seenIds ?? []))
      setLeadStates(parsed.leadStates ?? {})
      setLastQuery(parsed.lastQuery ?? '')
    } catch {
      // ignore corrupt local state and start clean
    } finally {
      setIsLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (!isLoaded) return
    const payload = {
      businessType,
      locality,
      activePreset,
      radius,
      mode,
      sort,
      showIgnored,
      status: status === 'loading' ? 'idle' : status,
      results,
      errMsg,
      errDetails,
      dataSource,
      offset,
      cacheMetrics,
      expandedRow,
      focusedRowId,
      selectedIds: Array.from(selectedIds),
      saved: Array.from(saved),
      pitches,
      seenIds: Array.from(seenIds),
      leadStates,
      lastQuery,
    }
    // A few hundred leads plus full pitch bodies blew past the ~5 MB quota and the
    // throw inside this effect broke rendering. Shed heavy data progressively until
    // the write fits; filters alone are still worth persisting.
    const attempts = [
      payload,
      { ...payload, pitches: {} },
      { ...payload, pitches: {}, results: [] },
    ]
    for (const attempt of attempts) {
      try {
        localStorage.setItem(SEARCH_STORAGE_KEY, JSON.stringify(attempt))
        break
      } catch {
        // try the next, lighter shape — final failure is safe to ignore
      }
    }
  }, [
    activePreset,
    businessType,
    cacheMetrics,
    dataSource,
    errDetails,
    errMsg,
    expandedRow,
    focusedRowId,
    isLoaded,
    lastQuery,
    leadStates,
    locality,
    mode,
    offset,
    pitches,
    radius,
    results,
    saved,
    seenIds,
    selectedIds,
    showIgnored,
    sort,
    status,
  ])

  const orderedIds = useMemo(() => results.map((client) => client.id), [results])

  const runSearch = useCallback(
    async (loadMore = false) => {
      const normalizedBusinessType = businessType.trim()
      const normalizedLocality = locality.trim()
      const query = normalizedBusinessType && normalizedLocality
        ? `${normalizedBusinessType} in ${normalizedLocality}`
        : normalizedBusinessType || normalizedLocality || lastQuery

      if (!query.trim()) {
        toast.error('Enter a business type and locality to scan')
        return
      }

      const nextOffset = loadMore ? offset + 15 : 0
      if (loadMore) {
        setIsLoadingMore(true)
      } else {
        setStatus('loading')
        setErrMsg('')
        setErrDetails([])
        setDataSource(undefined)
        setCacheMetrics(null)
        setExpandedRow(null)
        setFocusedRowId(null)
        setSelectedIds(new Set())
        setOffset(0)
      }

      try {
        const userPlan = (typeof window !== 'undefined' && localStorage.getItem('freelanceos_plan')) || 'free'
        const response = await fetch('/api/discover', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessType: normalizedBusinessType,
            location: normalizedLocality,
            query,
            plan: userPlan,
            seenIds: Array.from(seenIds),
            actedIds: Array.from(saved),
            offset: nextOffset,
          }),
        })

        const data = (await response.json()) as {
          error?: string
          details?: string[]
          clients?: Client[]
          source?: string
          metrics?: CacheMetrics
        }

        if (!response.ok || data.error) {
          const message = data.error || 'Discovery failed'
          if (loadMore) toast.error(message)
          else {
            setErrMsg(message)
            setErrDetails(data.details ?? [])
            setStatus('error')
          }
          return
        }

        const nextResults = (data.clients ?? []).map(normalizeClient)
        setResults((current) => (loadMore ? [...current, ...nextResults] : nextResults))
        setDataSource(data.source)
        setCacheMetrics(data.metrics ?? null)
        setOffset(nextOffset)
        setStatus('results')
        setLastQuery(query)

        if (!loadMore) {
          const firstId = nextResults[0]?.id ?? null
          setFocusedRowId(firstId)
          toast.success(`${nextResults.length} businesses found via ${(data.source ?? 'API').toUpperCase()}`)
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Network error'
        if (loadMore) toast.error(message)
        else {
          setErrMsg(message)
          setStatus('error')
        }
      } finally {
        setIsLoadingMore(false)
      }
    },
    [businessType, lastQuery, locality, offset, saved, seenIds]
  )

  const markLeadSeen = useCallback((client: Client) => {
    setSeenIds((current) => {
      if (current.has(client.id)) return current
      const next = new Set([...current, client.id])
      // FIFO eviction past the cap — keeps server payloads and localStorage bounded
      while (next.size > SEEN_IDS_CAP) {
        const oldest = next.values().next().value
        if (oldest === undefined) break
        next.delete(oldest)
      }
      return next
    })
    setLeadStates((current) => {
      const state = current[client.id] ?? client.leadState
      if (state && state !== 'new') return current
      return { ...current, [client.id]: 'seen' }
    })
  }, [])

  // Called when the pitch chat finishes — stores the result so the row shows it
  function handlePitchComplete(clientId: string, result: PitchChatResult) {
    setPitches((current) => ({
      ...current,
      [clientId]: {
        loading: false,
        content: result.pitch,
        error: null,
        agent: {
          grounded: true,
          audited: true,
          memoryHits: 0,
        },
      },
    }))
    setExpandedRow(clientId)
    toast.success(`Pitch ready — cited ${result.flawsCited} verified problem${result.flawsCited === 1 ? '' : 's'}`)
  }

  async function generatePitch(client: Client) {
    markLeadSeen(client)
    setPitches((current) => ({ ...current, [client.id]: { loading: true, content: null, error: null } }))
    try {
      const response = await fetch('/api/pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientData: client }),
      })
      const data = (await response.json()) as { pitch?: string; error?: string; agent?: PitchAgentMeta }
      if (!response.ok || data.error) throw new Error(data.error || 'Pitch generation failed')
      setPitches((current) => ({
        ...current,
        [client.id]: { loading: false, content: data.pitch ?? '', error: null, agent: data.agent },
      }))
      setExpandedRow(client.id)
    } catch (error) {
      setPitches((current) => ({
        ...current,
        [client.id]: {
          loading: false,
          content: null,
          error: error instanceof Error ? error.message : 'Pitch generation failed',
        },
      }))
    }
  }

  async function saveLead(client: Client) {
    if (saved.has(client.id)) return
    markLeadSeen(client)
    setSavingId(client.id)
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(client),
      })
      if (!response.ok) throw new Error('Save failed')
      // The server dedupes on place id / name+location — a repeat save lands here
      // with `duplicate: true` and still marks the row saved.
      const result = await response.json()
      if (result.duplicate) toast.message(`${client.businessName} is already saved`)
      else toast.success(`${client.businessName} saved`)
      setSaved((current) => new Set([...current, client.id]))
      setLeadStates((current) => ({ ...current, [client.id]: 'saved' }))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Save failed')
    } finally {
      setSavingId(null)
    }
  }

  function toggleIgnoreLead(client: Client) {
    markLeadSeen(client)
    // Use client.leadState from display (already merged) as the source of truth
    const currentState = client.leadState
    const isIgnored = currentState === 'ignored'

    if (isIgnored) {
      setLeadStates((prev) => ({ ...prev, [client.id]: 'seen' }))
      toast.success(`${client.businessName} unignored`)
    } else {
      setLeadStates((prev) => ({ ...prev, [client.id]: 'ignored' }))
      setSelectedIds((prev) => {
        if (!prev.has(client.id)) return prev
        const next = new Set(prev)
        next.delete(client.id)
        return next
      })
      toast.success(`${client.businessName} marked ignored`)
    }
  }

  function toggleSelect(client: Client) {
    markLeadSeen(client)
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(client.id)) next.delete(client.id)
      else next.add(client.id)
      return next
    })
  }

  function handleBulkAction(action: 'save' | 'ignore' | 'queue' | 'tag') {
    const selectedLeads = results.filter((client) => selectedIds.has(client.id))
    if (selectedLeads.length === 0) return

    if (action === 'save') {
      void Promise.all(selectedLeads.map((client) => saveLead(client)))
      return
    }

    if (action === 'ignore') {
      setLeadStates(current => {
        const next = { ...current }
        selectedLeads.forEach(client => { next[client.id] = 'ignored' })
        return next
      })
      setSelectedIds(new Set())
      toast.success(`${selectedLeads.length} businesses marked ignored`)
      return
    }

    if (action === 'queue') {
      toast.message('Bulk queue is reserved for the outreach handoff phase.')
      return
    }

    toast.message('Bulk tagging lands with the next discover operations phase.')
  }

  const display = useMemo(() => {
    const decorated = results.map((client) => {
      const merged: Client = {
        ...client,
        leadState: saved.has(client.id) ? 'saved' : leadStates[client.id] ?? client.leadState ?? 'new',
        intelStatus: (client.intelStatus ?? 'light_scan') as IntelStatus,
      }
      return merged
    })

    let list = decorated.filter((client) => (showIgnored ? true : client.leadState !== 'ignored'))

    if (mode === 'gold') list = list.filter(isHiddenGold)
    if (mode === 'coverage') list = [...list].sort((a, b) => a.businessName.localeCompare(b.businessName))
    if (mode === 'priority') list = [...list].sort((a, b) => b.opportunityScore - a.opportunityScore)
    if (mode === 'role-match') list = [...list].sort((a, b) => getContactability(b) - getContactability(a))

    if (sort === 'score') list = [...list].sort((a, b) => b.opportunityScore - a.opportunityScore)
    if (sort === 'newest') list = [...list].sort((a, b) => orderedIds.indexOf(a.id) - orderedIds.indexOf(b.id))
    if (sort === 'contactability') list = [...list].sort((a, b) => getContactability(b) - getContactability(a))
    if (sort === 'gold-first') {
      list = [...list].sort((a, b) => Number(isHiddenGold(b)) - Number(isHiddenGold(a)) || b.opportunityScore - a.opportunityScore)
    }

    return list
  }, [leadStates, mode, orderedIds, results, saved, showIgnored, sort])

  const metrics = useMemo(() => {
    const hiddenGoldCount = display.filter(isHiddenGold).length
    const readyIntel = display.filter((client) => client.intelStatus === 'ready').length
    const newCount = display.filter((client) => (client.leadState ?? 'new') === 'new').length
    return {
      found: display.length,
      newCount,
      cached: cacheMetrics?.cacheHits ?? 0,
      hiddenGold: hiddenGoldCount,
      intelReady: readyIntel,
      apiSaved: cacheMetrics?.savedCredits ?? 0,
    }
  }, [cacheMetrics, display])

  useDiscoverKeyboard({
    orderedIds: display.map((client) => client.id),
    focusedId: focusedRowId,
    setFocusedId: setFocusedRowId,
    onIntel: (id) => setExpandedRow((current) => (current === id ? null : id)),
    onPitch: (id) => {
      const client = results.find((entry) => entry.id === id)
      if (client) setChatClient(client)
    },
    onSave: (id) => {
      const client = results.find((entry) => entry.id === id)
      if (client) void saveLead(client)
    },
    onIgnore: (id) => {
      const client = results.find((entry) => entry.id === id)
      if (client) toggleIgnoreLead(client)
    },
    onSimilar: (id) => {
      const client = results.find((entry) => entry.id === id)
      if (client) toast.message(`Lookalike search for ${client.businessName} lands in Phase 6.`)
    },
    onToggleSelect: (id) => {
      const client = results.find((entry) => entry.id === id)
      if (client) toggleSelect(client)
    },
    onToggleHelp: () => setHelpOpen((current) => !current),
    onEscape: () => {
      if (helpOpen) {
        setHelpOpen(false)
        return
      }
      if (expandedRow) {
        setExpandedRow(null)
        return
      }
      if (selectedIds.size > 0) {
        setSelectedIds(new Set())
        return
      }
    },
  })

  return (
    <>
      <style>{`
        /* Discover page — fits inside dashboard-content normal flow */
        .discover-shell {
          /* NOT fixed — sits in the dashboard's normal scrollable flow */
          margin: -28px -32px -64px;
          min-height: calc(100vh - 56px);
          display: flex;
          flex-direction: column;
          background: var(--color-bg);
        }
        .discover-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
        }
        .discover-status-strip {
          display: flex;
          flex-wrap: wrap;
          gap: 0;
          border-bottom: 1px solid var(--color-border);
          background: rgba(255,255,255,0.015);
          overflow-x: auto;
        }
        .discover-status-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 9px 16px;
          font-size: 12px;
          font-weight: 500;
          color: var(--color-text-muted);
          border-right: 1px solid var(--color-border);
          white-space: nowrap;
          letter-spacing: -0.01em;
        }
        .discover-results {
          /* Normal block flow — page itself scrolls */
        }
        .discover-help-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 200;
        }
        .discover-help-panel {
          width: min(680px, calc(100% - 32px));
          border: 1px solid var(--color-border-hover);
          border-radius: 12px;
          background: rgba(13,13,18,0.98);
          box-shadow: 0 24px 64px rgba(0,0,0,0.5);
          overflow: hidden;
        }
        @media (max-width: 768px) {
          .discover-shell {
            margin: -16px -16px -80px;
          }
        }
      `}</style>

      <div className="discover-shell">
        <div className="discover-main">
          <DiscoverFilters
            businessType={businessType}
            locality={locality}
            onBusinessTypeChange={setBusinessType}
            onLocalityChange={setLocality}
            onSearch={() => void runSearch(false)}
            loading={status === 'loading'}
            activePreset={activePreset}
            onPreset={(preset) => {
              setActivePreset(preset)
              setBusinessType(preset.toLowerCase())
            }}
            radius={radius}
            onRadius={setRadius}
            mode={mode}
            onMode={setMode}
            sort={sort}
            onSort={setSort}
            showIgnored={showIgnored}
            onShowIgnored={setShowIgnored}
            onToggleHelp={() => setHelpOpen((current) => !current)}
          />

          <div className="discover-status-strip">
            <div className="discover-status-item" title="Total businesses found">
              Found
              <motion.strong key={`found-${metrics.found}`} initial={{ opacity: 0.3, y: 4 }} animate={{ opacity: 1, y: 0 }}
                style={{ color: '#fff', marginLeft: 4 }}>
                {metrics.found}
              </motion.strong>
            </div>
            <div className="discover-status-item" title="Not yet reviewed">
              New
              <motion.strong key={`new-${metrics.newCount}`} initial={{ opacity: 0.3, y: 4 }} animate={{ opacity: 1, y: 0 }}
                style={{ color: metrics.newCount > 0 ? '#00C9A7' : 'rgba(255,255,255,0.5)', marginLeft: 4 }}>
                {metrics.newCount}
              </motion.strong>
            </div>
            {metrics.cached > 0 && (
              <div className="discover-status-item" title="Loaded from cache">
                Cached
                <motion.strong key={`cached-${metrics.cached}`} initial={{ opacity: 0.3, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  style={{ color: 'rgba(255,255,255,0.35)', marginLeft: 4 }}>
                  {metrics.cached}
                </motion.strong>
              </div>
            )}
            {metrics.hiddenGold > 0 && (
              <div className="discover-status-item" title="High review count + multiple gaps = hidden opportunity">
                Gold
                <motion.strong key={`gold-${metrics.hiddenGold}`} initial={{ opacity: 0.3, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  style={{ color: '#F59E0B', marginLeft: 4 }}>
                  {metrics.hiddenGold}
                </motion.strong>
              </div>
            )}
            {metrics.intelReady > 0 && (
              <div className="discover-status-item" title="Intel fully loaded">
                Ready
                <motion.strong key={`ready-${metrics.intelReady}`} initial={{ opacity: 0.3, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  style={{ color: '#00C9A7', marginLeft: 4 }}>
                  {metrics.intelReady}
                </motion.strong>
              </div>
            )}
            {metrics.apiSaved > 0 && (
              <div className="discover-status-item" title="API credits saved via cache">
                Saved
                <motion.strong style={{ color: 'rgba(255,255,255,0.35)', marginLeft: 4 }}>
                  {metrics.apiSaved}
                </motion.strong>
              </div>
            )}
            {lastQuery && (
              <div className="discover-status-item" style={{ marginLeft: 'auto', fontSize: 11, color: 'rgba(255,255,255,0.2)', borderRight: 'none' }}>
                Last: <strong style={{ color: 'rgba(255,255,255,0.4)', marginLeft: 4 }}>{lastQuery}</strong>
              </div>
            )}
          </div>

          <div>
            <div className="discover-results" style={{ paddingTop: 12 }}>
              {status === 'idle' && (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  minHeight: 360, gap: 16, padding: 48,
                }}>
                  <motion.div animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ repeat: Infinity, duration: 2.5 }}>
                    <Terminal size={32} color="var(--color-text-muted)" />
                  </motion.div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
                    Find your next client
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>
                    Enter a business type and location above, then click Scan.
                  </p>
                </div>
              )}

              {status === 'loading' && <DiscoverLoading />}

              {status === 'error' && (
                <div style={{ padding: 28 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-accent)', marginBottom: 8 }}>Search failed</div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 12 }}>{errMsg}</div>
                  {errDetails.map((detail) => (
                    <div key={detail} style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 4 }}>
                      {detail}
                    </div>
                  ))}
                </div>
              )}

              {status === 'results' && display.length === 0 && (
                <DiscoverEmpty
                  locality={locality}
                  onPreset={(preset) => {
                    setActivePreset(preset)
                    setBusinessType(preset.toLowerCase())
                  }}
                />
              )}

              {status === 'results' &&
                display.map((client, index) => (
                  <DiscoverRow
                    key={client.id}
                    client={client}
                    localLeadState={client.leadState}
                    index={index}
                    expanded={expandedRow === client.id}
                    focused={focusedRowId === client.id}
                    selected={selectedIds.has(client.id)}
                    onToggle={() => setExpandedRow((current) => (current === client.id ? null : client.id))}
                    onIntel={() => setIntelDrawerClient(client)}
                    onSave={() => void saveLead(client)}
                    onIgnore={() => toggleIgnoreLead(client)}
                    onPitch={() => setChatClient(client)}
                    onSimilar={() => toast.message(`Lookalike search for ${client.businessName} lands in Phase 6.`)}
                    onToggleSelect={() => toggleSelect(client)}
                    onHover={(client) => markLeadSeen(client)}
                    onSeen={markLeadSeen}
                    pitch={pitches[client.id]}
                  />
                ))}

              {status === 'results' && display.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0 56px', gap: 12 }}>
                  <motion.button
                    type="button"
                    onClick={() => void runSearch(true)}
                    disabled={isLoadingMore}
                    whileHover={!isLoadingMore ? { scale: 1.03, y: -3 } : {}}
                    whileTap={!isLoadingMore ? { scale: 0.97 } : {}}
                    style={{
                      position: 'relative', overflow: 'hidden',
                      padding: '0 36px', height: 52, borderRadius: 26,
                      border: '1px solid rgba(255,255,255,0.12)',
                      background: isLoadingMore
                        ? 'rgba(255,255,255,0.03)'
                        : 'linear-gradient(135deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.03) 100%)',
                      color: isLoadingMore ? 'rgba(255,255,255,0.3)' : '#fff',
                      fontSize: 14, fontWeight: 700, letterSpacing: '0.03em',
                      cursor: isLoadingMore ? 'default' : 'pointer',
                      backdropFilter: 'blur(20px)',
                      boxShadow: isLoadingMore ? 'none' : '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
                      transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                      display: 'flex', alignItems: 'center', gap: 10,
                    }}
                  >
                    {isLoadingMore ? (
                      <>
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                          style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.15)', borderTopColor: 'rgba(255,255,255,0.5)', borderRadius: '50%' }}
                        />
                        Scanning the web…
                      </>
                    ) : (
                      <>
                        <span style={{ fontSize: 16 }}>⟳</span>
                        Load Deeper Results
                      </>
                    )}
                  </motion.button>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.04em' }}>
                    Searches {display.length} results deep across all sources
                  </span>
                </div>
              )}
            </div>

            <AnimatePresence>
              {helpOpen && (
                <motion.div
                  className="discover-help-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="discover-help-panel"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '16px 20px', borderBottom: '1px solid var(--color-border)',
                    }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>Keyboard shortcuts</span>
                      <button
                        type="button"
                        onClick={() => setHelpOpen(false)}
                        style={{
                          border: '1px solid var(--color-border)', background: 'transparent',
                          color: 'var(--color-text-secondary)', width: 32, height: 32,
                          borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <div style={{
                      padding: '20px',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                      gap: 10,
                      fontSize: 13,
                      color: 'var(--color-text-secondary)',
                    }}>
                      {[
                        ['J', 'Focus next lead'],
                        ['K', 'Focus previous lead'],
                        ['I', 'Open intel panel'],
                        ['P', 'Generate pitch'],
                        ['S', 'Save lead'],
                        ['X', 'Ignore lead'],
                        ['F', 'Find similar'],
                        ['Space', 'Toggle selection'],
                        ['Esc', 'Close panels / clear'],
                        ['?', 'Toggle this sheet'],
                      ].map(([key, label]) => (
                        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{
                            minWidth: 52, padding: '6px 10px',
                            borderRadius: 5,
                            border: '1px solid var(--color-border)',
                            background: 'rgba(255,255,255,0.04)',
                            color: 'var(--color-text-primary)',
                            textAlign: 'center', fontSize: 12, fontWeight: 500,
                          }}>
                            {key}
                          </span>
                          <span style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <BulkActionBar
          count={selectedIds.size}
          onAction={handleBulkAction}
          onClear={() => setSelectedIds(new Set())}
        />
      </div>

      <IntelDrawer 
        client={intelDrawerClient} 
        onClose={() => setIntelDrawerClient(null)} 
        onSave={(c) => void saveLead(c)}
        onIgnore={(c) => toggleIgnoreLead(c)}
        onPitch={(c) => setChatClient(c)}
        onSimilar={(c) => toast.message(`Lookalike search for ${c.businessName} lands in Phase 6.`)}
      />

      <AnimatePresence>
        {chatClient && (
          <PitchChatModal
            client={chatClient}
            onClose={() => setChatClient(null)}
            onComplete={handlePitchComplete}
          />
        )}
      </AnimatePresence>
    </>
  )
}
