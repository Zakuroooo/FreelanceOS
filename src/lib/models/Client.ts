import mongoose, { Schema, models, model, type Document } from 'mongoose'

export interface IClient extends Document {
  userId: mongoose.Types.ObjectId
  orgId: mongoose.Types.ObjectId
  businessName: string
  industry?: string
  location?: string
  website?: string
  websiteLive?: boolean
  metaDescription?: string
  email?: string
  /** 'confirmed' = scraped from their site/profiles; 'guessed' = pattern-built (info@domain, MX-verified only). */
  emailConfidence?: 'confirmed' | 'guessed' | 'none'
  phone?: string
  socials?: {
    linkedin?: string
    instagram?: string
    facebook?: string
    twitter?: string
    youtube?: string
    whatsapp?: string
  }
  detectedGaps: string[]
  source: 'scraped' | 'manual'
  status: 'discovered' | 'saved' | 'pitched' | 'replied' | 'deal' | 'closed'
  opportunityScore?: number
  rating?: number
  reviewCount?: number
  googleMapsUrl?: string
  category?: string
  notes?: string
  createdAt: Date
}

const ClientSchema = new Schema<IClient>({
  userId:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
  orgId:        { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  businessName: { type: String, required: true },
  industry:     { type: String },
  location:     { type: String },
  website:      { type: String },
  websiteLive:  { type: Boolean },
  metaDescription: { type: String },
  email:        { type: String },
  emailConfidence: { type: String, enum: ['confirmed', 'guessed', 'none'] },
  phone:        { type: String },
  socials: {
    linkedin:   { type: String },
    instagram:  { type: String },
    facebook:   { type: String },
    twitter:    { type: String },
    youtube:    { type: String },
    whatsapp:   { type: String },
  },
  detectedGaps: [{ type: String }],
  source: {
    type: String,
    enum: ['scraped', 'manual'],
    required: true,
  },
  status: {
    type: String,
    enum: ['discovered', 'saved', 'pitched', 'replied', 'deal', 'closed'],
    default: 'discovered',
  },
  opportunityScore: { type: Number },
  rating:       { type: Number },
  reviewCount:  { type: Number },
  googleMapsUrl:{ type: String },
  category:     { type: String },
  notes:        { type: String },
  createdAt:    { type: Date, default: Date.now },
})

// `{ userId: 1 }` alone cannot serve the sort in app/api/clients, which lists by userId
// and orders by `createdAt: -1`. Mongo would fetch the whole per-user set and sort it in
// memory. The compound index covers the single-key lookups too, so it replaces rather
// than supplements the old one.
ClientSchema.index({ userId: 1, createdAt: -1 })
ClientSchema.index({ orgId: 1, createdAt: -1 })

// Annotated for the same reason as User: `models.Client` is `Model<any>`, and without a
// type here `.lean()` results lose their fields.
const Client: mongoose.Model<IClient> = models.Client || model<IClient>('Client', ClientSchema)
export default Client
