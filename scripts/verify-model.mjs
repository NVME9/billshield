#!/usr/bin/env node
// Makes up to 3 real calls to /api/analyze's prompt builder + the live
// Anthropic API, using a clearly fictional bill, and prints token usage and
// estimated cost for each call plus a total. Run this after changing the
// model in api/_lib/anthropic.js to confirm it still works end-to-end and to
// see real cost numbers before deploying.
//
// Usage:
//   ANTHROPIC_API_KEY=sk-ant-... node scripts/verify-model.mjs
//
// This repo's sandbox has no ANTHROPIC_API_KEY configured, so this script
// could not be run as part of building this change — run it yourself with a
// real key before relying on the model/cost numbers.

import { callClaude, parseJsonFromText, MODEL, PRICE_PER_MTOK_INPUT, PRICE_PER_MTOK_OUTPUT } from '../api/_lib/anthropic.js'
import { buildPrompt } from '../api/analyze.js'

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY is not set. Export it and re-run:')
  console.error('  ANTHROPIC_API_KEY=sk-ant-... node scripts/verify-model.mjs')
  process.exit(1)
}

// FICTIONAL bill — invented hospital, invented charges, for verification only.
const fictionalBill = {
  providerType: 'er',
  insuranceStatus: 'uninsured',
  billAmount: '$5,210.00',
  rawText:
    'FICTIONAL TEST BILL — not a real patient. "Riverbend Fictional Memorial Hospital". ' +
    'ER facility fee (Level 4, CPT 99284): $2,400. CT head without contrast (CPT 70450): $1,100. ' +
    'IV administration (CPT 96374) billed twice on the same date: $290 + $290. Chest X-ray 2 views (CPT 71046): $480. ' +
    'Venipuncture (CPT 36415): $65. Total: $5,210.',
  context: 'This is a synthetic test bill used only to verify the analysis API after a model change. No real patient data.',
}

const cost = (usage) =>
  (usage.input_tokens / 1e6) * PRICE_PER_MTOK_INPUT + (usage.output_tokens / 1e6) * PRICE_PER_MTOK_OUTPUT

async function runOnce(n) {
  const prompt = buildPrompt(fictionalBill)
  const { text, usage } = await callClaude(prompt)
  let parsed = null
  let parseError = null
  try {
    parsed = parseJsonFromText(text)
  } catch (e) {
    parseError = e.message
  }
  return { n, usage, parsed, parseError }
}

console.log(`Model: ${MODEL}`)
console.log('Running 3 calls with a fictional test bill...\n')

let totalCost = 0
for (let i = 1; i <= 3; i++) {
  try {
    const { usage, parsed, parseError } = await runOnce(i)
    const callCost = cost(usage)
    totalCost += callCost
    console.log(
      `Call ${i}: input_tokens=${usage.input_tokens} output_tokens=${usage.output_tokens} ` +
        `cost=$${callCost.toFixed(5)}`
    )
    if (parseError) {
      console.log(`  WARNING: response was not valid JSON: ${parseError}`)
    } else {
      console.log(`  shieldScore=${parsed.shieldScore} redFlags=${parsed.redFlags?.length ?? 0}`)
    }
  } catch (err) {
    console.error(`Call ${i} failed: ${err.message}`)
  }
}

console.log(`\nTotal cost for ${3} calls: $${totalCost.toFixed(5)}`)
console.log(`Pricing used: $${PRICE_PER_MTOK_INPUT}/MTok input, $${PRICE_PER_MTOK_OUTPUT}/MTok output (claude-sonnet-5).`)
