import { isValidBetaCode, checkDailyCap } from './_lib/auth.js'
import { callClaude, AnthropicCallError } from './_lib/anthropic.js'
import { loadHospitalPriceData } from './_lib/hospitalData.js'
import { getHospitalById, matchBillLines } from '../src/lib/billMath.js'

const MAX_LINES = 30
const MAX_CODE_LEN = 12
const MAX_AMOUNT_LEN = 20

function validateLines(lines) {
  if (!Array.isArray(lines) || lines.length === 0 || lines.length > MAX_LINES) {
    return 'Provide between 1 and 30 bill lines.'
  }
  for (const line of lines) {
    if (!line || typeof line !== 'object' || Array.isArray(line)) return 'Invalid bill line.'
    const keys = Object.keys(line)
    if (keys.some((k) => k !== 'code' && k !== 'billedAmount')) return 'Unexpected field in bill line.'
    if (typeof line.code !== 'string' || line.code.length === 0 || line.code.length > MAX_CODE_LEN) return 'Invalid billing code.'
    if (
      (typeof line.billedAmount !== 'string' && typeof line.billedAmount !== 'number') ||
      String(line.billedAmount).length > MAX_AMOUNT_LEN
    ) {
      return 'Invalid billed amount.'
    }
  }
  return null
}

function buildPrompt(hospital, matched) {
  const lines = matched
    .map(
      (m) =>
        `- CPT/HCPCS ${m.code} (${m.description}): billed $${m.billedAmount.toFixed(2)}; hospital's own published cash price $${m.cashPrice.toFixed(2)}, a difference of $${m.difference.toFixed(2)}.`
    )
    .join('\n')

  return `You are drafting a dispute letter for a patient to send to a hospital's billing department. Use ONLY the facts given below. Do not invent, estimate, or round any dollar figure, statistic, or percentage that is not explicitly provided. Do not claim an error occurred — simply point out the discrepancy and ask for an explanation or adjustment.

Hospital: ${hospital.name}
Price file source: ${hospital.source_file_url}
Price file retrieved: ${hospital.retrieval_date}

Line items to reference (use every one, with the exact dollar figures given):
${lines}

Required content of the letter, in order:
1. Opening identifying the patient is writing about charges on their bill.
2. For each line item above, state the billed amount and the hospital's own disclosed cash price from its federally-required price transparency file, citing the file's retrieval date, and ask that the charge be reduced to no more than that disclosed cash price.
3. A clear caveat, verbatim in substance: cash prices apply to self-pay patients; if the patient has insurance, they should compare this bill against their insurer's Explanation of Benefits (EOB) rather than assuming the cash price applies to them.
4. A request for a response within 30 business days.
5. Sign-off with [Your Name], [Date of Service], [Account Number] placeholders.

Respond with ONLY the letter text (plain text, real newlines, no markdown, no commentary before or after).`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { code, hospitalId, lines } = req.body || {}

  if (!isValidBetaCode(code)) {
    return res.status(401).json({ error: 'A valid beta access code is required.' })
  }

  if (typeof hospitalId !== 'string' || hospitalId.length === 0 || hospitalId.length > 64) {
    return res.status(400).json({ error: 'Invalid hospital.' })
  }

  const linesError = validateLines(lines)
  if (linesError) {
    return res.status(400).json({ error: linesError })
  }

  const data = loadHospitalPriceData()
  const hospital = getHospitalById(data, hospitalId)
  if (!hospital) {
    return res.status(400).json({ error: 'Unknown hospital.' })
  }
  if (hospital.status !== 'available') {
    return res.status(400).json({ error: 'Price data for this hospital is not available yet.' })
  }

  const { matched, unmatched } = matchBillLines(hospital, lines)
  if (matched.length === 0) {
    return res.status(400).json({ error: 'None of the codes entered have real price data on file for this hospital.' })
  }

  const capResult = checkDailyCap(code)
  if (!capResult.allowed) {
    return res.status(429).json({ error: "You've reached today's analysis limit for this access code. Please try again tomorrow." })
  }

  try {
    const prompt = buildPrompt(hospital, matched)
    const { text } = await callClaude(prompt)
    return res.status(200).json({ letter: text.trim(), matched, unmatched })
  } catch (err) {
    const status = err instanceof AnthropicCallError ? err.status : 500
    console.error('BillShield bill-letter error:', err)
    return res.status(status).json({ error: err.message || 'Letter generation failed. Please try again.' })
  }
}

export const config = { maxDuration: 30 }
