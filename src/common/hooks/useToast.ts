import { useCallback } from 'react'
import { useToast as useToastContext } from '../components/Toast/ToastProvider'

export { useToast } from '../components/Toast/ToastProvider'

export function useConfirmWithToast() {
	const { showWarning } = useToastContext()
	return useCallback((message: string, onConfirm: () => void | Promise<void>) => {
		showWarning(message, {
			actionLabel: 'Confirm',
			duration: 7000,
			onActionClick: () => {
				void onConfirm()
			},
		})
	}, [showWarning])
}

export function useNotifyHeuristic() {
	const { showError, showSuccess } = useToastContext()
	return useCallback((message: string) => {
		if (/error|failed|fail/i.test(message)) {
			showError(message)
		} else {
			showSuccess(message)
		}
	}, [showError, showSuccess])
}
