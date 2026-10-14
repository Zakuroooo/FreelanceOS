import mongoose, { Schema, models, model, type Document } from 'mongoose'

export interface IOrganization extends Document {
  name: string
  /** The workspace creator. Owner role is immutable while they remain a member. */
  ownerUserId: mongoose.Types.ObjectId
  /** Whitelist-style selling: agencies hand this code to their team members. */
  inviteCode: string
  plan: 'free' | 'pro' | 'agency'
  /** Seat cap by plan — join route refuses beyond it. */
  seats: number
  createdAt: Date
}

const OrganizationSchema = new Schema<IOrganization>({
  name:        { type: String, required: true },
  ownerUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  inviteCode:  { type: String, required: true, unique: true },
  plan:        { type: String, enum: ['free', 'pro', 'agency'], default: 'free' },
  // free=3 seats (solo + small team), pro=10, agency=unlimited-ish
  seats:       { type: Number, default: 3 },
  createdAt:   { type: Date, default: Date.now },
})

/** Invite lookups happen on every join; code is the natural key. */
OrganizationSchema.index({ inviteCode: 1 }, { unique: true })

export function generateInviteCode(): string {
  // Crockford-ish base32: no 0/O/1/I confusables when read aloud over a call.
  const alphabet = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return code
}

const Organization: mongoose.Model<IOrganization> =
  models.Organization || model<IOrganization>('Organization', OrganizationSchema)
export default Organization
