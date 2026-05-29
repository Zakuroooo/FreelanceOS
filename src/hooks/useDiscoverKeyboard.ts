'use client'

import { useEffect } from 'react'

function isTypingContext(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable
}

interface UseDiscoverKeyboardParams {
  orderedIds: string[]
  focusedId: string | null
  setFocusedId: (id: string | null) => void
  onIntel: (id: string) => void
  onPitch: (id: string) => void
  onSave: (id: string) => void
  onIgnore: (id: string) => void
  onSimilar: (id: string) => void
  onToggleSelect: (id: string) => void
  onToggleHelp: () => void
  onEscape: () => void
}

export function useDiscoverKeyboard({
  orderedIds,
  focusedId,
  setFocusedId,
  onIntel,
  onPitch,
  onSave,
  onIgnore,
  onSimilar,
  onToggleSelect,
  onToggleHelp,
  onEscape,
}: UseDiscoverKeyboardParams) {
  useEffect(() => {
    function focusRelative(step: number) {
      if (orderedIds.length === 0) return
      const currentIndex = focusedId ? orderedIds.indexOf(focusedId) : -1
      const nextIndex =
        currentIndex === -1
          ? step > 0
            ? 0
            : orderedIds.length - 1
          : Math.max(0, Math.min(orderedIds.length - 1, currentIndex + step))
      setFocusedId(orderedIds[nextIndex] ?? null)
    }

    function withFocused(action: (id: string) => void) {
      const id = focusedId ?? orderedIds[0]
      if (id) action(id)
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onEscape()
        return
      }

      if (isTypingContext(event.target)) return

      const key = event.key.toLowerCase()
      if (!['j', 'k', 'i', 'p', 's', 'x', 'f', ' ', '?'].includes(key)) return
      event.preventDefault()

      if (key === 'j') focusRelative(1)
      if (key === 'k') focusRelative(-1)
      if (key === 'i') withFocused(onIntel)
      if (key === 'p') withFocused(onPitch)
      if (key === 's') withFocused(onSave)
      if (key === 'x') withFocused(onIgnore)
      if (key === 'f') withFocused(onSimilar)
      if (key === ' ') withFocused(onToggleSelect)
      if (key === '?') onToggleHelp()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [
    focusedId,
    onEscape,
    onIgnore,
    onIntel,
    onPitch,
    onSave,
    onSimilar,
    onToggleHelp,
    onToggleSelect,
    orderedIds,
    setFocusedId,
  ])
}
