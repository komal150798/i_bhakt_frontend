import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react'
import { PlanStructureModal } from './PlanStructureModal'

/** Open the global plan picker from anywhere (e.g. Manifestation, marketing CTAs). */
export const IBAHKT_OPEN_PLAN_MODAL = 'ibhakt:open-plan-modal'

export { IBAHKT_PLAN_UPGRADED, IBAHKT_DASHBOARD_REFRESH } from './PlanStructureModal'

type PlanModalContextValue = {
	openPlanModal: () => void
	closePlanModal: () => void
	isOpen: boolean
}

const PlanModalContext = createContext<PlanModalContextValue | null>(null)

export function PlanModalProvider({ children }: { children: React.ReactNode }) {
	const [isOpen, setIsOpen] = useState(false)
	const openPlanModal = useCallback(() => setIsOpen(true), [])
	const closePlanModal = useCallback(() => setIsOpen(false), [])

	useEffect(() => {
		const onOpen = () => setIsOpen(true)
		window.addEventListener(IBAHKT_OPEN_PLAN_MODAL, onOpen)
		return () => window.removeEventListener(IBAHKT_OPEN_PLAN_MODAL, onOpen)
	}, [])

	const value = useMemo(
		() => ({ openPlanModal, closePlanModal, isOpen }),
		[openPlanModal, closePlanModal, isOpen],
	)

	return (
		<PlanModalContext.Provider value={value}>
			{children}
			<PlanStructureModal isOpen={isOpen} onClose={closePlanModal} />
		</PlanModalContext.Provider>
	)
}

export function usePlanModal(): PlanModalContextValue {
	const ctx = useContext(PlanModalContext)
	if (!ctx) {
		throw new Error('usePlanModal must be used within PlanModalProvider')
	}
	return ctx
}
