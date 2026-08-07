import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Results from './pages/Results'
import Documentation from './pages/Documentation'
import Footer from './components/Footer'
import { Toaster } from 'react-hot-toast'

function App() {
  const [datasetId, setDatasetId] = useState<string | null>(null)

  return (
    <Router>
      <div className="min-h-screen bg-main text-main flex flex-col font-sans selection:bg-brand/30 selection:text-brand">
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--bg-surface)',
              color: 'var(--text-main)',
              border: '1px solid var(--glass-border)',
              borderRadius: '12px',
            },
          }}
        />
        <Navbar />
        <main className="flex-grow pt-16">
          <Routes>
            <Route path="/" element={<Home setDatasetId={setDatasetId} />} />
            <Route path="/dashboard" element={<Dashboard datasetId={datasetId} />} />
            <Route path="/results" element={<Results datasetId={datasetId} />} />
            <Route path="/documentation" element={<Documentation />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
