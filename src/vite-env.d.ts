/// <reference types="vite/client" />

declare module 'bootstrap/dist/js/bootstrap.bundle.min.js';

interface ImportMetaEnv {
	readonly VITE_BACKEND_URL?: string
	readonly VITE_API_URL?: string
	readonly VITE_PUBLIC_URL?: string
	/** Full URL for paid plan checkout (prod). If unset, uses `${origin}/checkout?...`. */
	readonly VITE_SUBSCRIPTION_CHECKOUT_URL?: string
	/** Force payment redirect even in dev (QA). */
	readonly VITE_FORCE_PAYMENT_FLOW?: string
	/** Force direct API upgrade even in prod (emergency). */
	readonly VITE_SKIP_PAYMENT_CHECKOUT?: string
	/** Optional: `dev` / `development` vs `prod` / `production` to mirror backend NODE_ENV without fetching. */
	readonly VITE_NODE_ENV?: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}

