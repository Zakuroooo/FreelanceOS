/**
 * Single source of truth for the Groq chat model.
 *
 * Groq retires hosted models on their own schedule. When that happens every call
 * site starts returning:
 *
 *   404 { "error": { "code": "model_not_found",
 *                    "message": "The model `<name>` does not exist or you do not
 *                                have access to it." } }
 *
 * This has already bitten this project twice — `llama-3.1-70b-versatile` was
 * decommissioned, and then `llama-3.3-70b-versatile` after it. Both times the
 * name was hardcoded in three separate route files, so the fix had to be applied
 * three times.
 *
 * It is now one constant, overridable from the environment, so a retirement is a
 * one-line `.env.local` change with no code edit and no redeploy of logic.
 *
 * To find the models your key can actually reach:
 *
 *   curl -s https://api.groq.com/openai/v1/models \
 *     -H "Authorization: Bearer $GROQ_API_KEY_1" | jq -r '.data[].id'
 *
 * Then set the one you want in .env.local:
 *
 *   GROQ_MODEL=<id from that list>
 */
export const GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b'

/**
 * Model fallback chain.
 *
 * Groq retires hosted models without notice — `llama-3.1-70b-versatile`,
 * `llama-3.3-70b-versatile`, and now this project has been bitten three times.
 * Call sites try GROQ_MODEL first, then walk this list when the failure is a
 * model-availability error, so a retirement becomes invisible instead of a
 * broken pitch pipeline.
 */
export const GROQ_MODEL_FALLBACKS = [
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'qwen/qwen3.6-27b',
] as const

/** True for errors meaning "this model cannot be used" — worth retrying on another model. */
export function isModelUnavailableError(err: unknown): boolean {
  const status = (err as { status?: number })?.status
  const code = (err as { error?: { error?: { code?: string } } })?.error?.error?.code
    ?? (err as { code?: string })?.code
  const message = err instanceof Error ? err.message : String(err)
  return (
    status === 404 ||
    status === 400 && /model/i.test(message) ||
    code === 'model_not_found' ||
    code === 'model_decommissioned' ||
    /does not exist or you do not have access/i.test(message)
  )
}
