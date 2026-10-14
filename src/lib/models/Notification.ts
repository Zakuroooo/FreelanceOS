import mongoose, { Schema, models, model, type Document } from 'mongoose'

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId
  orgId?: mongoose.Types.ObjectId
  type: 'reply' | 'deal_funded' | 'deal_paid' | 'reminder' | 'limit_warning'
    | 'campaign_complete' | 'pitch_generated' | 'email_failed'
    | 'deal_won' | 'deal_lost'
  message: string
  clientId?: mongoose.Types.ObjectId
  dealId?: mongoose.Types.ObjectId
  read: boolean
  createdAt: Date
}

const NotificationSchema = new Schema<INotification>({
  userId:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
  // Optional for now so pre-SaaS notifications stay readable; new writes always set it.
  orgId:    { type: Schema.Types.ObjectId, ref: 'Organization' },
  type: {
    type: String,
    enum: [
      'reply', 'deal_funded', 'deal_paid', 'reminder', 'limit_warning',
      'campaign_complete', 'pitch_generated', 'email_failed',
      'deal_won', 'deal_lost',
    ],
    required: true,
  },
  message:  { type: String, required: true },
  clientId: { type: Schema.Types.ObjectId, ref: 'Client' },
  dealId:   { type: Schema.Types.ObjectId, ref: 'Deal' },
  read:     { type: Boolean, default: false },
  createdAt:{ type: Date, default: Date.now },
})

// No API route reads this collection yet (Phase 9). The two access patterns it will have
// are the feed itself and the unread badge, so both are indexed now — adding an index
// after a collection has grown means a build on live data.
NotificationSchema.index({ userId: 1, createdAt: -1 })
NotificationSchema.index({ userId: 1, read: 1 })
NotificationSchema.index({ orgId: 1, createdAt: -1 })

const Notification: mongoose.Model<INotification> =
  models.Notification || model<INotification>('Notification', NotificationSchema)
export default Notification
