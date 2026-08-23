import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

// KEY must be 64 hex chars (32 bytes). Set TOKEN_ENCRYPTION_KEY in .env.local
function getKey(): Buffer {
  const hex = process.env.TOKEN_ENCRYPTION_KEY
  if (!hex || hex.length !== 64) {
    throw new Error('TOKEN_ENCRYPTION_KEY must be 64 hex characters (32 bytes)')
  }
  return Buffer.from(hex, 'hex')
}

/**
 * Encrypt a string using AES-256-CBC.
 * Returns "iv_hex:encrypted_hex" format.
 */
export function encrypt(text: string): string {
  const key = getKey()
  const iv = randomBytes(16)
  const cipher = createCipheriv('aes-256-cbc', key, iv)
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`
}

/**
 * Decrypt a string that was encrypted with encrypt().
 * Expects "iv_hex:encrypted_hex" format.
 */
export function decrypt(encryptedText: string): string {
  const key = getKey()
  const [ivHex, encryptedHex] = encryptedText.split(':')
  if (!ivHex || !encryptedHex) throw new Error('Invalid encrypted format')
  const iv = Buffer.from(ivHex, 'hex')
  const encrypted = Buffer.from(encryptedHex, 'hex')
  const decipher = createDecipheriv('aes-256-cbc', key, iv)
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8')
}
