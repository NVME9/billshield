export const MODEL = 'claude-sonnet-5'
// Current Anthropic API pricing for claude-sonnet-5, per million tokens.
// Used only to print an estimated cost in scripts/verify-model.mjs.
export const PRICE_PER_MTOK_INPUT = 2.0
export const PRICE_PER_MTOK_OUTPUT = 10.0
const MAX_TOKENS = 2000
const REQUEST_TIMEOUT_MS = 30_000

export class AnthropicCallError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

// Calls the Anthropic Messages API with a hard timeout and a friendly error
// on failure. `prompt` must already be fully built server-side — never pass
// through unvalidated client input directly.
export async function callClaude(prompt) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new AnthropicCallError('Analysis service is not configured.', 500)
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: controller.signal,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new AnthropicCallError(
        data.error?.message || 'The analysis service returned an error.',
        response.status >= 500 ? 502 : 500
      )
    }

    const text = data.content?.find((c) => c.type === 'text')?.text || ''
    return { text, usage: data.usage }
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new AnthropicCallError('Analysis timed out. Please try again.', 504)
    }
    if (err instanceof AnthropicCallError) throw err
    throw new AnthropicCallError('Analysis failed. Please try again.', 500)
  } finally {
    clearTimeout(timeout)
  }
}

export function parseJsonFromText(text) {
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}
