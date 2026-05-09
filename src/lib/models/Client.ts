import mongoose, { Schema, models, model, type Document } from 'mongoose'

export interface IClient extends Document {
  userId: mongoose.Types.ObjectId
  businessName: string
  industry?: string
  location?: string
  website?: string
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
  notes?: string
  createdAt: Date
}

const ClientSchema = new Schema<IClient>({
  userId:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
  businessName: { type: String, required: true },
  industry:     { type: String },
  location:     { type: String },
  website:      { type: String },
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
  notes:        { type: String },
  createdAt:    { type: Date, default: Date.now },
})

const Client = models.Client || model<IClient>('Client', ClientSchema)
export default Client
