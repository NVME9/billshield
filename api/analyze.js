import { isValidBetaCode, checkDailyCap } from './_lib/auth.js'
import { callClaude, parseJsonFromText, AnthropicCallError } from './_lib/anthropic.js'

const PROVIDER_TYPES = new Set(['hospital', 'er', 'specialist', 'lab', 'urgent_care', 'surgery_center', 'dental', 'other'])
const INSURANCE_STATUSES = new Set(['insured', 'underinsured', 'uninsured', 'medicare'])
const MAX_RAW_TEXT = 12_000
const MAX_CONTEXT = 2_000
const MAX_BILL_AMOUNT = 100

function badRequest(res, message) {
  return res.status(400).json({ error: message })
}

function validateBillData(billData) {
  if (!billData || typeof billData !== 'object' || Array.isArray(billData)) {
    return 'Missing bill details.'
  }
  const allowedKeys = new Set(['providerType', 'insuranceStatus', 'billAmount', 'rawText', 'context'])
  for (const key of Object.keys(billData)) {
    if (!allowedKeys.has(key)) return `Unexpected field: ${key}`
  }
  if (!PROVIDER_TYPES.has(billData.providerType)) return 'Invalid provider type.'
  if (!INSURANCE_STATUSES.has(billData.insuranceStatus)) return 'Invalid insurance status.'
  if (typeof billData.billAmount !== 'string' || billData.billAmount.length === 0 || billData.billAmount.length > MAX_BILL_AMOUNT) {
    return 'Invalid bill amount.'
  }
  if (billData.rawText !== undefined) {
    if (typeof billData.rawText !== 'string') return 'Invalid bill text.'
    if (billData.rawText.length > MAX_RAW_TEXT) return `Bill text must be ${MAX_RAW_TEXT} characters or fewer.`
  }
  if (billData.context !== undefined) {
    if (typeof billData.context !== 'string') return 'Invalid context.'
    if (billData.context.length > MAX_CONTEXT) return `Additional context must be ${MAX_CONTEXT} characters or fewer.`
  }
  return null
}

export function buildPrompt(billData) {
  return `You are a medical billing expert and patient advocate. Analyze this medical bill and identify errors, overcharges, and negotiation opportunities.

Bill Information:
- Provider Type: ${billData.providerType}
- Insurance Status: ${billData.insuranceStatus}
- Total Billed: ${billData.billAmount}
- Bill Content: ${billData.rawText || 'Not provided — analyze based on provider type and amount, and note common issues for this bill type'}
- Additional Context: ${billData.context || 'None'}

Respond ONLY with a valid JSON object. No markdown. No code blocks. No preamble. Do not invent specific dollar figures or statistics you cannot support from the bill content given — describe issues qualitatively instead of asserting a numeric savings estimate. Exact structure:
{
  "shieldScore": <integer 0-100, 100=fully legitimate, lower=more issues>,
  "summary": "<2-3 sentence plain-English overview>",
  "redFlags": [{"issue":"<title>","description":"<plain English explanation>","severity":"high|medium|low"}],
  "negotiationLetter": "<complete professional letter addressed to the billing department — use actual newlines — reference specific issues found, with no invented dollar amounts or statistics>",
  "phoneScript": "<step by step script with what to say and exactly how to handle common pushback>",
  "nextSteps": ["<step 1>","<step 2>","<step 3>","<step 4>"]
}`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { code, billData } = req.body || {}

  if (!isValidBetaCode(code)) {
    return res.status(401).json({ error: 'A valid beta access code is required.' })
  }

  const validationError = validateBillData(billData)
  if (validationError) {
    return badRequest(res, validationError)
  }

  const capResult = checkDailyCap(code)
  if (!capResult.allowed) {
    return res.status(429).json({ error: "You've reached today's analysis limit for this access code. Please try again tomorrow." })
  }

  try {
    const prompt = buildPrompt(billData)
    const { text } = await callClaude(prompt)
    const parsed = parseJsonFromText(text)
    return res.status(200).json(parsed)
  } catch (err) {
    if (err instanceof SyntaxError) {
      console.error('BillShield API: failed to parse model output as JSON', err)
      return res.status(502).json({ error: 'Analysis could not be completed. Please try again.' })
    }
    const status = err instanceof AnthropicCallError ? err.status : 500
    console.error('BillShield API error:', err)
    return res.status(status).json({ error: err.message || 'Analysis failed. Please try again.' })
  }
}

export const config = { maxDuration: 30 }
