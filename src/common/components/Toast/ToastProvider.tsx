import {
	createContext,
	useCallback,
	useContext,
	useState,
	type ReactNode,
} from 'react'
import ToastContainer from './ToastContainer'

export type ToastShowOptions = {
	title?: string
	description?: string
	duration?: number
	actionLabel?: string
	onActionClick?: () => void
	position?: string
}

export type ToastItemData = {
	id: string
	type: string
	title?: string
	message: string
	description?: string
	duration: number
	actionLabel?: string
	onActionClick?: () => void
	position: string
	createdAt: number
}

export type ToastContextValue = {
	toasts: ToastItemData[]
	addToast: (toast: ToastItemData) => void
	removeToast: (id: string) => void
	showSuccess: (message: string, options?: ToastShowOptions) => void
	showError: (message: string, options?: ToastShowOptions) => void
	showInfo: (message: string, options?: ToastShowOptions) => void
	showWarning: (message: string, options?: ToastShowOptions) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export const ToastTypes = {
	SUCCESS: 'success',
	ERROR: 'error',
	INFO: 'info',
	WARNING: 'warning',
} as const

export const ToastPositions = {
	TOP_RIGHT: 'top-right',
	TOP_LEFT: 'top-left',
	BOTTOM_RIGHT: 'bottom-right',
	BOTTOM_LEFT: 'bottom-left',
} as const

export function createToast(
	type: string,
	message: string,
	options: ToastShowOptions = {},
): ToastItemData {
	const {
		title,
		description,
		duration = 4000,
		actionLabel,
		onActionClick,
		position = ToastPositions.TOP_RIGHT,
	} = options

	return {
		id: `toast-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
		type,
		title,
		message,
		description,
		duration,
		actionLabel,
		onActionClick,
		position,
		createdAt: Date.now(),
	}
}

export function ToastProvider({ children }: { children: ReactNode }) {
	const [toasts, setToasts] = useState<ToastItemData[]>([])

	const addToast = useCallback((toast: ToastItemData) => {
		setToasts((prev) => [...prev, toast])
	}, [])

	const removeToast = useCallback((id: string) => {
		setToasts((prev) => prev.filter((toast) => toast.id !== id))
	}, [])

	const showSuccess = useCallback(
		(message: string, options: ToastShowOptions = {}) => {
			const toast = createToast(ToastTypes.SUCCESS, message, options)
			addToast(toast)
		},
		[addToast],
	)

	const showError = useCallback(
		(message: string, options: ToastShowOptions = {}) => {
			const toast = createToast(ToastTypes.ERROR, message, options)
			addToast(toast)
		},
		[addToast],
	)

	const showInfo = useCallback(
		(message: string, options: ToastShowOptions = {}) => {
			const toast = createToast(ToastTypes.INFO, message, options)
			addToast(toast)
		},
		[addToast],
	)

	const showWarning = useCallback(
		(message: string, options: ToastShowOptions = {}) => {
			const toast = createToast(ToastTypes.WARNING, message, options)
			addToast(toast)
		},
		[addToast],
	)

	const value: ToastContextValue = {
		toasts,
		addToast,
		removeToast,
		showSuccess,
		showError,
		showInfo,
		showWarning,
	}

	return (
		<ToastContext.Provider value={value}>
			{children}
			<ToastContainer toasts={toasts} onRemove={removeToast} />
		</ToastContext.Provider>
	)
}

export function useToast(): ToastContextValue {
	const context = useContext(ToastContext)
	if (!context) {
		throw new Error('useToast must be used within ToastProvider')
	}
	return context
}
