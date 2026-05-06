import React, { useCallback, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { getApiV1BaseUrl } from '../common/config/apiV1BaseUrl'
import { useAuth } from '../common/context/AuthContext'
type RazorpayCtor = new (options: Record<string, unknown>) => {
	open: () => void
	on: (event: string, handler: (response: Record<string, string>) => void) => void
}

declare global {
	interface Window {
		Razorpay?: RazorpayCtor
	}
}

function loadRazorpayScript(): Promise<void> {
	if (typeof window === 'undefined') return Promise.reject(new Error('No window'))
	if (window.Razorpay) return Promise.resolve()
	return new Promise((resolve, reject) => {
		const existing = document.querySelector('script[data-ibhakt-razorpay="1"]')
		if (existing) {
			existing.addEventListener('load', () => resolve(), { once: true })
			existing.addEventListener('error', () => reject(new Error('Razorpay script failed')), { once: true })
			return
		}
		const s = document.createElement('script')
		s.src = 'https://checkout.razorpay.com/v1/checkout.js'
		s.async = true
		s.dataset.ibhaktRazorpay = '1'
		s.onload = () => resolve()
		s.onerror = () => reject(new Error('Failed to load Razorpay'))
		document.body.appendChild(s)
	})
}

function unwrapData<T>(json: unknown): T | null {
	if (!json || typeof json !== 'object') return null
	const o = json as Record<string, unknown>
	if (o.success === true && o.data != null && typeof o.data === 'object') {
		return o.data as T
	}
	return (json as T) ?? null
}

/**
 * Web subscription checkout: query params `plan_unique_id` (UUID) and optional `plan_id`.
 * After successful verify, redirects to dashboard and triggers a full data refresh.
 */
const SubscriptionCheckoutPage: React.FC = () => {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const { token } = useAuth()
	const apiV1Base = useMemo(() => getApiV1BaseUrl(), [])

	const planUniqueId = (searchParams.get('plan_unique_id') || '').trim()
	const [status, setStatus] = useState<'idle' | 'loading' | 'paying' | 'done' | 'error'>('idle')
	const [message, setMessage] = useState<string | null>(null)

	const bearer = useMemo(
		() => token || (typeof window !== 'undefined' ? localStorage.getItem('ibhakt_token') : null),
		[token],
	)

	const goDashboardAfterSuccess = useCallback(() => {
		// Dashboard is not mounted on /checkout — refresh runs via ?payment=success after navigation.
		navigate('/dashboard?payment=success', { replace: true })
	}, [navigate])

	const startCheckout = useCallback(async () => {
		if (!planUniqueId) {
			setStatus('error')
			setMessage('Missing plan. Open Plans again and choose Upgrade.')
			return
		}
		if (!bearer) {
			setStatus('error')
			setMessage('Please sign in to continue to checkout.')
			return
		}

		setStatus('loading')
		setMessage(null)

		try {
			const orderRes = await fetch(`${apiV1Base}/app/payments/razorpay/order`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${bearer}`,
				},
				body: JSON.stringify({ plan_unique_id: planUniqueId, billing: 'yearly' }),
			})
			const orderJson = await orderRes.json().catch(() => null)
			if (!orderRes.ok) {
				const err = orderJson as { message?: string; data?: { message?: string } } | null
				throw new Error(err?.message || (err as { data?: { message?: string } })?.data?.message || 'Could not start checkout')
			}

			const data = unwrapData<{
				mode?: string
				requires_verification?: boolean
				key_id?: string
				amount?: number
				currency?: string
				razorpay_order_id?: string
			}>(orderJson)

			if (!data) {
				throw new Error('Invalid response from server')
			}

			if (data.mode === 'offline-dev' || data.requires_verification === false) {
				setStatus('done')
				setMessage('Plan activated (development / offline flow). Redirecting…')
				goDashboardAfterSuccess()
				return
			}

			const keyId = data.key_id
			const amount = data.amount
			const currency = data.currency || 'INR'
			const orderId = data.razorpay_order_id

			if (!keyId || !amount || !orderId) {
				throw new Error('Payment gateway is not fully configured. Check Razorpay keys on the server.')
			}

			await loadRazorpayScript()
			if (!window.Razorpay) {
				throw new Error('Razorpay failed to initialize')
			}

			setStatus('paying')

			const options: Record<string, unknown> = {
				key: keyId,
				amount,
				currency,
				name: 'iBhakt',
				description: 'Subscription',
				order_id: orderId,
				handler: async (response: Record<string, string>) => {
					try {
						const verifyRes = await fetch(`${apiV1Base}/app/payments/razorpay/verify`, {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
								Authorization: `Bearer ${bearer}`,
							},
							body: JSON.stringify({
								razorpay_order_id: response.razorpay_order_id,
								razorpay_payment_id: response.razorpay_payment_id,
								razorpay_signature: response.razorpay_signature,
							}),
						})
						const verifyJson = await verifyRes.json().catch(() => null)
						if (!verifyRes.ok) {
							const err = verifyJson as { message?: string } | null
							throw new Error(err?.message || 'Payment verification failed')
						}
						setStatus('done')
						setMessage('Payment successful. Refreshing your dashboard…')
						goDashboardAfterSuccess()
					} catch (e: unknown) {
						setStatus('error')
						setMessage((e as Error)?.message || 'Verification failed')
					}
				},
				theme: { color: '#4f46e5' },
				modal: {
					ondismiss: () => {
						setStatus('idle')
						setMessage('Checkout closed. You can try again when ready.')
					},
				},
			}

			const rzp = new window.Razorpay(options)
			rzp.open()
		} catch (e: unknown) {
			setStatus('error')
			setMessage((e as Error)?.message || 'Checkout could not start')
		}
	}, [apiV1Base, bearer, goDashboardAfterSuccess, planUniqueId])

	const layoutStyle: React.CSSProperties = {
		minHeight: '60vh',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		padding: '48px 20px',
		color: '#e2e8f0',
		textAlign: 'center',
		maxWidth: 520,
		margin: '0 auto',
	}

	if (!planUniqueId) {
		return (
			<div style={layoutStyle}>
				<h1 style={{ fontSize: 22, marginBottom: 12 }}>Checkout</h1>
				<p style={{ color: '#94a3b8', marginBottom: 20 }}>No plan was specified.</p>
				<Link to="/dashboard" style={{ color: '#a5b4fc' }}>
					Back to dashboard
				</Link>
			</div>
		)
	}

	if (!bearer) {
		return (
			<div style={layoutStyle}>
				<h1 style={{ fontSize: 22, marginBottom: 12 }}>Sign in required</h1>
				<p style={{ color: '#94a3b8', marginBottom: 20 }}>Log in to complete payment for your plan.</p>
				<Link to={`/login?next=${encodeURIComponent(`/checkout?plan_unique_id=${encodeURIComponent(planUniqueId)}`)}`} style={{ color: '#a5b4fc' }}>
					Go to login
				</Link>
			</div>
		)
	}

	return (
		<div style={layoutStyle}>
			<h1 style={{ fontSize: 22, marginBottom: 12 }}>Secure checkout</h1>
			<p style={{ color: '#94a3b8', marginBottom: 16 }}>
				{status === 'loading' && 'Starting payment…'}
				{status === 'paying' && 'Complete payment in the Razorpay window.'}
				{status === 'done' && (message || 'Done.')}
				{status === 'error' && (message || 'Something went wrong.')}
				{status === 'idle' &&
					(message ||
						'Continue to open our secure payment partner (Razorpay). Your plan activates after payment succeeds.')}
			</p>
			{(status === 'idle' || status === 'error') && (
				<button
					type="button"
					onClick={() => {
						setStatus('idle')
						void startCheckout()
					}}
					style={{
						marginTop: 8,
						padding: '12px 24px',
						borderRadius: 8,
						border: '1px solid rgba(99, 102, 241, 0.5)',
						background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.85), rgba(79, 70, 229, 0.9))',
						color: '#fff',
						fontWeight: 600,
						cursor: 'pointer',
					}}
				>
					{status === 'error' ? 'Try again' : 'Continue to payment'}
				</button>
			)}
			<Link to="/dashboard" style={{ display: 'block', marginTop: 24, color: '#64748b', fontSize: 14 }}>
				Cancel and return to dashboard
			</Link>
		</div>
	)
}

export default SubscriptionCheckoutPage
