import { useEffect, useState } from 'react'
import { ChevronDown, FileText, Trash2 } from 'lucide-react'
import { subscribeToSummaries, deleteSummary, updateSummaryLearning } from '../lib/summaries'
import { useAuth } from '../lib/AuthContext'
import SummaryWorkspace from './SummaryWorkspace'

export default function History({ refreshKey }) {
  const { user } = useAuth(); const [items, setItems] = useState([]); const [openId, setOpenId] = useState(null); const [error, setError] = useState('')
  useEffect(() => { if (!user) return undefined; return subscribeToSummaries(user.uid, setItems, (err) => setError(err.message)) }, [user, refreshKey])
  if (!user) return null
  return <section className="library-section"><div className="section-heading"><span className="heading-icon"><FileText size={19}/></span><div><h2>Your library</h2><p>{items.length ? `${items.length} saved brief${items.length === 1 ? '' : 's'}` : 'Your saved briefs will appear here.'}</p></div></div>{error && <div className="alert-error">Could not load your library: {error}</div>}{!items.length && !error ? <div className="library-empty">Generate a brief above to build your searchable study library.</div> : <div className="library-list">{items.map((item) => <article key={item.id} className="library-item"><div className="library-item-header"><button onClick={() => setOpenId(openId === item.id ? null : item.id)}><FileText size={19}/><span><strong>{item.fileName}</strong><small>{item.length} brief / {item.pageCount} pages</small></span><ChevronDown className={openId === item.id ? 'rotate' : ''} size={18}/></button><button className="delete-button" aria-label={`Delete ${item.fileName}`} onClick={async () => { if (window.confirm(`Delete “${item.fileName}”?`)) await deleteSummary(item.id) }}><Trash2 size={16}/></button></div>{openId === item.id && <SummaryWorkspace summary={item.summary} fileName={item.fileName} pageCount={item.pageCount} summaryId={item.id} learning={item.learning} onLearningChange={(learning) => updateSummaryLearning(item.id, learning)}/>}</article>)}</div>}</section>
}
