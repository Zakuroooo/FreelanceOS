import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'

/**
 * Fetch a URL that a user typed (a client's website) without letting it reach internal addresses (SSRF).
 * Only http/https on ports 80/443, the host must resolve to public IPs only, and every redirect hop is re-checked.
 * Note: DNS is checked before the request, so a fast DNS-rebinding attack is still theoretically possible;
 * this blocks the common cases (localhost, private ranges, cloud metadata).
 */
const MAX_REDIRECTS = 5

function isPrivateIPv4(ip: string) {
  const [a, b] = ip.split('.').map(Number)
  return a === 0 || a === 10 || a === 127 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 192 && b === 0) || (a === 198 && (b === 18 || b === 19)) || a >= 224
}
function isPrivateIP(ip: string) {
  if (isIP(ip) === 4) return isPrivateIPv4(ip)
  const v = ip.toLowerCase()
  if (v.startsWith('::ffff:')) return isPrivateIPv4(v.slice(7))
  return v === '::' || v === '::1' || v.startsWith('fc') || v.startsWith('fd') || v.startsWith('fe8') || v.startsWith('fe9') || v.startsWith('fea') || v.startsWith('feb')
}

export async function assertPublicUrl(raw: string): Promise<URL> {
  const u = new URL(raw)
  if (u.protocol !== 'http:' && u.protocol !== 'https:') throw new Error('Only http and https URLs are allowed')
  if (u.port && u.port !== '80' && u.port !== '443') throw new Error('Only ports 80 and 443 are allowed')
  const host = u.hostname.replace(/^\[|\]$/g, '')
  const addrs = isIP(host) ? [{ address: host }] : await lookup(host, { all: true })
  if (!addrs.length || addrs.some((a) => isPrivateIP(a.address))) throw new Error('This address is not allowed')
  return u
}

export async function safeFetch(raw: string, init: RequestInit = {}): Promise<Response> {
  let url = raw
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    await assertPublicUrl(url)
    const res = await fetch(url, { ...init, redirect: 'manual' })
    const loc = res.headers.get('location')
    if (res.status >= 300 && res.status < 400 && loc) { url = new URL(loc, url).toString(); continue }
    return res
  }
  throw new Error('Too many redirects')
}
