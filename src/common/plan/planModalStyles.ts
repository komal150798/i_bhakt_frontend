import type { CSSProperties } from 'react'
import type { PlanTier } from './planCatalogHelpers'

export const planModalOverlayStyle: CSSProperties = {
	position: 'fixed',
	top: 0,
	left: 0,
	right: 0,
	bottom: 0,
	background: 'rgba(0, 0, 0, 0.85)',
	backdropFilter: 'blur(8px)',
	zIndex: 10000,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	padding: 20,
	overflowY: 'auto',
}

export const planModalContentStyle: CSSProperties = {
	background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
	borderRadius: 24,
	border: '1px solid rgba(148, 163, 184, 0.2)',
	maxWidth: 1000,
	width: '100%',
	maxHeight: '90vh',
	overflowY: 'auto',
}

export const planModalHeaderStyle: CSSProperties = {
	display: 'flex',
	justifyContent: 'space-between',
	alignItems: 'center',
	padding: '24px 32px',
	borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
	position: 'sticky',
	top: 0,
	background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
	zIndex: 1,
}

export const planModalTitleStyle: CSSProperties = {
	margin: 0,
	fontSize: 24,
	fontWeight: 800,
	color: '#f8fafc',
	letterSpacing: '-0.02em',
}

export const planModalCloseButtonStyle: CSSProperties = {
	background: 'rgba(148, 163, 184, 0.2)',
	border: '1px solid rgba(148, 163, 184, 0.3)',
	borderRadius: 8,
	color: '#cbd5e1',
	width: 32,
	height: 32,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	cursor: 'pointer',
	fontSize: 18,
	fontWeight: 600,
	transition: 'all 0.2s ease-in-out',
}

export const planModalBodyStyle: CSSProperties = {
	padding: '24px 32px',
	display: 'grid',
	gap: 20,
}

export function planCardStyle(tier: PlanTier, isCurrent: boolean): CSSProperties {
	const tierColors: Record<PlanTier, { bg: string; border: string }> = {
		free: { bg: 'rgba(148, 163, 184, 0.1)', border: 'rgba(148, 163, 184, 0.3)' },
		referral: { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.3)' },
		paid: { bg: 'rgba(139, 92, 246, 0.1)', border: 'rgba(139, 92, 246, 0.3)' },
		premium: { bg: 'rgba(251, 191, 36, 0.1)', border: 'rgba(251, 191, 36, 0.3)' },
	}
	const colors = tierColors[tier]
	return {
		background: colors.bg,
		border: `2px solid ${isCurrent ? colors.border : 'rgba(148, 163, 184, 0.2)'}`,
		borderRadius: 16,
		padding: 20,
		position: 'relative',
		boxShadow: isCurrent ? `0 8px 24px ${colors.border}40` : '0 4px 12px rgba(0, 0, 0, 0.2)',
		transition: 'all 0.3s ease-in-out',
	}
}

export function planCardHeaderStyle(_tier: PlanTier): CSSProperties {
	return {
		display: 'flex',
		justifyContent: 'flex-start',
		alignItems: 'flex-start',
		marginBottom: 12,
		gap: 12,
	}
}

export const planCardTierStyle: CSSProperties = {
	display: 'flex',
	gap: 12,
	alignItems: 'flex-start',
	flex: 1,
}

export const planCardTierNumberStyle: CSSProperties = {
	fontSize: 28,
	lineHeight: 1,
}

export const planCardTitleStyle: CSSProperties = {
	margin: 0,
	fontSize: 18,
	fontWeight: 700,
	color: '#f8fafc',
	marginBottom: 4,
}

export const planCardTaglineStyle: CSSProperties = {
	margin: 0,
	fontSize: 13,
	color: '#94a3b8',
	fontStyle: 'italic',
}

export const planCardPriceCenterStyle: CSSProperties = {
	background: 'rgba(251, 191, 36, 0.2)',
	color: '#fde047',
	padding: '12px 20px',
	borderRadius: 12,
	fontSize: 16,
	fontWeight: 700,
	border: '1px solid rgba(251, 191, 36, 0.4)',
	textAlign: 'center',
	marginBottom: 16,
	boxShadow: '0 4px 12px rgba(251, 191, 36, 0.2)',
}

export const planCardBodyStyle: CSSProperties = {
	display: 'grid',
	gap: 12,
}

export const planCardIncludesStyle: CSSProperties = {
	fontSize: 13,
	color: '#cbd5e1',
	lineHeight: 1.6,
}

export const planCardListStyle: CSSProperties = {
	margin: '8px 0 0 0',
	paddingLeft: 20,
	display: 'grid',
	gap: 6,
}

export const planCardListItemStyle: CSSProperties = {
	fontSize: 12,
	color: '#94a3b8',
	lineHeight: 1.5,
}

export const planCardUnlocksStyle: CSSProperties = {
	fontSize: 13,
	color: '#c9a84c',
	lineHeight: 1.6,
	marginTop: 8,
	padding: '8px 12px',
	background: 'rgba(251, 191, 36, 0.1)',
	borderRadius: 8,
	border: '1px solid rgba(251, 191, 36, 0.2)',
}

export const planCardCurrentBadgeStyle: CSSProperties = {
	position: 'absolute',
	top: 16,
	right: 16,
	background: 'linear-gradient(135deg, #34d399, #10b981)',
	color: '#064e3b',
	padding: '6px 14px',
	borderRadius: 999,
	fontSize: 11,
	fontWeight: 700,
	letterSpacing: '0.1em',
	textTransform: 'uppercase',
	boxShadow: '0 4px 12px rgba(52, 211, 153, 0.4)',
	zIndex: 10,
}

export const referralProgressStyle: CSSProperties = {
	marginTop: 16,
	padding: '16px',
	borderRadius: 12,
	background: 'rgba(59, 130, 246, 0.1)',
	border: '1px solid rgba(59, 130, 246, 0.3)',
}

export const referralProgressHeaderStyle: CSSProperties = {
	display: 'flex',
	justifyContent: 'space-between',
	alignItems: 'center',
	marginBottom: 12,
	fontSize: 13,
	color: '#cbd5e1',
}

export const referralProgressBarStyle: CSSProperties = {
	width: '100%',
	height: 8,
	background: 'rgba(148, 163, 184, 0.2)',
	borderRadius: 999,
	overflow: 'hidden',
	marginBottom: 12,
}

export const referralProgressFillStyle: CSSProperties = {
	height: '100%',
	background: 'linear-gradient(90deg, #3b82f6, #2563eb)',
	borderRadius: 999,
	transition: 'width 0.3s ease-in-out',
}

export const referralCodeDisplayStyle: CSSProperties = {
	marginTop: 12,
	fontSize: 12,
	color: '#94a3b8',
}

export const referralCodeBoxStyle: CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	gap: 8,
	marginTop: 8,
}

export const referralCodeTextStyle: CSSProperties = {
	background: 'rgba(15, 23, 42, 0.6)',
	padding: '8px 12px',
	borderRadius: 8,
	fontSize: 14,
	fontWeight: 700,
	color: '#c9a84c',
	letterSpacing: '0.1em',
	flex: 1,
	border: '1px solid rgba(251, 191, 36, 0.3)',
}

export const copyButtonStyle: CSSProperties = {
	background: 'rgba(59, 130, 246, 0.2)',
	color: '#93c5fd',
	border: '1px solid rgba(59, 130, 246, 0.4)',
	borderRadius: 8,
	padding: '8px 16px',
	fontSize: 12,
	fontWeight: 600,
	cursor: 'pointer',
	transition: 'all 0.2s ease-in-out',
}

export const planQuickActionWrapStyle: CSSProperties = {
	marginBottom: 14,
	position: 'relative',
	zIndex: 50,
}

export const planQuickActionButtonStyle: CSSProperties = {
	width: '100%',
	padding: '12px 16px',
	borderRadius: 10,
	border: '1px solid rgba(16, 185, 129, 0.45)',
	background: 'linear-gradient(135deg, rgba(16,185,129,0.95), rgba(5,150,105,0.92))',
	color: '#ecfeff',
	fontWeight: 800,
	fontSize: 14,
	cursor: 'pointer',
	pointerEvents: 'auto',
	position: 'relative',
	zIndex: 60,
}
