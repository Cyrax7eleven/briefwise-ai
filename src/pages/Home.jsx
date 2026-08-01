import { ArrowRight, BookOpenCheck, FileSearch, GraduationCap } from 'lucide-react'
import { Link } from 'react-router-dom'
import UploadPdf from '../components/UploadPdf'

export default function Home() {
  return <main className="home-page"><section className="hero"><div className="hero-copy"><span className="eyebrow">YOUR READING, CLARIFIED</span><h1>Understand any<br/>document <em>without losing<br/>the details.</em></h1><p>BriefWise turns complex PDFs into complete, structured briefs with study cards, a glossary, quick self-checks, and exports — using free Gemini AI.</p><div className="hero-actions"><a href="#brief"><span>Try it free</span><ArrowRight size={17}/></a><Link to="/login">Save your library</Link></div><div className="trust-row"><span>Free to use</span><span>•</span><span>Private Firebase library</span><span>•</span><span>No credit card</span></div></div><aside className="hero-preview"><span className="preview-dot"></span><p className="preview-label">DOCUMENT BRIEF</p><h3>Research,<br/>reduced to<br/>what matters.</h3><ul><li><FileSearch size={16}/> Structured key takeaways</li><li><BookOpenCheck size={16}/> Hoverable key-term glossary</li><li><GraduationCap size={16}/> Flashcards &amp; self-checks</li></ul></aside></section><section id="brief" className="home-workspace"><UploadPdf /></section></main>
}
