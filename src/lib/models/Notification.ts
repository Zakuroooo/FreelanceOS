import mongoose, { Schema, models, model, type Document } from 'mongoose'

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId
  type: 'reply' | 'deal_funded' | 'deal_paid' | 'reminder' | 'limit_warning'
  message: string
  clientId?: mongoose.Types.ObjectId
  dealId?: mongoose.Types.ObjectId
  read: boolean
  createdAt: Date
}

const NotificationSchema = new Schema<INotification>({
  userId:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['reply', 'deal_funded', 'deal_paid', 'reminder', 'limit_warning'],
    required: true,
  },
  message:  { type: String, required: true },
  clientId: { type: Schema.Types.ObjectId, ref: 'Client' },
  dealId:   { type: Schema.Types.ObjectId, ref: 'Deal' },
  read:     { type: Boolean, default: false },
  createdAt:{ type: Date, default: Date.now },
})

const Notification = models.Notification || model<INotification>('Notification', NotificationSchema)
export default Notification
