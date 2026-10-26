import { readFileSync } from 'fs'
import path from 'path'

// Loads the PUBLIC hospital price dataset only. hospital-prices.internal.json
// (which carries negotiated min/max) must never be read from an API route —
// see data/README.md for why.
let cached = null

export function loadHospitalPriceData() {
  if (cached) return cached
  const filePath = path.join(process.cwd(), 'data', 'hospital-prices.json')
  cached = JSON.parse(readFileSync(filePath, 'utf-8'))
  return cached
}
