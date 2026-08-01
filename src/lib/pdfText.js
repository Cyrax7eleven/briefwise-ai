import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

/** Extracts every readable page locally; Gemini chunking happens later. */
export async function extractTextFromPdf(file) {
  const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise
  const pages = []
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
    const content = await (await pdf.getPage(pageNum)).getTextContent()
    pages.push(content.items.map((item) => item.str).join(' '))
  }
  return { text: pages.join('\n\n'), pageCount: pdf.numPages }
}
