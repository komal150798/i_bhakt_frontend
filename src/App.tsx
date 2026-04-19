import React, { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import AOS from 'aos'
import 'aos/dist/aos.css'
import './styles/variables.css'
import './styles/globals.css'
import './styles/bootstrap-overrides.css'

// Providers from common/ (used by home pages)
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './common/context/AuthContext'
import { AdminAuthProvider } from './common/context/AdminAuthContext'
import { LanguageProvider } from './common/i18n/LanguageContext'
import { ToastProvider } from './common/components/Toast/ToastProvider'

// Layouts
import HomeLayout from './home/layout/HomeLayout'

// Home pages (loaded via homeRoutes)
import { homeRoutes } from './home/routes/homeRoutes'

// Standalone pages (not inside HomeLayout)
import AdminLoginPage from './pages/AdminLoginPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AboutPage from './pages/AboutPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import TermsPage from './pages/TermsPage'
import RefundPolicyPage from './pages/RefundPolicyPage'
import PricingPolicyPage from './pages/PricingPolicyPage'
import DisclaimerPage from './pages/DisclaimerPage'
import ContactPage from './pages/ContactPage'

// Admin routes
import { adminRoutes } from './admin/routes/adminRoutes.js'
import AdminLayout from './admin/layout/AdminLayout'
import AdminRoute from './admin/routes/AdminRoute'

const ScrollToTop: React.FC = () => {
	const { pathname } = useLocation()
	useEffect(() => {
		window.scrollTo(0, 0)
	}, [pathname])
	return null
}

function AdminProtectedRoute({ children }: { children: React.ReactElement }) {
	const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
	if (!adminToken) {
		return <Navigate to="/admin/login" replace />
	}
	return children
}

const AppContentInner: React.FC = () => {
	useEffect(() => {
		AOS.init({
			duration: 800,
			easing: 'ease-in-out',
			once: true,
			offset: 100,
		})
	}, [])

	return (
		<>
			<ScrollToTop />
			<Routes>
				{/* Admin Login */}
				<Route path="/admin/login" element={<AdminLoginPage />} />

				{/* Protected Admin Routes */}
				<Route
					path="/admin"
					element={
						<AdminProtectedRoute>
							<AdminLayout />
						</AdminProtectedRoute>
					}
				>
					{adminRoutes.map((route: any) => {
						if (route.index) {
							return (
								<Route
									key="index"
									index
									element={
										route.permission ? (
											<AdminRoute permission={route.permission}>
												<route.element />
											</AdminRoute>
										) : (
											<route.element />
										)
									}
								/>
							)
						}
						return (
							<Route
								key={route.path}
								path={route.path}
								element={
									route.permission ? (
										<AdminRoute permission={route.permission}>
											<route.element />
										</AdminRoute>
									) : (
										<route.element />
									)
								}
							/>
						)
					})}
				</Route>

				{/* Home Routes - with HomeLayout (Header + Footer) */}
				<Route path="/" element={<HomeLayout />}>
					{homeRoutes.map((route: any) => {
						if (route.path === '/' && route.index) {
							return (
								<Route
									key={route.path}
									index
									element={<route.element />}
								/>
							)
						}
						const relativePath = route.path.replace(/^\//, '')
						return (
							<Route
								key={route.path}
								path={relativePath}
								element={<route.element />}
							/>
						)
					})}

					{/* Legal Pages - inside HomeLayout so they get Header + Footer */}
					<Route path="about" element={<AboutPage />} />
					<Route path="privacy" element={<PrivacyPolicyPage />} />
					<Route path="terms" element={<TermsPage />} />
					<Route path="refund" element={<RefundPolicyPage />} />
					<Route path="pricing-policy" element={<PricingPolicyPage />} />
					<Route path="disclaimer" element={<DisclaimerPage />} />
					<Route path="contact" element={<ContactPage />} />
				</Route>

				{/* Catch-all */}
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</>
	)
}

const App: React.FC = () => {
	const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

	return (
		<GoogleOAuthProvider clientId={googleClientId}>
			<ThemeProvider>
				<LanguageProvider>
					<ToastProvider>
						<AuthProvider>
							<AdminAuthProvider>
								<BrowserRouter>
									<AppContentInner />
								</BrowserRouter>
							</AdminAuthProvider>
						</AuthProvider>
					</ToastProvider>
				</LanguageProvider>
			</ThemeProvider>
		</GoogleOAuthProvider>
	)
}

export { App }
export default App
