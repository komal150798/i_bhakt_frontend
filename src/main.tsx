import React from 'react'
import { createRoot } from 'react-dom/client'
// Bootstrap CSS + JS (dropdowns, modals); avoid duplicate CDN in index.html
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
// Bootstrap Icons
import 'bootstrap-icons/font/bootstrap-icons.css'
// AOS Animations
import 'aos/dist/aos.css'
// Main styles
import App from './App'
import './index.css'

const container = document.getElementById('root')!
createRoot(container).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
)
