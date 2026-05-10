import mongoose, { Schema, models, model, type Document } from 'mongoose'

export interface IClient extends Document {
  userId: mongoose.Types.ObjectId
  businessName: string
  industry?: string
  location?: string
  website?: string
  websiteLive?: boolean
  metaDescription?: string
  email?: string
  phone?: string
  socials?: {
    linkedin?: string
    instagram?: string
    facebook?: string
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
  businessName: { type: String, required: true },
  industry:     { type: String },
  location:     { type: String },
  website:      { type: String },
  websiteLive:  { type: Boolean },
  metaDescription: { type: String },
  email:        { type: String },
  phone:        { type: String },
  socials: {
    linkedin:   { type: String },
    instagram:  { type: String },
    facebook:   { type: String },
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

ClientSchema.index({ userId: 1 })

const Client = models.Client || model<IClient>('Client', ClientSchema)
export default Client
