import React from 'react'
import { createRoot } from 'react-dom/client'
// Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css'
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
