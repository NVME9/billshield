# Admin stats — proposed schema & code changes (NOT applied)

This file is a proposal only. No schema change has been run against any
database, and none was run as part of adding the `/admin` stats page. The
admin page ships today with every metric honestly marked **"not tracked
yet"** because **BillShield currently has no database at all** — it's a
stateless Vite SPA plus two Vercel serverless functions
(`api/analyze.js`, `api/bill-letter.js`), gated by a shared `BETA_CODES`
secret, with no accounts and no persistence beyond an in-memory per-instance
counter that isn't queryable (see `api/_lib/auth.js`).

If the owner wants real numbers on `/admin`, two things are needed: (1) pick
a Postgres-compatible database (e.g. Vercel Postgres, Neon, Supabase — any
of them work with the schema below), and (2) make the small code changes
listed at the bottom. Nothing here should be run until the owner approves
both the schema and the specific code changes.

## Hard rule for anything that writes to this table

**Counts and timestamps only.** Never write bill content, raw text, names,
emails, addresses, account numbers, beta code values, or any other
identifying/billing data into this table or its `metadata` column. The
whole point of this table is to be safe to query from an admin page without
ever handling sensitive data.

## Proposed schema

```sql
-- One lightweight table is enough for every metric the admin page needs.
CREATE TABLE IF NOT EXISTS events (
  id          BIGSERIAL PRIMARY KEY,
  event_type  TEXT NOT NULL,              -- 'analysis_run' | 'bill_letter_run' | 'error' | 'signup' | 'payment_succeeded'
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_test     BOOLEAN NOT NULL DEFAULT false,  -- true for the owner's own/internal traffic; excluded from counts
  metadata    JSONB                        -- OPTIONAL, counts-safe fields only (e.g. {"tier":"basic"} or {"amount_cents":1900}) — never bill content or PII
);

CREATE INDEX IF NOT EXISTS idx_events_type_created_at
  ON events (event_type, created_at);
```

That single table covers every metric in the spec:

| Metric | Query shape |
|---|---|
| Signups per day / total | `COUNT(*) ... WHERE event_type='signup' AND is_test=false`, grouped by day |
| Analyses/letters per day / total | same, `event_type IN ('analysis_run','bill_letter_run')` |
| Error rate | `COUNT(*) WHERE event_type='error'` divided by total call events, per day |
| Paid vs. free | `COUNT(*) GROUP BY metadata->>'tier'` once `payment_succeeded`/tier is recorded |
| Revenue events | `COUNT(*) WHERE event_type='payment_succeeded'`, optionally `SUM(metadata->>'amount_cents')` |
| Last activity | `MAX(created_at) WHERE is_test=false` |
| 14-day trend | same queries with `WHERE created_at > now() - interval '14 days' GROUP BY date_trunc('day', created_at)` |

All admin-stats reads would be plain read-only `SELECT`s against this one
table — no joins, no other tables needed.

## Code changes needed (not made yet — for owner approval)

1. **Add a DB dependency + `DATABASE_URL` env var.** None is installed
   today (`package.json` has no `pg`/`@vercel/postgres`/`@neondatabase/serverless`).
   Pick a provider, add its client package, add `DATABASE_URL` to
   `.env.example` and to Vercel (Preview + Production).
2. **`api/analyze.js`** — after a successful response, fire-and-forget
   `INSERT INTO events(event_type) VALUES ('analysis_run')`; on the
   caught-error path, `INSERT ... VALUES ('error')`. Never include
   `billData` or the beta code in the insert.
3. **`api/bill-letter.js`** — same pattern, `event_type='bill_letter_run'`
   on success, `'error'` on the caught-error path.
4. **Signups — needs a product decision first.** BillShield has no
   account/signup concept today; access is a shared beta code, not an
   identity. Before writing this code, the owner needs to decide what
   "signup" means here, e.g.:
   - Treat first-ever use of a given beta code as a proxy "signup" (coarse —
     undercounts if one code is shared by several people), or
   - Add a real lightweight signup/waitlist step (e.g. email capture) and
     log that instead.
   Whichever is chosen, only a counts-only `'signup'` event is inserted —
   never the code or email itself.
5. **Paid vs. free / revenue — needs Stripe (or similar) integrated first.**
   There is no payment processor today (`DEPLOY.md` confirms payments
   aren't implemented). Once one exists, its webhook handler would insert a
   `'payment_succeeded'` event with a counts-safe `metadata` (e.g. tier,
   amount) and nothing else.
6. **`api/admin-stats.js` / `api/_lib/stats.js`** — once `DATABASE_URL`
   exists, replace the `notTracked(...)` fallbacks in `api/_lib/stats.js`
   with the read-only `SELECT`s above, gated on `is_test = false` to
   exclude the owner's own test traffic.
7. **Excluding test/internal accounts.** Simplest approach: an
   `x-billshield-internal` header (or a specific beta code reserved for
   internal testing) sets `is_test = true` on the inserted event, so admin
   counts never include the owner's own usage.
