import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

/*
 * Token-at-rest encryption for Gmail OAuth refresh tokens.
 *
 * New ciphertexts are AES-256-GCM and carry a version prefix:
 *
 *   v2:<iv_hex>:<tag_hex>:<ciphertext_hex>
 *
 * The previous format was unversioned AES-256-CBC:
 *
 *   <iv_hex>:<ciphertext_hex>
 *
 * `decrypt` still reads that, so tokens already in the database keep working and get
 * upgraded the next time they are rewritten. Two things drove the change:
 *
 *  - CBC has no authentication tag. A tampered ciphertext either decrypts to garbage or
 *    throws a padding error, and neither is a reliable integrity signal. GCM fails
 *    loudly on any modified byte.
 *  - Without a version prefix there is no way to tell which key encrypted a given
 *    value, so `TOKEN_ENCRYPTION_KEY` could never be rotated without orphaning every
 *    stored token. The prefix is what makes a future rotation possible.
 */

const V2_PREFIX = 'v2'
/** 96 bits is the GCM standard IV length and the only size Node accepts without config. */
const GCM_IV_BYTES = 12
const CBC_IV_BYTES = 16

const HEX_64 = /^[0-9a-fA-F]{64}$/

/** KEY must be 64 hex chars (32 bytes). Set TOKEN_ENCRYPTION_KEY in .env.local */
function getKey(): Buffer {
  const hex = process.env.TOKEN_ENCRYPTION_KEY
  // The length check alone accepted 64 characters of anything; `Buffer.from` silently
  // stops at the first non-hex byte, so a typo'd key produced a short key and a
  // confusing downstream error instead of this one.
  if (!hex || !HEX_64.test(hex)) {
    throw new Error('TOKEN_ENCRYPTION_KEY must be 64 hex characters (32 bytes)')
  }
  return Buffer.from(hex, 'hex')
}

/** Encrypt a string with AES-256-GCM. Returns `v2:iv:tag:ciphertext`, all hex. */
export function encrypt(text: string): string {
  const key = getKey()
  const iv = randomBytes(GCM_IV_BYTES)
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return [V2_PREFIX, iv.toString('hex'), tag.toString('hex'), encrypted.toString('hex')].join(':')
}

/**
 * Decrypt a value produced by `encrypt()`, or by the legacy unversioned CBC format.
 * Throws if the ciphertext has been modified (GCM only) or is malformed.
 */
export function decrypt(encryptedText: string): string {
  const key = getKey()
  const parts = encryptedText.split(':')

  if (parts[0] === V2_PREFIX) {
    const [, ivHex, tagHex, dataHex] = parts
    if (parts.length !== 4 || !ivHex || !tagHex || !dataHex) {
      throw new Error('Invalid encrypted format')
    }
    const iv = Buffer.from(ivHex, 'hex')
    const tag = Buffer.from(tagHex, 'hex')
    if (iv.length !== GCM_IV_BYTES || tag.length !== 16) {
      throw new Error('Invalid encrypted format')
    }
    const decipher = createDecipheriv('aes-256-gcm', key, iv)
    decipher.setAuthTag(tag)
    // `final()` is what verifies the tag — it throws on any tampering.
    return Buffer.concat([decipher.update(Buffer.from(dataHex, 'hex')), decipher.final()]).toString('utf8')
  }

  // Legacy AES-256-CBC. Kept read-only; nothing writes this format any more.
  const [ivHex, encryptedHex] = parts
  if (parts.length !== 2 || !ivHex || !encryptedHex) throw new Error('Invalid encrypted format')
  const iv = Buffer.from(ivHex, 'hex')
  if (iv.length !== CBC_IV_BYTES) throw new Error('Invalid encrypted format')
  const decipher = createDecipheriv('aes-256-cbc', key, iv)
  return Buffer.concat([decipher.update(Buffer.from(encryptedHex, 'hex')), decipher.final()]).toString('utf8')
}

/** True when a stored value still uses the legacy CBC format and should be rewritten. */
export function isLegacyCiphertext(encryptedText: string): boolean {
  return !encryptedText.startsWith(`${V2_PREFIX}:`)
}
