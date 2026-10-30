import { createHash, timingSafeEqual } from 'crypto'

// ── Admin stats secret check ────────────────────────────────────────────────
// Separate from BETA_CODES (which gates paid AI calls for ordinary users).
// ADMIN_STATS_SECRET gates the owner-only stats view and must be set as a
// Vercel env var (Preview + Production). Fails closed: if the env var is
// missing or empty, every request is rejected, even with a correct-looking
// header — there is no "open admin" fallback.
function hashValue(value) {
  return createHash('sha256').update(String(value)).digest()
}

export function isValidAdminSecret(candidate) {
  const configured = process.env.ADMIN_STATS_SECRET || ''
  if (configured.length === 0) return false
  if (typeof candidate !== 'string' || candidate.length === 0) return false
  return timingSafeEqual(hashValue(candidate), hashValue(configured))
}
