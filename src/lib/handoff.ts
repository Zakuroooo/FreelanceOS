/**
 * Manual-channel handoff primitives.
 *
 * Two browser realities broke the old flow:
 * 1. `window.open` after `await fetch` is OUTSIDE the user-gesture call stack —
 *    popup blockers silently kill it, which is why WhatsApp "never opened".
 * 2. `navigator.clipboard.writeText` fails silently on focus loss/permission
 *    quirks — which is why "copied" LinkedIn text arrived half-copied (or not
 *    copied at all).
 */

export interface CopyResult {
  ok: boolean
}

export async function copyText(text: string): Promise<CopyResult> {
  if (!text) return { ok: false }
  // Modern API first.
  try {
    await navigator.clipboard.writeText(text)
    return { ok: true }
  } catch {
    // Legacy fallback works on non-secure contexts where the async API refuses.
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.setAttribute('readonly', '')
      ta.style.position = 'fixed'
      ta.style.top = '-1000px'
      document.body.appendChild(ta)
      ta.focus()
      ta.select()
      const ok = document.execCommand('copy')
      ta.remove()
      return { ok }
    } catch {
      return { ok: false }
    }
  }
}

/**
 * MUST be called synchronously inside a click handler. Opens a placeholder tab
 * while the gesture is still valid; the caller can navigate it later once async
 * work finishes. Returns null when even that was blocked — callers must then
 * surface a plain link the user can click directly.
 */
export function claimPopup(): Window | null {
  const w = window.open('', '_blank')
  if (w) {
    // Prevent reverse-tabnabbing now that we hold the handle.
    w.opener = null
  }
  return w
}

/** Navigates a claimed popup; safe no-op if it died meanwhile. */
export function navigatePopup(tab: Window | null, url: string): boolean {
  try {
    if (!tab || tab.closed) return false
    tab.location.href = url
    return true
  } catch {
    return false
  }
}
