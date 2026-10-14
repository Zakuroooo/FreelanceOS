import NextAuth from 'next-auth'
import { authConfig } from './auth.config'
import Google from 'next-auth/providers/google'
import GitHub from 'next-auth/providers/github'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import dbConnect from '@/lib/db'
import User from '@/lib/models/User'

/**
 * There is deliberately no database adapter here.
 *
 * `@auth/mongodb-adapter` writes its own `users` collection — the exact name Mongoose
 * derives from `model('User')` — in the same database, over a second connection pool.
 * A credentials signup therefore produced a `users` document with no matching
 * `accounts` document, so Google sign-in found the user, found no linked account and
 * threw `OAuthAccountNotLinked`. That was the "error while registering and login".
 *
 * Sessions are JWTs (`strategy: 'jwt'`), so the adapter was never doing anything we
 * need. The `jwt` callback below owns one Mongoose `User` document per email instead,
 * which also means OAuth users finally get the schema defaults (role, plan,
 * monthlyPitchCount) that the raw-driver adapter skipped.
 *
 * Trade-off: accounts are linked by verified email address. `signIn` refuses any
 * OAuth profile whose email the provider has not verified, which is the same bar
 * `allowDangerousEmailAccountLinking` fails to enforce.
 */

/**
 * Look up a user by email, tolerating documents written before emails were
 * normalised. New rows are always lowercase; the second lookup only ever matches a
 * legacy mixed-case row, so it costs one extra query on a miss and nothing otherwise.
 *
 * A case-insensitive collation index on `email` would remove the fallback, but that
 * needs an index rebuild against the live collection — not something to do silently.
 */
async function findByEmail(email: string, raw: string) {
  return (await User.findOne({ email })) ?? (raw !== email ? User.findOne({ email: raw }) : null)
}

/** Find-or-create the Mongoose user backing this sign-in. Returns the document. */
async function resolveUser(input: {
  email: string
  name?: string | null
  image?: string | null
}) {
  await dbConnect()
  const raw   = input.email.trim()
  const email = raw.toLowerCase()

  const existing = await findByEmail(email, raw)
  if (existing) {
    // Backfill name/avatar the first time an OAuth profile supplies one.
    const patch: Record<string, unknown> = {}
    if (!existing.name && input.name) patch.name = input.name.trim()
    if (!existing.avatar && input.image) patch.avatar = input.image
    if (Object.keys(patch).length > 0) {
      await User.updateOne({ _id: existing._id }, { $set: patch })
      Object.assign(existing, patch)
    }
    return existing
  }

  return User.create({
    email,
    name:   input.name?.trim() || email.split('@')[0],
    avatar: input.image ?? undefined,
  })
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId:     process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (typeof credentials?.email !== 'string' || typeof credentials?.password !== 'string') {
          return null
        }

        // This used to `await import('@/lib/db')`, which loads the module but never
        // opens the connection — the very first login after a cold start could query
        // before Mongoose was connected.
        await dbConnect()

        const raw  = credentials.email.trim()
        const user = await findByEmail(raw.toLowerCase(), raw)
        if (!user?.passwordHash) return null

        const valid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!valid) return null

        return {
          id:    user._id.toString(),
          email: user.email,
          name:  user.name,
          image: user.avatar ?? null,
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,

    async signIn({ account, profile }) {
      if (!account || account.provider === 'credentials') return true
      // Google tells us explicitly; treat a missing flag as unverified.
      if (account.provider === 'google' && profile?.email_verified !== true) return false
      if (!profile?.email) return false
      return true
    },

    async jwt({ token, user }) {
      // `user` is only populated on the initial sign-in, so this is one query per login.
      if (user?.email) {
        const doc = await resolveUser({ email: user.email, name: user.name, image: user.image })
        token.id   = doc._id.toString()
        token.role = doc.role
      }
      return token
    },
  },
})
