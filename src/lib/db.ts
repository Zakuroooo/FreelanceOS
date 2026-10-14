import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable')
}

// Re-bound after the guard: TypeScript does not carry a module-scope narrowing into
// function bodies, so `dbConnect` would otherwise see `string | undefined`.
const uri: string = MONGODB_URI

/**
 * A filter key that is not in the schema used to be dropped silently — that is how
 * `Pitch.countDocuments({ status: 'sent' })` (the field is `overallStatus`) ended up
 * matching every document and every dashboard stat read 0. Throwing turns that class
 * of typo into an immediate, visible error instead of quietly wrong numbers.
 */
mongoose.set('strictQuery', 'throw')

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  var mongooseCache: MongooseCache | undefined
}

const cached: MongooseCache = global.mongooseCache ?? { conn: null, promise: null }

if (!global.mongooseCache) {
  global.mongooseCache = cached
}

export default async function dbConnect() {
  if (cached.conn) return cached.conn

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      // Serverless invocations are short-lived and many; the driver default of 100
      // sockets per instance will exhaust an Atlas connection limit under load.
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10_000,
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (err) {
    // A rejected promise stayed in the cache forever, so one failed connect — a cold
    // start during an Atlas blip — made every later request fail with the same error
    // and no retry. Clearing it lets the next request dial again.
    cached.promise = null
    throw err
  }

  return cached.conn
}

/*
 * `clientPromise` used to live here for `@auth/mongodb-adapter`. It opened a second,
 * independent MongoClient pool against the same database as Mongoose and was never
 * cached in production, so every serverless invocation dialled a fresh connection.
 * The adapter is gone (see src/auth.ts) and so is the export.
 */
