/// <reference types="vite/client" />

declare module 'bootstrap/dist/js/bootstrap.bundle.min.js';

interface ImportMetaEnv {
	readonly VITE_BACKEND_URL?: string
	readonly VITE_PUBLIC_URL?: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}

