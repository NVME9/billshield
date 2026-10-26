# Hospital price data

`hospital-prices.json` is BillShield's price-transparency dataset: for each
supported hospital, the gross charge and discounted cash price the hospital
itself discloses for a set of common billing codes, as published in that
hospital's federally-required machine-readable price file (45 CFR § 180.50).

This is a first build covering 10 hospitals near Sebastian, FL, produced from
a one-time research spike (`C:\Users\Natev\billshield-data-spike` on the
machine that ran it — not part of this repo). To regenerate it from a fresh
spike directory:

```
python scripts/build-hospital-prices.py --spike-dir /path/to/spike
```

## What's in the public file

Per hospital: `id`, `name`, `system`, `city`, `state`, `status`
(`available` / `not_available`), and for available hospitals, `source_file_url`,
`retrieval_date` (when we fetched the hospital's file), `extraction_date`,
and `lines` — one entry per billing code with both a real `gross_charge` and
a real `discounted_cash_price`. A code is only included if the hospital's own
file discloses *both* numbers; codes the hospital doesn't list, or lists only
a negotiated-payer rate for (no cash/gross price), are omitted rather than
shown as zero or guessed.

## What's deliberately left out, and why

- **Negotiated min/max (payer-negotiated rate ranges) are not in the public
  file.** They live in `hospital-prices.internal.json` for engineering
  reference only. A single code's negotiated range can span a 40–50x spread
  (e.g. CPT 99284 at Indian River: $59.76–$2,938.40) because it aggregates
  dozens of distinct insurer/plan contracts. Showing that range to a patient
  without resolving it to their specific payer and plan is actively
  misleading ("your hospital charges as little as $60!") rather than helpful.
  Do not add this to any user-facing surface without first building
  payer/plan disambiguation.
- **The Medicare Physician Fee Schedule (PFS) rate is not used as a facility
  benchmark anywhere.** The PFS prices the *physician's professional
  service*, not the hospital's facility fee (that's the separate OPPS
  Addendum B rate, which this spike could not obtain — see below). Using PFS
  as a stand-in for "what the facility should charge" compares two different
  things and would misstate the gap between a bill and Medicare.

## Blocked / unavailable hospitals

Two of the 10 hospitals in scope have `status: "not_available"` and an empty
`lines` array. The "Check my bill" UI should show these as **not available
yet** rather than hiding them:

| Hospital | Reason |
|---|---|
| Sebastian River Medical Center (Orlando Health Sebastian River Hospital) | orlandohealth.com returned an anti-bot HTTP 429 challenge on every request path tried (robots.txt, cms-hpt.txt, the pricing page, 3 independent HTTP clients); no machine-readable file could be located. |
| Rockledge Regional Medical Center | Facility permanently closed 2025-04-23 (building/infrastructure failures); it was also behind the same orlandohealth.com block. No current price file exists because the hospital no longer operates. |

## Known data-quality caveats (carry these into any UI copy or letter)

- **Cleveland Clinic Martin Health Tradition Hospital's price file is shared
  with two sister facilities** (Martin North and Martin South hospitals) —
  the underlying MRF has no row-level flag separating which facility a given
  price belongs to. Figures shown for "Tradition Hospital" are this hospital
  system's filing under that combined file, not independently verified as
  Tradition-specific.
- **HCA Florida Lawnwood Hospital's price file also covers a freestanding ER**
  (HCA Florida Vero Beach Emergency) under the same `location_name` list.
  Same caveat as above.
- **Staleness has no guaranteed refresh SLA.** CMS requires these files to be
  updated at least annually (hospitals may update more often); the
  `retrieval_date` on each hospital is when *we* pulled the file, not a
  promise the hospital's number hasn't changed since. Any dispute letter
  should say "as published in the hospital's file retrieved on [date]," never
  imply the number is current as of today.
- **Indian River Hospital's file has no cash/gross price at all for CPT 93000**
  (EKG with interpretation) — a disclosure gap on the hospital's side, not an
  extraction error on ours. This is why some hospitals show fewer than 40
  priced lines.
- All figures are self-attested by the hospital, not independently audited by
  CMS. Citing them is still defensible — they're the hospital's own public
  representation — but only when BillShield can show which file, and which
  date, a given number came from. That's why `source_file_url` and
  `retrieval_date` travel with every line and must appear in any generated
  letter.

## Files

- `hospital-prices.json` — public dataset, served to the app.
- `hospital-prices.internal.json` — same hospitals/codes plus
  `negotiated_min`/`negotiated_max`, for internal engineering reference only.
  Never load this file from client code or the API response.
- `../scripts/build-hospital-prices.py` — regenerates both files from a spike
  directory.
