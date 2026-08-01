import { useRef, useState } from 'react'
import { FileText, LoaderCircle, Upload, X } from 'lucide-react'
import { extractTextFromPdf } from '../lib/pdfText'
import { summarizeText } from '../lib/gemini'
import { saveSummary, updateSummaryLearning } from '../lib/summaries'
import { useAuth } from '../lib/AuthContext'
import SummaryWorkspace from './SummaryWorkspace'

const lengths = [{ value: 'short', label: 'Quick', detail: 'Key points' }, { value: 'medium', label: 'Balanced', detail: 'Best for most docs' }, { value: 'detailed', label: 'Deep dive', detail: 'Evidence & context' }]
const MAX_FILE_SIZE = 20 * 1024 * 1024

export default function UploadPdf({ onSummaryCreated }) {
  const { user } = useAuth(); const inputRef = useRef(null)
  const [file, setFile] = useState(null); const [length, setLength] = useState('medium'); const [status, setStatus] = useState('idle'); const [error, setError] = useState(''); const [result, setResult] = useState(''); const [resultId, setResultId] = useState(''); const [pageCount, setPageCount] = useState(0); const [progress, setProgress] = useState(null)
  const chooseFile = (nextFile) => { if (!nextFile) return; if (nextFile.type !== 'application/pdf') return setError('Please choose a PDF file.'); if (nextFile.size > MAX_FILE_SIZE) return setError('Please choose a PDF smaller than 20 MB.'); setFile(nextFile); setError(''); setResult(''); setResultId(''); setProgress(null) }
  const handleSummarize = async () => { if (!file) return; setError(''); setResult(''); setResultId(''); try { setStatus('extracting'); const extracted = await extractTextFromPdf(file); if (!extracted.text.trim()) throw new Error('No readable text was found. This may be a scanned-image PDF.'); setPageCount(extracted.pageCount); setStatus('summarizing'); const summary = await summarizeText(extracted.text, length, setProgress); setResult(summary); if (user) { setStatus('saving'); const saved = await saveSummary({ userId: user.uid, fileName: file.name, summary, length, pageCount: extracted.pageCount }); setResultId(saved.id); onSummaryCreated?.() }; setStatus('done') } catch (err) { console.error(err); setError(err.message || 'Something went wrong. Please try again.'); setStatus('error') } }
  const busy = ['extracting', 'summarizing', 'saving'].includes(status); const statusLabel = status === 'extracting' ? 'Reading your PDF...' : status === 'saving' ? 'Saving to your library...' : progress?.finalizing ? 'Creating your final brief...' : progress ? `Analyzing section ${progress.current} of ${progress.total}...` : 'Creating your brief...'
  return <div className="upload-layout"><section className="upload-card"><div className="section-heading"><span className="heading-icon"><Upload size={19}/></span><div><h2>Create a new brief</h2><p>Readable PDFs stay in your browser; only extracted text is sent to Gemini.</p></div></div><input ref={inputRef} type="file" accept="application/pdf" onChange={(e) => chooseFile(e.target.files?.[0])} className="sr-only" />
    <button className={`dropzone ${file ? 'has-file' : ''}`} onClick={() => inputRef.current?.click()} disabled={busy}>{file ? <><FileText size={26}/><span><strong>{file.name}</strong><small>{(file.size / 1024 / 1024).toFixed(1)} MB / Click to replace</small></span><X size={18} onClick={(e) => { e.stopPropagation(); setFile(null); setResult(''); setResultId('') }}/></> : <><span className="upload-orb"><Upload size={24}/></span><strong>Choose a PDF</strong><small>Up to 20 MB</small></>}</button>
    <fieldset disabled={busy} className="length-options"><legend>Brief depth</legend><div>{lengths.map((option) => <button key={option.value} onClick={() => setLength(option.value)} className={length === option.value ? 'selected' : ''}><strong>{option.label}</strong><small>{option.detail}</small></button>)}</div></fieldset>
    {error && <div role="alert" className="alert-error">{error}</div>}
    <button onClick={handleSummarize} disabled={!file || busy} className="primary-button">{busy ? <><LoaderCircle className="spin" size={18}/>{statusLabel}</> : <><FileText size={18}/>Generate complete brief</>}</button>
    {!user && <p className="save-note">Sign in to keep briefs in your private library.</p>}</section>{result && <SummaryWorkspace summary={result} fileName={file?.name} pageCount={pageCount} summaryId={resultId} onLearningChange={(learning) => updateSummaryLearning(resultId, learning)} />}</div>
}
