import mongoose, { Schema, models, model, type Document } from 'mongoose'

export interface IDeal extends Document {
  userId: mongoose.Types.ObjectId
  clientId: mongoose.Types.ObjectId
  title?: string
  scope?: string
  price: number
  currency: string
  deadline?: Date
  status: 'proposed' | 'funded' | 'in_progress' | 'delivered' | 'paid' | 'closed' | 'disputed'
  stripePaymentIntentId?: string
  stripePaymentLinkId?: string
  escrowAmount?: number
  commissionRate: number
  commissionAmount?: number
  payoutAmount?: number
  createdAt: Date
  fundedAt?: Date
  deliveredAt?: Date
  paidAt?: Date
}

const DealSchema = new Schema<IDeal>({
  userId:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
  clientId:     { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  title:        { type: String },
  scope:        { type: String },
  price:        { type: Number, required: true },
  currency:     { type: String, default: 'USD' },
  deadline:     { type: Date },
  status: {
    type: String,
    enum: ['proposed', 'funded', 'in_progress', 'delivered', 'paid', 'closed', 'disputed'],
    default: 'proposed',
  },
  stripePaymentIntentId: { type: String },
  stripePaymentLinkId:   { type: String },
  escrowAmount:          { type: Number },
  commissionRate:        { type: Number, default: 0.08 },
  commissionAmount:      { type: Number },
  payoutAmount:          { type: Number },
  createdAt:             { type: Date, default: Date.now },
  fundedAt:              { type: Date },
  deliveredAt:           { type: Date },
  paidAt:                { type: Date },
})

const Deal = models.Deal || model<IDeal>('Deal', DealSchema)
export default Deal
