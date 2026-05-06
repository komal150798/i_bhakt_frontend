import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { getApiV1BaseUrl } from '../config/apiV1BaseUrl'
import { useToast } from '../components/Toast/ToastProvider'
import { useAuth } from '../context/AuthContext'
import {
	buildSubscriptionCheckoutUrl,
	extractUpgradePlanFromResponse,
	fetchHomeRuntimeConfig,
	shouldUsePaymentCheckout,
} from './planUpgradeFlow'
import {
	catalogPlanIsCurrent,
	formatPlanPrice,
	normalizeUserPlanType,
	parseJwtSub,
	planFeatureBullets,
	planTypeToTier,
	shouldShowPlanUpgradeButton,
	type SubscriptionCatalogPlan,
} from './planCatalogHelpers'
import {
	copyButtonStyle,
	planCardBodyStyle,
	planCardCurrentBadgeStyle,
	planCardHeaderStyle,
	planCardIncludesStyle,
	planCardListItemStyle,
	planCardListStyle,
	planCardPriceCenterStyle,
	planCardTaglineStyle,
	planCardTierNumberStyle,
	planCardTierStyle,
	planCardTitleStyle,
	planCardUnlocksStyle,
	planModalBodyStyle,
	planModalCloseButtonStyle,
	planModalContentStyle,
	planModalHeaderStyle,
	planModalOverlayStyle,
	planModalTitleStyle,
	planQuickActionButtonStyle,
	planQuickActionWrapStyle,
	planCardStyle,
	referralCodeBoxStyle,
	referralCodeDisplayStyle,
	referralCodeTextStyle,
	referralProgressBarStyle,
	referralProgressFillStyle,
	referralProgressHeaderStyle,
	referralProgressStyle,
} from './planModalStyles'

export const IBAHKT_PLAN_UPGRADED = 'ibhakt:plan-upgraded'

/** Refetch dashboard + entitlements (e.g. after Razorpay verify). */
export const IBAHKT_DASHBOARD_REFRESH = 'ibhakt:dashboard-refresh'

type Props = {
	isOpen: boolean
	onClose: () => void
}

function normalizePlanRow(p: Record<string, unknown>): SubscriptionCatalogPlan {
	const idRaw = p.id
	const idNum =
		typeof idRaw === 'number' ? idRaw : typeof idRaw === 'string' ? Number.parseInt(idRaw, 10) : 0
	return {
		id: Number.isFinite(idNum) && idNum > 0 ? idNum : 0,
		unique_id: String(p.unique_id ?? '').trim(),
		plan_type: String(p.plan_type ?? ''),
		name: String(p.name ?? ''),
		description: (p.description as string | null) ?? null,
		tagline: (p.tagline as string | null) ?? null,
		monthly_price: Number(p.monthly_price) || 0,
		yearly_price:
			p.yearly_price != null && p.yearly_price !== '' ? Number(p.yearly_price) : null,
		currency: String(p.currency ?? 'INR'),
		billing_cycle_days: p.billing_cycle_days != null ? Number(p.billing_cycle_days) : null,
		referral_count_required:
			p.referral_count_required != null ? Number(p.referral_count_required) : null,
		sort_order: Number(p.sort_order) || 0,
		features: Array.isArray(p.features)
			? (p.features as SubscriptionCatalogPlan['features'])
			: [],
		is_popular: Boolean(p.is_popular),
		usage_limits:
			p.usage_limits && typeof p.usage_limits === 'object'
				? (p.usage_limits as Record<string, number>)
				: null,
		metadata:
			p.metadata && typeof p.metadata === 'object'
				? (p.metadata as Record<string, unknown>)
				: null,
	}
}

export function PlanStructureModal({ isOpen, onClose }: Props) {
	const { token, setUserId, userId } = useAuth()
	const { showSuccess, showError } = useToast()
	const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(
		null,
	)
	const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
		setToast({ message, type })
		setTimeout(() => setToast(null), 4000)
	}, [])

	const [usePaymentCheckout, setUsePaymentCheckout] = useState(() => shouldUsePaymentCheckout())
	const [upgradeConfirmPlan, setUpgradeConfirmPlan] = useState<SubscriptionCatalogPlan | null>(null)

	const apiV1Base = useMemo(() => getApiV1BaseUrl(), [])

	useEffect(() => {
		let cancelled = false
		void (async () => {
			const cfg = await fetchHomeRuntimeConfig(apiV1Base)
			if (!cancelled) {
				setUsePaymentCheckout(shouldUsePaymentCheckout(cfg?.node_env ?? null))
			}
		})()
		return () => {
			cancelled = true
		}
	}, [apiV1Base])

	const publicBaseUrl = useMemo(() => {
		const configured = import.meta.env.VITE_PUBLIC_URL
		if (typeof configured === 'string' && configured.trim().length > 0) {
			return configured.replace(/\/$/, '')
		}
		return typeof window !== 'undefined' ? window.location.origin : ''
	}, [])

	const authHeaders = useMemo(
		() => (token ? { Authorization: `Bearer ${token}` } : undefined),
		[token],
	)

	const [currentPlan, setCurrentPlan] = useState<string>('awaken')
	const [catalogPlans, setCatalogPlans] = useState<SubscriptionCatalogPlan[]>([])
	const [catalogPlansLoading, setCatalogPlansLoading] = useState(false)
	const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null)

	const [referralCode, setReferralCode] = useState<string | null>(null)
	const [referralCount, setReferralCount] = useState(0)
	const [referralLimitAwaken, setReferralLimitAwaken] = useState(5)
	const [referralLimitKarmaPro, setReferralLimitKarmaPro] = useState(51)
	const [referralType, setReferralType] = useState<'email' | 'phone'>('email')
	const [referralValue, setReferralValue] = useState('')
	const [sendingReferral, setSendingReferral] = useState(false)
	const [userReferrals, setUserReferrals] = useState<{
		pending: Array<{ id: number; referral_type: string; referral_value: string }>
		completed: Array<{ id: number; referral_type: string; referral_value: string }>
	} | null>(null)

	const refreshProfilePlan = useCallback(async () => {
		if (!token) return
		try {
			const res = await fetch(`${apiV1Base}/users/profile`, {
				headers: { 'Content-Type': 'application/json', ...(authHeaders || {}) },
			})
			const payload = await res.json().catch(() => null)
			const row =
				payload &&
				typeof payload === 'object' &&
				(payload as { success?: boolean }).success === true &&
				typeof (payload as { data?: unknown }).data === 'object'
					? (payload as { data: Record<string, unknown> }).data
					: null
			const plan = row && typeof row.current_plan === 'string' ? row.current_plan : null
			if (plan) setCurrentPlan(plan)
		} catch {
			/* optional */
		}
	}, [token, apiV1Base, authHeaders])

	const fetchReferralStats = useCallback(async () => {
		try {
			const res = await fetch(`${apiV1Base}/users/referral-stats`, {
				headers: { 'Content-Type': 'application/json', ...(authHeaders || {}) },
			})
			const payload = await res.json().catch(() => null)
			if (!res.ok || !payload) return null
			const data =
				payload &&
				typeof payload === 'object' &&
				(payload as { success?: boolean }).success === true &&
				(payload as { data?: unknown }).data != null
					? (payload as { data: Record<string, unknown> }).data
					: (payload as Record<string, unknown>)
			if (!data || typeof data !== 'object') return null
			if (typeof data.referral_code === 'string') setReferralCode(data.referral_code)
			if (typeof data.referral_count === 'number') setReferralCount(data.referral_count)
			if (typeof data.referral_limit_awaken_to_builder === 'number') {
				setReferralLimitAwaken(data.referral_limit_awaken_to_builder)
			}
			if (typeof data.referral_limit_karma_pro_to_dharma === 'number') {
				setReferralLimitKarmaPro(data.referral_limit_karma_pro_to_dharma)
			}
			if (data.current_plan != null) setCurrentPlan(String(data.current_plan))
			return data
		} catch {
			return null
		}
	}, [apiV1Base, authHeaders])

	const fetchUserReferrals = useCallback(async () => {
		try {
			const res = await fetch(`${apiV1Base}/users/referrals`, {
				headers: { 'Content-Type': 'application/json', ...(authHeaders || {}) },
			})
			const text = await res.text()
			let payload: unknown = null
			try {
				payload = text ? JSON.parse(text) : null
			} catch {
				payload = null
			}
			if (!res.ok || !payload || typeof payload !== 'object') return
			const body = payload as { success?: boolean; data?: unknown }
			const data =
				body.success === true && body.data != null && typeof body.data === 'object'
					? body.data
					: body
			if (
				data &&
				typeof data === 'object' &&
				Array.isArray((data as { pending?: unknown }).pending) &&
				Array.isArray((data as { completed?: unknown }).completed)
			) {
				const d = data as {
					pending: Array<{ id: number; referral_type: string; referral_value: string }>
					completed: Array<{ id: number; referral_type: string; referral_value: string }>
				}
				setUserReferrals({ pending: d.pending, completed: d.completed })
			}
		} catch {
			/* optional */
		}
	}, [apiV1Base, authHeaders])

	const effectiveUserId = useMemo(
		() => userId ?? parseJwtSub(token || localStorage.getItem('ibhakt_token')),
		[userId, token],
	)

	const handleSendReferral = useCallback(async () => {
		const uid = effectiveUserId
		if (!uid || !referralValue.trim()) {
			showToast('Please enter an email or phone number', 'error')
			return
		}
		setSendingReferral(true)
		try {
			const res = await fetch(`/api/users/${uid}/send-referral`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', ...(authHeaders || {}) },
				body: JSON.stringify({
					referral_type: referralType,
					referral_value: referralValue.trim(),
				}),
			})
			if (!res.ok) {
				const error = await res.json().catch(() => ({}))
				throw new Error((error as { detail?: string }).detail || 'Failed to send referral')
			}
			const data = await res.json().catch(() => ({}))
			showToast((data as { message?: string }).message || 'Referral sent successfully!', 'success')
			setReferralValue('')
			await fetchUserReferrals()
			await fetchReferralStats()
		} catch (error: unknown) {
			showToast((error as Error)?.message || 'Failed to send referral', 'error')
		} finally {
			setSendingReferral(false)
		}
	}, [
		effectiveUserId,
		referralValue,
		referralType,
		authHeaders,
		fetchUserReferrals,
		fetchReferralStats,
		showToast,
	])

	const executeDirectUpgrade = useCallback(
		async (planRow: SubscriptionCatalogPlan) => {
			const bearer =
				token ||
				(typeof window !== 'undefined' ? window.localStorage.getItem('ibhakt_token') : null)
			if (!bearer) {
				showError('Please sign in again to change your plan.')
				return
			}
			const uid = planRow.unique_id?.trim() || ''
			const rawId = planRow.id as unknown
			const pid =
				typeof rawId === 'number'
					? rawId
					: typeof rawId === 'string'
						? Number.parseInt(rawId, 10)
						: NaN
			const reqBody: { unique_id?: string; plan_id?: number } = {}
			if (uid) reqBody.unique_id = uid
			if (Number.isFinite(pid) && pid >= 1) reqBody.plan_id = pid
			if (!reqBody.unique_id && reqBody.plan_id == null) {
				showError('Invalid plan from server. Refresh and try again.')
				return
			}
			const upgradingKey =
				uid || (Number.isFinite(pid) && pid >= 1 ? `id:${pid}` : String(planRow.plan_type))
			setUpgradingPlan(upgradingKey)
			try {
				const res = await fetch(`${apiV1Base}/users/upgrade-plan`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${bearer}`,
					},
					body: JSON.stringify(reqBody),
				})
				const payload = await res.json().catch(() => null)
				if (!res.ok || !payload) {
					const errBody = payload as { message?: string; detail?: string } | null
					throw new Error(errBody?.message || errBody?.detail || 'Failed to upgrade plan')
				}
				const body = payload as { success?: boolean }
				if (body.success === false) {
					const errBody = payload as { message?: string; detail?: string }
					throw new Error(errBody?.message || errBody?.detail || 'Failed to upgrade plan')
				}
				const planStr = extractUpgradePlanFromResponse(payload)
				if (planStr) setCurrentPlan(planStr)
				showSuccess(`Successfully upgraded to ${planRow.name}!`)
				window.dispatchEvent(
					new CustomEvent(IBAHKT_PLAN_UPGRADED, { detail: { plan: planStr || undefined } }),
				)
				const refreshId = userId ?? parseJwtSub(bearer)
				if (refreshId && typeof setUserId === 'function') setUserId(refreshId)
				void fetchReferralStats()
				onClose()
			} catch (error: unknown) {
				showError((error as Error)?.message || 'Failed to upgrade plan')
			} finally {
				setUpgradingPlan(null)
			}
		},
		[token, apiV1Base, showSuccess, showError, onClose, userId, setUserId, fetchReferralStats],
	)

	const handleConfirmDevUpgrade = useCallback(() => {
		const p = upgradeConfirmPlan
		setUpgradeConfirmPlan(null)
		if (p) void executeDirectUpgrade(p)
	}, [upgradeConfirmPlan, executeDirectUpgrade])

	const handleConfirmPaymentRedirect = useCallback(() => {
		const p = upgradeConfirmPlan
		setUpgradeConfirmPlan(null)
		onClose()
		if (p) {
			window.location.assign(buildSubscriptionCheckoutUrl(p))
		}
	}, [upgradeConfirmPlan, onClose])

	useEffect(() => {
		if (!isOpen || !token) return
		let cancelled = false
		void refreshProfilePlan()
		void fetchReferralStats()
		void fetchUserReferrals()
		;(async () => {
			setCatalogPlansLoading(true)
			try {
				const res = await fetch(`${apiV1Base}/subscription/plans`, {
					headers: { ...(authHeaders || {}) },
				})
				const json = await res.json().catch(() => null)
				if (!res.ok) {
					const msg =
						(json as { message?: string } | null)?.message || 'Failed to load subscription plans'
					throw new Error(msg)
				}
				const top = (json as { data?: unknown })?.data
				const rows = Array.isArray(top)
					? top
					: top && typeof top === 'object' && Array.isArray((top as { data?: unknown }).data)
						? (top as { data: unknown[] }).data
						: []
				const list = (Array.isArray(rows) ? rows : [])
					.map((r) => normalizePlanRow(r as Record<string, unknown>))
					.filter((p) => p.unique_id || p.id > 0)
					.sort((a, b) => a.sort_order - b.sort_order)
				if (!cancelled) setCatalogPlans(list)
			} catch (e: unknown) {
				if (!cancelled) {
					setCatalogPlans([])
					showToast((e as Error)?.message || 'Could not load plans from server', 'error')
				}
			} finally {
				if (!cancelled) setCatalogPlansLoading(false)
			}
		})()
		return () => {
			cancelled = true
		}
	}, [
		isOpen,
		token,
		apiV1Base,
		authHeaders,
		showToast,
		refreshProfilePlan,
		fetchReferralStats,
		fetchUserReferrals,
	])

	useEffect(() => {
		if (!isOpen) setUpgradeConfirmPlan(null)
	}, [isOpen])

	if (!isOpen) return null

	return (
		<>
			{upgradeConfirmPlan && (
				<div
					style={{
						position: 'fixed',
						inset: 0,
						zIndex: 10050,
						background: 'rgba(0,0,0,0.6)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						padding: 20,
					}}
					onClick={() => setUpgradeConfirmPlan(null)}
					onKeyDown={(e) => {
						if (e.key === 'Escape') setUpgradeConfirmPlan(null)
					}}
					role="presentation"
				>
					<div
						role="dialog"
						aria-modal="true"
						aria-labelledby="upgrade-confirm-title"
						style={{
							maxWidth: 440,
							width: '100%',
							background: 'linear-gradient(165deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)',
							border: '1px solid rgba(148, 163, 184, 0.25)',
							borderRadius: 14,
							padding: '24px 28px',
							boxShadow: '0 24px 48px rgba(0,0,0,0.45)',
						}}
						onClick={(e) => e.stopPropagation()}
					>
						<h3
							id="upgrade-confirm-title"
							style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}
						>
							Confirm upgrade
						</h3>
						<p style={{ margin: '0 0 20px', fontSize: 14, lineHeight: 1.55, color: '#cbd5e1' }}>
							{usePaymentCheckout ? (
								<>
									<strong style={{ color: '#fde68a' }}>Paid upgrade:</strong> you will leave this
									screen and complete payment on our secure checkout (card / UPI / net banking as
									available). Your subscription updates only after the payment succeeds. Plan:{' '}
									<strong style={{ color: '#e2e8f0' }}>{upgradeConfirmPlan.name}</strong>.
								</>
							) : (
								<>
									<strong style={{ color: '#86efac' }}>Development mode:</strong> your plan activates
									immediately on the server — no payment is collected. Plan:{' '}
									<strong style={{ color: '#e2e8f0' }}>{upgradeConfirmPlan.name}</strong>.
								</>
							)}
						</p>
						<div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
							<button
								type="button"
								style={{
									padding: '10px 18px',
									borderRadius: 8,
									border: '1px solid rgba(148, 163, 184, 0.4)',
									background: 'rgba(148, 163, 184, 0.12)',
									color: '#e2e8f0',
									fontSize: 14,
									fontWeight: 600,
									cursor: 'pointer',
								}}
								onClick={() => setUpgradeConfirmPlan(null)}
							>
								Cancel
							</button>
							{usePaymentCheckout ? (
								<button
									type="button"
									style={{
										padding: '10px 18px',
										borderRadius: 8,
										border: '1px solid rgba(99, 102, 241, 0.5)',
										background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.9), rgba(79, 70, 229, 0.95))',
										color: '#fff',
										fontSize: 14,
										fontWeight: 600,
										cursor: 'pointer',
									}}
									onClick={handleConfirmPaymentRedirect}
								>
									Continue to payment
								</button>
							) : (
								<button
									type="button"
									disabled={
										!!upgradingPlan &&
										upgradingPlan ===
											(upgradeConfirmPlan.unique_id ||
												(upgradeConfirmPlan.id ? `id:${upgradeConfirmPlan.id}` : String(upgradeConfirmPlan.plan_type)))
									}
									style={{
										padding: '10px 18px',
										borderRadius: 8,
										border: '1px solid rgba(34, 197, 94, 0.45)',
										background: 'linear-gradient(135deg, rgba(22, 163, 74, 0.85), rgba(21, 128, 61, 0.9))',
										color: '#fff',
										fontSize: 14,
										fontWeight: 600,
										cursor: 'pointer',
										opacity:
											!!upgradingPlan &&
											upgradingPlan ===
												(upgradeConfirmPlan.unique_id ||
													(upgradeConfirmPlan.id ? `id:${upgradeConfirmPlan.id}` : String(upgradeConfirmPlan.plan_type)))
												? 0.65
												: 1,
									}}
									onClick={handleConfirmDevUpgrade}
								>
									{upgradingPlan &&
									upgradingPlan ===
										(upgradeConfirmPlan.unique_id ||
											(upgradeConfirmPlan.id ? `id:${upgradeConfirmPlan.id}` : String(upgradeConfirmPlan.plan_type)))
										? 'Activating…'
										: 'Activate plan'}
								</button>
							)}
						</div>
					</div>
				</div>
			)}
			{toast && (
				<div
					style={{
						position: 'fixed',
						bottom: 24,
						left: '50%',
						transform: 'translateX(-50%)',
						zIndex: 10001,
						padding: '12px 20px',
						borderRadius: 10,
						background:
							toast.type === 'error'
								? 'rgba(127, 29, 29, 0.95)'
								: toast.type === 'success'
									? 'rgba(6, 78, 59, 0.95)'
									: 'rgba(30, 41, 59, 0.95)',
						color: '#f8fafc',
						fontSize: 14,
						boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
					}}
				>
					{toast.message}
				</div>
			)}
			<div style={planModalOverlayStyle} onClick={onClose}>
				<div style={planModalContentStyle} onClick={(e) => e.stopPropagation()}>
					<div style={planModalHeaderStyle}>
						<h2 style={planModalTitleStyle}>
							<span className="brand-mark">iBhakt</span> Plan Structure
						</h2>
						<button
							type="button"
							style={planModalCloseButtonStyle}
							onClick={onClose}
							onMouseEnter={(e) => {
								e.currentTarget.style.background = 'rgba(148, 163, 184, 0.3)'
								e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.5)'
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.background = 'rgba(148, 163, 184, 0.2)'
								e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.3)'
							}}
						>
							✕
						</button>
					</div>
					<div style={planModalBodyStyle}>
						{catalogPlansLoading ? (
							<div style={{ textAlign: 'center', padding: 32, color: '#94a3b8', fontSize: 15 }}>
								Loading subscription plans…
							</div>
						) : !catalogPlans.length ? (
							<div style={{ textAlign: 'center', padding: 32, color: '#94a3b8', fontSize: 15 }}>
								No plans loaded. Open this modal again or check that the API returns plans for your
								account.
							</div>
						) : (
							catalogPlans.map((plan, idx) => {
								const tier = planTypeToTier(plan.plan_type)
								const planLevel = idx + 1
								const isCurrent = catalogPlanIsCurrent(plan, currentPlan)
								const canPurchaseUpgrade = shouldShowPlanUpgradeButton(plan, currentPlan)
								const bullets = planFeatureBullets(plan)
								const priceLabel = formatPlanPrice(plan)
								const referralUnlock =
									plan.referral_count_required != null && plan.referral_count_required > 0
										? `Refer ${plan.referral_count_required} friend${plan.referral_count_required === 1 ? '' : 's'}`
										: null
								const planUpgradeKey =
									plan.unique_id || (plan.id ? `id:${plan.id}` : String(plan.plan_type))
								return (
									<div key={plan.unique_id || `plan-${plan.id}-${idx}`} style={planCardStyle(tier, isCurrent)}>
										{isCurrent && <div style={planCardCurrentBadgeStyle}>Current Plan</div>}
										<div style={planCardHeaderStyle(tier)}>
											<div style={planCardTierStyle}>
												<span style={planCardTierNumberStyle}>{planLevel}️⃣</span>
												<div>
													<h3 style={planCardTitleStyle}>{plan.name}</h3>
													<p style={planCardTaglineStyle}>{plan.tagline || plan.description || '\u00a0'}</p>
												</div>
											</div>
										</div>
										{priceLabel && <div style={planCardPriceCenterStyle}>{priceLabel}</div>}
										<div style={planCardBodyStyle}>
											{canPurchaseUpgrade && (
												<div style={planQuickActionWrapStyle}>
													<button
														type="button"
														style={planQuickActionButtonStyle}
														disabled={!!upgradingPlan && upgradingPlan === planUpgradeKey}
														onClick={(e) => {
															e.stopPropagation()
															setUpgradeConfirmPlan(plan)
														}}
													>
														{upgradingPlan === planUpgradeKey
															? 'Upgrading...'
															: `Upgrade — ${plan.name}`}
													</button>
												</div>
											)}
											<div style={planCardIncludesStyle}>
												<strong>Includes:</strong>
												<ul style={planCardListStyle}>
													{bullets.map((item, bidx) => (
														<li key={bidx} style={planCardListItemStyle}>
															{item}
														</li>
													))}
												</ul>
											</div>
											{referralUnlock && plan.plan_type === 'karma_builder' && (
												<div style={planCardUnlocksStyle}>
													<div
														style={{
															width: '100%',
															background: 'rgba(99, 102, 241, 0.14)',
															border: '1px solid rgba(99, 102, 241, 0.35)',
															color: '#c7d2fe',
															fontWeight: 600,
															padding: '12px 20px',
															fontSize: 14,
															borderRadius: 8,
														}}
													>
														🔗 Auto-unlock via referrals: {referralUnlock}
													</div>
												</div>
											)}
											{referralUnlock && plan.plan_type !== 'karma_builder' && (
												<div style={planCardUnlocksStyle}>
													<strong>Unlocks when:</strong> {referralUnlock}
												</div>
											)}
											{plan.plan_type === 'karma_builder' &&
												normalizeUserPlanType(currentPlan) === 'awaken' && (
													<div style={referralProgressStyle}>
														<div style={referralProgressHeaderStyle}>
															<strong>Referral Progress:</strong>
															<span>
																{referralCount} / {referralLimitAwaken} referrals
															</span>
														</div>
														<div style={referralProgressBarStyle}>
															<div
																style={{
																	...referralProgressFillStyle,
																	width: `${Math.min(100, (referralCount / referralLimitAwaken) * 100)}%`,
																}}
															/>
														</div>
														{referralCode && (
															<div style={referralCodeDisplayStyle}>
																<span>Your Referral Code:</span>
																<div style={referralCodeBoxStyle}>
																	<code style={referralCodeTextStyle}>{referralCode}</code>
																	<button
																		type="button"
																		style={copyButtonStyle}
																		onClick={() => {
																			navigator.clipboard.writeText(referralCode)
																			showToast('Referral code copied!', 'success')
																		}}
																	>
																		Copy Code
																	</button>
																</div>
																<div style={{ marginTop: 12 }}>
																	<span
																		style={{
																			fontSize: 12,
																			color: '#94a3b8',
																			display: 'block',
																			marginBottom: 6,
																		}}
																	>
																		Share Your Referral Link:
																	</span>
																	<div style={referralCodeBoxStyle}>
																		<code
																			style={{
																				...referralCodeTextStyle,
																				fontSize: 11,
																				wordBreak: 'break-all',
																			}}
																		>
																			{publicBaseUrl}/?ref={referralCode}
																		</code>
																		<button
																			type="button"
																			style={copyButtonStyle}
																			onClick={() => {
																				const referralUrl = `${publicBaseUrl}/?ref=${referralCode}`
																				navigator.clipboard.writeText(referralUrl)
																				showToast(
																					'Referral link copied! Share it with friends.',
																					'success',
																				)
																			}}
																		>
																			Copy Link
																		</button>
																	</div>
																</div>
																<div
																	style={{
																		marginTop: 20,
																		padding: 16,
																		background: 'rgba(15, 23, 42, 0.6)',
																		borderRadius: 12,
																		border: '1px solid rgba(148, 163, 184, 0.2)',
																	}}
																>
																	<div
																		style={{
																			fontSize: 13,
																			fontWeight: 600,
																			color: '#cbd5f5',
																			marginBottom: 12,
																		}}
																	>
																		Refer via Email or Phone
																	</div>
																	<div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
																		<button
																			type="button"
																			onClick={() => setReferralType('email')}
																			style={{
																				flex: 1,
																				padding: '8px 12px',
																				borderRadius: 8,
																				border: '1px solid rgba(148, 163, 184, 0.3)',
																				background:
																					referralType === 'email'
																						? 'rgba(99, 102, 241, 0.3)'
																						: 'rgba(15, 23, 42, 0.5)',
																				color: '#e0e7ff',
																				fontSize: 12,
																				cursor: 'pointer',
																			}}
																		>
																			Email
																		</button>
																		<button
																			type="button"
																			onClick={() => setReferralType('phone')}
																			style={{
																				flex: 1,
																				padding: '8px 12px',
																				borderRadius: 8,
																				border: '1px solid rgba(148, 163, 184, 0.3)',
																				background:
																					referralType === 'phone'
																						? 'rgba(99, 102, 241, 0.3)'
																						: 'rgba(15, 23, 42, 0.5)',
																				color: '#e0e7ff',
																				fontSize: 12,
																				cursor: 'pointer',
																			}}
																		>
																			Phone
																		</button>
																	</div>
																	<input
																		type={referralType === 'email' ? 'email' : 'tel'}
																		value={referralValue}
																		onChange={(e) => setReferralValue(e.target.value)}
																		placeholder={
																			referralType === 'email'
																				? 'Enter email address'
																				: 'Enter phone number'
																		}
																		style={{
																			width: '100%',
																			padding: '10px 12px',
																			borderRadius: 8,
																			border: '1px solid rgba(148, 163, 184, 0.3)',
																			background: 'rgba(15, 23, 42, 0.7)',
																			color: '#f8fafc',
																			fontSize: 13,
																			marginBottom: 12,
																		}}
																	/>
																	<button
																		type="button"
																		onClick={() => void handleSendReferral()}
																		disabled={sendingReferral || !referralValue.trim()}
																		style={{
																			width: '100%',
																			padding: '10px 16px',
																			borderRadius: 8,
																			border: 'none',
																			background: sendingReferral
																				? 'rgba(148, 163, 184, 0.5)'
																				: 'rgba(99, 102, 241, 0.8)',
																			color: '#f8fafc',
																			fontSize: 13,
																			fontWeight: 600,
																			cursor: sendingReferral ? 'not-allowed' : 'pointer',
																			opacity: sendingReferral || !referralValue.trim() ? 0.6 : 1,
																		}}
																	>
																		{sendingReferral
																			? 'Sending...'
																			: `Send Referral via ${referralType === 'email' ? 'Email' : 'Phone'}`}
																	</button>
																</div>
															</div>
														)}
														{userReferrals &&
															(userReferrals.pending.length > 0 ||
																userReferrals.completed.length > 0) && (
																<div
																	style={{
																		marginTop: 16,
																		padding: 12,
																		background: 'rgba(15, 23, 42, 0.4)',
																		borderRadius: 10,
																		fontSize: 11,
																	}}
																>
																	<div style={{ color: '#94a3b8', marginBottom: 8 }}>
																		Pending: {userReferrals.pending.length} | Completed:{' '}
																		{userReferrals.completed.length}
																	</div>
																	{userReferrals.pending.length > 0 && (
																		<div style={{ marginTop: 8 }}>
																			<div style={{ color: '#c9a84c', marginBottom: 4, fontSize: 10 }}>
																				Pending Referrals:
																			</div>
																			{userReferrals.pending.slice(0, 3).map((ref) => (
																				<div
																					key={ref.id}
																					style={{ color: '#cbd5f5', fontSize: 10, marginTop: 2 }}
																				>
																					{ref.referral_type === 'email' ? '📧' : '📱'}{' '}
																					{ref.referral_value}
																				</div>
																			))}
																			{userReferrals.pending.length > 3 && (
																				<div style={{ color: '#94a3b8', fontSize: 10, marginTop: 4 }}>
																					+{userReferrals.pending.length - 3} more
																				</div>
																			)}
																		</div>
																	)}
																</div>
															)}
													</div>
												)}
											{plan.plan_type === 'dharma_master' &&
												normalizeUserPlanType(currentPlan) === 'karma_pro' && (
													<div style={referralProgressStyle}>
														<div style={referralProgressHeaderStyle}>
															<strong>Referral Progress to Dharma Master:</strong>
															<span>
																{referralCount} / {referralLimitKarmaPro} referrals
															</span>
														</div>
														<div style={referralProgressBarStyle}>
															<div
																style={{
																	...referralProgressFillStyle,
																	width: `${Math.min(100, (referralCount / referralLimitKarmaPro) * 100)}%`,
																}}
															/>
														</div>
														{referralCode && (
															<div style={referralCodeDisplayStyle}>
																<span>Your Referral Code:</span>
																<div style={referralCodeBoxStyle}>
																	<code style={referralCodeTextStyle}>{referralCode}</code>
																	<button
																		type="button"
																		style={copyButtonStyle}
																		onClick={() => {
																			navigator.clipboard.writeText(referralCode)
																			showToast('Referral code copied!', 'success')
																		}}
																	>
																		Copy Code
																	</button>
																</div>
																<div style={{ marginTop: 12 }}>
																	<span
																		style={{
																			fontSize: 12,
																			color: '#94a3b8',
																			display: 'block',
																			marginBottom: 6,
																		}}
																	>
																		Share Your Referral Link:
																	</span>
																	<div style={referralCodeBoxStyle}>
																		<code
																			style={{
																				...referralCodeTextStyle,
																				fontSize: 11,
																				wordBreak: 'break-all',
																			}}
																		>
																			{publicBaseUrl}/?ref={referralCode}
																		</code>
																		<button
																			type="button"
																			style={copyButtonStyle}
																			onClick={() => {
																				const referralUrl = `${publicBaseUrl}/?ref=${referralCode}`
																				navigator.clipboard.writeText(referralUrl)
																				showToast(
																					'Referral link copied! Share it with friends.',
																					'success',
																				)
																			}}
																		>
																			Copy Link
																		</button>
																	</div>
																</div>
															</div>
														)}
													</div>
												)}
										</div>
									</div>
								)
							})
						)}
					</div>
				</div>
			</div>
		</>
	)
}
