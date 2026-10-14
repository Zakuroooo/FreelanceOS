/** Client-side CSV download — no server round-trip, works on filtered views. */

type CsvValue = string | number | boolean | null | undefined

function escapeCell(value: CsvValue): string {
  if (value === null || value === undefined) return ''
  const s = String(value)
  // Quote when the cell could be misparsed: commas, quotes, newlines.
  if (/[",\n\r]/.test(s)) return `"${s.replaceAll('"', '""')}"`
  return s
}

export function downloadCsv(
  filename: string,
  headers: readonly string[],
  rows: ReadonlyArray<ReadonlyArray<CsvValue>>
): void {
  const lines = [headers as ReadonlyArray<CsvValue>, ...rows]
    .map(row => row.map(escapeCell).join(','))
    .join('\r\n')

  const blob = new Blob([`\uFEFF${lines}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export function todayStamp(): string {
  return new Date().toISOString().slice(0, 10)
}
