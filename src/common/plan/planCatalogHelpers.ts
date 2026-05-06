import type { CSSProperties } from 'react'

export type PlanTier = 'free' | 'referral' | 'paid' | 'premium'

/** Row from GET /api/v1/subscription/plans (browser SPA; native app uses /api/v1/app/subscription/plans). */
export type SubscriptionCatalogPlan = {
	id: number
	unique_id: string
	plan_type: string
	name: string
	description: string | null
	tagline: string | null
	monthly_price: number
	yearly_price: number | null
	currency: string
	billing_cycle_days: number | null
	referral_count_required: number | null
	sort_order: number
	features: Array<{ name: string; description?: string; icon?: string }>
	is_popular: boolean
	usage_limits?: Record<string, number> | null
	metadata?: Record<string, unknown> | null
}

export function planTypeToTier(planType: string): PlanTier {
	if (planType === 'awaken') return 'free'
	if (planType === 'karma_builder') return 'referral'
	if (planType === 'dharma_master') return 'premium'
	if (planType === 'karma_pro') return 'paid'
	return 'paid'
}

export function formatPlanPrice(p: SubscriptionCatalogPlan): string | null {
	const cur = p.currency || 'INR'
	const sym = cur === 'INR' ? '₹' : `${cur} `
	const m = Number(p.monthly_price) || 0
	const y = p.yearly_price != null ? Number(p.yearly_price) : null
	const parts: string[] = []
	if (m > 0) parts.push(`${sym}${m}/mo`)
	if (y != null && y > 0) parts.push(`${sym}${y}/yr`)
	return parts.length ? parts.join(' · ') : null
}

export function planFeatureBullets(p: SubscriptionCatalogPlan): string[] {
	if (p.features?.length) {
		return p.features.map((f) =>
			f.description?.trim() ? `${f.name}: ${f.description}` : f.name,
		)
	}
	if (p.description?.trim()) return [p.description.trim()]
	return ['See iBhakt for full benefits of this plan.']
}

export function isPurchasableSubscriptionPlan(p: SubscriptionCatalogPlan): boolean {
	if (p.plan_type === 'awaken' || p.plan_type === 'karma_builder') return false
	if (p.plan_type === 'karma_pro' || p.plan_type === 'dharma_master') return true
	const m = Number(p.monthly_price) || 0
	const y = p.yearly_price != null ? Number(p.yearly_price) : 0
	if (m > 0 || y > 0) return true
	return Boolean((p.metadata as { allow_direct_upgrade?: boolean } | null)?.allow_direct_upgrade)
}

export function normalizeUserPlanType(pt: string | null | undefined): string {
	const p = String(pt || '')
		.trim()
		.toLowerCase()
	if (p === 'free' || p === '') return 'awaken'
	return p
}

export function subscriptionTierRank(planType: string, sortOrder?: number): number {
	const t = normalizeUserPlanType(planType)
	if (t === 'awaken') return 0
	if (t === 'karma_builder') return 1
	if (t === 'karma_pro') return 2
	if (t === 'dharma_master') return 3
	if (typeof sortOrder === 'number' && Number.isFinite(sortOrder)) {
		return 100 + sortOrder
	}
	return 0
}

export function catalogPlanIsCurrent(plan: SubscriptionCatalogPlan, userPlanRaw: string): boolean {
	const u = normalizeUserPlanType(userPlanRaw)
	return normalizeUserPlanType(plan.plan_type) === u || plan.plan_type === userPlanRaw
}

export function shouldShowPlanUpgradeButton(
	plan: SubscriptionCatalogPlan,
	userPlanRaw: string,
): boolean {
	if (catalogPlanIsCurrent(plan, userPlanRaw)) return false
	if (!isPurchasableSubscriptionPlan(plan)) return false
	const curRank = subscriptionTierRank(userPlanRaw)
	const nextRank = subscriptionTierRank(plan.plan_type, plan.sort_order)
	return nextRank > curRank
}

export function formatCurrentPlanLabel(planRaw: string): string {
	const p = normalizeUserPlanType(planRaw)
	if (p === 'awaken') return 'Awaken'
	if (p === 'karma_builder') return 'Karma Builder'
	if (p === 'karma_pro') return 'Karma Pro'
	if (p === 'dharma_master') return 'Dharma Master'
	return planRaw ? planRaw.replace(/_/g, ' ') : 'Plan'
}

export function parseJwtSub(accessToken: string | null | undefined): number | null {
	if (!accessToken || typeof accessToken !== 'string') return null
	try {
		const parts = accessToken.split('.')
		if (parts.length < 2) return null
		const payload = JSON.parse(
			atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')),
		) as { sub?: string | number }
		const sub = payload.sub
		const n = typeof sub === 'number' ? sub : Number(sub)
		return Number.isFinite(n) && n > 0 ? n : null
	} catch {
		return null
	}
}

export function currentPlanBadgeStyle(plan: string): CSSProperties {
	const colors: Record<string, { bg: string; color: string; border: string }> = {
		awaken: { bg: 'rgba(148, 163, 184, 0.2)', color: '#cbd5e1', border: 'rgba(148, 163, 184, 0.4)' },
		free: { bg: 'rgba(148, 163, 184, 0.2)', color: '#cbd5e1', border: 'rgba(148, 163, 184, 0.4)' },
		karma_builder: { bg: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', border: 'rgba(59, 130, 246, 0.4)' },
		karma_pro: { bg: 'rgba(139, 92, 246, 0.2)', color: '#c4b5fd', border: 'rgba(139, 92, 246, 0.4)' },
		dharma_master: { bg: 'rgba(251, 191, 36, 0.2)', color: '#fde047', border: 'rgba(251, 191, 36, 0.4)' },
	}
	const key = normalizeUserPlanType(plan)
	const style = colors[key] || colors.awaken
	return {
		background: style.bg,
		color: style.color,
		border: `1px solid ${style.border}`,
		borderRadius: 8,
		padding: '4px 12px',
		fontSize: 11,
		fontWeight: 600,
		letterSpacing: '0.05em',
		textTransform: 'uppercase',
	}
}
