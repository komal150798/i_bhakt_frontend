/**
 * Single place to resolve the Nest global prefix base (`/api/v1`).
 * Matches logic in `authApi.js` / `karmaApi.js` so dashboard + plan modal hit the same host as auth.
 */
export function getApiV1BaseUrl(): string {
	const raw =
		(typeof import.meta.env.VITE_BACKEND_URL === 'string' && import.meta.env.VITE_BACKEND_URL.trim()) ||
		(typeof import.meta.env.VITE_API_URL === 'string' && import.meta.env.VITE_API_URL.trim()) ||
		'http://localhost:3000'
	let origin = raw.replace(/\/$/, '')
	if (/\/api\/v\d+$/i.test(origin)) {
		return origin
	}
	return `${origin}/api/v1`
}

/** Host origin without `/api/v1` (for resolving relative media paths like `/uploads/...`). */
export function getBackendOrigin(): string {
	return getApiV1BaseUrl().replace(/\/api\/v\d+$/i, '')
}
