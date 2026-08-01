const TERM_PATTERN = /^\s*[-*]\s+\*\*([^*]+)\*\*\s*(?:-|—|:|–)\s*(.+)$/gm
const DATE_PATTERN = /\b(?:\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}|(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}|(?:19|20)\d{2})\b/g

export function extractTerms(summary) {
  return [...summary.matchAll(TERM_PATTERN)].slice(-6).map((match) => ({
    term: match[1].trim(),
    definition: match[2].trim(),
  }))
}

export function getReadingStats(text) {
  const words = text.replace(/[#*`_>-]/g, '').trim().split(/\s+/).filter(Boolean).length
  return { words, minutes: Math.max(1, Math.ceil(words / 220)) }
}

export function extractTimeline(summary) {
  const seen = new Set()
  return summary.split(/\n+/).flatMap((line) => {
    const date = line.match(DATE_PATTERN)?.[0]
    if (!date || seen.has(`${date}:${line}`)) return []
    seen.add(`${date}:${line}`)
    return [{ date, detail: line.replace(/^[#*\-\s]+/, '').replace(/\*\*/g, '').trim() }]
  }).slice(0, 8)
}
