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
createRoot(container).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
)
