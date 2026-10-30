// ── Admin stats catalog ─────────────────────────────────────────────────────
// BillShield currently has no database and persists nothing server-side
// beyond an in-memory per-instance daily-cap counter (see _lib/auth.js),
// which is not queryable and resets on redeploy/idle. Every metric below is
// therefore reported as not tracked, with one line on what recording it
// would require — never a guessed or interpolated number. This file is the
// single place to update once real events start being recorded (see
// docs/stats-sql.md for the proposed schema and the code changes it needs).
//
// COUNTS ONLY: nothing in this module may read, hold, or return bill
// content, names, emails, addresses, account numbers, or beta code values.

function notTracked(definition, note) {
  return {
    definition,
    tracked: false,
    note,
    total: null,
    perDay: null,
    trend14d: null,
  }
}

export function getStats() {
  const generatedAt = new Date().toISOString()

  const signups = notTracked(
    'New users per day and all-time, excluding test/internal accounts.',
    'BillShield has no signup or account system — access is a shared beta code, not an identity. Needs a real signup/account concept (or an explicit definition of what counts as a "new user") plus an events table — see docs/stats-sql.md.'
  )

  const analyses = notTracked(
    'Bill analyses and "Check My Bill" letters generated per day and all-time.',
    'Neither /api/analyze nor /api/bill-letter records that a call happened. Needs a counts-only INSERT on each successful call — see docs/stats-sql.md.'
  )

  const errorRate = notTracked(
    'Share of API calls that failed, per day.',
    'Errors are only sent to console.error, which lands in ephemeral Vercel function logs — not queryable from the app. Needs a counts-only error event on each failed call — see docs/stats-sql.md.'
  )

  const paidVsFree = notTracked(
    'Split of usage between paid and free tiers.',
    'There is no payment system yet — paid tiers are gated by the same shared BETA_CODES secret as everything else, with no per-user paid/free distinction recorded.'
  )

  const revenue = notTracked(
    'Revenue events (e.g. successful charges).',
    'No payment processor (e.g. Stripe) is integrated. DEPLOY.md confirms payments are not implemented yet.'
  )

  const lastActivity = {
    definition: 'Timestamp of the most recent recorded app activity.',
    tracked: false,
    note: 'No activity is recorded anywhere, so a "nothing happened in 72h" warning cannot be computed honestly right now — showing it would risk implying data that does not exist.',
    timestamp: null,
    staleWarning: false,
  }

  return {
    generatedAt,
    metrics: { signups, analyses, errorRate, paidVsFree, revenue, lastActivity },
  }
}
