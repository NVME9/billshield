import { createHash, timingSafeEqual } from 'crypto'

// ── Beta access code check ──────────────────────────────────────────────────
// Until BillShield has real payments wired up, every paid-tier call to the
// Anthropic API must present one of the codes in BETA_CODES (comma-separated
// env var). Codes are compared as fixed-length SHA-256 digests via
// timingSafeEqual so a wrong guess doesn't leak how many characters matched
// through response-time differences.

function hashCode(value) {
  return createHash('sha256').update(String(value)).digest()
}

function getValidCodes() {
  const raw = process.env.BETA_CODES || ''
  return raw
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean)
}

export function isValidBetaCode(candidate) {
  if (typeof candidate !== 'string' || candidate.length === 0) return false
  const validCodes = getValidCodes()
  if (validCodes.length === 0) return false

  const candidateHash = hashCode(candidate)
  let matched = false
  // Check every code (no early return) so match position never leaks via timing.
  for (const code of validCodes) {
    if (timingSafeEqual(candidateHash, hashCode(code))) matched = true
  }
  return matched
}

// ── Per-code daily cap ──────────────────────────────────────────────────────
// IMPORTANT — what this can and cannot guarantee on Vercel serverless:
// This counter lives in the function instance's memory. Vercel can run many
// concurrent instances of the same function (one per region, one per burst
// of traffic) and recycles instances on redeploy or after idling, so this
// cap is a best-effort throttle, NOT a hard global limit — a code can be
// used more than DAILY_CAP times if requests land on different instances,
// and the count silently resets whenever an instance is recycled. It is
// enough to blunt casual abuse from a single leaked code hitting one warm
// instance repeatedly; it is not enough to enforce a billing-accurate quota.
// For a real guarantee, move this to Upstash or Vercel KV once one of those
// is already a dependency of this project — do not add a new persistent
// store just for this check.
const dailyCounts = new Map() // code -> { day: 'YYYY-MM-DD', count: number }

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

const DEFAULT_DAILY_CAP = 20

export function checkDailyCap(code) {
  const cap = Number(process.env.DAILY_CAP_PER_CODE) || DEFAULT_DAILY_CAP
  const day = todayKey()
  const entry = dailyCounts.get(code)

  if (!entry || entry.day !== day) {
    dailyCounts.set(code, { day, count: 1 })
    return { allowed: true, remaining: cap - 1 }
  }

  if (entry.count >= cap) {
    return { allowed: false, remaining: 0 }
  }

  entry.count += 1
  return { allowed: true, remaining: cap - entry.count }
}
