import React, { createContext, useContext, useMemo, useState } from 'react'

type UserProfile = {
	fullName?: string
	email?: string
	phoneNumber?: string
	dateOfBirth?: string
	timeOfBirth?: string
	placeOfBirth?: string
	gender?: string
}

type AuthContextValue = {
	token: string | null
	setToken: (token: string | null) => void
	profile: UserProfile | null
	setProfile: (profile: UserProfile | null) => void
	userId: number | null
	setUserId: (id: number | null) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [tokenState, setTokenState] = useState<string | null>(() => {
		return window.localStorage.getItem('ibhakt_token')
	})

	const [profileState, setProfileState] = useState<UserProfile | null>(() => {
		const raw = window.localStorage.getItem('ibhakt_profile')
		if (!raw) return null
		try {
			return JSON.parse(raw)
		} catch {
			return null
		}
	})

	const [userIdState, setUserIdState] = useState<number | null>(() => {
		const raw = window.localStorage.getItem('ibhakt_user_id')
		if (!raw) return null
		const parsed = Number(raw)
		return Number.isFinite(parsed) ? parsed : null
	})

	// Sync function to update state from localStorage
	const syncFromLocalStorage = React.useCallback(() => {
		const currentToken = window.localStorage.getItem('ibhakt_token')
		if (currentToken !== tokenState) {
			setTokenState(currentToken)
		}
		
		// Try to sync user data from ibhakt_user (used by common AuthContext)
		const userData = window.localStorage.getItem('ibhakt_user')
		if (userData) {
			try {
				const user = JSON.parse(userData)
				// Map user data to profile
				setProfileState(prev => {
					if (prev) return prev // Don't overwrite if already set
					return {
						fullName: user.full_name || user.name || user.fullName,
						email: user.email,
						phoneNumber: user.phone_number || user.phoneNumber,
						dateOfBirth: user.date_of_birth || user.dateOfBirth,
						timeOfBirth: user.time_of_birth || user.timeOfBirth,
						placeOfBirth: user.place_of_birth || user.placeOfBirth,
						gender: user.gender,
					}
				})
				if (user.id) {
					setUserIdState(prev => prev || Number(user.id))
				}
			} catch (e) {
				console.warn('Failed to parse user data:', e)
			}
		}
	}, [tokenState])

	// Listen for auth events
	React.useEffect(() => {
		const handleAuthLogout = () => {
			setTokenState(null)
			setProfileState(null)
			setUserIdState(null)
		}
		
		const handleAuthLogin = () => {
			syncFromLocalStorage()
		}
		
		window.addEventListener('auth:logout', handleAuthLogout)
		window.addEventListener('auth:login', handleAuthLogin)
		
		// Initial sync on mount
		syncFromLocalStorage()
		
		// Poll for localStorage changes (since storage event doesn't fire for same-tab changes)
		const interval = setInterval(syncFromLocalStorage, 1000) // Check every 1 second
		
		return () => {
			window.removeEventListener('auth:logout', handleAuthLogout)
			window.removeEventListener('auth:login', handleAuthLogin)
			clearInterval(interval)
		}
	}, [syncFromLocalStorage])

	const setToken = (value: string | null) => {
		setTokenState(value)
		if (value) {
			window.localStorage.setItem('ibhakt_token', value)
		} else {
			window.localStorage.removeItem('ibhakt_token')
		}
	}

	const setProfile = (value: UserProfile | null) => {
		setProfileState(value)
		if (value) {
			window.localStorage.setItem('ibhakt_profile', JSON.stringify(value))
		} else {
			window.localStorage.removeItem('ibhakt_profile')
		}
	}

	const setUserId = (value: number | null) => {
		setUserIdState(value)
		if (value !== null && Number.isFinite(value)) {
			window.localStorage.setItem('ibhakt_user_id', String(value))
		} else {
			window.localStorage.removeItem('ibhakt_user_id')
		}
	}

	const value = useMemo<AuthContextValue>(
		() => ({
			token: tokenState,
			setToken,
			profile: profileState,
			setProfile,
			userId: userIdState,
			setUserId,
		}),
		[tokenState, profileState, userIdState]
	)

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextValue => {
	const ctx = useContext(AuthContext)
	if (!ctx) {
		throw new Error('useAuth must be used within an AuthProvider')
	}
	return ctx
}

