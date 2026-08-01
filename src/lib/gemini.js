const API_KEY = import.meta.env.VITE_GEMINI_API_KEY
// Pin a stable model. `gemini-flash-latest` can change behavior without an app deploy.
const MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-3.5-flash'
const REQUEST_TIMEOUT_MS = 90000
const CHUNK_SIZE = 14000
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`

function modelError(data, candidate) {
  if (data?.promptFeedback?.blockReason) return `Gemini blocked the prompt: ${data.promptFeedback.blockReason}.`
  const reason = candidate?.finishReason
  if (reason === 'SAFETY') return 'Gemini blocked this response because of its safety settings.'
  if (reason === 'RECITATION') return 'Gemini stopped because the response may reproduce source text too closely.'
  if (reason === 'MAX_TOKENS') return 'Gemini reached the configured response limit before completing the brief.'
  return 'Gemini returned no usable text. Please try again.'
}

async function generate(prompt, maxOutputTokens) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  let response
  try {
    response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens,
          // Summarization is extraction and synthesis, not a reasoning task. This
          // reserves the output allowance for the visible, complete brief.
          thinkingConfig: { thinkingLevel: 'MINIMAL' },
        },
      }),
    })
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('Gemini did not respond within 90 seconds. Please try again.')
    throw new Error(`Network error while contacting Gemini: ${error.message}`)
  } finally { clearTimeout(timeoutId) }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(`Gemini could not generate this summary: ${body?.error?.message || 'Please check your API key and model configuration.'}`)
  }

  const data = await response.json()
  const candidate = data?.candidates?.[0]
  // Gemini may return thought parts. They are not user-facing content and must
  // never be included in the Markdown brief.
  const output = candidate?.content?.parts
    ?.filter((part) => part.text && !part.thought)
    .map((part) => part.text)
    .join('')
    .trim()

  if (!output || candidate?.finishReason === 'MAX_TOKENS') throw new Error(modelError(data, candidate))
  return output
}

function splitIntoChunks(text) {
  if (text.length <= CHUNK_SIZE) return [text]
  const chunks = []; let current = ''
  text.split(/\n\s*\n/).forEach((paragraph) => {
    if (paragraph.length > CHUNK_SIZE) {
      if (current) { chunks.push(current); current = '' }
      for (let start = 0; start < paragraph.length; start += CHUNK_SIZE) chunks.push(paragraph.slice(start, start + CHUNK_SIZE))
      return
    }
    if (current.length + paragraph.length > CHUNK_SIZE && current) { chunks.push(current); current = '' }
    current += `${paragraph}\n\n`
  })
  if (current.trim()) chunks.push(current)
  return chunks
}

/** Complete long-document summarization, with progress per source chunk. */
export async function summarizeText(text, length = 'medium', onProgress) {
  if (!API_KEY) throw new Error('Missing VITE_GEMINI_API_KEY. Add it to your .env file.')
  const chunks = splitIntoChunks(text)
  const notes = []
  for (let index = 0; index < chunks.length; index += 1) {
    onProgress?.({ current: index + 1, total: chunks.length })
    notes.push(await generate(`Extract complete, factual notes from document part ${index + 1} of ${chunks.length}. Preserve names, dates, numbers, findings, caveats, and conclusions. Do not add information. Keep the notes under 700 words.\n\n${chunks[index]}`, 4096))
  }
  onProgress?.({ current: chunks.length, total: chunks.length, finalizing: true })
  const config = {
    short: { detail: 'in 150-250 words', limit: 2048 },
    medium: { detail: 'in 400-700 words', limit: 6144 },
    detailed: { detail: 'in 900-1,400 words', limit: 12288 },
  }[length] || { detail: 'in 400-700 words', limit: 6144 }
  return generate(`You are BriefWise AI. Create one COMPLETE, polished Markdown summary ${config.detail} from the source notes below. Never mention source notes or document chunks. Use exactly these sections:\n\n# Overview\nOne concise, plain-language paragraph.\n\n## Key takeaways\n- 3-7 specific bullets\n\n## Important details\nUse short subsections or bullets for evidence, methods, dates, findings, or arguments.\n\n## Actions or implications\n- Concrete next steps, implications, or state that none were identified.\n\n## Key terms\n- **Term** - brief document-grounded definition (3-6 terms)\n\nUse complete sentences. Finish every section. Do not reproduce long passages from the source.\n\nSOURCE NOTES:\n${notes.join('\n\n---\n\n')}`, config.limit)
}

/** Answers against the generated brief only, keeping tutor responses grounded. */
export async function askTutor(summary, question) {
  if (!API_KEY) throw new Error('Missing VITE_GEMINI_API_KEY. Add it to your .env file.')
  return generate(`You are a concise learning tutor. Answer only from the document brief below. If the brief does not contain the answer, say so clearly. Do not invent citations or facts. Use plain language and at most 180 words.\n\nDOCUMENT BRIEF:\n${summary}\n\nLEARNER QUESTION:\n${question}`, 2048)
}
