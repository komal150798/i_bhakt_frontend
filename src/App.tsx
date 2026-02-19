import React, { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AOS from 'aos'
import LandingPage from './pages/LandingPage'
import HomePage from './pages/HomePage'
import DashboardPage from './pages/DashboardPage'
import KarmaLedgerPage from './pages/KarmaLedgerPage'
import ManifestationPage from './pages/ManifestationPage'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AboutPage from './pages/AboutPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import TermsPage from './pages/TermsPage'
import RefundPolicyPage from './pages/RefundPolicyPage'
import PricingPolicyPage from './pages/PricingPolicyPage'
import DisclaimerPage from './pages/DisclaimerPage'
import ContactPage from './pages/ContactPage'
import PricingPage from './pages/PricingPage'
import LoginPage from './home/pages/LoginPage/LoginPage'
import SignupPage from './home/pages/SignupPage/SignupPage'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { LanguageProvider } from './context/LanguageContext'
import Header from './components/Header'
import Footer from './components/Footer'

// Error Boundary Component
class ErrorBoundary extends React.Component<
	{ children: React.ReactNode },
	{ hasError: boolean; error: Error | null }
> {
	constructor(props: { children: React.ReactNode }) {
		super(props)
		this.state = { hasError: false, error: null }
	}

	static getDerivedStateFromError(error: Error) {
		return { hasError: true, error }
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error('DashboardPage Error:', error, errorInfo)
	}

	render() {
		if (this.state.hasError) {
			return (
				<div style={{ minHeight: '100vh', background: '#0f172a', color: '#fff', padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
					<h1 style={{ fontSize: 24, marginBottom: 16 }}>Something went wrong</h1>
					<p style={{ color: '#94a3b8', marginBottom: 24 }}>{this.state.error?.message || 'An error occurred'}</p>
					<button
						onClick={() => {
							this.setState({ hasError: false, error: null })
							globalThis.window.location.reload()
						}}
						style={{
							padding: '12px 24px',
							background: '#6366f1',
							color: '#fff',
							border: 'none',
							borderRadius: 8,
							cursor: 'pointer',
							fontSize: 14,
							fontWeight: 600,
						}}
					>
						Reload Page
					</button>
				</div>
			)
		}
		return this.props.children
	}
}

type ProtectedRouteProps = {
	children: React.ReactElement
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
	const { token, setToken } = useAuth()
	const location = useLocation()
	const [, forceUpdate] = React.useReducer(x => x + 1, 0)
	
	// Always check localStorage directly on every render (most reliable)
	// Don't rely on state which might be stale
	const checkToken = React.useCallback(() => {
		if (!globalThis.window) return null;
		return localStorage.getItem('ibhakt_token')
	}, [])
	
	// Listen for auth events to trigger re-render
	React.useEffect(() => {
		const handleAuthLogin = () => {
			forceUpdate() // Force re-render to re-check token
		}
		
		const handleAuthLogout = () => {
			setToken(null)
			forceUpdate()
		}
		
		globalThis.window.addEventListener('auth:login', handleAuthLogin)
		globalThis.window.addEventListener('auth:logout', handleAuthLogout)
		
		return () => {
			globalThis.window.removeEventListener('auth:login', handleAuthLogin)
			globalThis.window.removeEventListener('auth:logout', handleAuthLogout)
		}
	}, [setToken])
	
	// Check token directly from localStorage (always fresh)
	const currentToken = checkToken()
	const hasToken = !!(currentToken || token)
	
	if (!hasToken) {
		return <Navigate to="/login" replace state={{ from: location.pathname }} />
	}
	
	return children
}

const AdminProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
	const adminToken = localStorage.getItem('admin_token')
	if (!adminToken) {
		return <Navigate to="/admin/login" replace />
	}
	return children
}

const AppContentInner: React.FC = () => {
	const location = useLocation()
	const isAdminRoute = location.pathname.startsWith('/admin')
	const isAdminLogin = location.pathname === '/admin/login'

	useEffect(() => {
		// Initialize AOS
		AOS.init({
			duration: 800,
			easing: 'ease-in-out',
			once: true,
			offset: 100,
		})
	}, [])

	return (
		<>
			{!isAdminLogin && <Header />}
			<main style={{ minHeight: isAdminLogin ? '100vh' : 'calc(100vh - 200px)' }}>
				<Routes>
					{/* Admin routes - must come before catch-all */}
					<Route path="/admin/login" element={<AdminLoginPage />} />
					<Route
						path="/admin/dashboard"
						element={
							<AdminProtectedRoute>
								<AdminDashboardPage />
							</AdminProtectedRoute>
						}
					/>
					<Route path="/admin" element={<Navigate to="/admin/login" replace />} />
					
					{/* Public routes */}
					<Route path="/" element={<HomePage />} />
					<Route path="/login" element={<LoginPage />} />
					<Route path="/landing" element={<LandingPage />} />
					<Route path="/pricing" element={<PricingPage />} />
					
					{/* Protected user routes */}
					<Route
						path="/dashboard"
						element={
							<ProtectedRoute>
								<ErrorBoundary>
									<DashboardPage />
								</ErrorBoundary>
							</ProtectedRoute>
						}
					/>
					<Route
						path="/karma-ledger"
						element={
							<ProtectedRoute>
								<KarmaLedgerPage />
							</ProtectedRoute>
						}
					/>
					{/* Manifestation route - public for Instagram traffic */}
					<Route path="/manifestations" element={<ManifestationPage />} />

					{/* Signup route */}
					<Route path="/signup" element={<SignupPage />} />
					
					{/* Legal Pages */}
					<Route path="/about" element={<AboutPage />} />
					<Route path="/privacy" element={<PrivacyPolicyPage />} />
					<Route path="/terms" element={<TermsPage />} />
					<Route path="/refund" element={<RefundPolicyPage />} />
					<Route path="/pricing-policy" element={<PricingPolicyPage />} />
					<Route path="/disclaimer" element={<DisclaimerPage />} />
					<Route path="/contact" element={<ContactPage />} />
					
					{/* Catch-all - must be last */}
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</main>
			{!isAdminRoute && <Footer />}
		</>
	)
}

const AppContent: React.FC = () => {
	return (
		<BrowserRouter>
			<AppContentInner />
		</BrowserRouter>
	)
}

const App: React.FC = () => {
	return (
		<ThemeProvider>
			<LanguageProvider>
				<AuthProvider>
					<AppContent />
				</AuthProvider>
			</LanguageProvider>
		</ThemeProvider>
	)
}

export { App }
export default App
