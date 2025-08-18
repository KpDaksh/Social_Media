#!/usr/bin/env node
// Usage:
//   node scripts/set-cors.cjs --bucket your-bucket-name --key /path/to/service-account.json
// If you omit --key, set GOOGLE_APPLICATION_CREDENTIALS env var pointing to the key file.

const { Storage } = require('@google-cloud/storage')
const fs = require('fs')
const path = require('path')

function parseArgs() {
  const args = process.argv.slice(2)
  const out = {}
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a === '--bucket') out.bucket = args[++i]
    else if (a === '--key') out.key = args[++i]
    else if (a === '--cors') out.cors = args[++i]
  }
  // support positional bucket: first arg without dashes
  if (!out.bucket && args.length > 0 && !args[0].startsWith('-')) {
    out.bucket = args[0]
  }
  return out
}

async function main() {
  const args = parseArgs()
  const bucketName = args.bucket || process.env.VITE_FIREBASE_STORAGE_BUCKET
  if (!bucketName) {
  console.error('Bucket name must be provided via --bucket, as first positional arg, or VITE_FIREBASE_STORAGE_BUCKET in .env')
    process.exit(1)
  }

  const key = args.key || process.env.GOOGLE_APPLICATION_CREDENTIALS
  if (key && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // set env for client
    process.env.GOOGLE_APPLICATION_CREDENTIALS = key
  }

  const corsPath = args.cors || path.join(process.cwd(), 'cors.json')
  if (!fs.existsSync(corsPath)) {
    console.error('CORS file not found at', corsPath)
    process.exit(1)
  }

  const corsContent = JSON.parse(fs.readFileSync(corsPath, 'utf8'))

  // Initialize storage client
  const storage = new Storage()
  const bucket = storage.bucket(bucketName)

  console.log('Applying CORS to bucket:', bucketName)
  try {
    await bucket.setMetadata({ cors: corsContent })
    console.log('CORS applied successfully.')
    // verify
    const [metadata] = await bucket.getMetadata()
    console.log('Current CORS config:', JSON.stringify(metadata.cors, null, 2))
  } catch (err) {
    console.error('Failed to apply CORS:', err.message || err)
    if (err.code === 401 || err.code === 403) {
      console.error('Permission denied. Make sure GOOGLE_APPLICATION_CREDENTIALS points to a service account JSON with storage.buckets.update permission, or run `gcloud auth application-default login`.')
    }
    process.exit(2)
  }
}

main()
