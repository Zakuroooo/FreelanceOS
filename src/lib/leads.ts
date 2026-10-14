/**
 * How reachable a lead is across channels — powers the role-match mode and the
 * contactability sort on Discover.
 *
 * Max 5 signals: website, email, phone, instagram, whatsapp. WhatsApp only counts
 * when it is distinct from the phone number — counting both inflated phone-only
 * leads to 2/5 and skewed every sort that used the score.
 */
export interface ContactableLead {
  website?: string | null
  email?: string | null
  phone?: string | null
  socials?: {
    instagram?: string | null
    whatsapp?: string | null
  } | null
}

export function getContactability(client: ContactableLead): number {
  let count = 0
  if (client.website) count += 1
  if (client.email) count += 1
  if (client.phone) count += 1
  if (client.socials?.instagram) count += 1
  // WhatsApp is a distinct signal only when it differs from the phone number —
  // the old `whatsapp || phone` branch scored a phone-only lead 2/5.
  const wa = client.socials?.whatsapp
  if (wa && wa !== client.phone) count += 1
  return count
}
