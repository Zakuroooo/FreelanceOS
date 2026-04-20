import mongoose, { Schema, models, model, type Document } from 'mongoose'

export interface IUser extends Document {
  email: string
  passwordHash?: string
  name: string
  avatar?: string
  role: string
  speciality?: string
  minRate: number
  maxRate: number
  currency: string
  connectedChannels: {
    linkedin?: string
    instagram?: string
    emailSmtp?: string
  }
  plan: string
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
  avatar:      { type: String },
  role: {
    type: String,
    enum: ['web-dev', 'video-creator', 'designer', 'copywriter',
           'social-media', 'ai-integrator', 'other'],
  },
  speciality:  { type: String },
  minRate:     { type: Number, default: 0 },
  maxRate:     { type: Number, default: 0 },
  currency:    { type: String, default: 'USD' },
  connectedChannels: {
    linkedin:  { type: String },
    instagram: { type: String },
    emailSmtp: { type: String },
  },
  plan: {
    type: String,
    enum: ['free', 'pro', 'agency'],
    default: 'free',
  },
  monthlyPitchCount:     { type: Number, default: 0 },
  monthlyPitchResetDate: { type: Date },
  stripeAccountId:       { type: String },
  stripeCustomerId:      { type: String },
  createdAt:             { type: Date, default: Date.now },
})

const User = models.User || model<IUser>('User', UserSchema)
export default User
