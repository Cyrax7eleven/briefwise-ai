import { useState } from 'react'
import { Bookmark, CalendarDays, LoaderCircle, MessageCircle, NotebookPen, Send } from 'lucide-react'
import { askTutor } from '../lib/gemini'

export function TimelinePanel({ events }) {
  if (!events.length) return <p className="empty-state">No dated events were detected in this brief. Timeline is most useful for research, policy, project, and history documents.</p>
  return <div className="timeline-panel"><p className="panel-kicker"><CalendarDays size={15}/> Timeline lens</p>{events.map((event, index) => <div className="timeline-event" key={`${event.date}-${index}`}><span>{event.date}</span><p>{event.detail}</p></div>)}</div>
}

export function NotebookPanel({ learning, onSave, canSave }) {
  const [note, setNote] = useState(learning?.note || '')
  const [saved, setSaved] = useState(false)
  const submit = async () => { await onSave({ ...learning, note }); setSaved(true); setTimeout(() => setSaved(false), 1600) }
  return <div className="notebook-panel"><p className="panel-kicker"><NotebookPen size={15}/> Private notebook</p><h3>What do you want to remember?</h3><textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Capture a connection, a question, or your own explanation…" maxLength={2000} disabled={!canSave}/><div className="notebook-footer"><span>{note.length}/2000</span><button disabled={!canSave} onClick={submit}>{saved ? 'Saved' : 'Save note'}</button></div>{!canSave && <p className="muted">Sign in and save this brief to keep notes in your private library.</p>}</div>
}

export function TutorPanel({ summary }) {
  const [question, setQuestion] = useState(''); const [answer, setAnswer] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false)
  const ask = async (event) => { event.preventDefault(); if (!question.trim()) return; setBusy(true); setError(''); try { setAnswer(await askTutor(summary, question.trim())); } catch (err) { setError(err.message || 'The tutor could not answer right now.') } finally { setBusy(false) } }
  return <div className="tutor-panel"><p className="panel-kicker"><MessageCircle size={15}/> Grounded tutor</p><h3>Explore this brief more deeply.</h3><p className="muted">Answers are limited to information in this brief.</p><form onSubmit={ask}><input value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={500} placeholder="Ask about a concept, finding, or implication…"/><button disabled={busy || !question.trim()}>{busy ? <LoaderCircle className="spin" size={16}/> : <Send size={16}/>} Ask</button></form>{error && <div className="alert-error">{error}</div>}{answer && <div className="tutor-answer"><strong>Document answer</strong><p>{answer}</p></div>}</div>
}

export function BookmarkButton({ bookmarked, onToggle, disabled }) {
  return <button className={`bookmark-button ${bookmarked ? 'is-bookmarked' : ''}`} onClick={onToggle} disabled={disabled} title={bookmarked ? 'Remove bookmark' : 'Bookmark this brief'}><Bookmark size={16} fill={bookmarked ? 'currentColor' : 'none'}/>{bookmarked ? 'Bookmarked' : 'Bookmark'}</button>
}
