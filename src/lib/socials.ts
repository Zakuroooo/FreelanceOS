/**
 * Social-link normalizers.
 *
 * Discovery stores social fields as FULL URLs scraped off business sites
 * ("https://www.instagram.com/acecafe/"), while older UI code assumed bare
 * handles — concatenating both produced instagram.com/https://www.instagram…
 * and Instagram's "page isn't available" error.
 */

export function instagramProfileUrl(raw?: string | null): string | null {
  if (!raw) return null
  const v = raw.trim()
  if (!v) return null
  if (/^https?:\/\//i.test(v)) return v
  const handle = v.replace(/^@+/, '').replace(/\/+$/, '')
  // Real IG usernames: letters, numbers, dots, underscores — max 30.
  if (!/^[a-zA-Z0-9._]{1,30}$/.test(handle)) return null
  return `https://www.instagram.com/${handle}/`
}

export function linkedinProfileUrl(raw?: string | null): string | null {
  if (!raw) return null
  const v = raw.trim()
  if (!v) return null
  if (/^https?:\/\//i.test(v)) return v
  if (/^linkedin\.com\//i.test(v)) return `https://${v}`
  // A bare slug is only valid for company/person paths we control.
  if (/^[a-zA-Z0-9\-_%]{2,100}$/.test(v)) return `https://www.linkedin.com/company/${v}/`
  return null
}
