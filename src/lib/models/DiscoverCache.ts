import mongoose, { Schema, models, model, type Document } from 'mongoose'

export interface IDiscoverCache extends Document {
  placeId: string
  businessName: string
  industry: string
  location: string
  website: string
  websiteLive: boolean
  metaDescription: string
  email: string
  emailConfidence: 'confirmed' | 'guessed' | 'none'
  phone: string
  socials: {
    instagram: string
    facebook: string
    linkedin: string
    twitter: string
    youtube: string
    whatsapp: string
  }
  socialCount: number
  detectedGaps: string[]
  source: string
  opportunityScore: number
  rating: number | null
  reviewCount: number
  googleMapsUrl: string
  category: string
  leadState: 'new' | 'seen' | 'saved' | 'pitched' | 'responded' | 'won' | 'lost' | 'ignored'
  intelStatus: 'light_scan' | 'prefetching' | 'ready' | 'stale'
  sourceConfidence: 'verified' | 'scraped' | 'inferred' | 'guessed'
  sourceOrigin: string
  updatedAt: Date
}

const DiscoverCacheSchema = new Schema<IDiscoverCache>({
  placeId: { type: String, required: true, unique: true },
  businessName: { type: String, required: true },
  industry: { type: String },
  location: { type: String },
  website: { type: String },
  websiteLive: { type: Boolean },
  metaDescription: { type: String },
  email: { type: String },
  emailConfidence: { 
    type: String, 
    enum: ['confirmed', 'guessed', 'none'],
    default: 'none'
  },
  phone: { type: String },
  socials: {
    instagram: { type: String },
    facebook: { type: String },
    linkedin: { type: String },
    twitter: { type: String },
    youtube: { type: String },
    whatsapp: { type: String },
  },
  socialCount: { type: Number, default: 0 },
  detectedGaps: [{ type: String }],
  source: { type: String },
  opportunityScore: { type: Number, default: 0 },
  rating: { type: Number },
  reviewCount: { type: Number, default: 0 },
  googleMapsUrl: { type: String },
  category: { type: String },
  leadState: {
    type: String,
    enum: ['new', 'seen', 'saved', 'pitched', 'responded', 'won', 'lost', 'ignored'],
    default: 'new',
  },
  intelStatus: {
    type: String,
    enum: ['light_scan', 'prefetching', 'ready', 'stale'],
    default: 'light_scan',
  },
  sourceConfidence: {
    type: String,
    enum: ['verified', 'scraped', 'inferred', 'guessed'],
    default: 'scraped',
  },
  sourceOrigin: { type: String, default: 'scraped' },
  updatedAt: { type: Date, default: Date.now }
})

// Create TTL index on updatedAt to automatically expire documents after 30 days (2592000 seconds)
DiscoverCacheSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 2592000 })

const DiscoverCache = models.DiscoverCache || model<IDiscoverCache>('DiscoverCache', DiscoverCacheSchema)
export default DiscoverCache
