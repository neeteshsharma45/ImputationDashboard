import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './style.css'
import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <App />
    <Toaster position="top-right" />
  </React.StrictMode>,
)
