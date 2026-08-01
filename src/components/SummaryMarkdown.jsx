import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function SummaryMarkdown({ children, className = '' }) {
  return <article className={`summary-content ${className}`}><ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown></article>
}
