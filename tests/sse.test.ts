import { describe, expect, it } from 'vitest'
import { extractSseEvents } from '../src/lib/sse'

describe('extractSseEvents', () => {
  it('parses complete single-line frames', () => {
    const { events, rest } = extractSseEvents('data: {"type":"start","total":2}\n\n')
    expect(events).toEqual([{ type: 'start', total: 2 }])
    expect(rest).toBe('')
  })

  it('carries a line split across chunks (the H2 regression)', () => {
    const first  = extractSseEvents('data: {"type":"generating"')
    expect(first.events).toEqual([])
    expect(first.rest).toBe('data: {"type":"generating"')

    // Second read completes the line — with the old per-chunk split this frame
    // was discarded and the lead row never left "waiting".
    const second = extractSseEvents(first.rest + ',"index":1}\n\ndata: {"type":"done"}\n')
    expect(second.events).toEqual([
      { type: 'generating', index: 1 },
      { type: 'done' },
    ])
    expect(second.rest).toBe('')
  })

  it('skips non-data lines and malformed JSON without throwing', () => {
    const { events } = extractSseEvents(
      ': keep-alive comment\n\nevent: ping\ndata: {broken json\n\n data: nope\ndata: {"ok":1}\n'
    )
    expect(events).toEqual([{ ok: 1 }])
  })

  it('returns everything as rest when the chunk ends mid-line', () => {
    const { events, rest } = extractSseEvents('data: {"partial":')
    expect(events).toEqual([])
    expect(rest).toBe('data: {"partial":')
  })
})
