import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const normalizePhoneAttempts = (raw: string): string[] => {
	const trimmed = raw.trim()
	if (!trimmed) return []
	const digits = trimmed.replace(/\D+/g, '')
	const leadingStripped = digits.replace(/^0+/, '')
	const attempts = new Set<string>()
	attempts.add(trimmed)
	if (digits) attempts.add(digits)
	if (leadingStripped) attempts.add(leadingStripped)
	if (digits.length > 10) {
		attempts.add(digits.slice(-10))
	}
	return Array.from(attempts)
}

type KarmaRecord = {
	id: number
	category_slug?: string | null
	category_label?: string | null
	score_delta: number
	sentiment?: string | null
	confidence?: number | null
	recorded_at: string
	input_text?: string | null
	metadata?: Record<string, any> | null
	source: string
	status: 'pending' | 'completed' | 'skipped' | 'not_implemented'
}

type KarmaSummary = {
	user_id: number
	cumulative_score: number
	positive_score: number
	negative_score: number
	records: KarmaRecord[]
}

type UserDetails = {
	id: number
	first_name: string | null
	last_name: string | null
	phone_number: string | null
}

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const KarmaLedgerPage: React.FC = () => {
	const navigate = useNavigate()
	const { token, profile, userId, setUserId } = useAuth()
	const [currentUser, setCurrentUser] = useState<UserDetails | null>(null)
	const [karmaSummary, setKarmaSummary] = useState<KarmaSummary | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [actionFeedback, setActionFeedback] = useState<string | null>(null)
	const [actionError, setActionError] = useState<string | null>(null)
	const [updatingRecordId, setUpdatingRecordId] = useState<number | null>(null)

	const authHeaders = useMemo(
		() =>
			token
				? {
					Authorization: `Bearer ${token}`,
				}
				: undefined,
		[token]
	)

	const describeActionStatus = (status: KarmaRecord['status']) => {
		if (status === 'completed') return 'Implemented'
		if (status === 'not_implemented') return 'Not Implemented'
		if (status === 'skipped') return 'Skipped'
		return 'Pending'
	}

	const describeTipFrequency = (metadata?: Record<string, any> | null): string | null => {
		if (!metadata) return null
		const frequency = metadata.frequency
		if (!frequency) return null
		if (frequency === 'daily') return 'Daily ritual'
		const label =
			typeof metadata.scheduled_day === 'number'
				? WEEKDAY_LABELS[metadata.scheduled_day] ?? 'selected day'
				: 'selected day'
		if (frequency === 'weekly') return `Weekly · ${label}`
		if (frequency === 'specific_day') return `Specific day · ${label}`
		return frequency
	}

	const formatDueDate = (raw?: string | null): string | null => {
		if (!raw) return null
		const parsed = new Date(raw)
		if (Number.isNaN(parsed.getTime())) return null
		return parsed.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
	}

	const fetchUserDetails = useCallback(
		async (targetUserId: number) => {
			const res = await fetch(`/api/users/${targetUserId}`, {
				headers: { 'Content-Type': 'application/json', ...(authHeaders || {}) },
			})
			const payload = await res.json().catch(() => null)
			if (!res.ok || !payload) {
				const message = (payload as { detail?: string } | null)?.detail || 'Unable to load user details.'
				throw new Error(message)
			}
			setCurrentUser(payload as UserDetails)
			return payload as UserDetails
		},
		[authHeaders]
	)

	const fetchKarma = useCallback(
		async (targetUserId: number) => {
			const res = await fetch(`/api/users/${targetUserId}/karma`, {
				headers: { 'Content-Type': 'application/json', ...(authHeaders || {}) },
			})
			const payload = await res.json().catch(() => null)
			if (!res.ok || !payload) {
				const message = (payload as { detail?: string } | null)?.detail || 'Unable to load karma records.'
				throw new Error(message)
			}
			setKarmaSummary(payload as KarmaSummary)
			return payload as KarmaSummary
		},
		[authHeaders]
	)

	const ensureUserProfile = useCallback(async (): Promise<number | null> => {
		if (userId) {
			return userId
		}
		const phone = profile?.phoneNumber?.trim()
		if (!phone) {
			return null
		}
		const attempts = normalizePhoneAttempts(phone)
		for (const attempt of attempts) {
			try {
				const res = await fetch(`/api/users?limit=1&phone=${encodeURIComponent(attempt)}`)
				const payload = await res.json().catch(() => null)
				if (!res.ok || !payload) {
					continue
				}
				const match = (payload as { users?: Array<{ id?: number }> }).users?.find(entry => typeof entry.id === 'number')
				if (match?.id) {
					setUserId(match.id)
					return match.id
				}
			} catch {
				/* ignore */
			}
		}
		return null
	}, [profile?.phoneNumber, setUserId, userId])

	const updateActionStatus = useCallback(
		async (recordId: number, status: 'completed' | 'not_implemented' | 'pending') => {
			if (!currentUser?.id) {
				return
			}
			setUpdatingRecordId(recordId)
			setActionError(null)
			setActionFeedback(null)
			try {
				const res = await fetch(`/api/users/${currentUser.id}/guidance/${recordId}/status`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json', ...(authHeaders || {}) },
					body: JSON.stringify({ status }),
				})
				if (!res.ok) {
					const detail = await res.json().catch(() => ({}))
					const errorMessage = detail.detail || 'Unable to update action status.'
					throw new Error(errorMessage)
				}
				await fetchKarma(currentUser.id)
				if (status === 'not_implemented') {
					setActionFeedback('Action marked as Not Implemented. This is a final decision and cannot be changed.')
				} else {
					setActionFeedback(
						status === 'completed'
							? 'Action marked as Implemented.'
							: 'Action reset to pending.'
					)
				}
			} catch (err: any) {
				setActionError(err?.message || 'Unable to update action status.')
			} finally {
				setUpdatingRecordId(null)
			}
		},
		[currentUser?.id, authHeaders, fetchKarma]
	)

	useEffect(() => {
		let cancelled = false
		const load = async () => {
			setLoading(true)
			setError(null)
			try {
				let resolvedId = userId
				if (!resolvedId) {
					resolvedId = await ensureUserProfile()
				}
				if (!resolvedId) {
					throw new Error('We could not find your digital twin profile yet.')
				}
				await fetchUserDetails(resolvedId)
				await fetchKarma(resolvedId)
			} catch (err: any) {
				if (!cancelled) {
					setError(err?.message || 'Unable to load karma ledger.')
				}
			} finally {
				if (!cancelled) {
					setLoading(false)
				}
			}
		}
		void load()
		return () => {
			cancelled = true
		}
	}, [userId, ensureUserProfile, fetchKarma, fetchUserDetails])

	const records = karmaSummary?.records ?? []

	return (
		<div style={ledgerPageStyle}>
			<header style={ledgerHeaderStyle}>
				<button style={backButtonStyle} onClick={() => navigate('/dashboard')}>
					← Back to Dashboard
				</button>
				<h1 style={ledgerTitleStyle}>Karma Ledger</h1>
				<div style={{ width: 120 }} />
			</header>
			<main style={ledgerMainStyle}>
				{error && <div style={errorBannerStyle}>{error}</div>}
				{loading ? (
					<p style={{ color: '#cbd5f5' }}>Loading karmic records...</p>
				) : (
					<div style={ledgerContentStyle}>
						<div style={ledgerSummaryRowStyle}>
							<div style={ledgerSummaryCardStyle('#38bdf8')}>
								<span>Cumulative</span>
								<strong>{karmaSummary ? karmaSummary.cumulative_score.toFixed(1) : '0.0'}</strong>
							</div>
							<div style={ledgerSummaryCardStyle('#34d399')}>
								<span>Positive</span>
								<strong>{karmaSummary ? karmaSummary.positive_score.toFixed(1) : '0.0'}</strong>
							</div>
							<div style={ledgerSummaryCardStyle('#f97316')}>
								<span>Negative</span>
								<strong>{karmaSummary ? karmaSummary.negative_score.toFixed(1) : '0.0'}</strong>
							</div>
						</div>
						<div style={ledgerListStyle}>
							{actionError && <div style={errorBannerStyle}>{actionError}</div>}
							{actionFeedback && <div style={successBannerStyle}>{actionFeedback}</div>}
							{records.length === 0 ? (
								<p style={{ color: '#94a3b8' }}>No karma entries yet.</p>
							) : (
								records.map(record => {
									const metadata = record.metadata || {}
									const dueLabel = formatDueDate(metadata.due_date)
									const frequencyLabel = describeTipFrequency(metadata)
									const isActionRecord = record.source === 'guidance' || record.source === 'manifestation_tip'
									const isUpdating = updatingRecordId === record.id
									// Hide action buttons if status is 'completed' or 'not_implemented' (final actions)
									const showActionButtons = isActionRecord && record.status !== 'completed' && record.status !== 'not_implemented'
									return (
										<div key={record.id} style={ledgerRecordCardStyle}>
											<div style={karmaRecordHeaderStyle}>
												<div style={{ fontWeight: 600, color: '#f8fafc' }}>
													{record.category_label || record.category_slug || 'Unclassified'}
												</div>
												<div style={{ fontSize: 12, color: '#94a3b8' }}>
													{new Date(record.recorded_at).toLocaleString()}
												</div>
											</div>
											{record.input_text && <div style={karmaRecordTextStyle}>{record.input_text}</div>}
											<div style={karmaMetaRowStyle}>
												<span>Δ Score: {record.score_delta.toFixed(2)}</span>
												{record.sentiment && <span>Sentiment: {record.sentiment}</span>}
												{record.confidence != null && (
													<span>Confidence: {(record.confidence * 100).toFixed(0)}%</span>
												)}
											</div>
											{record.metadata && (
												<div style={karmaMetadataStyle}>
													{record.metadata.engine && <>Engine: {record.metadata.engine}</>}
													{record.metadata.rationale && (
														<>
															{record.metadata.engine && <br />}
															Rationale: {record.metadata.rationale}
														</>
													)}
													{record.metadata.guidance_title && (
														<div style={{ fontSize: 12, color: '#93c5fd', marginTop: 6 }}>
															Guidance: {record.metadata.guidance_title}
														</div>
													)}
												</div>
											)}
											{isActionRecord && (
												<div style={actionStatusWrapperStyle}>
													<div style={actionStatusHeaderStyle}>
														<span style={actionStatusBadgeStyle(record.status)}>
															{describeActionStatus(record.status)}
															{record.status === 'not_implemented' && (
																<span style={{ marginLeft: 6, fontSize: 10, opacity: 0.8 }}>🔒 Final</span>
															)}
														</span>
														<div style={actionStatusMetaRowStyle}>
															{frequencyLabel && <span style={dueBadgeStyle}>{frequencyLabel}</span>}
															{dueLabel && <span style={dueBadgeStyle}>Due {dueLabel}</span>}
														</div>
													</div>
													{record.status === 'not_implemented' && (
														<div style={{ fontSize: 11, color: '#fecaca', fontStyle: 'italic', marginTop: 4 }}>
															This action has been marked as final and cannot be changed.
														</div>
													)}
													{showActionButtons && (
														<div style={actionButtonRowStyle}>
															<button
																type="button"
																style={{
																	...actionPrimaryButtonStyle,
																	opacity: isUpdating ? 0.6 : 1,
																}}
																disabled={isUpdating}
																onClick={() => updateActionStatus(record.id, 'completed')}
															>
																Implemented
															</button>
															<button
																type="button"
																style={{
																	...actionSecondaryButtonStyle,
																	opacity: isUpdating ? 0.6 : 1,
																}}
																disabled={isUpdating}
																onClick={() => updateActionStatus(record.id, 'not_implemented')}
															>
																Not Implemented
															</button>
														</div>
													)}
												</div>
											)}
										</div>
									)
								})
							)}
						</div>
					</div>
				)}
			</main>
		</div>
	)
}

const ledgerPageStyle: React.CSSProperties = {
	minHeight: '100vh',
	background: 'radial-gradient(circle at top, #0f172a 0%, #030712 60%)',
	color: '#f8fafc',
	paddingBottom: 48,
}

const ledgerHeaderStyle: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	padding: '24px 48px 12px',
}

const backButtonStyle: React.CSSProperties = {
	background: 'rgba(148, 163, 184, 0.2)',
	border: '1px solid rgba(148, 163, 184, 0.4)',
	padding: '8px 14px',
	borderRadius: 999,
	color: '#e2e8f0',
	cursor: 'pointer',
}

const ledgerTitleStyle: React.CSSProperties = {
	fontSize: 24,
	fontWeight: 700,
	color: '#facc15',
}

const ledgerMainStyle: React.CSSProperties = {
	padding: '0 48px 48px',
}

const ledgerContentStyle: React.CSSProperties = {
	display: 'grid',
	gap: 24,
}

const ledgerSummaryRowStyle: React.CSSProperties = {
	display: 'grid',
	gap: 16,
	gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
}

const ledgerSummaryCardStyle = (color: string): React.CSSProperties => ({
	background: `linear-gradient(135deg, ${color}, rgba(15,23,42,0.85))`,
	borderRadius: 16,
	padding: '14px 18px',
	display: 'flex',
	flexDirection: 'column',
	gap: 4,
	boxShadow: '0 15px 30px rgba(2,6,23,0.5)',
})

const ledgerListStyle: React.CSSProperties = {
	borderRadius: 20,
	border: '1px solid rgba(148,163,184,0.2)',
	background: 'rgba(15,23,42,0.8)',
	padding: '20px 22px',
	display: 'grid',
	gap: 12,
	maxHeight: '65vh',
	overflowY: 'auto',
}

const ledgerRecordCardStyle: React.CSSProperties = {
	borderRadius: 16,
	border: '1px solid rgba(148,163,184,0.22)',
	padding: '14px 16px',
	background: 'rgba(15, 23, 42, 0.75)',
	display: 'grid',
	gap: 6,
}

const karmaRecordHeaderStyle: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	gap: 12,
}

const karmaRecordTextStyle: React.CSSProperties = {
	fontSize: 13,
	color: '#e2e8f0',
}

const karmaMetaRowStyle: React.CSSProperties = {
	display: 'flex',
	gap: 12,
	flexWrap: 'wrap',
	fontSize: 12,
	color: '#cbd5f5',
}

const karmaMetadataStyle: React.CSSProperties = {
	fontSize: 12,
	color: '#93c5fd',
}

const actionStatusWrapperStyle: React.CSSProperties = {
	display: 'grid',
	gap: 10,
	marginTop: 8,
}

const actionStatusHeaderStyle: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	gap: 12,
	flexWrap: 'wrap',
}

const actionStatusMetaRowStyle: React.CSSProperties = {
	display: 'flex',
	gap: 8,
	flexWrap: 'wrap',
}

const actionButtonRowStyle: React.CSSProperties = {
	display: 'flex',
	gap: 10,
	flexWrap: 'wrap',
}

const dueBadgeStyle: React.CSSProperties = {
	borderRadius: 999,
	padding: '4px 10px',
	fontSize: 11,
	color: '#c7d2fe',
	background: 'rgba(79, 70, 229, 0.18)',
	border: '1px solid rgba(129, 140, 248, 0.35)',
}

const actionPrimaryButtonStyle: React.CSSProperties = {
	border: 'none',
	borderRadius: 999,
	padding: '6px 14px',
	fontSize: 12,
	fontWeight: 600,
	background: 'rgba(34, 197, 94, 0.22)',
	color: '#bbf7d0',
	cursor: 'pointer',
}

const actionSecondaryButtonStyle: React.CSSProperties = {
	...actionPrimaryButtonStyle,
	background: 'rgba(248, 113, 113, 0.25)',
	color: '#fecaca',
}

const actionStatusBadgeStyle = (status: KarmaRecord['status']): React.CSSProperties => {
	let background = 'rgba(56, 189, 248, 0.18)'
	let color = '#bae6fd'
	if (status === 'completed') {
		background = 'rgba(34, 197, 94, 0.22)'
		color = '#bbf7d0'
	} else if (status === 'not_implemented' || status === 'skipped') {
		background = 'rgba(248, 113, 113, 0.25)'
		color = '#fecaca'
	}
	return {
		borderRadius: 999,
		padding: '4px 12px',
		fontSize: 11,
		fontWeight: 600,
		background,
		color,
	}
}

const errorBannerStyle: React.CSSProperties = {
	background: 'rgba(248, 113, 113, 0.2)',
	color: '#fecaca',
	padding: '12px 14px',
	borderRadius: 12,
	border: '1px solid rgba(248, 113, 113, 0.4)',
}

const successBannerStyle: React.CSSProperties = {
	background: 'rgba(34, 197, 94, 0.18)',
	color: '#bbf7d0',
	padding: '12px 14px',
	borderRadius: 12,
	border: '1px solid rgba(34, 197, 94, 0.35)',
}

export default KarmaLedgerPage
