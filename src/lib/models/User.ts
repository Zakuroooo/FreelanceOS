import mongoose, { Schema, models, model, type Document } from 'mongoose'

export interface IUser extends Document {
  email: string
  passwordHash?: string
  name: string
  /** Workspace membership. Every user lands in a workspace (auto-created solo one by default). */
  orgId?: mongoose.Types.ObjectId
  /** Role INSIDE the workspace. (The other `role` field is the freelancer speciality.) */
  orgRole: 'owner' | 'admin' | 'member'
  avatar?: string
  role: string
  speciality?: string
  minRate: number
  maxRate: number
  currency: string
  connectedChannels: {
    linkedin?: string
    instagram?: string
  }
  /**
   * The user's own SMTP server — the non-Gmail way to send.
   *
   * This exists because Gmail cannot be the only option. `gmail.send` is a *restricted*
   * OAuth scope, so while the Google app's publishing status is "Testing" only accounts on
   * a hand-maintained test-user list can connect one, and reaching Production requires
   * OAuth verification plus an annual paid third-party security assessment. Any user who
   * is not on that list has no way to send at all without this.
   *
   * `pass` is AES-256-GCM encrypted at rest by `lib/encryption.ts`, same as the Gmail
   * tokens — it is a live mailbox credential, usually an app-specific password.
   *
   * Every field is optional at the schema level and validated in the route, mirroring
   * `gmailOAuth`: Mongoose materialises a nested path as `{}` whether or not anything was
   * written to it, so presence is tested on `host`, never on the object itself.
   */
  smtp?: {
    host: string
    port: number
    /** True = implicit TLS on connect (465). False = plaintext then STARTTLS (587). */
    secure: boolean
    user: string
    pass: string             // AES-256-GCM encrypted
    /** Envelope and `From:` address. Often but not always the same as `user`. */
    fromAddress: string
    connectedAt: Date
  }
  gmailOAuth?: {
    accessToken: string      // AES-256 encrypted
    refreshToken: string     // AES-256 encrypted
    tokenExpiry: number      // Unix ms timestamp
    gmailAddress: string     // e.g. ravi@gmail.com
    connectedAt: Date
  }
  plan: string
  /** Service catalog ids chosen during onboarding — the default pitch lens. */
  services?: string[]
  monthlyPitchCount: number
  monthlyPitchResetDate?: Date
  stripeAccountId?: string
  stripeCustomerId?: string
  createdAt: Date
}

const UserSchema = new Schema<IUser>({
  email:       { type: String, unique: true, required: true },
  passwordHash: { type: String },
  name:        { type: String, required: true },
  orgId:       { type: Schema.Types.ObjectId, ref: 'Organization' },
  orgRole: {
    type: String,
    enum: ['owner', 'admin', 'member'],
    default: 'member',
  },
  avatar:      { type: String },
  role: {
    type: String,
    enum: ['web-dev', 'video-creator', 'designer', 'copywriter',
           'social-media', 'ai-integrator', 'other'],
    // OAuth sign-ups never see the role dropdown, and pitch generation interpolates
    // this straight into the Groq prompt — `undefined` would leak into the prompt text.
    default: 'other',
  },
  speciality:  { type: String },
  minRate:     { type: Number, default: 0 },
  maxRate:     { type: Number, default: 0 },
  currency:    { type: String, default: 'USD' },
  connectedChannels: {
    linkedin:  { type: String },
    instagram: { type: String },
  },
  smtp: {
    host:        { type: String },
    port:        { type: Number },
    secure:      { type: Boolean },
    user:        { type: String },
    pass:        { type: String },
    fromAddress: { type: String },
    connectedAt: { type: Date },
  },
  gmailOAuth: {
    accessToken:   { type: String },
    refreshToken:  { type: String },
    tokenExpiry:   { type: Number },
    gmailAddress:  { type: String },
    connectedAt:   { type: Date },
  },
  plan: {
    type: String,
    enum: ['free', 'pro', 'agency'],
    default: 'free',
  },
  services: { type: [String], default: [] },
  monthlyPitchCount:     { type: Number, default: 0 },
  monthlyPitchResetDate: { type: Date },
  stripeAccountId:       { type: String },
  stripeCustomerId:      { type: String },
  createdAt:             { type: Date, default: Date.now },
})

// Org member listings and per-member stats resolve through this.
UserSchema.index({ orgId: 1 })

/*
 * The annotation is load-bearing. `models.User` is typed `Model<any>`, so without it the
 * union `Model<any> | Model<IUser>` collapses the document type and `.lean()` hands back
 * something with no known fields — which is why callers reaching for `gmailOAuth` had to
 * write `as any`. Naming the type here removes the need for those casts.
 */
const User: mongoose.Model<IUser> = models.User || model<IUser>('User', UserSchema)
export default User
