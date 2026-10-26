// Pure lookup + math for the "Check my bill" flow. No side effects, no I/O —
// callers (client UI, the bill-letter API route) pass in the parsed
// data/hospital-prices.json document so this stays unit-testable and so the
// server never has to trust client-submitted prices.

export function listHospitals(data) {
  return data.hospitals.map((h) => ({ id: h.id, name: h.name, system: h.system, city: h.city, status: h.status }))
}

export function getHospitalById(data, hospitalId) {
  return data.hospitals.find((h) => h.id === hospitalId) || null
}

function round2(n) {
  return Math.round(n * 100) / 100
}

function parseAmount(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value !== 'string') return null
  const cleaned = value.replace(/[$,\s]/g, '')
  if (cleaned === '' || !/^\d+(\.\d{1,2})?$/.test(cleaned)) return null
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : null
}

// enteredLines: [{ code, billedAmount }] (billedAmount may be a "$1,234.56"
// style string or a number). Returns matched lines with real hospital data
// joined in, and anything that couldn't be matched (unknown code, or the
// hospital has no real price on file for that code).
export function matchBillLines(hospital, enteredLines) {
  if (!hospital || hospital.status !== 'available') {
    return { matched: [], unmatched: (enteredLines || []).map((l) => ({ ...l, reason: 'hospital_not_available' })) }
  }

  const byCode = new Map(hospital.lines.map((l) => [l.code.toUpperCase(), l]))
  const matched = []
  const unmatched = []

  for (const line of enteredLines || []) {
    const code = String(line.code || '').trim().toUpperCase()
    const billed = parseAmount(line.billedAmount)
    const priceLine = byCode.get(code)

    if (!code || billed === null) {
      unmatched.push({ ...line, reason: 'invalid_input' })
      continue
    }
    if (!priceLine) {
      unmatched.push({ ...line, code, reason: 'no_price_on_file' })
      continue
    }

    matched.push({
      code,
      description: priceLine.description,
      billedAmount: round2(billed),
      cashPrice: priceLine.discounted_cash_price,
      difference: round2(billed - priceLine.discounted_cash_price),
      sourceFileUrl: hospital.source_file_url,
      retrievalDate: hospital.retrieval_date,
    })
  }

  return { matched, unmatched }
}
