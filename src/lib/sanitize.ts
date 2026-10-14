/**
 * Copy only the named keys out of an untrusted request body.
 *
 * Every write route used to spread `...body` into `Model.create()`, and because the
 * spread came *after* the trusted fields a client could send `{ "userId": "<someone
 * else>" }` and win. Whitelisting is the fix: anything the server owns (userId,
 * status/stage, timestamps) can never be supplied by the caller.
 *
 * Keys starting with `$` or containing `.` are dropped too, so a body can't smuggle
 * a Mongo operator or a nested path into an update document.
 *
 * `T` is the document interface the result is destined for, named at the call site as
 * `pick<IDeal>(body, DEAL_WRITABLE_FIELDS)`. It buys two things: the whitelist can no
 * longer name a field the schema does not have, and the result is a `Partial<T>` that a
 * typed `Model.create()` accepts. It is not a validity claim about the values — those are
 * still unverified JSON, and the schema's casting and validators remain what enforce
 * their types at write time.
 */
export function pick<T, K extends Extract<keyof T, string> = Extract<keyof T, string>>(
  source: Record<string, unknown>,
  keys: readonly K[],
): Partial<Pick<T, K>> {
  const out: Partial<Pick<T, K>> = {}
  if (!source || typeof source !== 'object') return out

  for (const key of keys) {
    if (key.startsWith('$') || key.includes('.')) continue
    if (!Object.prototype.hasOwnProperty.call(source, key)) continue
    if (source[key] === undefined) continue
    out[key] = source[key] as T[K]
  }
  return out
}

/** Pitch fields a client may supply. userId, overallStatus and sentChannels are server-owned. */
export const PITCH_WRITABLE_FIELDS = [
  'clientId',
  'businessName', 'businessEmail', 'businessPhone', 'businessInstagram',
  'businessLinkedin', 'businessWhatsapp', 'businessLocation',
  'emailSubject', 'emailBody', 'whatsappMsg', 'linkedinDm', 'instagramDm',
  'fullProposal', 'whyThem', 'qualityScore', 'tone',
] as const

/** Pitch fields a client may edit after creation. */
export const PITCH_PATCHABLE_FIELDS = [
  'emailSubject', 'emailBody', 'whatsappMsg', 'linkedinDm', 'instagramDm',
  'fullProposal', 'whyThem', 'qualityScore', 'tone', 'overallStatus',
  'businessEmail', 'businessPhone', 'businessInstagram',
  'businessLinkedin', 'businessWhatsapp', 'businessLocation',
] as const

/** Deal fields a client may supply on create. Stage timestamps stay server-owned. */
export const DEAL_WRITABLE_FIELDS = [
  'clientId', 'pitchId', 'businessName', 'businessLocation',
  'channel', 'estimatedValue', 'currency', 'nextAction', 'nextActionDate',
] as const

/**
 * Client (saved lead) fields a client may supply on create. userId, status and
 * createdAt are server-owned. The nested `socials` object is picked as a whole
 * and re-validated field-by-field in the route.
 */
export const CLIENT_WRITABLE_FIELDS = [
  'businessName', 'industry', 'location', 'website', 'websiteLive',
  'metaDescription', 'email', 'phone',
  'detectedGaps', 'source', 'opportunityScore', 'rating', 'reviewCount',
  'googleMapsUrl', 'category',
] as const
