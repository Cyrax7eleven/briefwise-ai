import { useState } from 'react'
import UploadPdf from '../components/UploadPdf'
import History from '../components/History'

export default function Dashboard() {
  const [refreshKey, setRefreshKey] = useState(0)
  return <main className="app-shell dashboard-page"><header className="page-intro"><span className="eyebrow">YOUR READING ROOM / 01</span><h1>A quieter place for difficult ideas.</h1><p>Distill the source, make a personal record, then revisit it when it matters.</p></header><UploadPdf onSummaryCreated={() => setRefreshKey((key) => key + 1)} /><History refreshKey={refreshKey} /></main>
}
