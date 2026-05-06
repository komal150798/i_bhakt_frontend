import type { SubscriptionCatalogPlan } from './planCatalogHelpers'
import { getApiV1BaseUrl } from '../config/apiV1BaseUrl'

/** Matches backend `RazorpayCheckoutService.isDevBypassMode` env check. */
export function isNodeEnvDevLike(nodeEnv: string | undefined | null): boolean {
	const e = (nodeEnv || '').toLowerCase().trim()
	return e === 'dev' || e === 'development'
}

/**
 * Dev / local: skip payment; call upgrade API directly.
 * Production-like server or Vite prod build: redirect to checkout after confirming.
 *
 * - `serverNodeEnv`: from GET /home/runtime-config (backend `NODE_ENV`). When set, this wins over
 *   `import.meta.env.PROD` so `NODE_ENV=prod` on the API shows the payment warning even on Vite dev.
 * - `VITE_NODE_ENV=dev|development` forces dev behaviour; `prod|production` forces checkout.
 *
 * Override: VITE_FORCE_PAYMENT_FLOW / VITE_SKIP_PAYMENT_CHECKOUT.
 */
export function shouldUsePaymentCheckout(serverNodeEnv?: string | null): boolean {
	if (import.meta.env.VITE_FORCE_PAYMENT_FLOW === 'true') return true
	if (import.meta.env.VITE_SKIP_PAYMENT_CHECKOUT === 'true') return false
	const viteOverride = (import.meta.env.VITE_NODE_ENV || '').toLowerCase().trim()
	if (viteOverride === 'dev' || viteOverride === 'development') return false
	if (viteOverride === 'prod' || viteOverride === 'production') return true
	if (serverNodeEnv !== undefined && serverNodeEnv !== null && String(serverNodeEnv).length > 0) {
		return !isNodeEnvDevLike(serverNodeEnv)
	}
	return import.meta.env.PROD === true
}

/** Fetch backend NODE_ENV (and is_dev_like) from GET /home/runtime-config. */
export async function fetchHomeRuntimeConfig(
	apiV1Base: string,
): Promise<{ node_env: string; is_dev_like: boolean } | null> {
	try {
		const res = await fetch(`${apiV1Base.replace(/\/$/, '')}/home/runtime-config`)
		const json = (await res.json().catch(() => null)) as
			| { data?: { node_env?: string; is_dev_like?: boolean } }
			| { node_env?: string; is_dev_like?: boolean }
			| null
		if (!res.ok || !json) return null
		const data =
			json && typeof json === 'object' && 'data' in json && json.data && typeof json.data === 'object'
				? (json.data as { node_env?: string; is_dev_like?: boolean })
				: (json as { node_env?: string; is_dev_like?: boolean })
		const node_env = typeof data?.node_env === 'string' ? data.node_env : null
		if (!node_env) return null
		const is_dev_like =
			typeof data?.is_dev_like === 'boolean' ? data.is_dev_like : isNodeEnvDevLike(node_env)
		return { node_env, is_dev_like }
	} catch {
		return null
	}
}

/** Extract plan slug from POST /users/upgrade-plan response (handles interceptor wrapping). */
export function extractUpgradePlanFromResponse(payload: unknown): string | null {
	if (!payload || typeof payload !== 'object') return null
	const p = payload as Record<string, unknown>
	let data: unknown = p.data
	if (data && typeof data === 'object') {
		const inner = data as Record<string, unknown>
		if ('data' in inner && !('plan' in inner)) {
			data = inner.data
		}
	}
	if (data && typeof data === 'object' && 'plan' in data) {
		const plan = (data as { plan?: unknown }).plan
		if (plan != null) return String(plan)
	}
	return null
}

/** Absolute or same-origin URL to open after user confirms paid upgrade. */
export function buildSubscriptionCheckoutUrl(plan: SubscriptionCatalogPlan): string {
	const configured = (import.meta.env.VITE_SUBSCRIPTION_CHECKOUT_URL || '').trim()
	const uid = encodeURIComponent(plan.unique_id || '')
	const pid = plan.id > 0 ? String(plan.id) : ''
	const qs = `plan_unique_id=${uid}${pid ? `&plan_id=${encodeURIComponent(pid)}` : ''}`

	if (configured) {
		const base = configured.replace(/\/$/, '')
		const sep = base.includes('?') ? '&' : '?'
		return `${base}${sep}${qs}`
	}

	const path = `/checkout?${qs}`
	if (typeof window !== 'undefined' && path.startsWith('/')) {
		return `${window.location.origin}${path}`
	}
	return path
}
