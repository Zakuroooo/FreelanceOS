/**
 * Minimal SSE parsing for the outreach campaign stream.
 *
 * Extracted so the chunk-boundary behavior (the H2 fix) is unit-testable: a TCP
 * chunk can split a `data:` line in half, and the old per-chunk `split('\n')`
 * silently discarded those halves.
 */
export type SseEvent = Record<string, unknown>

export function extractSseEvents(buffer: string): { events: SseEvent[]; rest: string } {
  const lines = buffer.split('\n')
  // The trailing fragment may be an incomplete line — carry it to the next read.
  const rest = lines.pop() ?? ''

  const events: SseEvent[] = []
  for (const line of lines) {
    if (!line.startsWith('data: ')) continue
    try {
      events.push(JSON.parse(line.slice(6)) as SseEvent)
    } catch {
      // Malformed frame — skip rather than kill the stream consumer.
    }
  }
  return { events, rest }
}
