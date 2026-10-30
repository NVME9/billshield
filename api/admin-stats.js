import { isValidAdminSecret } from './_lib/adminAuth.js'
import { getStats } from './_lib/stats.js'

// Owner-only stats. Not linked from the public site. Protected server-side
// by ADMIN_STATS_SECRET (fails closed if that env var is unset) — never
// returns bill content, names, emails, addresses, account numbers, or any
// secret/key values, only counts and timestamps.
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const provided = req.headers['x-admin-secret']
  if (!isValidAdminSecret(provided)) {
    return res.status(401).json({ error: 'Unauthorized.' })
  }

  return res.status(200).json(getStats())
}

export const config = { maxDuration: 10 }
