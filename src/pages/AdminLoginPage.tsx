import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AdminLoginPage() {
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)
	const navigate = useNavigate()

	const backendBaseUrl = useMemo(() => {
		const configured = import.meta.env.VITE_BACKEND_URL
		if (typeof configured === 'string' && configured.trim().length > 0) {
			return configured.replace(/\/$/, '')
		}
		// Use relative URL to leverage Vite proxy, fallback to direct URL
		return '' // Empty string means relative URLs will use the Vite proxy
	}, [])

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)
		setLoading(true)

		try {
			// VITE_API_URL already includes /api/v1
			const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'
			const res = await fetch(`${apiUrl}/admin/auth/login`, {
				method: 'POST',
				headers: { 
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					username,
					password,
				}),
			})

			const response = await res.json()

			if (!res.ok) {
				// Handle error response
				const errorMessage = response.message || response.detail || response.data?.message || 'Login failed'
				throw new Error(errorMessage)
			}

			// Backend uses standard response wrapper: { success, code, message, data }
			// The actual data is in response.data
			const data = response.data

			if (!data || !data.access_token) {
				throw new Error('Invalid response from server')
			}

			// Store token and admin info
			localStorage.setItem('admin_token', data.access_token)
			
			if (data.refresh_token) {
				localStorage.setItem('admin_refresh_token', data.refresh_token)
			}
			
			// Store admin user with permissions
			if (data.user) {
				// Ensure user object has permissions array and proper types
				const adminUser = {
					...data.user,
					id: typeof data.user.id === 'string' ? parseInt(data.user.id, 10) : data.user.id,
					role_id: data.user.role_id ? (typeof data.user.role_id === 'string' ? parseInt(data.user.role_id, 10) : data.user.role_id) : null,
					is_master: data.user.is_master === true || data.user.is_master === 'true' || data.user.is_master === 1,
					permissions: data.user.permissions || [],
				}
				console.log('Login: Storing admin user:', adminUser);
				localStorage.setItem('admin_info', JSON.stringify(adminUser))
				
				// Dispatch custom event to notify context of update
				window.dispatchEvent(new Event('adminAuthUpdate'));
			}
			
			// Small delay to ensure localStorage is updated before navigation
			setTimeout(() => {
				navigate('/admin/dashboard', { replace: true })
			}, 100)
		} catch (err: any) {
			setError(err.message || 'Login failed. Please try again.')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div style={pageStyle}>
			<div style={containerStyle}>
				<div style={headerStyle}>
					<h1 style={titleStyle}>iBhakt Admin Portal</h1>
					<p style={subtitleStyle}>Sign in to manage the application</p>
				</div>

				<form onSubmit={handleLogin} style={formStyle}>
					{error && (
						<div style={errorStyle}>
							{error}
						</div>
					)}

					<div style={inputGroupStyle}>
						<label style={labelStyle}>Username</label>
						<input
							type="text"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							required
							style={inputStyle}
							placeholder="Enter username"
						/>
					</div>

					<div style={inputGroupStyle}>
						<label style={labelStyle}>Password</label>
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							style={inputStyle}
							placeholder="Enter password"
						/>
					</div>

					<button
						type="submit"
						disabled={loading}
						style={buttonStyle(loading)}
					>
						{loading ? 'Signing in...' : 'Sign In'}
					</button>
				</form>
			</div>
		</div>
	)
}

const pageStyle: React.CSSProperties = {
	minHeight: '100vh',
	background: 'radial-gradient(circle at top, #1f2937 0%, #0f172a 45%, #020617 100%)',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	padding: 20,
}

const containerStyle: React.CSSProperties = {
	background: 'rgba(15, 23, 42, 0.8)',
	border: '1px solid rgba(148, 163, 184, 0.2)',
	borderRadius: 20,
	padding: '48px 40px',
	width: '100%',
	maxWidth: 420,
	boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
}

const headerStyle: React.CSSProperties = {
	textAlign: 'center',
	marginBottom: 32,
}

const titleStyle: React.CSSProperties = {
	fontSize: 28,
	fontWeight: 700,
	color: '#f8fafc',
	margin: '0 0 8px 0',
}

const subtitleStyle: React.CSSProperties = {
	fontSize: 14,
	color: '#94a3b8',
	margin: 0,
}

const formStyle: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	gap: 20,
}

const inputGroupStyle: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	gap: 8,
}

const labelStyle: React.CSSProperties = {
	fontSize: 13,
	fontWeight: 600,
	color: '#cbd5e1',
	textTransform: 'uppercase',
	letterSpacing: '0.05em',
}

const inputStyle: React.CSSProperties = {
	background: 'rgba(30, 41, 59, 0.6)',
	border: '1px solid rgba(148, 163, 184, 0.3)',
	borderRadius: 10,
	padding: '12px 16px',
	fontSize: 15,
	color: '#f8fafc',
	outline: 'none',
	transition: 'all 0.2s',
}

const buttonStyle = (loading: boolean): React.CSSProperties => ({
	background: loading
		? 'rgba(59, 130, 246, 0.5)'
		: 'linear-gradient(135deg, #3b82f6, #2563eb)',
	color: '#ffffff',
	border: 'none',
	borderRadius: 10,
	padding: '14px 24px',
	fontSize: 15,
	fontWeight: 600,
	cursor: loading ? 'not-allowed' : 'pointer',
	transition: 'all 0.2s',
	marginTop: 8,
	boxShadow: loading ? 'none' : '0 4px 12px rgba(59, 130, 246, 0.4)',
})

const errorStyle: React.CSSProperties = {
	background: 'rgba(239, 68, 68, 0.1)',
	border: '1px solid rgba(239, 68, 68, 0.3)',
	borderRadius: 8,
	padding: '12px 16px',
	color: '#fca5a5',
	fontSize: 14,
	textAlign: 'center',
}

