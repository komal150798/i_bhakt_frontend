import React from 'react'
import { createRoot } from 'react-dom/client'
// Bootstrap CSS only here; JS deferred — see scheduleBootstrapJs()
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import { scheduleBootstrapJs } from './common/utils/scheduleBootstrapJs'
// Main styles
import App from './App'
import './index.css'

scheduleBootstrapJs()

const container = document.getElementById('root')!
// StrictMode intentionally off: React 18 dev double-mounts effects, which duplicates every
// useEffect-driven GET. Production never did that; re-enable StrictMode when refactoring
// data loading to a deduping layer (e.g. TanStack Query) or AbortController-only patterns.
createRoot(container).render(<App />)
