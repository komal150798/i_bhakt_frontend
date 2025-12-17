import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logoImage from '../../ibhakt_logo.jpeg'
import { SouthIndianChart } from '../Chart'
import { getTwinState } from '../common/api/twinApi'
import { getEntitlements, checkFeatureAccess } from '../common/api/entitlementsApi'
import { getKarmaDashboard } from '../common/api/karmaApi'
import ManifestationDashboard from '../components/Manifestation/ManifestationDashboard'

// Digital twin image path - user should place the image at frontend/public/digital-twin.png
// Files in the public folder are served at the root path

// Function to get glow color based on cumulative karma score
const getGlowColor = (cumulativeScore: number): string => {
	if (cumulativeScore >= 50) {
		// Very positive - Golden/Yellow
		return '#fbbf24'
	} else if (cumulativeScore >= 20) {
		// Positive - Green
		return '#34d399'
	} else if (cumulativeScore >= 0) {
		// Neutral - Blue
		return '#60a5fa'
	} else if (cumulativeScore >= -20) {
		// Slightly negative - Orange
		return '#fb923c'
	} else {
		// Very negative - Red
		return '#f87171'
	}
}

// Planet symbols mapping
const PLANET_SYMBOLS: Record<string, string> = {
	'Sun': '☉',
	'Moon': '☽',
	'Mars': '♂',
	'Mercury': '☿',
	'Jupiter': '♃',
	'Venus': '♀',
	'Saturn': '♄',
	'Rahu': '☊',
	'Ketu': '☋',
}

// Planet themes mapping (first 5 themes)
const PLANET_THEMES: Record<string, string[]> = {
	'Sun': ['Leadership', 'Authority', 'Confidence', 'Vitality', 'Self-expression'],
	'Moon': ['Emotions', 'Intuition', 'Nurturing', 'Mind', 'Comfort'],
	'Mars': ['Energy', 'Courage', 'Action', 'Competition', 'Passion'],
	'Mercury': ['Ideas', 'Networking', 'Communication', 'Documentation', 'Contracts'],
	'Jupiter': ['Wisdom', 'Expansion', 'Guru', 'Knowledge', 'Prosperity'],
	'Venus': ['Love', 'Beauty', 'Arts', 'Relationships', 'Luxury'],
	'Saturn': ['Hard work', 'Delayed but permanent results', 'Building foundations', 'Structure & systems', 'Leadership through responsibility'],
	'Rahu': ['Desires', 'Materialism', 'Innovation', 'Technology', 'Unconventional'],
	'Ketu': ['Spirituality', 'Detachment', 'Mysticism', 'Intuition', 'Enlightenment'],
}

// Planet-specific thought alignment recommendations for immediate results (Antardasha & Pratyantar)
const THOUGHT_ALIGNMENT: Record<string, {
	aligned: string[]
	avoid: string[]
	affirmation: string
}> = {
	'Sun': {
		aligned: ['Confident', 'Authoritative', 'Clear purpose', 'Self-directed'],
		avoid: ['Doubtful', 'Seeking approval', 'Unclear goals', 'Passive'],
		affirmation: 'I lead with confidence. I manifest through clarity of purpose and self-directed action.'
	},
	'Moon': {
		aligned: ['Intuitive', 'Emotionally balanced', 'Nurturing', 'Reflective'],
		avoid: ['Overly emotional', 'Reactive', 'Neglecting self-care', 'Suppressing feelings'],
		affirmation: 'I trust my intuition. I manifest through emotional balance and nurturing action.'
	},
	'Mars': {
		aligned: ['Action-oriented', 'Courageous', 'Focused energy', 'Determined'],
		avoid: ['Impulsive', 'Aggressive', 'Scattered energy', 'Procrastinating'],
		affirmation: 'I act with courage. I manifest through focused determination and disciplined action.'
	},
	'Mercury': {
		aligned: ['Logical', 'Structured', 'Written', 'Consistent'],
		avoid: ['Emotional', 'Scattered', 'Imagined', 'Random'],
		affirmation: 'I build steadily. I manifest through clarity, structure, and consistent action.'
	},
	'Jupiter': {
		aligned: ['Expansive', 'Wise', 'Grateful', 'Optimistic'],
		avoid: ['Limited thinking', 'Pessimistic', 'Ungrateful', 'Narrow-minded'],
		affirmation: 'I expand with wisdom. I manifest through gratitude and optimistic action.'
	},
	'Venus': {
		aligned: ['Harmonious', 'Appreciative', 'Creative', 'Loving'],
		avoid: ['Critical', 'Disconnected', 'Rigid', 'Unloving'],
		affirmation: 'I create harmony. I manifest through appreciation, creativity, and loving action.'
	},
	'Saturn': {
		aligned: ['Disciplined', 'Structured', 'Patient', 'Systematic'],
		avoid: ['Impatient', 'Unstructured', 'Avoiding responsibility', 'Shortcuts'],
		affirmation: 'I build with discipline. I manifest through patience, structure, and systematic action.'
	},
	'Rahu': {
		aligned: ['Innovative', 'Ambitious', 'Unconventional', 'Focused on goals'],
		avoid: ['Conventional limits', 'Distracted desires', 'Materialistic obsession', 'Unrealistic'],
		affirmation: 'I innovate with purpose. I manifest through focused ambition and unconventional action.'
	},
	'Ketu': {
		aligned: ['Spiritual', 'Detached', 'Intuitive', 'Mystical'],
		avoid: ['Materialistic', 'Attached', 'Overly analytical', 'Superficial'],
		affirmation: 'I align with spirit. I manifest through detachment, intuition, and spiritual action.'
	},
}

// Digital Twin Display Component - Using actual image with zoom and rotation animation + Dasha symbols in arc
const DigitalTwinDisplay: React.FC<{ 
	cumulativeScore: number
	mahadasha?: { lord: string } | null
	antardasha?: { lord: string } | null
	pratyantar?: { lord: string } | null
	sukshmaDasha?: { lord: string } | null
	sukshmaThemes?: string[] // Pass themes from parent
}> = ({ cumulativeScore, mahadasha, antardasha, pratyantar, sukshmaDasha, sukshmaThemes: propsThemes }) => {
	// Image path - place your image at frontend/public/digital-twin.png (or .jpg, .jpeg)
	// Try different formats if one doesn't exist
	const [imageSrc, setImageSrc] = useState('/digital-twin.png')
	
	const handleImageError = useCallback(() => {
		// Try alternative formats if PNG fails
		if (imageSrc.includes('.png')) {
			setImageSrc('/digital-twin.jpg')
		} else if (imageSrc.includes('.jpg')) {
			setImageSrc('/digital-twin.jpeg')
		} else if (imageSrc.includes('.jpeg')) {
			setImageSrc('/digital-twin.webp')
		}
	}, [imageSrc])
	
	// Get all dasha symbols
	const mahadashaLord = mahadasha?.lord || null
	const antardashaLord = antardasha?.lord || null
	const pratyantarLord = pratyantar?.lord || null
	const sukshmaLord = sukshmaDasha?.lord || null
	
	// Get Sukshma Dasha themes - use props if provided, otherwise calculate from lord
	const sukshmaThemes = propsThemes || (sukshmaLord ? (PLANET_THEMES[sukshmaLord] || []).slice(0, 5) : [])
	
	// Calculate safe radius: container is 200x280, max zoom is now 0.75x
	// At max zoom: 150x210, from center to image corner: sqrt(75² + 105²) ≈ 129px
	// Container boundary: from center to container corner: sqrt(100² + 140²) ≈ 172px
	// Use 140px for symbols to stay well within boundary with padding
	const SYMBOL_ROTATION_RADIUS = 140
	const THEME_ROTATION_RADIUS = 160 // Slightly further out for themes
	
	// Create arc of 4 dasha symbols (Mahadasha, Antardasha, Pratyantar, Sukshma)
	const dashaSymbolsArc = useMemo(() => {
		const symbols: Array<{ id: string; lord: string; symbol: string; label: string }> = []
		
		if (mahadashaLord) {
			symbols.push({
				id: 'maha',
				lord: mahadashaLord,
				symbol: PLANET_SYMBOLS[mahadashaLord] || '✨',
				label: 'Maha',
			})
		}
		if (antardashaLord) {
			symbols.push({
				id: 'antar',
				lord: antardashaLord,
				symbol: PLANET_SYMBOLS[antardashaLord] || '✨',
				label: 'Antar',
			})
		}
		if (pratyantarLord) {
			symbols.push({
				id: 'pratyantar',
				lord: pratyantarLord,
				symbol: PLANET_SYMBOLS[pratyantarLord] || '✨',
				label: 'Pratyantar',
			})
		}
		if (sukshmaLord) {
			symbols.push({
				id: 'sukshma',
				lord: sukshmaLord,
				symbol: PLANET_SYMBOLS[sukshmaLord] || '✨',
				label: 'Sukshma',
			})
		}
		
		return symbols
	}, [mahadashaLord, antardashaLord, pratyantarLord, sukshmaLord])
	
	
	return (
		<div style={digitalTwinContainerStyle(cumulativeScore)}>
			{/* Rotating arc of Dasha symbols (Mahadasha, Antardasha, Pratyantar, Sukshma) - Continuous rotation */}
			{dashaSymbolsArc.length > 0 && (
				<div
					style={{
						position: 'absolute',
						left: '50%',
						top: '30%', // Shifted up by 20% (from 50% to 30%)
						width: SYMBOL_ROTATION_RADIUS * 2,
						height: SYMBOL_ROTATION_RADIUS * 2,
						transformOrigin: 'center center',
						transform: 'translate(-50%, -50%)',
						animation: 'revolveSymbol 10s linear infinite',
						zIndex: 3,
					}}
				>
					{dashaSymbolsArc.map((dasha, index) => {
						// Arrange symbols in an arc (spread over 100 degrees, centered at top)
						const arcSpread = 100 // degrees
						const startAngle = -90 - arcSpread / 2 // Start from top-left
						const totalItems = dashaSymbolsArc.length
						const angle = totalItems > 1 
							? startAngle + (index / (totalItems - 1)) * arcSpread
							: -90 // If only one item, place at top
						
						return (
							<div
								key={dasha.id}
								style={{
									position: 'absolute',
									left: '50%',
									top: '50%',
									transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${SYMBOL_ROTATION_RADIUS}px)`,
									transformOrigin: 'center center',
								}}
							>
								<div
									style={{
										transform: `rotate(${-angle}deg)`, // Counter-rotate to keep symbol upright
										fontSize: 24,
										color: '#fbbf24',
										filter: 'drop-shadow(0 0 8px #fbbf24) drop-shadow(0 0 16px #fbbf24)',
										animation: 'sparklePulse 2s ease-in-out infinite',
										fontWeight: 'bold',
										textAlign: 'center',
										pointerEvents: 'none',
									}}
									title={`${dasha.label} Dasha: ${dasha.lord}`}
								>
									<div>{dasha.symbol}</div>
									<div style={{ 
										fontSize: 10, 
										marginTop: 4, 
										opacity: 1, 
										letterSpacing: '0.5px',
										color: '#fde68a',
										fontWeight: 600,
										textShadow: '0 0 6px rgba(251, 191, 36, 0.8), 0 0 12px rgba(251, 191, 36, 0.6)',
									}}>{dasha.label}</div>
								</div>
							</div>
						)
					})}
				</div>
			)}
			
			
			{/* Wrapper to shift image up to avoid overlapping with symbols */}
			<div
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					width: '100%',
					height: '100%',
					transform: 'translateY(-20%)', // Shift image up by 20% to avoid symbol overlap
					transformOrigin: 'center center',
				}}
			>
				<img
					src={imageSrc}
					alt="Digital Twin"
					style={digitalTwinImageStyle}
					onError={handleImageError}
				/>
			</div>
		</div>
	)
}

// Digital Twin Image Style - Zoom and Y-axis rotation animation with background removal
const digitalTwinImageStyle: React.CSSProperties = {
	width: '100%',
	height: '100%',
	objectFit: 'contain',
	animation: 'digitalTwinZoom 8s ease-in-out infinite', // Slower animation (8s instead of 4s)
	transformOrigin: 'center center',
	transformStyle: 'preserve-3d', // Enable 3D transforms
	position: 'relative',
	zIndex: 1,
	// Remove black background and blend with dashboard
	// 'screen' blend mode: black becomes transparent, colors are preserved and brightened
	mixBlendMode: 'screen',
	// Enhance the golden glow while maintaining transparency
	filter: 'brightness(1.15) contrast(1.3) saturate(1.2)',
	// Alternative blend modes to try if 'screen' doesn't work well:
	// mixBlendMode: 'lighten', // Softer effect, makes dark areas transparent
	// mixBlendMode: 'color-dodge', // More intense, brightens colors significantly
}

// Legacy component - kept for reference but not used
const DigitalTwinFigure_Legacy: React.FC<{ cumulativeScore: number }> = ({ cumulativeScore }) => {
	// Use golden-yellow color as per the image (not karma-based)
	const goldenYellow = '#fbbf24' // Bright golden-yellow
	const goldenYellowLight = '#fde68a' // Lighter gold
	const goldenYellowDark = '#d97706' // Darker gold
	
	// Center of figure
	const centerX = 100
	const centerY = 140
	
	// Create dense particle network for human figure
	// Head - circular, featureless
	const headParticles = Array.from({ length: 16 }).map((_, i) => {
		const angle = (i / 16) * Math.PI * 2
		const radius = 12 + (i % 3) * 2
		return {
			x: centerX + Math.cos(angle) * radius,
			y: centerY - 100 + Math.sin(angle) * radius,
		}
	})
	
	// Neck
	const neckParticles = Array.from({ length: 6 }).map((_, i) => ({
		x: centerX + (i - 2.5) * 2,
		y: centerY - 85 + i * 2,
	}))
	
	// Shoulders
	const shoulderParticles = Array.from({ length: 12 }).map((_, i) => {
		const side = i < 6 ? -1 : 1
		const offset = (i % 6) - 2.5
		return {
			x: centerX + side * (15 + offset * 3),
			y: centerY - 75 + offset * 2,
		}
	})
	
	// Torso - dense core
	const torsoParticles = Array.from({ length: 30 }).map((_, i) => {
		const row = Math.floor(i / 6)
		const col = (i % 6) - 2.5
		return {
			x: centerX + col * 4,
			y: centerY - 70 + row * 8,
		}
	})
	
	// Left arm - outstretched, slightly bent, palm open
	const leftArmParticles = [
		// Upper arm
		...Array.from({ length: 8 }).map((_, i) => ({
			x: centerX - 15 - i * 3,
			y: centerY - 70 + i * 2,
		})),
		// Forearm
		...Array.from({ length: 6 }).map((_, i) => ({
			x: centerX - 39 - i * 2,
			y: centerY - 54 + i * 3,
		})),
		// Hand - open palm
		{ x: centerX - 50, y: centerY - 36 }, // wrist
		{ x: centerX - 55, y: centerY - 32 }, // thumb
		{ x: centerX - 52, y: centerY - 30 }, // index
		{ x: centerX - 50, y: centerY - 28 }, // middle
		{ x: centerX - 48, y: centerY - 30 }, // ring
		{ x: centerX - 46, y: centerY - 32 }, // pinky
	]
	
	// Right arm - outstretched, slightly bent, palm open
	const rightArmParticles = [
		// Upper arm
		...Array.from({ length: 8 }).map((_, i) => ({
			x: centerX + 15 + i * 3,
			y: centerY - 70 + i * 2,
		})),
		// Forearm
		...Array.from({ length: 6 }).map((_, i) => ({
			x: centerX + 39 + i * 2,
			y: centerY - 54 + i * 3,
		})),
		// Hand - open palm
		{ x: centerX + 50, y: centerY - 36 }, // wrist
		{ x: centerX + 55, y: centerY - 32 }, // thumb
		{ x: centerX + 52, y: centerY - 30 }, // index
		{ x: centerX + 50, y: centerY - 28 }, // middle
		{ x: centerX + 48, y: centerY - 30 }, // ring
		{ x: centerX + 46, y: centerY - 32 }, // pinky
	]
	
	// Hips
	const hipParticles = Array.from({ length: 10 }).map((_, i) => ({
		x: centerX + (i - 4.5) * 3,
		y: centerY - 10,
	}))
	
	// Legs - together, slightly apart
	const leftLegParticles = Array.from({ length: 12 }).map((_, i) => ({
		x: centerX - 3,
		y: centerY - 5 + i * 8,
	}))
	
	const rightLegParticles = Array.from({ length: 12 }).map((_, i) => ({
		x: centerX + 3,
		y: centerY - 5 + i * 8,
	}))
	
	// Feet - hovering
	const feetParticles = [
		{ x: centerX - 3, y: centerY + 90 },
		{ x: centerX + 3, y: centerY + 90 },
	]
	
	const allParticles = [
		...headParticles,
		...neckParticles,
		...shoulderParticles,
		...torsoParticles,
		...leftArmParticles,
		...rightArmParticles,
		...hipParticles,
		...leftLegParticles,
		...rightLegParticles,
		...feetParticles,
	]
	
	// Connect nearby particles with lines (dense network)
	const connections: Array<[number, number]> = []
	for (let i = 0; i < allParticles.length; i++) {
		for (let j = i + 1; j < allParticles.length; j++) {
			const dx = allParticles[i].x - allParticles[j].x
			const dy = allParticles[i].y - allParticles[j].y
			const dist = Math.sqrt(dx * dx + dy * dy)
			if (dist < 25) {
				connections.push([i, j])
			}
		}
	}
	
	// Energy tendrils - wavy, lightning-like, emanating from figure
	const energyTendrils = [
		// Above head
		{ startX: centerX, startY: centerY - 112, endX: centerX - 20, endY: centerY - 130, controlX: centerX - 10, controlY: centerY - 120 },
		{ startX: centerX, startY: centerY - 112, endX: centerX + 15, endY: centerY - 125, controlX: centerX + 8, controlY: centerY - 118 },
		// Right side (viewer's left) - prominent
		{ startX: centerX + 50, startY: centerY - 36, endX: centerX + 70, endY: centerY - 20, controlX: centerX + 60, controlY: centerY - 28 },
		{ startX: centerX + 45, startY: centerY - 50, endX: centerX + 65, endY: centerY - 35, controlX: centerX + 55, controlY: centerY - 42 },
		// Shoulder area
		{ startX: centerX + 25, startY: centerY - 75, endX: centerX + 40, endY: centerY - 60, controlX: centerX + 32, controlY: centerY - 67 },
		// Hip area
		{ startX: centerX + 12, startY: centerY - 5, endX: centerX + 30, endY: centerY + 10, controlX: centerX + 20, controlY: centerY + 2 },
	]
	
	// Floating particles detaching from figure
	const floatingParticles = Array.from({ length: 20 }).map((_, i) => {
		const baseAngle = (i / 20) * Math.PI * 2
		const radius = 30 + (i % 5) * 8
		return {
			x: centerX + Math.cos(baseAngle) * radius,
			y: centerY - 50 + Math.sin(baseAngle) * radius,
			delay: i * 0.2,
		}
	})
	
	return (
		<g transform="translate(100, 140)">
			{/* Energy tendrils - wavy, lightning-like */}
			{energyTendrils.map((tendril, idx) => (
				<path
					key={`tendril-${idx}`}
					d={`M ${tendril.startX - centerX} ${tendril.startY - centerY} Q ${tendril.controlX - centerX} ${tendril.controlY - centerY} ${tendril.endX - centerX} ${tendril.endY - centerY}`}
					stroke={goldenYellow}
					strokeWidth="1.5"
					fill="none"
					opacity="0.7"
					strokeLinecap="round"
				>
					<animate
						attributeName="opacity"
						values="0.5;0.9;0.5"
						dur="2s"
						repeatCount="indefinite"
						begin={`${idx * 0.3}s`}
					/>
				</path>
			))}
			
			{/* Connections between particles - dense network */}
			{connections.map(([i, j], idx) => {
				const p1 = allParticles[i]
				const p2 = allParticles[j]
				return (
					<line
						key={`conn-${idx}`}
						x1={p1.x - centerX}
						y1={p1.y - centerY}
						x2={p2.x - centerX}
						y2={p2.y - centerY}
						stroke={goldenYellow}
						strokeWidth="0.8"
						opacity="0.5"
					/>
				)
			})}
			
			{/* Particles - glowing golden-yellow */}
			{allParticles.map((particle, idx) => {
				const isCore = idx >= headParticles.length && idx < headParticles.length + neckParticles.length + shoulderParticles.length + torsoParticles.length
				const size = isCore ? 2.5 : 2
				const opacity = isCore ? 0.95 : 0.85
				return (
					<circle
						key={`particle-${idx}`}
						cx={particle.x - centerX}
						cy={particle.y - centerY}
						r={size}
						fill={isCore ? goldenYellow : goldenYellowLight}
						opacity={opacity}
					>
						<animate
							attributeName="r"
							values={`${size};${size + 1};${size}`}
							dur="3s"
							repeatCount="indefinite"
							begin={`${idx * 0.05}s`}
						/>
						<animate
							attributeName="opacity"
							values={`${opacity};${Math.min(1, opacity + 0.1)};${opacity}`}
							dur="3s"
							repeatCount="indefinite"
							begin={`${idx * 0.05}s`}
						/>
					</circle>
				)
			})}
			
			{/* Floating particles detaching */}
			{floatingParticles.map((particle, idx) => (
				<circle
					key={`float-${idx}`}
					cx={particle.x - centerX}
					cy={particle.y - centerY}
					r="1.5"
					fill={goldenYellowLight}
					opacity="0.6"
				>
					<animate
						attributeName="cx"
						values={`${particle.x - centerX};${particle.x - centerX + 10};${particle.x - centerX}`}
						dur="4s"
						repeatCount="indefinite"
						begin={`${particle.delay}s`}
					/>
					<animate
						attributeName="cy"
						values={`${particle.y - centerY};${particle.y - centerY - 15};${particle.y - centerY}`}
						dur="4s"
						repeatCount="indefinite"
						begin={`${particle.delay}s`}
					/>
					<animate
						attributeName="opacity"
						values="0.6;0.2;0.6"
						dur="4s"
						repeatCount="indefinite"
						begin={`${particle.delay}s`}
					/>
				</circle>
			))}
		</g>
	)
}

type GuidanceTemplate = {
	id: number
	title: string
	body: string
	min_score?: number | null
	max_score?: number | null
	tier: string
	tags?: string | null
	score_value?: number | null
}

type GuidanceContext = {
	nakshatra?: string | null
	mahadasha?: string | null
	antardasha?: string | null
	pratyantar?: string | null
}

type GuidancePayload = {
	template: GuidanceTemplate | null
	delivered_count: number
	remaining: number | null
	limit: number | null
	context?: GuidanceContext | null
	ledger_record_id?: number | null
	status?: string | null
}

type GuidanceAcceptanceResponse = {
	next_guidance: GuidancePayload | null
	accepted_record: KarmaRecord
}

type KarmaCategory = {
	id: number
	slug: string
	label: string
	description?: string | null
	polarity: 'positive' | 'negative' | 'neutral'
	default_weight: number
}

type KarmaRecord = {
	id: number
	category_slug?: string | null
	category_label?: string | null
	score_delta: number
	sentiment?: string | null
	confidence?: number | null
	recorded_at: string
	input_text?: string | null
	metadata?: Record<string, any> | null
	source: string
	status: 'pending' | 'completed' | 'skipped' | 'not_implemented'
}

type KarmaSummary = {
	user_id: number
	cumulative_score: number
	positive_score: number
	negative_score: number
	records: KarmaRecord[]
}

type UserDetails = {
	id: number
	first_name: string | null
	last_name: string | null
	gender: string | null
	phone_number: string | null
	date_of_birth: string
	time_of_birth: string
	place_name: string
	latitude?: number | null
	longitude?: number | null
	timezone?: string | null
	nakshatra: string
	pada: number
	moon_longitude_deg: number
	dasha_at_birth: string
	avatar_url?: string | null
	plan?: 'awaken' | 'karma_builder' | 'karma_pro' | 'dharma_master'
}

type AvatarJobState = 'idle' | 'queued' | 'processing' | 'completed' | 'failed'

type FactorGraphBar = {
	label: string
	value: number
}

const extractFactorDelta = (text: string, fallback: number): number => {
	const match = text.match(/([+-]?\d+(?:\.\d+)?)\s*%/)
	if (match) {
		const parsed = Number(match[1])
		if (!Number.isNaN(parsed) && isFinite(parsed)) {
			return parsed
		}
	}
	return fallback
}

const buildFactorGraphData = (items: string[]): FactorGraphBar[] =>
	items.map(item => ({
		label: item,
		value: Math.abs(extractFactorDelta(item, 1)) || 1,
	}))

type AvatarJobResponse = {
	job_id: string
	status: AvatarJobState
}

type AvatarJobStatusResponse = {
	job_id: string
	status: AvatarJobState
	avatar_url?: string | null
	error?: string | null
}

type AlignmentTip = {
	id: number
	tip_text: string
	status: 'active' | 'archived'
	source: string
	manifestation_summary?: string | null
	last_added_to_journal_at?: string | null
	updated_at?: string | null
	frequency: 'daily' | 'weekly' | 'specific_day'
	scheduled_day?: number | null
	start_date?: string | null
	last_generated_at?: string | null
	auto_archive_after_days: number
	next_due_date?: string | null
	created_at: string
}

type ManifestationAstroContext = {
	nakshatra: string | null
	mahadasha: string | null
	antardasha: string | null
	pratyantar: string | null
	karma_score: number | null
	supporting_factors: string[]
	challenging_factors: string[]
}

type ManifestationAnalysis = {
	probability: number
	category: string
	summary: string
	astro_context: ManifestationAstroContext
	recommendations: string[]
}

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const describeTipSchedule = (tip: AlignmentTip): string => {
	if (tip.frequency === 'daily') {
		return 'Repeats daily'
	}
	const label =
		typeof tip.scheduled_day === 'number' && tip.scheduled_day >= 0 && tip.scheduled_day <= 6
			? WEEKDAY_LABELS[tip.scheduled_day]
			: 'selected day'
	if (tip.frequency === 'weekly') {
		return `Weekly on ${label}`
	}
	return `Specific day · ${label}`
}

const formatTipDueDate = (tip: AlignmentTip): string | null => {
	if (!tip.next_due_date) {
		return null
	}
	const parsed = new Date(tip.next_due_date)
	if (Number.isNaN(parsed.getTime())) {
		return null
	}
	return parsed.toLocaleDateString(undefined, {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
	})
}

const normalizePhoneAttempts = (raw: string): string[] => {
	const trimmed = raw.trim()
	const digitsOnly = trimmed.replace(/\D+/g, '')
	const leadingStripped = digitsOnly.replace(/^0+/, '')
	const lastTen = digitsOnly.length > 10 ? digitsOnly.slice(-10) : digitsOnly
	const attempts = new Set<string>()
	if (trimmed) attempts.add(trimmed)
	if (digitsOnly) attempts.add(digitsOnly)
	if (leadingStripped) attempts.add(leadingStripped)
	if (lastTen && lastTen !== digitsOnly) attempts.add(lastTen)
	return Array.from(attempts)
}

type PlanTier = 'free' | 'referral' | 'paid' | 'premium'

type PlanData = {
	id: 'awaken' | 'karma_builder' | 'karma_pro' | 'dharma_master'
	tier: PlanTier
	name: string
	tagline: string
	target: string
	goal: string
	includes: string[]
	price?: string
	unlocksWhen?: string
}

const PLAN_DATA: PlanData[] = [
	{
		id: 'awaken',
		tier: 'free',
		name: 'FREE Plan — "Awaken"',
		tagline: 'Begin your consciousness journey.',
		target: 'New users forming the habit',
		goal: 'Daily engagement + emotional connection',
		includes: [
			'Daily AI Karma Journal (limited analysis)',
			'Basic Karma Score',
			'Starter Digital Twin (static aura)',
			'Daily reflection reminders',
			'Access to 108-Day Karma Challenge (basic version)',
			'3 monthly manifestation entries (no MFP score)',
			'Community feed (view-only)',
			'Limited push notifications',
		],
	},
	{
		id: 'karma_builder',
		tier: 'referral',
		name: 'REFERRAL-REWARDS Plan — "Karma Builder"',
		tagline: 'Your good karma unlocks more awareness.',
		target: 'Users excited to share iBhakt',
		goal: 'Virality + growth (self-expanding loops)',
		unlocksWhen: 'Refer 5 friends',
		includes: [
			'Everything in Free +',
			'Advanced Karma Journal Analysis (emotional depth + patterns)',
			'Evolving Twin Aura (updates with your karma trends)',
			'Weekly Karmic Energy Report',
			'Unlock Custom Twin Accessories (each with moral symbolism)',
			'10 monthly manifestation entries',
			'Partial MFP (Manifestation Fulfillment Probability) score',
			'Referral leaderboard to earn more perks',
			'KarmaCoin pre-earn access (when launched)',
		],
	},
	{
		id: 'karma_pro',
		tier: 'paid',
		name: 'PAID LOWER TIER — "Karma Pro"',
		tagline: 'Align your thoughts, emotions, and timing.',
		target: 'Serious self-improvement & manifestation seekers',
		goal: 'Strong MRR + broad adoption',
		price: '₹199–399/month or ₹1,499–2,999 yearly',
		includes: [
			'Everything in Referral Tier +',
			'Unlimited Manifestation Journal entries',
			'Full MFP scoring engine (Astro timing + emotional coherence)',
			'Personal Dharma Compass (AI guidance)',
			'Weekly Astro-Emotional Forecast',
			'Advanced Twin Evolution (shifts with emotional frequency)',
			'Access to Karma Circles (group reflections)',
			'Premium music & meditation library',
			'« Action Tracker » — map your karma to habits',
			'Remove ads',
			'Priority email support',
		],
	},
	{
		id: 'dharma_master',
		tier: 'premium',
		name: 'PREMIUM / ELITE TIER — "Dharma Master"',
		tagline: 'Master your Karma. Shape your destiny.',
		target: 'High-intent spiritual seekers & manifestation believers',
		goal: 'High LTV + strong brand equity',
		price: '₹11,999–19,999/year',
		includes: [
			'Everything in Pro +',
			'1:1 AI Mentor Twin (voice-based personalized mentor)',
			'Monthly Karmic Alignment Report (professional-grade PDF)',
			'Personalized Astro-Karma Life Blueprint',
			'Advanced Manifestation Accelerator (timed rituals & actions)',
			'Early access to all new features',
			'VIP KarmaCoin multipliers (when blockchain launches)',
			'Premium Twin skins (gold aura, trinetra, cosmic halo)',
			'Exclusive Mastermind circles (elite community)',
			'Founder-letter access (i.e., from Rahul)',
			'Priority chat support',
		],
	},
]

const DashboardPage: React.FC = () => {
	const navigate = useNavigate()
	const { token, setToken, profile, setProfile, userId, setUserId } = useAuth()
	
	// Debug: Log when component mounts and token status
	useEffect(() => {
		console.log('[DashboardPage] Component mounted/updated', { 
			hasToken: !!token, 
			hasLocalToken: !!localStorage.getItem('ibhakt_token'),
			userId,
			hasProfile: !!profile
		})
	}, [token, userId, profile])

	// CRITICAL: Always render something - prevent blank screen
	// This ensures the component never returns undefined/null
	if (!token && !localStorage.getItem('ibhakt_token')) {
		console.log('[DashboardPage] No token found, showing loading...')
		return (
			<div style={{ minHeight: '100vh', background: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
				<div>Loading...</div>
			</div>
		)
	}

	const [initializing, setInitializing] = useState(true)
	const [currentUser, setCurrentUser] = useState<UserDetails | null>(null)
	const [guidance, setGuidance] = useState<GuidancePayload | null>(null)
	const [guidanceLoading, setGuidanceLoading] = useState(false)
	const [guidanceError, setGuidanceError] = useState<string | null>(null)
	const [karmaCategories, setKarmaCategories] = useState<KarmaCategory[]>([])
	const [karmaSummary, setKarmaSummary] = useState<KarmaSummary | null>(null)
	const [karmaText, setKarmaText] = useState('')
	const [karmaCategorySlug, setKarmaCategorySlug] = useState<string>('')
	const [selfAssessment, setSelfAssessment] = useState<'good' | 'bad' | 'neutral' | null>(null)
	const [karmaSubmitting, setKarmaSubmitting] = useState(false)
	const [karmaFeedback, setKarmaFeedback] = useState<string | null>(null)
	const [karmaError, setKarmaError] = useState<string | null>(null)
	const [karmaLoading, setKarmaLoading] = useState(false)
	const [avatarUploading, setAvatarUploading] = useState(false)
	const [avatarError, setAvatarError] = useState<string | null>(null)
	const [avatarJobId, setAvatarJobId] = useState<string | null>(null)
	const [avatarJobStatus, setAvatarJobStatus] = useState<AvatarJobState>('idle')
	const [manifestationText, setManifestationText] = useState('')
	const [manifestationResult, setManifestationResult] = useState<ManifestationAnalysis | null>(null)
	const [manifestationError, setManifestationError] = useState<string | null>(null)
	const [manifestationLoading, setManifestationLoading] = useState(false)
	const [alignmentTipStatus, setAlignmentTipStatus] = useState<Record<string, 'idle' | 'saving' | 'added' | 'error'>>({})
	const [alignmentTips, setAlignmentTips] = useState<AlignmentTip[]>([])
	const [alignmentTipsLoading, setAlignmentTipsLoading] = useState(false)
	const [alignmentTipsError, setAlignmentTipsError] = useState<string | null>(null)
	const [digitalTwinCreating, setDigitalTwinCreating] = useState(false)
	const [digitalTwinMessage, setDigitalTwinMessage] = useState<string | null>(null)
	const [digitalTwinError, setDigitalTwinError] = useState<string | null>(null)
	const [currentDasha, setCurrentDasha] = useState<{
		current_mahadasha?: { lord: string } | null
		current_antardasha?: { lord: string } | null
		current_pratyantar?: { lord: string } | null
		current_sukshma?: { lord: string } | null
	} | null>(null)
	const [mfpHovered, setMfpHovered] = useState(false)
	const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
	const [showPlanModal, setShowPlanModal] = useState(false)
	const [showReferralModal, setShowReferralModal] = useState(false)
	const [referralPhoneNumbers, setReferralPhoneNumbers] = useState<string[]>([''])
	const [showGuidanceModal, setShowGuidanceModal] = useState(false)
	const [showMFPModal, setShowMFPModal] = useState(false)
	const [showKarmaModal, setShowKarmaModal] = useState(false)
	const [showDigitalTwinModal, setShowDigitalTwinModal] = useState(false)
	const [digitalTwinForm, setDigitalTwinForm] = useState({
		firstName: '',
		lastName: '',
		dateOfBirth: '',
		timeOfBirth: '',
		placeOfBirth: '',
		gender: '',
	})
	const [currentPlan, setCurrentPlan] = useState<'awaken' | 'karma_builder' | 'karma_pro' | 'dharma_master'>('awaken')
	const [activeSection, setActiveSection] = useState<'dashboard' | 'cosmic-blueprint' | 'charts'>('dashboard')
	const [birthDetails, setBirthDetails] = useState<{
		yoga?: string
		karan_avkhda_chakra?: string
		karan_ghat_chakra?: string
		varna?: string
		yoni?: string
		gan?: string
		nadi?: string
		rashi?: string
		day_of_birth?: string
		nakshatra?: string
		moon_rashi?: string
		sun_sign?: string
	} | null>(null)
	const [birthDetailsLoading, setBirthDetailsLoading] = useState(false)
	const [chartData, setChartData] = useState<any>(null)
	const [chartLoading, setChartLoading] = useState(false)
	const [referralCode, setReferralCode] = useState<string | null>(null)
	const [referralCount, setReferralCount] = useState(0)
	const [referralsNeeded, setReferralsNeeded] = useState(11)
	const [referralLimitAwaken, setReferralLimitAwaken] = useState(5)
	const [referralLimitKarmaPro, setReferralLimitKarmaPro] = useState(51)
	const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null)
	const [referralType, setReferralType] = useState<'email' | 'phone'>('email')
	const [referralValue, setReferralValue] = useState('')
	const [sendingReferral, setSendingReferral] = useState(false)
	const [userReferrals, setUserReferrals] = useState<{pending: any[], completed: any[]} | null>(null)
	const [featureLimits, setFeatureLimits] = useState<{
		plan: string
		features: {
			cosmic_guidance?: {
				limits: { day: { max: number | null; current: number; remaining: number | null; allowed: boolean }; week: { max: number | null; current: number; remaining: number | null; allowed: boolean }; month: { max: number | null; current: number; remaining: number | null; allowed: boolean } }
				visibility: { karma_ledger: boolean; cosmic_blueprint: boolean }
			}
			manifestation_check?: {
				limits: { day: { max: number | null; current: number; remaining: number | null; allowed: boolean }; week: { max: number | null; current: number; remaining: number | null; allowed: boolean }; month: { max: number | null; current: number; remaining: number | null; allowed: boolean } }
				visibility: { karma_ledger: boolean; cosmic_blueprint: boolean }
			}
			karma_record?: {
				limits: { day: { max: number | null; current: number; remaining: number | null; allowed: boolean }; week: { max: number | null; current: number; remaining: number | null; allowed: boolean }; month: { max: number | null; current: number; remaining: number | null; allowed: boolean } }
				visibility: { karma_ledger: boolean; cosmic_blueprint: boolean }
			}
		}
	} | null>(null)
	const [twinState, setTwinState] = useState<{
		energy: number
		mood: string
		alignment: number
		aura: { color: string; intensity: number; evolution_level: string }
		karma_score: number
		mfp_score: number | null
		highlights: any
	} | null>(null)
	const [twinStateLoading, setTwinStateLoading] = useState(false)
	const [entitlements, setEntitlements] = useState<{
		plan_type: string
		plan_name: string
		features: Array<{ feature: string; allowed: boolean; limit?: number }>
		usage_limits: Record<string, { limit: number; current: number }>
	} | null>(null)
	const [entitlementsLoading, setEntitlementsLoading] = useState(false)
	const [karmaDashboard, setKarmaDashboard] = useState<{
		karma_score: number
		karma_grade: string
		trend: string
		total_actions: number
		streak?: {
			current_days: number
			longest_days: number
			level: string
			level_name: string
			next_level_threshold: number
			progress_to_next_level: number
		}
	} | null>(null)
	const [karmaDashboardLoading, setKarmaDashboardLoading] = useState(false)

	const backendBaseUrl = useMemo(() => {
		const configured = import.meta.env.VITE_BACKEND_URL
		if (typeof configured === 'string' && configured.trim().length > 0) {
			return configured.replace(/\/$/, '')
		}
		return 'http://localhost:8000'
	}, [])

	const publicBaseUrl = useMemo(() => {
		// Use environment variable if set, otherwise fall back to current origin
		const configured = import.meta.env.VITE_PUBLIC_URL
		if (typeof configured === 'string' && configured.trim().length > 0) {
			return configured.replace(/\/$/, '')
		}
		// Fallback to current origin (works in development, but should be set in production)
		return window.location.origin
	}, [])

	const uploadInputRef = useRef<HTMLInputElement | null>(null)
	const avatarPollRef = useRef<number | null>(null)
	const guidanceSectionRef = useRef<HTMLDivElement | null>(null)
	const manifestationSectionRef = useRef<HTMLDivElement | null>(null)
	const karmaSectionRef = useRef<HTMLDivElement | null>(null)

	const authHeaders = useMemo(
		() =>
			token
				? {
						Authorization: `Bearer ${token}`,
					}
				: undefined,
		[token]
	)

	const supportiveGraphData = useMemo(() => {
		if (!manifestationResult) return []
		return buildFactorGraphData(manifestationResult.astro_context.supporting_factors)
	}, [manifestationResult])

	const challengeGraphData = useMemo(() => {
		if (!manifestationResult) return []
		return buildFactorGraphData(manifestationResult.astro_context.challenging_factors)
	}, [manifestationResult])

	const supportiveGraphMax = useMemo(() => {
		if (!supportiveGraphData.length) return 1
		return supportiveGraphData.reduce((acc, bar) => Math.max(acc, Math.abs(bar.value)), 0) || 1
	}, [supportiveGraphData])

	const challengeGraphMax = useMemo(() => {
		if (!challengeGraphData.length) return 1
		return challengeGraphData.reduce((acc, bar) => Math.max(acc, Math.abs(bar.value)), 0) || 1
	}, [challengeGraphData])

	const storedTipTexts = useMemo(
		() =>
			new Set(
				alignmentTips.map(tip => tip.tip_text.trim().toLowerCase())
			),
		[alignmentTips]
	)

	const visibleAlignmentTips = useMemo(() => {
		if (!manifestationResult) return []
		return manifestationResult.recommendations.filter(
			tip =>
				!storedTipTexts.has(tip.trim().toLowerCase()) &&
				(alignmentTipStatus[tip] || 'idle') !== 'added'
		)
	}, [manifestationResult, alignmentTipStatus, storedTipTexts])

	const implementedTipIds = useMemo(() => {
		if (!karmaSummary?.records) return new Set<number>()
		const implemented = new Set<number>()
		for (const record of karmaSummary.records) {
			if (record.source === 'manifestation_tip' && record.status === 'completed') {
				const tipId = record.metadata?.alignment_tip_id
				if (typeof tipId === 'number') {
					implemented.add(tipId)
				}
			}
		}
		return implemented
	}, [karmaSummary?.records])

	const activeAlignmentTips = useMemo(
		() => alignmentTips.filter(
			tip => tip.status === 'active' && !implementedTipIds.has(tip.id)
		),
		[alignmentTips, implementedTipIds]
	)

	const fetchUser = useCallback(
		async (targetUserId: number) => {
			try {
				const res = await fetch(`/api/users/${targetUserId}`, {
					headers: { 'Content-Type': 'application/json', ...(authHeaders || {}) },
				})
				const payload = await res.json().catch(() => null)
				if (!res.ok || !payload) {
					const message = (payload as { detail?: string } | null)?.detail || 'Unable to load user profile.'
					throw new Error(message)
				}
				const data = payload as UserDetails
				setCurrentUser(data)
			if (data.plan) {
				setCurrentPlan(data.plan)
			}
				if (data.id && data.id !== userId) {
					setUserId(data.id)
				}
				return data
			} catch (error) {
				console.warn('Failed to fetch user details', error)
				throw error
			}
		},
		[authHeaders, setUserId, userId]
	)

	const fetchBirthDetails = useCallback(
		async (targetUserId: number) => {
			if (!targetUserId) return
			setBirthDetailsLoading(true)
			try {
				const res = await fetch(`/api/users/${targetUserId}/birth-details`, {
					headers: { 'Content-Type': 'application/json', ...(authHeaders || {}) },
				})
				if (res.ok) {
					const data = await res.json()
					setBirthDetails(data)
				} else {
					console.warn('Failed to fetch birth details')
					setBirthDetails(null)
				}
			} catch (error) {
				console.warn('Error fetching birth details', error)
				setBirthDetails(null)
			} finally {
				setBirthDetailsLoading(false)
			}
		},
		[authHeaders]
	)

	const fetchKarmaSummary = useCallback(
		async (targetUserId: number) => {
			try {
				const res = await fetch(`/api/users/${targetUserId}/karma`, {
					headers: { 'Content-Type': 'application/json', ...(authHeaders || {}) },
				})
				const payload = await res.json().catch(() => null)
				if (!res.ok || !payload) {
					const message = (payload as { detail?: string } | null)?.detail || 'Unable to load karma summary.'
					throw new Error(message)
				}
				const data = payload as KarmaSummary
				setKarmaSummary(data)
				return data
			} catch (error) {
				console.warn('Failed to fetch karma summary', error)
				throw error
			}
		},
		[authHeaders]
	)

	// Fetch new karma dashboard with streak data
	const fetchKarmaDashboard = useCallback(async () => {
		setKarmaDashboardLoading(true)
		try {
			const data = await getKarmaDashboard()
			setKarmaDashboard(data)
		} catch (error) {
			console.warn('Failed to fetch karma dashboard:', error)
		} finally {
			setKarmaDashboardLoading(false)
		}
	}, [])

	// Fetch digital twin state
	const fetchTwinState = useCallback(async () => {
		setTwinStateLoading(true)
		try {
			const data = await getTwinState()
			setTwinState(data)
		} catch (error) {
			console.warn('Failed to fetch twin state:', error)
		} finally {
			setTwinStateLoading(false)
		}
	}, [])

	// Fetch entitlements
	const fetchEntitlements = useCallback(async () => {
		setEntitlementsLoading(true)
		try {
			const data = await getEntitlements()
			setEntitlements(data)
			// Update current plan from entitlements
			if (data?.plan_type) {
				setCurrentPlan(data.plan_type as any)
			}
		} catch (error) {
			console.warn('Failed to fetch entitlements:', error)
		} finally {
			setEntitlementsLoading(false)
		}
	}, [])

	// Define showToast early so it can be used in fetchChartData
	const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
		setToast({ message, type })
		setTimeout(() => setToast(null), 4000)
	}, [])

	const fetchChartData = useCallback(
		async (targetUserId: number) => {
			if (!currentUser || !currentUser.date_of_birth || !currentUser.time_of_birth) {
				console.warn('Cannot fetch chart: missing birth details')
				return
			}
			setChartLoading(true)
			try {
				const requestBody = {
					date_of_birth: currentUser.date_of_birth,
					time_of_birth: currentUser.time_of_birth,
					place_name: currentUser.place_name || 'Unknown',
					timezone: currentUser.timezone || 'Asia/Kolkata',
					latitude: currentUser.latitude || 0,
					longitude: currentUser.longitude || 0,
				}
				console.log('Fetching chart with data:', requestBody)
				const res = await fetch(`/api/chart`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json', ...(authHeaders || {}) },
					body: JSON.stringify(requestBody),
				})
				const payload = await res.json().catch(() => null)
				if (!res.ok || !payload) {
					const errorDetail = payload?.detail || 'Unable to load chart data.'
					console.error('Chart API error:', errorDetail, payload)
					showToast(`Failed to load charts: ${errorDetail}`, 'error')
					return
				}
				// Transform backend format to frontend Chart component format
				// The backend returns: { lagna_sign, moon_sign, planets: { Sun: {longitude, sign, house}, ... }, lagna_chart_houses, moon_chart_houses }
				if (!payload.planets || payload.lagna_sign === undefined || payload.moon_sign === undefined) {
					console.error('Invalid chart data format:', payload)
					showToast('Invalid chart data received from server', 'error')
					return
				}
				const transformedData = {
					lagna_sign: payload.lagna_sign,
					moon_sign: payload.moon_sign,
					planets: payload.planets || {},
					lagna_chart_houses: payload.lagna_chart_houses || [],
					moon_chart_houses: payload.moon_chart_houses || [],
				}
				console.log('Chart data transformed:', transformedData)
				setChartData(transformedData)
			} catch (error: any) {
				console.error('Failed to fetch chart data', error)
				showToast(`Failed to load charts: ${error?.message || 'Unknown error'}`, 'error')
			} finally {
				setChartLoading(false)
			}
		},
		[currentUser, authHeaders, showToast]
	)

	const fetchGuidance = useCallback(
		async (targetUserId: number, options?: { silent?: boolean }) => {
			const silent = options?.silent ?? false
			if (!silent) {
				setGuidanceLoading(true)
				setGuidanceError(null)
			}
			try {
				const res = await fetch(`/api/users/${targetUserId}/guidance`, {
					headers: { 'Content-Type': 'application/json', ...(authHeaders || {}) },
				})
				const payload = await res.json().catch(() => null)
				if (!res.ok || !payload) {
					const message = (payload as { detail?: string } | null)?.detail || 'Unable to load guidance.'
					throw new Error(message)
				}
				const data = payload as GuidancePayload
				setGuidance(data)
				return data
			} catch (error: any) {
				if (!silent) {
					setGuidanceError(error?.message || 'Unable to load guidance right now.')
				}
				console.warn('Failed to fetch guidance', error)
				throw error
			} finally {
				if (!silent) {
					setGuidanceLoading(false)
				}
			}
		},
		[authHeaders]
	)

	const fetchAlignmentTips = useCallback(
		async (targetUserId: number, options?: { silent?: boolean }) => {
			const silent = options?.silent ?? false
			if (!silent) {
				setAlignmentTipsLoading(true)
				setAlignmentTipsError(null)
			}
			try {
				const res = await fetch(`/api/users/${targetUserId}/alignment-tips?status=active`, {
					headers: { 'Content-Type': 'application/json', ...(authHeaders || {}) },
				})
				if (!res.ok) {
					const detail = await res.json().catch(() => ({}))
					throw new Error(detail.detail || 'Unable to load alignment tips.')
				}
				const data = (await res.json()) as AlignmentTip[]
				setAlignmentTips(data)
				return data
			} catch (error: any) {
				if (!silent) {
					setAlignmentTipsError(error?.message || 'Unable to load alignment tips right now.')
				}
				console.warn('Failed to fetch alignment tips', error)
				throw error
			} finally {
				if (!silent) {
					setAlignmentTipsLoading(false)
				}
			}
		},
		[authHeaders]
	)

	const clearAvatarPolling = useCallback(() => {
		if (avatarPollRef.current !== null) {
			window.clearInterval(avatarPollRef.current)
			avatarPollRef.current = null
		}
	}, [])

	const scrollToSection = useCallback((ref: React.RefObject<HTMLElement>) => {
		ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
	}, [])

	const fetchFeatureLimits = useCallback(async (targetUserId: number) => {
		try {
			const res = await fetch(`/api/users/${targetUserId}/feature-limits`, {
				headers: { 'Content-Type': 'application/json', ...(authHeaders || {}) },
			})
			const payload = await res.json().catch(() => null)
			if (res.ok && payload) {
				setFeatureLimits(payload)
			}
		} catch (error) {
			console.warn('Failed to fetch feature limits', error)
		}
	}, [authHeaders])

	const fetchCurrentDasha = useCallback(async (userId: number) => {
		try {
			const res = await fetch(`${backendBaseUrl}/api/users/${userId}/current-dasha`, {
				headers: authHeaders,
			})
			if (!res.ok) {
				return
			}
			const data = await res.json()
			setCurrentDasha(data)
		} catch (err) {
			// Silently fail - dasha data is optional
			console.warn('Failed to fetch current dasha:', err)
		}
	}, [backendBaseUrl, authHeaders])

	const fetchUserReferrals = useCallback(async (userId: number) => {
		try {
			const res = await fetch(`/api/users/${userId}/referrals`, {
				headers: { ...(authHeaders || {}) },
			})
			if (res.ok) {
				const data = await res.json()
				setUserReferrals(data)
			}
		} catch (error) {
			console.error('Failed to fetch user referrals', error)
		}
	}, [authHeaders])

	const fetchReferralStats = useCallback(async (userId: number) => {
		try {
			const res = await fetch(`${backendBaseUrl}/api/users/${userId}/referral-stats`, {
				headers: authHeaders || {},
			})
			if (!res.ok) return null
			const data = await res.json()
			setReferralCode(data.referral_code)
			setReferralCount(data.referral_count)
			setReferralsNeeded(data.referrals_needed || 0)
			if (data.referral_limit_awaken_to_builder) {
				setReferralLimitAwaken(data.referral_limit_awaken_to_builder)
			}
			if (data.referral_limit_karma_pro_to_dharma) {
				setReferralLimitKarmaPro(data.referral_limit_karma_pro_to_dharma)
			}
			if (data.current_plan) {
				setCurrentPlan(data.current_plan as typeof currentPlan)
			}
			return data
		} catch (error) {
			// Silently fail
			return null
		}
	}, [backendBaseUrl, authHeaders])

	const handleSendReferral = useCallback(async () => {
		if (!currentUser?.id || !referralValue.trim()) {
			showToast('Please enter an email or phone number', 'error')
			return
		}

		setSendingReferral(true)
		try {
			const res = await fetch(`/api/users/${currentUser.id}/send-referral`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', ...(authHeaders || {}) },
				body: JSON.stringify({
					referral_type: referralType,
					referral_value: referralValue.trim(),
				}),
			})

			if (!res.ok) {
				const error = await res.json().catch(() => ({}))
				throw new Error(error.detail || 'Failed to send referral')
			}

			const data = await res.json()
			showToast(data.message || 'Referral sent successfully!', 'success')
			setReferralValue('')
			await fetchUserReferrals(currentUser.id)
			await fetchReferralStats(currentUser.id)
		} catch (error: any) {
			showToast(error?.message || 'Failed to send referral', 'error')
		} finally {
			setSendingReferral(false)
		}
	}, [currentUser?.id, referralType, referralValue, authHeaders, fetchUserReferrals, fetchReferralStats])

	const handleSendMultipleReferrals = useCallback(async () => {
		if (!currentUser?.id) {
			showToast('User not found', 'error')
			return
		}

		// Filter out empty phone numbers
		const validPhones = referralPhoneNumbers.filter(phone => phone.trim().length > 0)
		if (validPhones.length === 0) {
			showToast('Please enter at least one phone number', 'error')
			return
		}

		setSendingReferral(true)
		let successCount = 0
		let errorCount = 0

		try {
			// Send referrals for each phone number
			for (const phone of validPhones) {
				try {
					const res = await fetch(`/api/users/${currentUser.id}/send-referral`, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json', ...(authHeaders || {}) },
						body: JSON.stringify({
							referral_type: 'phone',
							referral_value: phone.trim(),
						}),
					})

					if (res.ok) {
						successCount++
					} else {
						errorCount++
					}
				} catch {
					errorCount++
				}
			}

			if (successCount > 0) {
				showToast(`Successfully sent ${successCount} referral${successCount > 1 ? 's' : ''}!`, 'success')
			}
			if (errorCount > 0) {
				showToast(`Failed to send ${errorCount} referral${errorCount > 1 ? 's' : ''}`, 'error')
			}

			// Reset form
			setReferralPhoneNumbers([''])
			
			// Refresh referral stats
			await fetchUserReferrals(currentUser.id)
			const updatedStats = await fetchReferralStats(currentUser.id)
			
			// Check if user should be upgraded
			if (updatedStats && updatedStats.referral_count >= referralLimitAwaken) {
				// Refresh user data to get updated plan
				await fetchUser(currentUser.id)
			}
		} catch (error: any) {
			showToast(error?.message || 'Failed to send referrals', 'error')
		} finally {
			setSendingReferral(false)
		}
	}, [currentUser?.id, referralPhoneNumbers, authHeaders, fetchUserReferrals, fetchReferralStats, referralLimitAwaken, fetchUser])

	const handleUpgradePlan = useCallback(async (planId: 'karma_pro' | 'dharma_master') => {
		if (!currentUser?.id) return
		setUpgradingPlan(planId)
		try {
			const res = await fetch(`${backendBaseUrl}/api/users/${currentUser.id}/upgrade-plan`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', ...(authHeaders || {}) },
				body: JSON.stringify({ plan: planId }),
			})
			if (!res.ok) {
				const detail = await res.json().catch(() => ({}))
				throw new Error(detail.detail || 'Failed to upgrade plan')
			}
			const data = await res.json()
			setCurrentPlan(planId)
			showToast(`Successfully upgraded to ${planId === 'karma_pro' ? 'Karma Pro' : 'Dharma Master'}!`, 'success')
			setShowPlanModal(false)
		} catch (error: any) {
			showToast(error?.message || 'Failed to upgrade plan', 'error')
		} finally {
			setUpgradingPlan(null)
		}
	}, [currentUser?.id, backendBaseUrl, authHeaders, showToast])

	const ensureUserProfile = useCallback(async (): Promise<number | null> => {
		if (userId) {
			return userId
		}
		const phone = profile?.phoneNumber?.trim()
		if (!phone) {
			return null
		}
		const attempts = normalizePhoneAttempts(phone)
		for (const attempt of attempts) {
			try {
				const res = await fetch(`/api/users?limit=1&phone=${encodeURIComponent(attempt)}`)
				const payload = await res.json().catch(() => null)
				if (!res.ok || !payload) {
					continue
				}
				const users = (payload as { users?: Array<{ id?: number }> } | null)?.users || []
				const match = users.find(entry => typeof entry.id === 'number')
				if (match?.id) {
					setUserId(match.id)
					return match.id
				}
			} catch (error) {
				console.warn('User lookup attempt failed', attempt, error)
			}
		}
		return null
	}, [profile?.phoneNumber, setUserId, userId])

	const pollAvatarJobStatus = useCallback(
		(jobId: string, userIdForRefresh: number) => {
			clearAvatarPolling()
			const pollOnce = async () => {
				try {
					const res = await fetch(`/api/avatar/jobs/${jobId}`, {
						headers: { ...(authHeaders || {}) },
						cache: 'no-store',
					})
					const payload = await res.json().catch(() => null)
					if (!res.ok || !payload) {
						const message = (payload as { detail?: string } | null)?.detail || 'Unable to fetch avatar job status.'
						throw new Error(message)
					}
					const data = payload as AvatarJobStatusResponse
					setAvatarJobStatus(data.status)
					if (data.error) {
						setAvatarError(data.error)
					}
					if (data.avatar_url) {
						console.log('Avatar URL received:', data.avatar_url)
						setCurrentUser(prev => {
							const updated = prev ? { ...prev, avatar_url: data.avatar_url } : prev
							console.log('Updated currentUser with avatar_url:', updated?.avatar_url)
							return updated
						})
					}
					if (data.status === 'completed') {
						console.log('Avatar job completed, avatar_url:', data.avatar_url)
						setAvatarUploading(false)
						setAvatarJobStatus('completed')
						clearAvatarPolling()
						// Force refresh user data to get the latest avatar_url
						try {
							await fetchUser(userIdForRefresh)
						} catch (err) {
							console.warn('Failed to refresh user after avatar completion:', err)
						}
					} else if (data.status === 'failed') {
						setAvatarUploading(false)
						setAvatarJobStatus('failed')
						clearAvatarPolling()
					} else {
						setAvatarUploading(true)
					}
				} catch (error) {
					console.warn('Avatar polling failed', error)
				}
			}
			void pollOnce()
			avatarPollRef.current = window.setInterval(() => {
				void pollOnce()
			}, 3500)
		},
		[authHeaders, clearAvatarPolling, fetchUser]
	)

	// Removed redirect check - ProtectedRoute handles authentication
	// This prevents race conditions and blank screens

	useEffect(() => {
		return () => {
			clearAvatarPolling()
		}
	}, [clearAvatarPolling])

	useEffect(() => {
		;(async () => {
			try {
				const res = await fetch('/api/karma/categories', {
					headers: { 'Content-Type': 'application/json', ...(authHeaders || {}) },
				})
				if (!res.ok) throw new Error('Unable to load karma categories.')
				const data = await res.json()
				setKarmaCategories(data || [])
			} catch (error: any) {
				console.warn(error?.message || 'Unable to load karma categories.')
			}
		})()
	}, [authHeaders])

	// Fetch birth details when Cosmic Blueprint section is active
	useEffect(() => {
		if (activeSection === 'cosmic-blueprint' && currentUser?.id) {
			fetchBirthDetails(currentUser.id)
		}
	}, [activeSection, currentUser?.id, fetchBirthDetails])

	const handleAcceptGuidance = async () => {
		if (!currentUser?.id) return
		
		// Check limit before proceeding
		const guidanceLimits = featureLimits?.features?.cosmic_guidance
		if (guidanceLimits && !guidanceLimits.limits.day.allowed) {
			showToast(`Daily limit reached (${guidanceLimits.limits.day.current}/${guidanceLimits.limits.day.max}). Please try again tomorrow or upgrade your plan.`, 'error')
			return
		}
		if (guidanceLimits && !guidanceLimits.limits.week.allowed) {
			showToast(`Weekly limit reached (${guidanceLimits.limits.week.current}/${guidanceLimits.limits.week.max}). Please try again next week or upgrade your plan.`, 'error')
			return
		}
		if (guidanceLimits && !guidanceLimits.limits.month.allowed) {
			showToast(`Monthly limit reached (${guidanceLimits.limits.month.current}/${guidanceLimits.limits.month.max}). Please try again next month or upgrade your plan.`, 'error')
			return
		}
		
		setGuidanceLoading(true)
		setGuidanceError(null)
		try {
			const res = await fetch(`/api/users/${currentUser.id}/guidance/accept`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', ...(authHeaders || {}) },
			})
			if (!res.ok) {
				const detail = await res.json().catch(() => ({}))
				throw new Error(detail.detail || 'Unable to refresh guidance.')
			}
			const data = (await res.json()) as GuidanceAcceptanceResponse
			setGuidance(data.next_guidance ?? null)
			await fetchKarmaSummary(currentUser.id)
			await fetchFeatureLimits(currentUser.id) // Refresh limits after use
			showToast('Guidance added to your karma ledger ✓', 'success')
			// Optionally close modal after successful action
			setShowGuidanceModal(false)
		} catch (error: any) {
			setGuidanceError(error?.message || 'Unable to refresh guidance.')
		} finally {
			setGuidanceLoading(false)
		}
	}

	const handleAddKarma = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		if (!karmaText.trim() && !karmaCategorySlug) {
			setKarmaError('Please describe the karma or choose a category.')
			return
		}
		
		// Check karma limit before proceeding
		if (currentUser?.id) {
			const karmaLimits = featureLimits?.features?.karma_record
			if (karmaLimits && !karmaLimits.limits.day.allowed) {
				setKarmaError(`Daily limit reached (${karmaLimits.limits.day.current}/${karmaLimits.limits.day.max}). Please try again tomorrow or upgrade your plan.`)
				return
			}
			if (karmaLimits && !karmaLimits.limits.week.allowed) {
				setKarmaError(`Weekly limit reached (${karmaLimits.limits.week.current}/${karmaLimits.limits.week.max}). Please try again next week or upgrade your plan.`)
				return
			}
			if (karmaLimits && !karmaLimits.limits.month.allowed) {
				setKarmaError(`Monthly limit reached (${karmaLimits.limits.month.current}/${karmaLimits.limits.month.max}). Please try again next month or upgrade your plan.`)
				return
			}
		}

		setKarmaError(null)
		setKarmaFeedback(null)
		setKarmaSubmitting(true)

		try {
			let activeUserId = currentUser?.id || userId
			if (!activeUserId) {
				const ensuredId = await ensureUserProfile()
				if (!ensuredId) {
					throw new Error('We could not find your digital twin profile. Use the "Create Your Digital Twin" button to generate it.')
				}
				activeUserId = ensuredId
				await fetchUser(ensuredId)
				await fetchGuidance(ensuredId)
				await fetchFeatureLimits(ensuredId)
			}

			const res = await fetch(`/api/users/${activeUserId}/karma`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', ...(authHeaders || {}) },
				body: JSON.stringify({
					text: karmaText.trim() || undefined,
					category_slug: karmaCategorySlug || undefined,
					sentiment: selfAssessment || undefined, // Send sentiment explicitly: 'good', 'bad', or 'neutral'
					source: 'text',
				}),
			})
			if (!res.ok) {
				const detail = await res.json().catch(() => ({}))
				throw new Error(detail.detail || 'Unable to record karma.')
			}

			const data = (await res.json()) as KarmaSummary
			setKarmaSummary(data)
			setKarmaText('')
			setKarmaCategorySlug('')
			setSelfAssessment(null)
			// Refresh limits after use
			if (activeUserId) {
				await fetchFeatureLimits(activeUserId).catch(() => undefined)
			}
			showToast('Karma recorded successfully ✓', 'success')
			// Optionally close modal after successful action
			setShowKarmaModal(false)
		} catch (error: any) {
			setKarmaError(error?.message || 'Unable to record karma right now.')
		} finally {
			setKarmaSubmitting(false)
		}
	}

	const analyzeManifestation = useCallback(async () => {
		const trimmed = manifestationText.trim()
		setManifestationError(null)
		if (!trimmed) {
			setManifestationError('Describe your manifestation before analyzing it.')
			return
		}

		let targetUserId = currentUser?.id ?? userId ?? null
		if (!targetUserId) {
			targetUserId = await ensureUserProfile()
			if (targetUserId) {
				try {
					await fetchUser(targetUserId)
				} catch {
					/* ignore */
				}
			}
		}

		if (!targetUserId) {
			setManifestationError('We could not find your digital twin profile yet. Use the "Create Your Digital Twin" button to generate it.')
			return
		}

		// Check manifestation limit before proceeding
		const manifestationLimits = featureLimits?.features?.manifestation_check
		if (manifestationLimits && !manifestationLimits.limits.day.allowed) {
			setManifestationError(`Daily limit reached (${manifestationLimits.limits.day.current}/${manifestationLimits.limits.day.max}). Please try again tomorrow or upgrade your plan.`)
			return
		}
		if (manifestationLimits && !manifestationLimits.limits.week.allowed) {
			setManifestationError(`Weekly limit reached (${manifestationLimits.limits.week.current}/${manifestationLimits.limits.week.max}). Please try again next week or upgrade your plan.`)
			return
		}
		if (manifestationLimits && !manifestationLimits.limits.month.allowed) {
			setManifestationError(`Monthly limit reached (${manifestationLimits.limits.month.current}/${manifestationLimits.limits.month.max}). Please try again next month or upgrade your plan.`)
			return
		}

		setManifestationLoading(true)
		setManifestationResult(null)
		try {
			const res = await fetch('/api/manifestations/analyze', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', ...(authHeaders || {}) },
				body: JSON.stringify({ manifestation: trimmed, user_id: targetUserId }),
			})
			const payload = await res.json().catch(() => null)
			if (!res.ok || !payload) {
				const message = (payload as { detail?: string } | null)?.detail || 'Unable to analyze manifestation right now.'
				throw new Error(message)
			}
			setManifestationResult(payload as ManifestationAnalysis)
			// Refresh limits after use
			if (targetUserId) {
				await fetchFeatureLimits(targetUserId).catch(() => undefined)
			}
		} catch (error: any) {
			setManifestationError(error?.message || 'Unable to analyze manifestation right now.')
		} finally {
			setManifestationLoading(false)
		}
	}, [manifestationText, currentUser?.id, userId, ensureUserProfile, fetchUser, authHeaders, featureLimits, fetchFeatureLimits])

	const handleActionStatusChange = async (
		recordId: number,
		status: 'completed' | 'skipped' | 'pending' | 'not_implemented'
	) => {
		if (!currentUser?.id) return
		setKarmaLoading(true)
		setKarmaError(null)
		try {
			const res = await fetch(`/api/users/${currentUser.id}/guidance/${recordId}/status`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', ...(authHeaders || {}) },
				body: JSON.stringify({ status }),
			})
			if (!res.ok) {
				const detail = await res.json().catch(() => ({}))
				throw new Error(detail.detail || 'Unable to update guidance status.')
			}
			await fetchKarmaSummary(currentUser.id)
			const message =
				status === 'completed'
					? '✓ Action marked as completed'
					: status === 'not_implemented'
					? 'Action marked as not implemented'
					: status === 'skipped'
					? 'Action marked as skipped'
					: 'Action reset to pending'
			showToast(message, 'success')
		} catch (error: any) {
			const errorMsg = error?.message || 'Unable to update action status.'
			setKarmaError(errorMsg)
			showToast(errorMsg, 'error')
		} finally {
			setKarmaLoading(false)
		}
	}

	const handleAlignmentTipStatusChange = useCallback(
		async (tipId: number, status: 'active' | 'archived') => {
			if (!currentUser?.id) return
			try {
				const res = await fetch(`/api/users/${currentUser.id}/alignment-tips/${tipId}`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json', ...(authHeaders || {}) },
					body: JSON.stringify({ status }),
				})
				if (!res.ok) {
					const detail = await res.json().catch(() => ({}))
					throw new Error(detail.detail || 'Unable to update alignment tip.')
				}
				await fetchAlignmentTips(currentUser.id, { silent: true })
			} catch (error: any) {
				setAlignmentTipsError(error?.message || 'Unable to update tip.')
			}
		},
		[currentUser?.id, authHeaders, fetchAlignmentTips]
	)

	const handleAlignmentTipArchiveToggle = useCallback(
		async (tip: AlignmentTip) => {
			const nextStatus = tip.status === 'active' ? 'archived' : 'active'
			await handleAlignmentTipStatusChange(tip.id, nextStatus)
		},
		[handleAlignmentTipStatusChange]
	)

	const handleAddAlignmentTip = useCallback(
		async (tip: string) => {
			if (!manifestationResult) return
			let targetUserId = currentUser?.id ?? userId ?? null
			if (!targetUserId) {
				targetUserId = await ensureUserProfile()
				if (!targetUserId) {
					setKarmaError('Please create your digital twin profile before saving tips.')
					return
				}
			}
			setAlignmentTipStatus(prev => ({ ...prev, [tip]: 'saving' }))
			setKarmaError(null)
			try {
				const res = await fetch(`/api/users/${targetUserId}/manifestations/tips`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json', ...(authHeaders || {}) },
					body: JSON.stringify({
						tip,
						manifestation_summary: manifestationResult.summary,
						frequency: 'daily',
					}),
				})
				if (!res.ok) {
					const detail = await res.json().catch(() => ({}))
					throw new Error(detail.detail || 'Unable to store alignment tip.')
				}
				await Promise.all([
					fetchKarmaSummary(targetUserId),
					fetchAlignmentTips(targetUserId, { silent: true }),
				])
				setAlignmentTipStatus(prev => ({ ...prev, [tip]: 'added' }))
				showToast('Alignment tip added to your daily journal ✓', 'success')
			} catch (error: any) {
				setAlignmentTipStatus(prev => ({ ...prev, [tip]: 'error' }))
				setKarmaError(error?.message || 'Unable to store alignment tip.')
			}
		},
		[
			manifestationResult,
			currentUser?.id,
			userId,
			ensureUserProfile,
			authHeaders,
			fetchKarmaSummary,
		]
	)

	const handleAvatarUpload = async (file: File | null) => {
		if (!file) {
			return
		}
		const targetUserId = currentUser?.id ?? userId ?? null
		if (!targetUserId) {
			setAvatarError('Create your digital twin first using the "Create Your Digital Twin" button so we can attach an avatar to it.')
			return
		}
		setAvatarError(null)
		clearAvatarPolling()
		setAvatarJobStatus('queued')
		setAvatarJobId(null)
		setAvatarUploading(true)
		try {
			const formData = new FormData()
			formData.append('file', file)
			const res = await fetch(`/api/users/${targetUserId}/avatar/generate`, {
				method: 'POST',
				body: formData,
				headers: { ...(authHeaders || {}) },
			})
			if (!res.ok) {
				const detail = await res.json().catch(() => ({}))
				throw new Error(detail.detail || 'Unable to start avatar generation.')
			}
			const data = (await res.json()) as AvatarJobResponse
			setAvatarJobId(data.job_id)
			setAvatarJobStatus(data.status)
			pollAvatarJobStatus(data.job_id, targetUserId)
		} catch (error: any) {
			setAvatarUploading(false)
			setAvatarJobStatus('failed')
			setAvatarError(error?.message || 'Unable to generate avatar right now.')
		}
	}

	const handleCreateDigitalTwin = useCallback(async () => {
		if (digitalTwinCreating) {
			return
		}
		setDigitalTwinError(null)
		setDigitalTwinMessage(null)

		// Use currentUser data if available, otherwise fall back to profile
		const phone = currentUser?.phone_number || profile?.phoneNumber?.trim()
		const dateOfBirth = currentUser?.date_of_birth || profile?.dateOfBirth?.trim()
		const placeOfBirth = currentUser?.place_name || profile?.placeOfBirth?.trim()
		const timeOfBirth = currentUser?.time_of_birth || profile?.timeOfBirth?.trim() || '00:00'

		if (!phone) {
			setDigitalTwinError('Phone number missing. Please contact support.')
			return
		}
		if (!dateOfBirth || !timeOfBirth || !placeOfBirth || dateOfBirth === '1900-01-01' || placeOfBirth === 'Unknown') {
			setDigitalTwinError('Please provide your birth details (date, time, and place) to create your digital twin.')
			return
		}

		// Use currentUser data if available, otherwise fall back to profile
		const firstName = currentUser?.first_name || (profile?.fullName ? profile.fullName.split(/\s+/)[0] : null) || null
		const lastName = currentUser?.last_name || (profile?.fullName ? profile.fullName.split(/\s+/).slice(1).join(' ') : null) || null
		const gender = currentUser?.gender || profile?.gender || null

		const payload: Record<string, unknown> = {
			first_name: firstName,
			last_name: lastName,
			gender: gender,
			phone_number: phone,
			date_of_birth: dateOfBirth,
			time_of_birth: timeOfBirth,
			place_name: placeOfBirth,
		}

		try {
			const geocodeRes = await fetch(`/api/geocode?q=${encodeURIComponent(placeOfBirth)}`)
			if (geocodeRes.ok) {
				const geo = await geocodeRes.json()
				if (typeof geo.latitude === 'number') {
					payload.latitude = geo.latitude
				}
				if (typeof geo.longitude === 'number') {
					payload.longitude = geo.longitude
				}
				if (geo.timezone) {
					payload.timezone = geo.timezone
				}
			}
		} catch {
			/* ignore geocoding issues */
		}

		setDigitalTwinCreating(true)
		try {
			// Get referral code from localStorage (set during registration)
			const storedReferralCode = localStorage.getItem('pending_referral_code')
			const referralParam = storedReferralCode ? `?referral_code=${encodeURIComponent(storedReferralCode)}` : ''
			
			const res = await fetch(`/api/users/save${referralParam}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', ...(authHeaders || {}) },
				body: JSON.stringify(payload),
			})
			
			// Clear referral code after use
			if (storedReferralCode) {
				localStorage.removeItem('pending_referral_code')
			}
			const data = await res.json().catch(() => null)
			if (!res.ok || !data) {
				const message = (data as { detail?: string } | null)?.detail || 'Unable to create your digital twin right now.'
				throw new Error(message)
			}
			const newUserId = (data as { user_id?: number | null }).user_id
			if (typeof newUserId === 'number') {
				setUserId(newUserId)
				await fetchUser(newUserId)
				await Promise.all([
					fetchGuidance(newUserId, { silent: true }).catch(() => undefined),
					fetchKarmaSummary(newUserId).catch(() => undefined),
					fetchFeatureLimits(newUserId).catch(() => undefined),
				])
			}
			setDigitalTwinMessage('Digital twin created successfully. Your dashboard has been refreshed.')
		} catch (error: any) {
			setDigitalTwinError(error?.message || 'Unable to create your digital twin right now.')
		} finally {
			setDigitalTwinCreating(false)
		}
	}, [
		digitalTwinCreating,
		currentUser,
		profile?.phoneNumber,
		profile?.dateOfBirth,
		profile?.placeOfBirth,
		profile?.timeOfBirth,
		profile?.fullName,
		profile?.gender,
		authHeaders,
		setUserId,
		fetchUser,
		fetchGuidance,
		fetchKarmaSummary,
	])

	const handleLogout = () => {
		clearAvatarPolling()
		setToken(null)
		setProfile(null)
		setUserId(null)
		navigate('/', { replace: true })
	}

	const welcomeName =
		currentUser?.first_name ||
		profile?.fullName ||
		(currentUser?.phone_number ? `Seeker ${currentUser.phone_number.slice(-4)}` : 'Seeker')

	const isAvatarProcessing = avatarJobStatus === 'queued' || avatarJobStatus === 'processing'
	const avatarStatusMessage = (() => {
		if (avatarError) return avatarError
		if (avatarJobStatus === 'completed') return 'Cosmic avatar ready.'
		if (avatarJobStatus === 'failed') return 'Avatar generation failed. Try a different photo.'
		if (isAvatarProcessing) return avatarJobStatus === 'queued' ? 'Avatar generation queued…' : 'Crafting your cosmic avatar…'
		return null
	})()

	const resolvedAvatarUrl = useMemo(() => {
		const url = currentUser?.avatar_url
		console.log('Computing resolvedAvatarUrl, currentUser?.avatar_url:', url, 'backendBaseUrl:', backendBaseUrl)
		if (!url) {
			console.log('No avatar URL found')
			return null
		}
		if (/^https?:/i.test(url)) {
			console.log('Avatar URL is absolute:', url)
			return url
		}
		const resolved = `${backendBaseUrl}${url}`
		console.log('Resolved avatar URL:', resolved)
		return resolved
	}, [backendBaseUrl, currentUser?.avatar_url])

	useEffect(() => {
		if (currentUser?.id) {
			setDigitalTwinError(null)
		}
	}, [currentUser?.id])

	useEffect(() => {
		if (currentUser?.id) {
			void fetchAlignmentTips(currentUser.id, { silent: true })
		}
	}, [currentUser?.id, fetchAlignmentTips])

	useEffect(() => {
		if (showPlanModal && currentUser?.id) {
			void fetchReferralStats(currentUser.id)
			void fetchUserReferrals(currentUser.id)
		}
	}, [showPlanModal, currentUser?.id, fetchReferralStats, fetchUserReferrals])

	useEffect(() => {
		if (activeSection === 'charts' && currentUser?.id && !chartData && !chartLoading && currentUser.date_of_birth && currentUser.time_of_birth) {
			void fetchChartData(currentUser.id)
		}
	}, [activeSection, currentUser?.id, currentUser?.date_of_birth, currentUser?.time_of_birth, chartData, chartLoading, fetchChartData])

	useEffect(() => {
		if (!token) {
			return
		}
		let cancelled = false
		const bootstrap = async () => {
			setInitializing(true)
			try {
				let resolvedId = userId
				if (!resolvedId) {
					resolvedId = await ensureUserProfile()
				}
				// Even if user doesn't exist yet, still render the dashboard
				// User can create their digital twin from the dashboard
				if (resolvedId && !cancelled) {
				await fetchUser(resolvedId)
				if (cancelled) {
					return
				}
				await Promise.all([
					fetchGuidance(resolvedId, { silent: true }).catch(() => undefined),
					fetchKarmaSummary(resolvedId).catch(() => undefined),
						fetchAlignmentTips(resolvedId, { silent: true }).catch(() => undefined),
						fetchReferralStats(resolvedId).catch(() => undefined),
						fetchCurrentDasha(resolvedId).catch(() => undefined),
						fetchKarmaDashboard().catch(() => undefined),
						fetchTwinState().catch(() => undefined),
						fetchEntitlements().catch(() => undefined),
				])
				}
			} catch (error) {
				console.error('Failed to initialise dashboard', error)
				// Don't block rendering on errors - show dashboard anyway
			} finally {
				if (!cancelled) {
					setInitializing(false)
				}
			}
		}
		void bootstrap()
		return () => {
			cancelled = true
		}
	}, [token, userId, ensureUserProfile, fetchUser, fetchGuidance, fetchKarmaSummary, fetchCurrentDasha])

	// Refresh referral stats when referral modal opens
	useEffect(() => {
		if (showReferralModal && currentUser?.id) {
			fetchReferralStats(currentUser.id)
		}
	}, [showReferralModal, currentUser?.id, fetchReferralStats])

	// Show loading state only briefly while initializing (max 1.5 seconds)
	// After that, render the dashboard even if data isn't loaded yet
	const [showLoading, setShowLoading] = useState(true)
	useEffect(() => {
		// Always hide loading after max 1.5 seconds
		const maxTimer = setTimeout(() => {
			setShowLoading(false)
		}, 1500)
		
		if (!initializing) {
			// Stop showing loading once initialization completes
			setShowLoading(false)
		}
		
		return () => clearTimeout(maxTimer)
	}, [initializing])

	// Don't block rendering - always show dashboard after timeout
	// Only show loading if we're still initializing AND it's been less than 1.5 seconds
	if (showLoading && initializing && !currentUser) {
	return (
		<div style={pageStyle}>
				<div style={{ 
					display: 'flex', 
					flexDirection: 'column', 
					alignItems: 'center', 
					justifyContent: 'center', 
					minHeight: '100vh',
					gap: 16
				}}>
					<div style={{ fontSize: 18, color: '#cbd5f5' }}>Loading your dashboard...</div>
					<div style={{ fontSize: 14, color: '#64748b' }}>Preparing your cosmic journey</div>
				</div>
			</div>
		)
	}

	// Check token from both context and localStorage to handle race conditions
	const localToken = typeof window !== 'undefined' ? localStorage.getItem('ibhakt_token') : null
	const hasToken = token || localToken
	
	// If no token at all, ProtectedRoute should handle redirect, but show loading just in case
	if (!hasToken) {
		return (
			<div style={pageStyle}>
				<div style={{ 
					display: 'flex', 
					flexDirection: 'column', 
					alignItems: 'center', 
					justifyContent: 'center', 
					minHeight: '100vh',
					gap: 16
				}}>
					<div style={{ fontSize: 18, color: '#cbd5f5' }}>Verifying authentication...</div>
				</div>
			</div>
		)
	}

	// Debug: Force render something visible immediately
	console.log('[DashboardPage] Rendering dashboard', { hasToken, initializing, hasUser: !!currentUser, showLoading })
	
	// Always render - even if there are errors, show something
	return (
		<div style={pageStyle || { minHeight: '100vh', background: '#0f172a', color: '#fff' }}>
			<header style={headerStyle}>
				<div style={brandBlockStyle}>
					<img src={logoImage} alt="iBhakt logo" style={brandLogoStyle} />
					<div style={brandTaglineStyle}>Record your Karma</div>
				</div>
				<nav style={navBarStyle}>
					<button 
						type="button" 
						style={activeSection === 'dashboard' ? navButtonActiveStyle : navButtonStyle}
						onClick={() => setActiveSection('dashboard')}
					>
						Dashboard
					</button>
					<button 
						type="button" 
						style={activeSection === 'cosmic-blueprint' ? navButtonActiveStyle : navButtonStyle}
						onClick={() => setActiveSection('cosmic-blueprint')}
					>
						Cosmic Blueprint
					</button>
					<button 
						type="button" 
						style={activeSection === 'charts' ? navButtonActiveStyle : navButtonStyle}
						onClick={() => setActiveSection('charts')}
					>
						Charts
					</button>
					<button
						type="button"
						style={navButtonStyle}
						onClick={() => navigate('/karma-ledger')}
					>
						Karma Ledger
					</button>
					<button
						type="button"
						style={navButtonStyle}
						onClick={() => navigate('/manifestations')}
					>
						Manifestations
					</button>
				</nav>
				<div style={headerUserStyle}>
					<div style={{ textAlign: 'right' }}>
						<div style={{ fontWeight: 600, fontSize: 14, color: '#f8fafc' }}>{welcomeName}</div>
						<div style={{ fontSize: 12, color: '#94a3b8' }}>
							{profile?.phoneNumber || currentUser?.phone_number || '--'}
						</div>
					</div>
					<button style={logoutButtonStyle} onClick={handleLogout}>
						Log out
					</button>
				</div>
			</header>

			<main style={mainStyle}>
				{activeSection === 'dashboard' && (
				<>
				{/* Manifestation Dashboard Section */}
				<div style={{ marginBottom: 32 }}>
					<ManifestationDashboard />
				</div>
				<section style={gridWrapperStyle}>
					<div style={leftColumnStyle}>
						{/* Your Cosmic Avatar - moved to left column */}
						<div style={cardStyle}>
							<div style={{ marginBottom: 18 }}>
								<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
									<div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
										{/* "Your Cosmic Avatar" text above profile picture */}
										<div style={cardLabelStyle}>Your Cosmic Avatar</div>
										{/* Create Digital Twin Button - Only show if digital twin doesn't exist */}
										{currentUser && (
											(currentUser.date_of_birth === '1900-01-01' || currentUser.place_name === 'Unknown' || !currentUser.date_of_birth || !currentUser.place_name) && (
												<button
													type="button"
													onClick={() => {
														// Pre-fill form with existing data if available
														setDigitalTwinForm({
															firstName: currentUser.first_name || '',
															lastName: currentUser.last_name || '',
															dateOfBirth: currentUser.date_of_birth && currentUser.date_of_birth !== '1900-01-01' ? currentUser.date_of_birth : '',
															timeOfBirth: currentUser.time_of_birth && currentUser.time_of_birth !== '00:00' ? currentUser.time_of_birth : '',
															placeOfBirth: currentUser.place_name && currentUser.place_name !== 'Unknown' ? currentUser.place_name : '',
															gender: currentUser.gender || '',
														})
														setShowDigitalTwinModal(true)
													}}
													style={{
														padding: '14px 24px',
														background: 'linear-gradient(135deg, rgba(250, 204, 21, 0.9), rgba(249, 115, 22, 0.85))',
														border: '2px solid rgba(250, 204, 21, 0.8)',
														borderRadius: 12,
														color: '#1f2937',
														fontWeight: 800,
														fontSize: '15px',
														letterSpacing: '0.05em',
														textTransform: 'uppercase',
														cursor: 'pointer',
														boxShadow: '0 0 30px rgba(250, 204, 21, 0.6), 0 8px 24px rgba(0, 0, 0, 0.4)',
														transition: 'all 0.3s ease',
														marginTop: 12,
														width: '100%',
													}}
													onMouseEnter={(e) => {
														e.currentTarget.style.transform = 'scale(1.05)'
														e.currentTarget.style.boxShadow = '0 0 40px rgba(250, 204, 21, 0.9), 0 12px 32px rgba(0, 0, 0, 0.5)'
														e.currentTarget.style.borderColor = 'rgba(250, 204, 21, 1)'
													}}
													onMouseLeave={(e) => {
														e.currentTarget.style.transform = 'scale(1)'
														e.currentTarget.style.boxShadow = '0 0 30px rgba(250, 204, 21, 0.6), 0 8px 24px rgba(0, 0, 0, 0.4)'
														e.currentTarget.style.borderColor = 'rgba(250, 204, 21, 0.8)'
													}}
												>
													✨ Create My Digital Twin ✨
												</button>
											)
										)}
										{/* Profile Picture - Below "Your Cosmic Avatar" text */}
										{!resolvedAvatarUrl && !isAvatarProcessing && (
											<div style={{ marginTop: 12 }}>
												<input
													ref={uploadInputRef}
													type="file"
													accept="image/*"
													style={{ display: 'none' }}
													onChange={event => {
														const file = event.target.files?.[0]
														void handleAvatarUpload(file || null)
														event.target.value = ''
													}}
												/>
												<button
													type="button"
													onClick={() => uploadInputRef.current?.click()}
													style={{
														padding: '12px 20px',
														background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.9), rgba(139, 92, 246, 0.85))',
														border: '2px solid rgba(99, 102, 241, 0.8)',
														borderRadius: 12,
														color: '#f8fafc',
														fontWeight: 700,
														fontSize: '14px',
														cursor: 'pointer',
														boxShadow: '0 0 20px rgba(99, 102, 241, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3)',
														transition: 'all 0.3s ease',
													}}
													onMouseEnter={(e) => {
														e.currentTarget.style.transform = 'scale(1.05)'
														e.currentTarget.style.boxShadow = '0 0 30px rgba(99, 102, 241, 0.7), 0 6px 16px rgba(0, 0, 0, 0.4)'
													}}
													onMouseLeave={(e) => {
														e.currentTarget.style.transform = 'scale(1)'
														e.currentTarget.style.boxShadow = '0 0 20px rgba(99, 102, 241, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3)'
													}}
												>
													📸 Upload Image to Create Cosmic Avatar
												</button>
											</div>
										)}
										{(resolvedAvatarUrl || (isAvatarProcessing && currentUser?.avatar_url)) && (
											<div style={{ position: 'relative', display: 'inline-block', marginTop: 12 }}>
												{resolvedAvatarUrl ? (
													<img
														src={resolvedAvatarUrl}
														alt="Cosmic Avatar"
														style={avatarImageLeftStyle}
														onLoad={() => {
															console.log('Avatar image loaded successfully:', resolvedAvatarUrl)
															setAvatarUploading(false)
															setAvatarJobStatus('completed')
														}}
														onError={(e) => {
															console.error('Failed to load avatar image:', resolvedAvatarUrl, e)
															setAvatarError('Failed to load avatar image. Please try uploading again.')
														}}
													/>
												) : currentUser?.avatar_url ? (
													<img
														src={`${backendBaseUrl}${currentUser.avatar_url}`}
														alt="Cosmic Avatar"
														style={avatarImageLeftStyle}
														onLoad={() => {
															console.log('Avatar image loaded from currentUser:', currentUser.avatar_url)
															setAvatarUploading(false)
															setAvatarJobStatus('completed')
														}}
														onError={(e) => {
															console.error('Failed to load avatar image from currentUser:', currentUser.avatar_url, e)
														}}
													/>
												) : null}
												<input
													ref={uploadInputRef}
													type="file"
													accept="image/*"
													style={{ display: 'none' }}
													onChange={event => {
														const file = event.target.files?.[0]
														void handleAvatarUpload(file || null)
														event.target.value = ''
													}}
												/>
												<button
													type="button"
													onClick={() => !avatarUploading && uploadInputRef.current?.click()}
													disabled={avatarUploading}
													style={avatarEditIconStyle}
													title="Update Cosmic Avatar"
													onMouseEnter={e => {
														e.currentTarget.style.background = 'rgba(99, 102, 241, 1)'
														e.currentTarget.style.transform = 'scale(1.1)'
													}}
													onMouseLeave={e => {
														e.currentTarget.style.background = 'rgba(99, 102, 241, 0.9)'
														e.currentTarget.style.transform = 'scale(1)'
													}}
												>
													✏️
												</button>
											</div>
										)}
							</div>
									<div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
										<div style={currentPlanBadgeStyle(currentPlan)}>
											{currentPlan === 'awaken' ? 'Awaken' : currentPlan === 'karma_builder' ? 'Karma Builder' : currentPlan === 'karma_pro' ? 'Karma Pro' : 'Dharma Master'}
							</div>
										{/* PDF Download Button */}
										{currentUser?.id && currentUser?.date_of_birth && currentUser.date_of_birth !== '1900-01-01' && currentUser?.place_name && currentUser.place_name !== 'Unknown' && (
											<button
												type="button"
												onClick={async () => {
													try {
														const res = await fetch(`/api/users/${currentUser.id}/pdf`, {
															headers: { ...(authHeaders || {}) },
														})
														if (!res.ok) {
															const error = await res.json().catch(() => ({}))
															throw new Error(error.detail || 'Failed to generate PDF')
														}
														const blob = await res.blob()
														const url = window.URL.createObjectURL(blob)
														const a = document.createElement('a')
														a.href = url
														a.download = `digital_twin_report_${currentUser.id}_${currentUser.date_of_birth?.replace(/-/g, '') || 'report'}.pdf`
														document.body.appendChild(a)
														a.click()
														window.URL.revokeObjectURL(url)
														document.body.removeChild(a)
														showToast('PDF report downloaded successfully!', 'success')
													} catch (error: any) {
														showToast(error?.message || 'Failed to download PDF report', 'error')
													}
												}}
												style={{
													padding: '10px 18px',
													background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(220, 38, 38, 0.85))',
													border: '2px solid rgba(239, 68, 68, 0.8)',
													borderRadius: 10,
													color: '#fff',
													fontWeight: 700,
													fontSize: '13px',
													cursor: 'pointer',
													boxShadow: '0 0 20px rgba(239, 68, 68, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3)',
													transition: 'all 0.3s ease',
													display: 'flex',
													alignItems: 'center',
													gap: 6,
												}}
												onMouseEnter={(e) => {
													e.currentTarget.style.transform = 'scale(1.05)'
													e.currentTarget.style.boxShadow = '0 0 30px rgba(239, 68, 68, 0.7), 0 6px 16px rgba(0, 0, 0, 0.4)'
												}}
												onMouseLeave={(e) => {
													e.currentTarget.style.transform = 'scale(1)'
													e.currentTarget.style.boxShadow = '0 0 20px rgba(239, 68, 68, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3)'
												}}
											>
												📄 Download PDF Report
											</button>
										)}
										<button
											type="button"
											style={planButtonStyle}
											onClick={() => setShowPlanModal(true)}
											onMouseEnter={e => {
												e.currentTarget.style.transform = 'scale(1.05)'
												e.currentTarget.style.boxShadow = '0 6px 16px rgba(99, 102, 241, 0.5)'
											}}
											onMouseLeave={e => {
												e.currentTarget.style.transform = 'scale(1)'
												e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.4)'
											}}
										>
											PLAN
										</button>
									</div>
								</div>
							</div>
							<div style={avatarPreviewWrapperStyle}>
								{isAvatarProcessing ? (
									<div style={avatarUploadingStyle}>Crafting your cosmic avatar…</div>
								) : (
									<>
										{/* Glowing Digital Twin - Shifted Right */}
										<div style={avatarContainerStyle}>
											<DigitalTwinDisplay
												cumulativeScore={karmaSummary?.cumulative_score || twinState?.karma_score || karmaDashboard?.karma_score || 0}
												mahadasha={currentDasha?.current_mahadasha || null}
												antardasha={currentDasha?.current_antardasha || null}
												pratyantar={currentDasha?.current_pratyantar || null}
												sukshmaDasha={currentDasha?.current_sukshma || null}
												sukshmaThemes={currentDasha?.current_sukshma?.lord ? (PLANET_THEMES[currentDasha.current_sukshma.lord] || []).slice(0, 5) : []}
											/>
											{/* Twin State Info Overlay */}
											{twinState && (
												<div style={{
													position: 'absolute',
													bottom: 10,
													left: 10,
													right: 10,
													background: 'rgba(15, 23, 42, 0.9)',
													padding: 8,
													borderRadius: 6,
													border: `1px solid ${twinState.aura.color === 'gold' ? '#fbbf24' : twinState.aura.color === 'green' ? '#34d399' : '#60a5fa'}`,
													fontSize: 10,
												}}>
													<div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
														<span style={{ color: '#94a3b8' }}>Energy:</span>
														<span style={{ color: '#34d399', fontWeight: 600 }}>{twinState.energy}%</span>
													</div>
													<div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
														<span style={{ color: '#94a3b8' }}>Mood:</span>
														<span style={{ 
															color: twinState.mood === 'positive' ? '#34d399' : twinState.mood === 'negative' ? '#f87171' : '#94a3b8',
															fontWeight: 600,
															textTransform: 'capitalize'
														}}>{twinState.mood}</span>
													</div>
													<div style={{ display: 'flex', justifyContent: 'space-between' }}>
														<span style={{ color: '#94a3b8' }}>Alignment:</span>
														<span style={{ color: '#60a5fa', fontWeight: 600 }}>{twinState.alignment}%</span>
													</div>
												</div>
											)}
										</div>
									</>
								)}
							</div>
							{/* Digital MATRIX - Three scrolling lines: Align (Green), Avoid (Red), Themes (Golden) */}
							{(() => {
								const antaraLord = currentDasha?.current_antardasha?.lord
								const pratyantarLord = currentDasha?.current_pratyantar?.lord
								const sukshmaLord = currentDasha?.current_sukshma?.lord
								
								// Get thought alignment data
								const antaraAlignment = antaraLord ? (THOUGHT_ALIGNMENT[antaraLord] || THOUGHT_ALIGNMENT['Mercury']) : null
								const pratyantarAlignment = pratyantarLord ? (THOUGHT_ALIGNMENT[pratyantarLord] || THOUGHT_ALIGNMENT['Mercury']) : null
								
								// Combine aligned and avoid words (prioritize Antardasha, add Pratyantar if different)
								const alignedWords = antaraAlignment 
									? [...antaraAlignment.aligned, ...(pratyantarAlignment ? pratyantarAlignment.aligned.filter(a => !antaraAlignment.aligned.includes(a)) : [])]
									: []
								const avoidWords = antaraAlignment
									? [...antaraAlignment.avoid, ...(pratyantarAlignment ? pratyantarAlignment.avoid.filter(a => !antaraAlignment.avoid.includes(a)) : [])]
									: []
								const sukshmaThemes = sukshmaLord ? (PLANET_THEMES[sukshmaLord] || []).slice(0, 5) : []
								
								if (alignedWords.length === 0 && avoidWords.length === 0 && sukshmaThemes.length === 0) {
									return null
								}
								
								return (
									<div
										style={{
											position: 'absolute',
											bottom: 0,
											left: 0,
											right: 0,
											height: 120, // Height for three lines
											overflow: 'hidden',
											zIndex: 5,
											// Digital MATRIX background effect
											background: `
												linear-gradient(to right, rgba(15, 23, 42, 0.98) 0%, transparent 5%, transparent 95%, rgba(15, 23, 42, 0.98) 100%),
												repeating-linear-gradient(0deg, rgba(34, 211, 153, 0.03) 0px, transparent 1px, transparent 2px, rgba(34, 211, 153, 0.03) 3px),
												repeating-linear-gradient(90deg, rgba(34, 211, 153, 0.03) 0px, transparent 1px, transparent 2px, rgba(34, 211, 153, 0.03) 3px)
											`,
											borderTop: '1px solid rgba(34, 211, 153, 0.2)',
											boxShadow: 'inset 0 0 20px rgba(34, 211, 153, 0.1), 0 -2px 10px rgba(0, 0, 0, 0.3)',
										}}
									>
										{/* Green line - Align words (Top) */}
										{alignedWords.length > 0 && (
											<div
												style={{
													position: 'absolute',
													top: 8,
													left: 0,
													right: 0,
													height: 32,
													display: 'flex',
													alignItems: 'center',
													animation: 'scrollWords 18s linear infinite',
													whiteSpace: 'nowrap',
												}}
											>
												{[...alignedWords, ...alignedWords].map((word, index) => (
													<div
														key={`matrix-align-${word}-${index}`}
														style={{
															fontSize: 10,
															color: '#34d399',
															padding: '4px 20px',
															marginRight: 28,
															whiteSpace: 'nowrap',
															fontWeight: 600,
															letterSpacing: '0.1em',
															fontFamily: 'monospace',
															textShadow: '0 0 8px rgba(52, 211, 153, 0.8), 0 0 16px rgba(52, 211, 153, 0.4)',
															borderLeft: '2px solid rgba(52, 211, 153, 0.3)',
															borderRight: '2px solid rgba(52, 211, 153, 0.3)',
														}}
													>
														✓ {word.toUpperCase()}
													</div>
												))}
											</div>
										)}
										
										{/* Red line - Avoid words (Middle) */}
										{avoidWords.length > 0 && (
											<div
												style={{
													position: 'absolute',
													top: 44,
													left: 0,
													right: 0,
													height: 32,
													display: 'flex',
													alignItems: 'center',
													animation: 'scrollWordsLeftToRight 16s linear infinite',
													whiteSpace: 'nowrap',
												}}
											>
												{[...avoidWords, ...avoidWords].map((word, index) => (
													<div
														key={`matrix-avoid-${word}-${index}`}
														style={{
															fontSize: 10,
															color: '#f87171',
															padding: '4px 20px',
															marginRight: 28,
															whiteSpace: 'nowrap',
															fontWeight: 600,
															letterSpacing: '0.1em',
															fontFamily: 'monospace',
															textShadow: '0 0 8px rgba(248, 113, 113, 0.8), 0 0 16px rgba(248, 113, 113, 0.4)',
															borderLeft: '2px solid rgba(248, 113, 113, 0.3)',
															borderRight: '2px solid rgba(248, 113, 113, 0.3)',
														}}
													>
														✗ {word.toUpperCase()}
													</div>
												))}
											</div>
										)}
										
										{/* Golden line - Sukshma Dasha themes (Bottom) */}
										{sukshmaThemes.length > 0 && (
											<div
												style={{
													position: 'absolute',
													bottom: 8,
													left: 0,
													right: 0,
													height: 32,
													display: 'flex',
													alignItems: 'center',
													animation: 'scrollWords 20s linear infinite',
													whiteSpace: 'nowrap',
												}}
											>
												{[...sukshmaThemes, ...sukshmaThemes].map((theme, index) => (
													<div
														key={`matrix-theme-${theme}-${index}`}
														style={{
															fontSize: 11,
															color: '#fde68a',
															padding: '6px 24px',
															marginRight: 32,
															whiteSpace: 'nowrap',
															fontWeight: 600,
															letterSpacing: '0.1em',
															fontFamily: 'monospace',
															textShadow: '0 0 10px rgba(251, 191, 36, 0.8), 0 0 20px rgba(251, 191, 36, 0.4)',
															borderLeft: '2px solid rgba(251, 191, 36, 0.3)',
															borderRight: '2px solid rgba(251, 191, 153, 0.3)',
														}}
													>
														{theme.toUpperCase()}
													</div>
												))}
											</div>
										)}
									</div>
								)
							})()}
							{!currentUser?.id && (
								<button
									type="button"
									style={{
										...primaryButtonStyle,
										width: '100%',
										marginTop: 12,
										opacity: digitalTwinCreating ? 0.75 : 1,
										cursor: digitalTwinCreating ? 'wait' : 'pointer',
									}}
									disabled={digitalTwinCreating}
									onClick={() => {
										if (!digitalTwinCreating) {
											void handleCreateDigitalTwin()
										}
									}}
								>
									{digitalTwinCreating ? 'Creating Digital Twin...' : 'Create Your Digital Twin'}
								</button>
							)}
							{digitalTwinError && <div style={errorBannerStyle}>{digitalTwinError}</div>}
							{digitalTwinMessage && <div style={successBannerStyle}>{digitalTwinMessage}</div>}
							{avatarStatusMessage && (
								<div
									style={
										avatarError
											? errorBannerStyle
											: {
												marginTop: 12,
												padding: '10px 14px',
												borderRadius: 10,
												fontSize: 13,
												color: '#e0e7ff',
												background: 'rgba(99, 102, 241, 0.16)',
												border: '1px solid rgba(129, 140, 248, 0.35)',
											}
									}
								>
									{avatarStatusMessage}
								</div>
							)}
						</div>

						{/* Daily Alignment Tips - moved to left column under Cosmic Avatar */}
						<div style={alignmentTipsCardStyle}>
							<div style={{ marginBottom: 16 }}>
								<div style={cardLabelStyle}>Daily Alignment Tips</div>
								<h2 style={cardTitleStyle}>Active tips awaiting implementation.</h2>
								<p style={{ ...cardBodyTextStyle, marginTop: 8, fontSize: 12, color: '#94a3b8' }}>
									Tips that have been implemented or archived are available in the Karma Ledger.
								</p>
							</div>
							{alignmentTipsLoading ? (
								<p style={{ ...cardBodyTextStyle, color: '#cbd5f5' }}>Loading alignment tips...</p>
							) : alignmentTipsError ? (
								<div style={errorBannerStyle}>{alignmentTipsError}</div>
							) : (
							<div>
									{activeAlignmentTips.length === 0 ? (
										<p style={{ ...cardBodyTextStyle, color: '#9ca3af' }}>
											No active tips awaiting implementation. Add new ones from Manifestation Pulse.
										</p>
									) : (
										<div style={alignmentTipsListStyle}>
											{activeAlignmentTips.map(tip => (
												<div key={tip.id} style={alignmentTipListCardStyle}>
													<div style={{ color: '#e0e7ff', fontSize: 13 }}>{tip.tip_text}</div>
													{tip.manifestation_summary && (
														<div style={alignmentTipSummaryStyle}>
															{tip.manifestation_summary}
							</div>
													)}
													<div style={alignmentTipScheduleRowStyle}>
														<span>{describeTipSchedule(tip)}</span>
														{formatTipDueDate(tip) && (
															<span>Next due {formatTipDueDate(tip)}</span>
														)}
							</div>
													<div style={alignmentTipMetaRowStyle}>
														<span>
															Added {new Date(tip.created_at).toLocaleDateString()}
														</span>
														<button
															type="button"
															onClick={() => handleAlignmentTipArchiveToggle(tip)}
															style={alignmentTipArchiveButtonStyle}
														>
															Archive
														</button>
													</div>
												</div>
											))}
										</div>
									)}
								</div>
							)}
						</div>

						{/* Guidance section removed - now in modal */}
						<div style={{ display: 'none' }} ref={guidanceSectionRef}>
							<div style={cardHeaderStyle}>
								<div>
									<div style={cardLabelStyle}>Cosmic Guidance for Today</div>
									<h2 style={cardTitleStyle}>
										{guidanceLoading
											? 'Fetching cosmic instruction...'
											: guidance?.template
											? guidance.template.title
											: 'All guidance completed for today'}
									</h2>
								</div>
								{currentUser && (
									<button style={ghostButtonStyle} onClick={() => fetchGuidance(currentUser.id)}>
										Refresh
									</button>
								)}
							</div>
							<div style={cardBodyStyle}>
								<div style={{ display: 'grid', gap: 12 }}>
									{initializing ? (
										<p style={cardBodyTextStyle}>Preparing your cosmic briefing...</p>
									) : guidanceError ? (
										<p style={{ ...cardBodyTextStyle, color: '#fda4af' }}>{guidanceError}</p>
									) : guidance?.template ? (
										<>
											<p style={cardBodyTextStyle}>{guidance.template.body}</p>
											{guidance.context && (
												<div style={guidanceContextStyle}>
													{guidance.context.nakshatra && (
														<span>Nakshatra: {guidance.context.nakshatra}</span>
													)}
													{guidance.context.mahadasha && (
														<span>Mahadasha: {guidance.context.mahadasha}</span>
													)}
													{guidance.context.antardasha && (
														<span>Antardasha: {guidance.context.antardasha}</span>
													)}
													{guidance.context.pratyantar && (
														<span>Pratyantar: {guidance.context.pratyantar}</span>
													)}
												</div>
											)}
											<div style={guidanceLimitStyle}>
												Guidances remaining today:{' '}
												{guidance.limit === null ? 'Unlimited' : guidance.remaining ?? 0}
											</div>
										</>
									) : (
										<p style={cardBodyTextStyle}>
											You have completed all available guidance for today. Come back tomorrow for new
											insights.
										</p>
									)}
								</div>
							</div>
							<button
								style={primaryButtonStyle}
								onClick={handleAcceptGuidance}
								disabled={guidanceLoading || !currentUser || !guidance?.template}
							>
								{guidanceLoading ? 'Please wait...' : 'Accept this Action'}
							</button>
						</div>

						{/* Manifestation section removed - now in modal */}
						<div style={{ display: 'none' }} ref={manifestationSectionRef}>
							<div style={{ marginBottom: 18 }}>
								<div style={cardLabelStyle}>Manifestation Fulfillment Probability</div>
								<h2 style={cardTitleStyle}>Project the probability of your current intention.</h2>
							</div>
							<textarea
								value={manifestationText}
								onChange={event => setManifestationText(event.target.value)}
								placeholder="E.g., Manifesting a joyful new role with greater responsibility"
								style={textAreaStyle}
								rows={4}
							/>
							<div style={manifestationActionRowStyle}>
								<button
									type="button"
									onClick={analyzeManifestation}
									disabled={manifestationLoading}
									style={{
										...primaryButtonStyle,
										opacity: manifestationLoading ? 0.75 : 1,
										cursor: manifestationLoading ? 'wait' : 'pointer',
									}}
								>
									{manifestationLoading ? 'Analyzing...' : 'Analyze Manifestation'}
								</button>
								{manifestationResult && (
									<span style={manifestationCategoryChipStyle}>
										{manifestationResult.category === 'general'
											? 'General Outlook'
											: manifestationResult.category.replace('_', ' ')}
									</span>
								)}
							</div>
							{manifestationError && <div style={errorBannerStyle}>{manifestationError}</div>}
							{manifestationResult && (
								<div style={manifestationResultBoxStyle}>
									<div style={manifestationProbabilityContainerStyle}>
										<div style={manifestationProbabilityBadgeStyle}>
											<span style={manifestationProbabilityValueStyle}>
												{Math.round(manifestationResult.probability)}
											</span>
											<span style={manifestationProbabilityPercentStyle}>%</span>
										</div>
										<div style={manifestationProbabilityLabelStyle}>Fulfillment Probability</div>
									</div>
									<p style={manifestationSummaryTextStyle}>{manifestationResult.summary}</p>
									{supportiveGraphData.length > 0 && (
										<div style={manifestationGraphSectionStyle}>
											<span style={manifestationGraphSectionHeadingStyle}>Supportive Factors</span>
											<div style={manifestationGraphBarsRowStyle}>
												{supportiveGraphData.map((bar, index) => {
													const magnitude = Math.max(
														12,
														(Math.abs(bar.value) / supportiveGraphMax) * 100
													)
													return (
														<div key={`support-bar-${index}`} style={manifestationGraphColumnStyle}>
															<div style={manifestationGraphBarTrackStyle}>
																<div
																	style={{
																		...manifestationGraphBarStyle,
																		height: `${magnitude}%`,
																		background: '#34d399',
																	}}
																/>
															</div>
															<div style={manifestationGraphLabelStyle}>{bar.label}</div>
														</div>
													)
												})}
											</div>
											</div>
										)}
									{challengeGraphData.length > 0 && (
										<div style={manifestationGraphSectionStyle}>
											<span style={manifestationGraphSectionHeadingStyle}>Challenges to Transmute</span>
											<div style={manifestationGraphBarsRowStyle}>
												{challengeGraphData.map((bar, index) => {
													const magnitude = Math.max(
														12,
														(Math.abs(bar.value) / challengeGraphMax) * 100
													)
													return (
														<div key={`challenge-bar-${index}`} style={manifestationGraphColumnStyle}>
															<div style={manifestationGraphBarTrackStyle}>
																<div
																	style={{
																		...manifestationGraphBarStyle,
																		height: `${magnitude}%`,
																		background: '#f87171',
																	}}
																/>
															</div>
															<div style={manifestationGraphLabelStyle}>{bar.label}</div>
														</div>
													)
												})}
											</div>
										</div>
									)}
									<div style={manifestationFactorsGridStyle}>
										{manifestationResult.astro_context.challenging_factors.length > 0 && (
											<div>
												<span style={manifestationFactorHeadingStyle}>Challenges to Transmute</span>
												<ul style={manifestationFactorListStyle}>
													{manifestationResult.astro_context.challenging_factors.map((item, index) => (
														<li key={`challenge-${index}`}>{item}</li>
													))}
												</ul>
											</div>
										)}
									</div>
									{manifestationResult.recommendations.length > 0 && (
										<div style={alignmentTipSectionStyle}>
											<span style={manifestationFactorHeadingStyle}>Daily Alignment Tips</span>
											{visibleAlignmentTips.length === 0 ? (
												<p style={{ margin: 0, fontSize: 12, color: '#e0f2fe' }}>
													All tips have been added to your karma journal for today.
												</p>
											) : (
												<div style={alignmentTipsGridStyle}>
													{visibleAlignmentTips.map((tip, index) => {
														const status = alignmentTipStatus[tip] || 'idle'
														return (
															<div key={`tip-${index}`} style={alignmentTipCardStyle}>
																<p style={{ margin: 0, color: '#cbd5f5' }}>{tip}</p>
																<button
																	type="button"
																	onClick={() => handleAddAlignmentTip(tip)}
																	disabled={status === 'saving'}
																	style={{
																		...alignmentTipButtonStyle,
																		opacity: status === 'saving' ? 0.7 : 1,
																	}}
																>
																	{status === 'saving' ? 'Saving...' : 'Add to Karma Journal'}
																</button>
															</div>
														)
													})}
												</div>
											)}
										</div>
									)}
								</div>
							)}
						</div>

						{/* Karma section removed - now in modal */}
						<div style={{ display: 'none' }} ref={karmaSectionRef}>
							<div style={{ marginBottom: 18 }}>
								<div style={cardLabelStyle}>Record Your Karma</div>
								<h2 style={cardTitleStyle}>Describe an action you took today.</h2>
							</div>
							<form onSubmit={handleAddKarma} style={{ display: 'grid', gap: 16 }}>
								<textarea
									value={karmaText}
									onChange={event => setKarmaText(event.target.value)}
									placeholder="Describe an action you took or an experience you had today..."
									style={textAreaStyle}
								/>
								<div style={sentimentRowStyle}>
									<span style={sentimentLabelStyle}>Optionally, classify it yourself:</span>
									<div style={sentimentButtonsRowStyle}>
										{(['good', 'bad', 'neutral'] as const).map(option => (
											<button
												type="button"
												key={option}
												onClick={() =>
													setSelfAssessment(prev => (prev === option ? null : option))
												}
												style={
													selfAssessment === option
														? sentimentButtonActiveStyle(option)
														: sentimentButtonStyle(option)
												}
											>
												{option === 'good' ? 'Good' : option === 'bad' ? 'Bad' : 'Neutral'}
											</button>
										))}
									</div>
								</div>
								<div style={categoryRowStyle}>
									<select
										value={karmaCategorySlug}
										onChange={event => setKarmaCategorySlug(event.target.value)}
										style={selectStyle}
									>
										<option value="">Auto detect category (AI)</option>
										{karmaCategories.map(category => (
											<option key={category.id} value={category.slug}>
												{category.label}{' '}
												(
													{category.polarity === 'positive'
														? '+'
														: category.polarity === 'negative'
														? '-'
														: '±'}
													{Math.abs(category.default_weight)}
												)
											</option>
										))}
									</select>
								</div>
								<button type="submit" style={primaryButtonStyle} disabled={karmaSubmitting}>
									{karmaSubmitting ? 'Analyzing...' : 'Analyze and Add Karma'}
								</button>
								{karmaError && <div style={errorBannerStyle}>{karmaError}</div>}
							</form>
						</div>
						</div>

					<div style={rightColumnStyle}>
						{/* Welcome section - moved to right column */}
						<div style={heroCardStyle}>
							<div>
								<div style={heroEyebrowStyle}>Welcome, {welcomeName}!</div>
								<h1 style={heroTitleStyle}>
									Your cosmic journey is alive.<br />
									Record today's actions to shape tomorrow.
								</h1>
							</div>
						<div style={heroPillsRowStyle}>
													<button
														type="button"
								style={heroPill('#38bdf8')}
								onClick={() => setShowGuidanceModal(true)}
													>
								Daily Guidance
													</button>
													<button
														type="button"
								style={heroPill('#34d399')}
								onClick={() => setShowKarmaModal(true)}
													>
								Karma Engine
													</button>
						</div>
					</div>

						{/* Manifestation Tile - Prominent tile below Welcome */}
						<div style={manifestationTileStyle}>
							<div style={manifestationTileContentStyle}>
								<div style={manifestationTileIconStyle}>✨</div>
								<div style={manifestationTileTextContainerStyle}>
									<div style={manifestationTileTitleStyle}>MANIFESTATION</div>
									<div style={manifestationTileSubtitleStyle}>Unlock your cosmic potential</div>
							</div>
								<button
									type="button"
									style={manifestationTileButtonStyle}
								onClick={() => {
										const activeUserId = currentUser?.id || userId
										if (activeUserId) {
											navigate(`/manifestation?user_id=${activeUserId}${manifestationText ? `&manifestation=${encodeURIComponent(manifestationText)}` : ''}`)
										} else {
											showToast('Please create your digital twin first', 'error')
										}
									}}
									onMouseEnter={e => {
										e.currentTarget.style.transform = 'scale(1.05)'
										e.currentTarget.style.boxShadow = '0 8px 20px rgba(251, 191, 36, 0.6)'
									}}
									onMouseLeave={e => {
										e.currentTarget.style.transform = 'scale(1)'
										e.currentTarget.style.boxShadow = '0 4px 12px rgba(251, 191, 36, 0.4)'
									}}
								>
									Explore →
							</button>
								</div>
						</div>

						{/* Karma Overview - moved to right column below Manifestation */}
						<div style={cardStyle}>
							<div style={{ marginBottom: 16 }}>
								<div style={cardLabelStyle}>Karma Overview</div>
								<h2 style={cardTitleStyle}>Your actions influence your destiny.</h2>
							</div>
							<div style={karmaSummaryGridStyle}>
								<div style={karmaSummaryCardStyle('#22d3ee')}>
									<div style={karmaSummaryLabelStyle}>Cumulative</div>
									<div style={karmaSummaryValueStyle}>
										{karmaSummary ? karmaSummary.cumulative_score.toFixed(1) : karmaDashboard?.karma_score?.toFixed(1) || '0.0'}
									</div>
								</div>
								<div style={karmaSummaryCardStyle('#34d399')}>
									<div style={karmaSummaryLabelStyle}>Positive</div>
									<div style={karmaSummaryValueStyle}>
										{karmaSummary ? karmaSummary.positive_score.toFixed(1) : '0.0'}
									</div>
								</div>
								<div style={karmaSummaryCardStyle('#f97316')}>
									<div style={karmaSummaryLabelStyle}>Negative</div>
									<div style={karmaSummaryValueStyle}>
										{karmaSummary ? karmaSummary.negative_score.toFixed(1) : '0.0'}
									</div>
								</div>
							</div>
							{/* Streak Information */}
							{karmaDashboard?.streak && (
								<div style={{ marginTop: 20, padding: 16, background: 'rgba(34, 211, 153, 0.1)', borderRadius: 8, border: '1px solid rgba(34, 211, 153, 0.2)' }}>
									<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
										<div style={{ fontSize: 14, fontWeight: 600, color: '#34d399' }}>🔥 Streak</div>
										<div style={{ fontSize: 18, fontWeight: 700, color: '#fbbf24' }}>{karmaDashboard.streak.current_days} days</div>
									</div>
									<div style={{ fontSize: 12, color: '#cbd5f5', marginBottom: 8 }}>
										Level: <span style={{ color: '#fbbf24', fontWeight: 600 }}>{karmaDashboard.streak.level_name}</span>
									</div>
									<div style={{ fontSize: 11, color: '#94a3b8' }}>
										Longest: {karmaDashboard.streak.longest_days} days · Next level in {karmaDashboard.streak.next_level_threshold - karmaDashboard.streak.current_days} days
									</div>
									<div style={{ marginTop: 8, height: 4, background: 'rgba(34, 211, 153, 0.2)', borderRadius: 2, overflow: 'hidden' }}>
										<div style={{ 
											height: '100%', 
											background: '#34d399', 
											width: `${karmaDashboard.streak.progress_to_next_level}%`,
											transition: 'width 0.3s ease'
										}} />
									</div>
								</div>
							)}
						</div>
					</div>
				</section>
				</>
				)}

				{activeSection === 'cosmic-blueprint' && (
					<section style={gridWrapperStyle}>
						<div style={leftColumnStyle}>
						<div style={cardStyle}>
							<div style={{ marginBottom: 16 }}>
								<div style={cardLabelStyle}>Birth Snapshot</div>
								<h2 style={cardTitleStyle}>Your astral imprint at birth.</h2>
							</div>
							{currentUser ? (
								<>
									{birthDetailsLoading ? (
										<p style={{ ...cardBodyTextStyle, color: '#cbd5f5' }}>Loading birth details...</p>
									) : (
								<ul style={birthListStyle}>
									<li>
										<strong>Date & Time:</strong> {currentUser.date_of_birth} · {currentUser.time_of_birth}{' '}
										({currentUser.timezone || '—'})
									</li>
									<li>
										<strong>Place:</strong> {currentUser.place_name}
									</li>
											{birthDetails && (
												<>
													<li>
														<strong>Rashi:</strong> {birthDetails.rashi || '—'}
													</li>
													<li>
														<strong>Day of Birth:</strong> {birthDetails.day_of_birth || '—'}
													</li>
													<li>
														<strong>Nakshatra:</strong> {birthDetails.nakshatra || currentUser.nakshatra} · Pada {currentUser.pada}
													</li>
													<li>
														<strong>Karan of Ghat Chakra:</strong> {birthDetails.karan_ghat_chakra || '—'}
													</li>
													<li>
														<strong>Moon of which Rashi:</strong> {birthDetails.moon_rashi || '—'}
													</li>
													<li>
														<strong>Sun Sign:</strong> {birthDetails.sun_sign || '—'}
													</li>
													<li>
														<strong>Yog:</strong> {birthDetails.yoga || '—'}
													</li>
													<li>
														<strong>Karan of Avkhda Chakra:</strong> {birthDetails.karan_avkhda_chakra || '—'}
													</li>
													<li>
														<strong>Varna:</strong> {birthDetails.varna || '—'}
													</li>
													<li>
														<strong>Yoni:</strong> {birthDetails.yoni || '—'}
													</li>
													<li>
														<strong>Gan:</strong> {birthDetails.gan || '—'}
													</li>
													<li>
														<strong>Nadi:</strong> {birthDetails.nadi || '—'}
									</li>
									<li>
										<strong>Dasha at Birth:</strong> {currentUser.dasha_at_birth}
									</li>
												</>
											)}
											{!birthDetails && !birthDetailsLoading && (
												<li>
													<strong>Dasha at Birth:</strong> {currentUser.dasha_at_birth}
												</li>
											)}
								</ul>
									)}
								</>
							) : (
								<p style={{ ...cardBodyTextStyle, color: '#cbd5f5' }}>
									Run your digital twin analysis to populate your birth snapshot.
								</p>
							)}
						</div>
					</div>
				</section>
				)}

				{activeSection === 'charts' && (
					<section style={{ ...gridWrapperStyle, gridTemplateColumns: '1fr' }}>
						<div style={cardStyle}>
							<div style={{ marginBottom: 16 }}>
								<div style={cardLabelStyle}>Astrological Charts</div>
								<h2 style={cardTitleStyle}>Lagna Chart & Moon Chart</h2>
											</div>
							{!currentUser ? (
								<p style={{ ...cardBodyTextStyle, color: '#cbd5f5' }}>
									Please create your digital twin first to view charts.
								</p>
							) : (
								<div>
									{chartLoading ? (
										<p style={{ ...cardBodyTextStyle, color: '#cbd5f5' }}>Loading charts...</p>
									) : chartData ? (
										<div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
											<div>
												<SouthIndianChart chartData={chartData} type="lagna" />
												</div>
											<div>
												<SouthIndianChart chartData={chartData} type="moon" />
												</div>
											</div>
									) : (
										<div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
											<p style={{ ...cardBodyTextStyle, color: '#cbd5f5', marginBottom: 8 }}>
												Click the button below to load your astrological charts.
											</p>
											<button
												type="button"
												style={primaryButtonStyle}
												onClick={() => currentUser?.id && fetchChartData(currentUser.id)}
											>
												Load Charts
											</button>
												</div>
											)}
								</div>
							)}
						</div>
					</section>
				)}
			</main>
			{toast && (
				<div style={toastContainerStyle}>
					<div style={toastStyle(toast.type)}>
						<span style={toastIconStyle(toast.type)}>
							{toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'}
						</span>
						<span>{toast.message}</span>
											</div>
												</div>
											)}
			{showPlanModal && (
				<div style={planModalOverlayStyle} onClick={() => setShowPlanModal(false)}>
					<div style={planModalContentStyle} onClick={e => e.stopPropagation()}>
						<div style={planModalHeaderStyle}>
							<h2 style={planModalTitleStyle}>iBhakt Plan Structure</h2>
													<button
														type="button"
								style={planModalCloseButtonStyle}
								onClick={() => setShowPlanModal(false)}
								onMouseEnter={e => {
									e.currentTarget.style.background = 'rgba(148, 163, 184, 0.3)'
									e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.5)'
								}}
								onMouseLeave={e => {
									e.currentTarget.style.background = 'rgba(148, 163, 184, 0.2)'
									e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.3)'
								}}
							>
								✕
													</button>
												</div>
						<div style={planModalBodyStyle}>
							{(() => {
								// Define plan hierarchy
								const planHierarchy: Record<string, number> = {
									'awaken': 1,
									'karma_builder': 2,
									'karma_pro': 3,
									'dharma_master': 4,
								}
								const currentPlanLevel = planHierarchy[currentPlan] || 0
								
								// Show all plans (no filter)
								return PLAN_DATA.map((plan) => {
									const planLevel = planHierarchy[plan.id] || 0
									return (
										<div key={plan.id} style={planCardStyle(plan.tier, currentPlan === plan.id)}>
											{currentPlan === plan.id && (
												<div style={planCardCurrentBadgeStyle}>Current Plan</div>
											)}
											<div style={planCardHeaderStyle(plan.tier)}>
												<div style={planCardTierStyle}>
													<span style={planCardTierNumberStyle}>{planLevel}️⃣</span>
													<div>
														<h3 style={planCardTitleStyle}>{plan.name}</h3>
														<p style={planCardTaglineStyle}>{plan.tagline}</p>
												</div>
										</div>
											</div>
									{plan.price && (
										<div style={planCardPriceCenterStyle}>
											{plan.price}
								</div>
							)}
									<div style={planCardBodyStyle}>
										<div style={planCardIncludesStyle}>
											<strong>Includes:</strong>
											<ul style={planCardListStyle}>
												{plan.includes.map((item, idx) => (
													<li key={idx} style={planCardListItemStyle}>{item}</li>
												))}
											</ul>
							</div>
									{plan.unlocksWhen && plan.id === 'karma_builder' && (
										<div style={planCardUnlocksStyle}>
											<button
												type="button"
												onClick={() => setShowReferralModal(true)}
												style={{
													width: '100%',
													background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
													border: '1px solid rgba(99, 102, 241, 0.5)',
													color: '#f8fafc',
													fontWeight: 600,
													padding: '12px 20px',
													fontSize: 14,
													cursor: 'pointer',
													borderRadius: 8,
													transition: 'all 0.2s ease',
												}}
											>
												🔗 Unlock when: {plan.unlocksWhen}
											</button>
										</div>
									)}
									{plan.unlocksWhen && plan.id !== 'karma_builder' && (
										<div style={planCardUnlocksStyle}>
											<strong>Unlocks when:</strong> {plan.unlocksWhen}
										</div>
									)}
									{plan.id === 'karma_builder' && currentPlan === 'awaken' && (
										<div style={referralProgressStyle}>
											<div style={referralProgressHeaderStyle}>
												<strong>Referral Progress:</strong>
												<span>{referralCount} / {referralLimitAwaken} referrals</span>
							</div>
											<div style={referralProgressBarStyle}>
											<div
												style={{
														...referralProgressFillStyle,
														width: `${Math.min(100, (referralCount / referralLimitAwaken) * 100)}%`,
													}}
												/>
											</div>
											{referralCode && (
												<div style={referralCodeDisplayStyle}>
													<span>Your Referral Code:</span>
													<div style={referralCodeBoxStyle}>
														<code style={referralCodeTextStyle}>{referralCode}</code>
								<button
															type="button"
															style={copyButtonStyle}
															onClick={() => {
																navigator.clipboard.writeText(referralCode)
																showToast('Referral code copied!', 'success')
															}}
														>
															Copy Code
														</button>
											</div>
													<div style={{ marginTop: 12 }}>
														<span style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Share Your Referral Link:</span>
														<div style={referralCodeBoxStyle}>
															<code style={{ ...referralCodeTextStyle, fontSize: 11, wordBreak: 'break-all' }}>
																{publicBaseUrl}/?ref={referralCode}
															</code>
													<button
														type="button"
																style={copyButtonStyle}
																onClick={() => {
																	const referralUrl = `${publicBaseUrl}/?ref=${referralCode}`
																	navigator.clipboard.writeText(referralUrl)
																	showToast('Referral link copied! Share it with friends.', 'success')
																}}
															>
																Copy Link
													</button>
														</div>
													</div>
													{/* Send Referral via Email/Phone */}
													<div style={{ marginTop: 20, padding: 16, background: 'rgba(15, 23, 42, 0.6)', borderRadius: 12, border: '1px solid rgba(148, 163, 184, 0.2)' }}>
														<div style={{ fontSize: 13, fontWeight: 600, color: '#cbd5f5', marginBottom: 12 }}>Refer via Email or Phone</div>
														<div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
													<button
														type="button"
																onClick={() => setReferralType('email')}
									style={{
																	flex: 1,
																	padding: '8px 12px',
																	borderRadius: 8,
																	border: '1px solid rgba(148, 163, 184, 0.3)',
																	background: referralType === 'email' ? 'rgba(99, 102, 241, 0.3)' : 'rgba(15, 23, 42, 0.5)',
																	color: '#e0e7ff',
																	fontSize: 12,
																	cursor: 'pointer',
																}}
															>
																Email
															</button>
															<button
									type="button"
																onClick={() => setReferralType('phone')}
																style={{
																	flex: 1,
																	padding: '8px 12px',
																	borderRadius: 8,
																	border: '1px solid rgba(148, 163, 184, 0.3)',
																	background: referralType === 'phone' ? 'rgba(99, 102, 241, 0.3)' : 'rgba(15, 23, 42, 0.5)',
																	color: '#e0e7ff',
																	fontSize: 12,
																	cursor: 'pointer',
																}}
															>
																Phone
													</button>
												</div>
														<input
															type={referralType === 'email' ? 'email' : 'tel'}
															value={referralValue}
															onChange={(e) => setReferralValue(e.target.value)}
															placeholder={referralType === 'email' ? 'Enter email address' : 'Enter phone number'}
															style={{
																width: '100%',
																padding: '10px 12px',
																borderRadius: 8,
																border: '1px solid rgba(148, 163, 184, 0.3)',
																background: 'rgba(15, 23, 42, 0.7)',
																color: '#f8fafc',
																fontSize: 13,
																marginBottom: 12,
															}}
														/>
							<button
								type="button"
															onClick={handleSendReferral}
															disabled={sendingReferral || !referralValue.trim()}
								style={{
									width: '100%',
																padding: '10px 16px',
																borderRadius: 8,
																border: 'none',
																background: sendingReferral ? 'rgba(148, 163, 184, 0.5)' : 'rgba(99, 102, 241, 0.8)',
																color: '#f8fafc',
																fontSize: 13,
																fontWeight: 600,
																cursor: sendingReferral ? 'not-allowed' : 'pointer',
																opacity: sendingReferral || !referralValue.trim() ? 0.6 : 1,
															}}
														>
															{sendingReferral ? 'Sending...' : `Send Referral via ${referralType === 'email' ? 'Email' : 'Phone'}`}
														</button>
												</div>
													{/* Show pending and completed referrals */}
													{userReferrals && (userReferrals.pending.length > 0 || userReferrals.completed.length > 0) && (
														<div style={{ marginTop: 16, padding: 12, background: 'rgba(15, 23, 42, 0.4)', borderRadius: 10, fontSize: 11 }}>
															<div style={{ color: '#94a3b8', marginBottom: 8 }}>
																Pending: {userReferrals.pending.length} | Completed: {userReferrals.completed.length}
															</div>
															{userReferrals.pending.length > 0 && (
																<div style={{ marginTop: 8 }}>
																	<div style={{ color: '#fbbf24', marginBottom: 4, fontSize: 10 }}>Pending Referrals:</div>
																	{userReferrals.pending.slice(0, 3).map((ref: any) => (
																		<div key={ref.id} style={{ color: '#cbd5f5', fontSize: 10, marginTop: 2 }}>
																			{ref.referral_type === 'email' ? '📧' : '📱'} {ref.referral_value}
										</div>
									))}
																	{userReferrals.pending.length > 3 && (
																		<div style={{ color: '#94a3b8', fontSize: 10, marginTop: 4 }}>+{userReferrals.pending.length - 3} more</div>
																	)}
								</div>
													)}
												</div>
											)}
										</div>
											)}
								</div>
							)}
									{plan.id === 'dharma_master' && currentPlan === 'karma_pro' && (
										<div style={referralProgressStyle}>
											<div style={referralProgressHeaderStyle}>
												<strong>Referral Progress to Dharma Master:</strong>
												<span>{referralCount} / {referralLimitKarmaPro} referrals</span>
						</div>
											<div style={referralProgressBarStyle}>
												<div
													style={{
														...referralProgressFillStyle,
														width: `${Math.min(100, (referralCount / referralLimitKarmaPro) * 100)}%`,
													}}
												/>
					</div>
											{referralCode && (
												<div style={referralCodeDisplayStyle}>
													<span>Your Referral Code:</span>
													<div style={referralCodeBoxStyle}>
														<code style={referralCodeTextStyle}>{referralCode}</code>
														<button
															type="button"
															style={copyButtonStyle}
								onClick={() => {
																navigator.clipboard.writeText(referralCode)
																showToast('Referral code copied!', 'success')
															}}
														>
															Copy Code
							</button>
													</div>
													<div style={{ marginTop: 12 }}>
														<span style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Share Your Referral Link:</span>
														<div style={referralCodeBoxStyle}>
															<code style={{ ...referralCodeTextStyle, fontSize: 11, wordBreak: 'break-all' }}>
																{publicBaseUrl}/?ref={referralCode}
															</code>
								<button
																type="button"
																style={copyButtonStyle}
																onClick={() => {
																	const referralUrl = `${publicBaseUrl}/?ref=${referralCode}`
																	navigator.clipboard.writeText(referralUrl)
																	showToast('Referral link copied! Share it with friends.', 'success')
																}}
															>
																Copy Link
															</button>
														</div>
													</div>
								</div>
							)}
						</div>
									)}
								</div>
								{plan.id === 'karma_pro' && currentPlan !== 'karma_pro' && currentPlan !== 'dharma_master' && (
									<button
									type="button"
										style={upgradeButtonStyle}
										onClick={() => handleUpgradePlan('karma_pro')}
										disabled={upgradingPlan === 'karma_pro'}
								>
										{upgradingPlan === 'karma_pro' ? 'Upgrading...' : 'Upgrade to Karma Pro'}
								</button>
								)}
								{plan.id === 'dharma_master' && currentPlan !== 'dharma_master' && (
								<button
									type="button"
										style={upgradeButtonStyle}
										onClick={() => handleUpgradePlan('dharma_master')}
										disabled={upgradingPlan === 'dharma_master'}
								>
										{upgradingPlan === 'dharma_master' ? 'Upgrading...' : 'Upgrade to Dharma Master'}
								</button>
								)}
							</div>
									)
								})
							})()}
						</div>
					</div>
				</div>
			)}

			{/* Referral Modal */}
			{showReferralModal && (
				<div style={planModalOverlayStyle} onClick={() => setShowReferralModal(false)}>
					<div style={planModalContentStyle} onClick={e => e.stopPropagation()}>
						<div style={planModalHeaderStyle}>
							<h2 style={planModalTitleStyle}>Refer Friends to Unlock Karma Builder</h2>
							<button
								type="button"
								style={planModalCloseButtonStyle}
								onClick={() => setShowReferralModal(false)}
								onMouseEnter={e => {
									e.currentTarget.style.background = 'rgba(148, 163, 184, 0.3)'
									e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.5)'
								}}
								onMouseLeave={e => {
									e.currentTarget.style.background = 'rgba(148, 163, 184, 0.2)'
									e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.3)'
								}}
							>
								✕
							</button>
							</div>
						<div style={planModalBodyStyle}>
							{/* Progress Bar */}
							<div style={{ marginBottom: 24 }}>
								<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
									<strong style={{ color: '#cbd5f5', fontSize: 14 }}>Referral Progress:</strong>
									<span style={{ color: '#94a3b8', fontSize: 14 }}>
										{referralCount} / {referralLimitAwaken} referrals
										</span>
								</div>
								<div style={referralProgressBarStyle}>
									<div
										style={{
											...referralProgressFillStyle,
											width: `${Math.min(100, (referralCount / referralLimitAwaken) * 100)}%`,
										}}
									/>
								</div>
								{referralCount >= referralLimitAwaken && (
									<div style={{ marginTop: 8, color: '#34d399', fontSize: 12, fontWeight: 600 }}>
										✓ You've reached the referral goal! Your plan will be upgraded automatically.
									</div>
								)}
							</div>

							{/* Phone Number Input Section */}
							<div style={{ marginBottom: 20 }}>
								<label style={{ display: 'block', color: '#cbd5f5', fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
									Enter Phone Numbers to Refer:
								</label>
								{referralPhoneNumbers.map((phone, index) => (
									<div key={index} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
								<input
											type="tel"
											value={phone}
											onChange={(e) => {
												const newPhones = [...referralPhoneNumbers]
												newPhones[index] = e.target.value
												setReferralPhoneNumbers(newPhones)
											}}
											placeholder="+91 1234567890"
											style={{
												flex: 1,
												padding: '10px 12px',
												borderRadius: 8,
												border: '1px solid rgba(148, 163, 184, 0.3)',
												background: 'rgba(15, 23, 42, 0.6)',
												color: '#f8fafc',
												fontSize: 14,
											}}
										/>
										{referralPhoneNumbers.length > 1 && (
								<button
												type="button"
												onClick={() => {
													const newPhones = referralPhoneNumbers.filter((_, i) => i !== index)
													setReferralPhoneNumbers(newPhones)
												}}
									style={{
													padding: '10px 16px',
													borderRadius: 8,
													border: '1px solid rgba(239, 68, 68, 0.3)',
													background: 'rgba(239, 68, 68, 0.2)',
													color: '#fca5a5',
													cursor: 'pointer',
													fontSize: 14,
												}}
											>
												Remove
								</button>
										)}
									</div>
								))}
								<button
									type="button"
									onClick={() => setReferralPhoneNumbers([...referralPhoneNumbers, ''])}
									style={{
										width: '100%',
										padding: '8px 12px',
										borderRadius: 8,
										border: '1px solid rgba(148, 163, 184, 0.3)',
										background: 'rgba(15, 23, 42, 0.6)',
										color: '#cbd5f5',
										cursor: 'pointer',
										fontSize: 13,
										marginTop: 8,
									}}
								>
									+ Add Another Phone Number
								</button>
							</div>

							{/* Send Button */}
							<button
								type="button"
								onClick={handleSendMultipleReferrals}
								disabled={sendingReferral || referralPhoneNumbers.every(p => !p.trim())}
								style={{
									width: '100%',
									opacity: sendingReferral || referralPhoneNumbers.every(p => !p.trim()) ? 0.6 : 1,
									cursor: sendingReferral || referralPhoneNumbers.every(p => !p.trim()) ? 'not-allowed' : 'pointer',
									padding: '12px 20px',
									fontSize: 15,
									fontWeight: 600,
									background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
									border: '1px solid rgba(99, 102, 241, 0.5)',
									color: '#f8fafc',
									borderRadius: 8,
									transition: 'all 0.2s ease',
								}}
							>
								{sendingReferral ? 'Sending Referrals...' : 'Send Referrals'}
							</button>

							{/* Info Text */}
							<div style={{ marginTop: 16, padding: 12, background: 'rgba(59, 130, 246, 0.1)', borderRadius: 8, border: '1px solid rgba(59, 130, 246, 0.2)' }}>
								<div style={{ color: '#93c5fd', fontSize: 12, lineHeight: 1.6 }}>
									<strong>How it works:</strong>
									<ul style={{ marginTop: 6, paddingLeft: 20 }}>
										<li>Enter phone numbers of friends you want to refer</li>
										<li>When they register using your referral, it will count towards your progress</li>
										<li>Once you reach {referralLimitAwaken} referrals, your plan will be upgraded automatically</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Daily Guidance Modal */}
			{showGuidanceModal && (
				<div style={planModalOverlayStyle} onClick={() => setShowGuidanceModal(false)}>
					<div style={sectionModalContentStyle} onClick={e => e.stopPropagation()}>
						<div style={planModalHeaderStyle}>
							<h2 style={planModalTitleStyle}>Cosmic Guidance for Today</h2>
							<button
								type="button"
								style={planModalCloseButtonStyle}
								onClick={() => setShowGuidanceModal(false)}
								onMouseEnter={e => {
									e.currentTarget.style.background = 'rgba(148, 163, 184, 0.3)'
									e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.5)'
								}}
								onMouseLeave={e => {
									e.currentTarget.style.background = 'rgba(148, 163, 184, 0.2)'
									e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.3)'
								}}
							>
								✕
							</button>
								</div>
						<div style={sectionModalBodyStyle}>
							<div style={cardHeaderStyle}>
								<div>
									<h2 style={cardTitleStyle}>
										{guidanceLoading
											? 'Fetching cosmic instruction...'
											: guidance?.template
											? guidance.template.title
											: 'All guidance completed for today'}
									</h2>
									</div>
								{currentUser && (
									<button style={ghostButtonStyle} onClick={() => fetchGuidance(currentUser.id)}>
										Refresh
									</button>
							)}
						</div>
							<div style={cardBodyStyle}>
								<div style={{ display: 'grid', gap: 12 }}>
									{initializing ? (
										<p style={cardBodyTextStyle}>Preparing your cosmic briefing...</p>
									) : guidanceError ? (
										<p style={{ ...cardBodyTextStyle, color: '#fda4af' }}>{guidanceError}</p>
									) : guidance?.template ? (
										<>
											<p style={cardBodyTextStyle}>{guidance.template.body}</p>
											{guidance.context && (
												<div style={guidanceContextStyle}>
													{guidance.context.nakshatra && (
														<span>Nakshatra: {guidance.context.nakshatra}</span>
													)}
													{guidance.context.mahadasha && (
														<span>Mahadasha: {guidance.context.mahadasha}</span>
													)}
													{guidance.context.antardasha && (
														<span>Antardasha: {guidance.context.antardasha}</span>
													)}
													{guidance.context.pratyantar && (
														<span>Pratyantar: {guidance.context.pratyantar}</span>
													)}
									</div>
											)}
											<div style={guidanceLimitStyle}>
												Guidances remaining today:{' '}
												{guidance.limit === null ? 'Unlimited' : guidance.remaining ?? 0}
								</div>
										</>
									) : (
										<p style={cardBodyTextStyle}>
											You have completed all available guidance for today. Come back tomorrow for new
											insights.
										</p>
									)}
									</div>
								</div>
							<button
								style={primaryButtonStyle}
								onClick={handleAcceptGuidance}
								disabled={guidanceLoading || !currentUser || !guidance?.template}
							>
								{guidanceLoading ? 'Please wait...' : 'Accept this Action'}
							</button>
							</div>
						</div>
				</div>
			)}

			{/* MFP Modal */}
			{showMFPModal && (
				<div style={planModalOverlayStyle} onClick={() => setShowMFPModal(false)}>
					<div style={sectionModalContentStyle} onClick={e => e.stopPropagation()}>
						<div style={planModalHeaderStyle}>
							<h2 style={planModalTitleStyle}>Manifestation Fulfillment Probability</h2>
							<button
								type="button"
								style={planModalCloseButtonStyle}
								onClick={() => setShowMFPModal(false)}
								onMouseEnter={e => {
									e.currentTarget.style.background = 'rgba(148, 163, 184, 0.3)'
									e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.5)'
								}}
								onMouseLeave={e => {
									e.currentTarget.style.background = 'rgba(148, 163, 184, 0.2)'
									e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.3)'
								}}
							>
								✕
							</button>
							</div>
						<div style={sectionModalBodyStyle}>
							<div style={{ marginBottom: 18 }}>
								<h2 style={cardTitleStyle}>Project the probability of your current intention.</h2>
									</div>
							<textarea
								value={manifestationText}
								onChange={event => setManifestationText(event.target.value)}
								placeholder="E.g., Manifesting a joyful new role with greater responsibility"
								style={textAreaStyle}
								rows={4}
							/>
							<div style={manifestationActionRowStyle}>
								<button
									type="button"
									onClick={analyzeManifestation}
									disabled={manifestationLoading}
									style={{
										...primaryButtonStyle,
										opacity: manifestationLoading ? 0.75 : 1,
										cursor: manifestationLoading ? 'wait' : 'pointer',
									}}
								>
									{manifestationLoading ? 'Analyzing...' : 'Analyze Manifestation'}
								</button>
								{manifestationResult && (
									<span style={manifestationCategoryChipStyle}>
										{manifestationResult.category === 'general'
											? 'General Outlook'
											: manifestationResult.category.replace('_', ' ')}
									</span>
								)}
								</div>
							{manifestationError && <div style={errorBannerStyle}>{manifestationError}</div>}
							{manifestationResult && (
								<div style={manifestationResultBoxStyle}>
									<div style={manifestationProbabilityContainerStyle}>
										<div style={manifestationProbabilityBadgeStyle}>
											<span style={manifestationProbabilityValueStyle}>
												{Math.round(manifestationResult.probability)}
											</span>
											<span style={manifestationProbabilityPercentStyle}>%</span>
									</div>
										<div style={manifestationProbabilityLabelStyle}>Fulfillment Probability</div>
								</div>
									<p style={manifestationSummaryTextStyle}>{manifestationResult.summary}</p>
									{supportiveGraphData.length > 0 && (
										<div style={manifestationGraphSectionStyle}>
											<span style={manifestationGraphSectionHeadingStyle}>Supportive Factors</span>
											<div style={manifestationGraphBarsRowStyle}>
												{supportiveGraphData.map((bar, index) => {
													const magnitude = Math.max(
														12,
														(Math.abs(bar.value) / supportiveGraphMax) * 100
													)
													return (
														<div key={`support-bar-${index}`} style={manifestationGraphColumnStyle}>
															<div style={manifestationGraphBarTrackStyle}>
																<div
																	style={{
																		...manifestationGraphBarStyle,
																		height: `${magnitude}%`,
																		background: '#34d399',
																	}}
																/>
									</div>
															<div style={manifestationGraphLabelStyle}>{bar.label}</div>
								</div>
													)
												})}
							</div>
						</div>
									)}
									{challengeGraphData.length > 0 && (
										<div style={manifestationGraphSectionStyle}>
											<span style={manifestationGraphSectionHeadingStyle}>Challenges to Transmute</span>
											<div style={manifestationGraphBarsRowStyle}>
												{challengeGraphData.map((bar, index) => {
													const magnitude = Math.max(
														12,
														(Math.abs(bar.value) / challengeGraphMax) * 100
													)
													return (
														<div key={`challenge-bar-${index}`} style={manifestationGraphColumnStyle}>
															<div style={manifestationGraphBarTrackStyle}>
																<div
																	style={{
																		...manifestationGraphBarStyle,
																		height: `${magnitude}%`,
																		background: '#f87171',
																	}}
																/>
							</div>
															<div style={manifestationGraphLabelStyle}>{bar.label}</div>
														</div>
													)
												})}
											</div>
										</div>
									)}
									<div style={manifestationFactorsGridStyle}>
										{manifestationResult.astro_context.challenging_factors.length > 0 && (
											<div>
												<span style={manifestationFactorHeadingStyle}>Challenges to Transmute</span>
												<ul style={manifestationFactorListStyle}>
													{manifestationResult.astro_context.challenging_factors.map((item, index) => (
														<li key={`challenge-${index}`}>{item}</li>
													))}
								</ul>
											</div>
										)}
									</div>
									{manifestationResult.recommendations.length > 0 && (
										<div style={alignmentTipSectionStyle}>
											<span style={manifestationFactorHeadingStyle}>Daily Alignment Tips</span>
											{visibleAlignmentTips.length === 0 ? (
												<p style={{ margin: 0, fontSize: 12, color: '#e0f2fe' }}>
													All tips have been added to your karma journal for today.
												</p>
											) : (
												<div style={alignmentTipsGridStyle}>
													{visibleAlignmentTips.map((tip, index) => {
														const status = alignmentTipStatus[tip] || 'idle'
														return (
															<div key={`tip-${index}`} style={alignmentTipCardStyle}>
																<p style={{ margin: 0, color: '#cbd5f5' }}>{tip}</p>
																<button
																	type="button"
																	onClick={() => handleAddAlignmentTip(tip)}
																	disabled={status === 'saving'}
																	style={{
																		...alignmentTipButtonStyle,
																		opacity: status === 'saving' ? 0.7 : 1,
																	}}
																>
																	{status === 'saving' ? 'Saving...' : 'Add to Karma Journal'}
																</button>
															</div>
														)
													})}
												</div>
							)}
						</div>
									)}
					</div>
							)}
						</div>
					</div>
				</div>
			)}

			{/* Karma Engine Modal */}
			{showKarmaModal && (
				<div style={planModalOverlayStyle} onClick={() => setShowKarmaModal(false)}>
					<div style={sectionModalContentStyle} onClick={e => e.stopPropagation()}>
						<div style={planModalHeaderStyle}>
							<h2 style={planModalTitleStyle}>Record Your Karma</h2>
							<button
								type="button"
								style={planModalCloseButtonStyle}
								onClick={() => setShowKarmaModal(false)}
								onMouseEnter={e => {
									e.currentTarget.style.background = 'rgba(148, 163, 184, 0.3)'
									e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.5)'
								}}
								onMouseLeave={e => {
									e.currentTarget.style.background = 'rgba(148, 163, 184, 0.2)'
									e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.3)'
								}}
							>
								✕
							</button>
						</div>
						<div style={sectionModalBodyStyle}>
							<div style={{ marginBottom: 18 }}>
								<h2 style={cardTitleStyle}>Describe an action you took today.</h2>
							</div>
							<form onSubmit={handleAddKarma} style={{ display: 'grid', gap: 16 }}>
								<textarea
									value={karmaText}
									onChange={event => setKarmaText(event.target.value)}
									placeholder="Describe an action you took or an experience you had today..."
									style={textAreaStyle}
								/>
								<div style={sentimentRowStyle}>
									<span style={sentimentLabelStyle}>Optionally, classify it yourself:</span>
									<div style={sentimentButtonsRowStyle}>
										{(['good', 'bad', 'neutral'] as const).map(option => (
											<button
												type="button"
												key={option}
												onClick={() =>
													setSelfAssessment(prev => (prev === option ? null : option))
												}
												style={
													selfAssessment === option
														? sentimentButtonActiveStyle(option)
														: sentimentButtonStyle(option)
												}
											>
												{option === 'good' ? 'Good' : option === 'bad' ? 'Bad' : 'Neutral'}
											</button>
										))}
									</div>
								</div>
								<div style={categoryRowStyle}>
									<select
										value={karmaCategorySlug}
										onChange={event => setKarmaCategorySlug(event.target.value)}
										style={selectStyle}
									>
										<option value="">Auto detect category (AI)</option>
										{karmaCategories.map(category => (
											<option key={category.id} value={category.slug}>
												{category.label}{' '}
												(
													{category.polarity === 'positive'
														? '+'
														: category.polarity === 'negative'
														? '-'
														: '±'}
													{Math.abs(category.default_weight)}
												)
											</option>
										))}
									</select>
								</div>
								<button type="submit" style={primaryButtonStyle} disabled={karmaSubmitting}>
									{karmaSubmitting ? 'Analyzing...' : 'Analyze and Add Karma'}
								</button>
								{karmaError && <div style={errorBannerStyle}>{karmaError}</div>}
							</form>
						</div>
					</div>
				</div>
			)}

			{/* Digital Twin Creation Modal */}
			{showDigitalTwinModal && (
				<div style={planModalOverlayStyle} onClick={() => setShowDigitalTwinModal(false)}>
					<div style={planModalContentStyle} onClick={e => e.stopPropagation()}>
						<div style={planModalHeaderStyle}>
							<h2 style={planModalTitleStyle}>Create Your Digital Twin</h2>
							<button
								type="button"
								style={planModalCloseButtonStyle}
								onClick={() => setShowDigitalTwinModal(false)}
								onMouseEnter={e => {
									e.currentTarget.style.background = 'rgba(148, 163, 184, 0.3)'
									e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.5)'
								}}
								onMouseLeave={e => {
									e.currentTarget.style.background = 'rgba(148, 163, 184, 0.2)'
									e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.3)'
								}}
							>
								✕
							</button>
						</div>
						<div style={planModalBodyStyle}>
							<p style={{ color: '#cbd5f5', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
								Enter your birth details to generate your unique astrological profile, including Kundali, Mahadasha, Antardasha, Pratyantar, and Sukshma Dasha.
							</p>
							<form
								onSubmit={async (e) => {
									e.preventDefault()
									if (!digitalTwinForm.dateOfBirth || !digitalTwinForm.timeOfBirth || !digitalTwinForm.placeOfBirth) {
										setDigitalTwinError('Please fill in all required fields: Date of Birth, Time of Birth, and Place of Birth.')
										return
									}
									
									setDigitalTwinError(null)
									setDigitalTwinMessage(null)
									setDigitalTwinCreating(true)
									
									const phone = currentUser?.phone_number || profile?.phoneNumber?.trim()
									if (!phone) {
										setDigitalTwinError('Phone number missing. Please contact support.')
										setDigitalTwinCreating(false)
										return
									}
									
									const payload: Record<string, unknown> = {
										first_name: digitalTwinForm.firstName || null,
										last_name: digitalTwinForm.lastName || null,
										gender: digitalTwinForm.gender || null,
										phone_number: phone,
										date_of_birth: digitalTwinForm.dateOfBirth,
										time_of_birth: digitalTwinForm.timeOfBirth,
										place_name: digitalTwinForm.placeOfBirth,
									}
									
									try {
										const geocodeRes = await fetch(`/api/geocode?q=${encodeURIComponent(digitalTwinForm.placeOfBirth)}`)
										if (geocodeRes.ok) {
											const geo = await geocodeRes.json()
											if (typeof geo.latitude === 'number') {
												payload.latitude = geo.latitude
											}
											if (typeof geo.longitude === 'number') {
												payload.longitude = geo.longitude
											}
											if (geo.timezone) {
												payload.timezone = geo.timezone
											}
										}
									} catch {
										/* ignore geocoding issues */
									}
									
									try {
										const storedReferralCode = localStorage.getItem('pending_referral_code')
										const referralParam = storedReferralCode ? `?referral_code=${encodeURIComponent(storedReferralCode)}` : ''
										
										const res = await fetch(`/api/users/save${referralParam}`, {
											method: 'POST',
											headers: { 'Content-Type': 'application/json', ...(authHeaders || {}) },
											body: JSON.stringify(payload),
										})
										
										if (storedReferralCode) {
											localStorage.removeItem('pending_referral_code')
										}
										
										const data = await res.json().catch(() => null)
										if (!res.ok || !data) {
											const message = (data as { detail?: string } | null)?.detail || 'Unable to create your digital twin right now.'
											throw new Error(message)
										}
										
										const newUserId = (data as { user_id?: number | null }).user_id
										if (typeof newUserId === 'number') {
											setUserId(newUserId)
											await fetchUser(newUserId)
											await Promise.all([
												fetchGuidance(newUserId, { silent: true }).catch(() => undefined),
												fetchKarmaSummary(newUserId).catch(() => undefined),
												fetchFeatureLimits(newUserId).catch(() => undefined),
											])
										}
										
										setDigitalTwinMessage('Digital twin created successfully! Your astrological profile has been generated.')
										setShowDigitalTwinModal(false)
										setTimeout(() => {
											setDigitalTwinMessage(null)
										}, 5000)
									} catch (error: any) {
										setDigitalTwinError(error?.message || 'Unable to create your digital twin right now.')
									} finally {
										setDigitalTwinCreating(false)
									}
								}}
								style={{ display: 'grid', gap: 20 }}
							>
								<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
									<label style={{ display: 'grid', gap: 8 }}>
										<span style={{ fontSize: 13, color: '#e5e7eb', fontWeight: 600 }}>First Name</span>
										<input
											type="text"
											value={digitalTwinForm.firstName}
											onChange={(e) => setDigitalTwinForm(prev => ({ ...prev, firstName: e.target.value }))}
											placeholder="First Name"
											style={{
												padding: '12px 14px',
												borderRadius: 10,
												border: '1px solid rgba(148, 163, 184, 0.3)',
												background: 'rgba(30, 41, 59, 0.6)',
												color: '#f8fafc',
												fontSize: '14px',
											}}
										/>
									</label>
									<label style={{ display: 'grid', gap: 8 }}>
										<span style={{ fontSize: 13, color: '#e5e7eb', fontWeight: 600 }}>Last Name</span>
										<input
											type="text"
											value={digitalTwinForm.lastName}
											onChange={(e) => setDigitalTwinForm(prev => ({ ...prev, lastName: e.target.value }))}
											placeholder="Last Name"
											style={{
												padding: '12px 14px',
												borderRadius: 10,
												border: '1px solid rgba(148, 163, 184, 0.3)',
												background: 'rgba(30, 41, 59, 0.6)',
												color: '#f8fafc',
												fontSize: '14px',
											}}
										/>
									</label>
								</div>
								
								<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
									<label style={{ display: 'grid', gap: 8 }}>
										<span style={{ fontSize: 13, color: '#e5e7eb', fontWeight: 600 }}>Date of Birth <span style={{ color: '#f87171' }}>*</span></span>
										<input
											type="date"
											value={digitalTwinForm.dateOfBirth}
											onChange={(e) => setDigitalTwinForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
											required
											style={{
												padding: '12px 14px',
												borderRadius: 10,
												border: '1px solid rgba(148, 163, 184, 0.3)',
												background: 'rgba(30, 41, 59, 0.6)',
												color: '#f8fafc',
												fontSize: '14px',
											}}
										/>
									</label>
									<label style={{ display: 'grid', gap: 8 }}>
										<span style={{ fontSize: 13, color: '#e5e7eb', fontWeight: 600 }}>Time of Birth <span style={{ color: '#f87171' }}>*</span></span>
										<input
											type="time"
											value={digitalTwinForm.timeOfBirth}
											onChange={(e) => setDigitalTwinForm(prev => ({ ...prev, timeOfBirth: e.target.value }))}
											required
											style={{
												padding: '12px 14px',
												borderRadius: 10,
												border: '1px solid rgba(148, 163, 184, 0.3)',
												background: 'rgba(30, 41, 59, 0.6)',
												color: '#f8fafc',
												fontSize: '14px',
											}}
										/>
									</label>
								</div>
								
								<label style={{ display: 'grid', gap: 8 }}>
									<span style={{ fontSize: 13, color: '#e5e7eb', fontWeight: 600 }}>Place of Birth <span style={{ color: '#f87171' }}>*</span></span>
									<input
										type="text"
										value={digitalTwinForm.placeOfBirth}
										onChange={(e) => setDigitalTwinForm(prev => ({ ...prev, placeOfBirth: e.target.value }))}
										placeholder="e.g., Delhi, India"
										required
										style={{
											padding: '12px 14px',
											borderRadius: 10,
											border: '1px solid rgba(148, 163, 184, 0.3)',
											background: 'rgba(30, 41, 59, 0.6)',
											color: '#f8fafc',
											fontSize: '14px',
										}}
									/>
								</label>
								
								<label style={{ display: 'grid', gap: 8 }}>
									<span style={{ fontSize: 13, color: '#e5e7eb', fontWeight: 600 }}>Gender</span>
									<select
										value={digitalTwinForm.gender}
										onChange={(e) => setDigitalTwinForm(prev => ({ ...prev, gender: e.target.value }))}
										style={{
											padding: '12px 14px',
											borderRadius: 10,
											border: '1px solid rgba(148, 163, 184, 0.3)',
											background: 'rgba(30, 41, 59, 0.6)',
											color: '#f8fafc',
											fontSize: '14px',
										}}
									>
										<option value="">Select Gender (Optional)</option>
										<option value="Male">Male</option>
										<option value="Female">Female</option>
										<option value="Other">Other</option>
									</select>
								</label>
								
								{digitalTwinError && (
									<div style={{ padding: '12px 16px', background: '#fee2e2', color: '#b91c1c', borderRadius: 10, fontSize: 14 }}>
										{digitalTwinError}
									</div>
								)}
								
								<button
									type="submit"
									disabled={digitalTwinCreating}
									style={{
										padding: '16px 24px',
										background: digitalTwinCreating
											? 'rgba(250, 204, 21, 0.5)'
											: 'linear-gradient(135deg, rgba(250, 204, 21, 0.9), rgba(249, 115, 22, 0.85))',
										border: '2px solid rgba(250, 204, 21, 0.8)',
										borderRadius: 12,
										color: '#1f2937',
										fontWeight: 800,
										fontSize: '16px',
										letterSpacing: '0.05em',
										textTransform: 'uppercase',
										cursor: digitalTwinCreating ? 'wait' : 'pointer',
										boxShadow: '0 0 30px rgba(250, 204, 21, 0.6), 0 8px 24px rgba(0, 0, 0, 0.4)',
										transition: 'all 0.3s ease',
									}}
								>
									{digitalTwinCreating ? 'Creating Digital Twin...' : '✨ Create My Digital Twin ✨'}
								</button>
							</form>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

const pageStyle: React.CSSProperties = {
	minHeight: '100vh',
	background: 'radial-gradient(circle at top, #1f2937 0%, #0f172a 45%, #020617 100%)',
	color: '#f8fafc',
	paddingBottom: 48,
	paddingTop: 0,
	marginTop: 0,
}

const headerStyle: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	padding: '28px 48px 16px',
}

const brandBlockStyle: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	gap: 16,
}

const brandLogoStyle: React.CSSProperties = {
	height: 52,
	width: 'auto',
	minWidth: 52,
	maxWidth: 65,
	objectFit: 'contain',
	objectPosition: 'center',
	display: 'block',
	borderRadius: 14,
	boxShadow: '0 12px 24px rgba(2, 6, 23, 0.45), 0 2px 8px rgba(251, 191, 36, 0.3)',
	filter: 'drop-shadow(0 2px 8px rgba(251, 191, 36, 0.3))',
	padding: '4px',
	background: 'transparent',
	transition: 'all 0.3s ease',
}

const brandTaglineStyle: React.CSSProperties = {
	fontSize: 12,
	color: '#94a3b8',
	letterSpacing: '0.22em',
	textTransform: 'uppercase',
	margin: 0,
}

const navBarStyle: React.CSSProperties = {
	display: 'flex',
	gap: 18,
	alignItems: 'center',
	background: 'rgba(15, 23, 42, 0.65)',
	padding: '10px 18px',
	borderRadius: 999,
	border: '1px solid rgba(148, 163, 184, 0.25)',
}

const navButtonStyle: React.CSSProperties = {
	fontSize: 13,
	fontWeight: 600,
	color: '#94a3b8',
	padding: '6px 14px',
	borderRadius: 999,
	cursor: 'pointer',
	background: 'transparent',
	border: 'none',
}

const navButtonActiveStyle: React.CSSProperties = {
	...navButtonStyle,
	background: '#facc15',
	color: '#0f172a',
}

const headerUserStyle: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	gap: 16,
}

const logoutButtonStyle: React.CSSProperties = {
	background: 'linear-gradient(90deg, #ef4444, #f97316)',
	border: 'none',
	borderRadius: 999,
	padding: '10px 18px',
	color: '#fff',
	fontWeight: 600,
	cursor: 'pointer',
	boxShadow: '0 12px 20px rgba(239, 68, 68, 0.35)',
}

const mainStyle: React.CSSProperties = {
	padding: '0 48px 48px',
	marginTop: 0,
	paddingTop: 0,
}

const gridWrapperStyle: React.CSSProperties = {
	display: 'grid',
	gridTemplateColumns: 'minmax(0, 1.408fr) minmax(0, 1.792fr)', // Reduced left by 20% further (1.76 -> 1.408), increased right proportionately (1.44 -> 1.792)
	gap: 32,
	alignItems: 'start',
}

const leftColumnStyle: React.CSSProperties = {
	display: 'grid',
	gap: 24,
}

const rightColumnStyle: React.CSSProperties = {
	display: 'grid',
	gap: 24,
}

const heroCardStyle: React.CSSProperties = {
	background: 'linear-gradient(120deg, rgba(99,102,241,0.92), rgba(6,182,212,0.85))',
	padding: '30px 36px',
	borderRadius: 26,
	display: 'flex',
	flexDirection: 'column',
	gap: 22,
	boxShadow: '0 25px 60px rgba(15, 23, 42, 0.55)',
}

const heroEyebrowStyle: React.CSSProperties = {
	fontSize: 14,
	letterSpacing: '0.12em',
	textTransform: 'uppercase',
	color: '#e0f2fe',
	marginBottom: 10,
}

const heroTitleStyle: React.CSSProperties = {
	margin: 0,
	fontSize: 32,
	fontWeight: 700,
	color: '#f8fafc',
	lineHeight: 1.3,
}

const heroPillsRowStyle: React.CSSProperties = {
	display: 'flex',
	gap: 12,
	flexWrap: 'wrap',
	justifyContent: 'center', // Center buttons horizontally
}

const heroPill = (background: string): React.CSSProperties => ({
	background,
	color: '#0f172a',
	padding: '8px 16px',
	borderRadius: 999,
	fontSize: 12,
	fontWeight: 700,
	letterSpacing: '0.08em',
	textTransform: 'uppercase',
	border: 'none',
	cursor: 'pointer',
})

const mfpPillStyle: React.CSSProperties = {
	background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 50%, #db2777 100%)',
	color: '#ffffff',
	padding: '10px 20px',
	borderRadius: '12px 4px 12px 4px',
	fontSize: 14,
	fontWeight: 800,
	letterSpacing: '0.15em',
	textTransform: 'uppercase',
	border: '2px solid rgba(255, 255, 255, 0.3)',
	cursor: 'pointer',
	boxShadow: '0 4px 15px rgba(244, 114, 182, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
	transform: 'rotate(-2deg)',
	transition: 'all 0.3s ease',
	position: 'relative',
	overflow: 'hidden',
}

const mfpPillHoverStyle: React.CSSProperties = {
	...mfpPillStyle,
	transform: 'rotate(0deg) scale(1.05)',
	boxShadow: '0 6px 20px rgba(244, 114, 182, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
}

const cardStyle: React.CSSProperties = {
	background: 'rgba(15, 23, 42, 0.85)',
	borderRadius: 22,
	border: '1px solid rgba(148, 163, 184, 0.18)',
	padding: '28px 26px',
	boxShadow: '0 20px 45px rgba(2, 6, 23, 0.6)',
	backdropFilter: 'blur(14px)',
	display: 'grid',
	gap: 16,
}

const cardHeaderStyle: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	gap: 16,
}

const cardLabelStyle: React.CSSProperties = {
	fontSize: 12,
	letterSpacing: '0.18em',
	color: '#8ea8ff',
	textTransform: 'uppercase',
	marginBottom: 6,
}

const cardTitleStyle: React.CSSProperties = {
	margin: 0,
	fontSize: 20,
	fontWeight: 700,
	color: '#f8fafc',
	lineHeight: 1.4,
}

const cosmicGuidanceCardStyle: React.CSSProperties = {
	...cardStyle,
	background: 'linear-gradient(180deg, rgba(13, 23, 55, 0.9), rgba(15, 23, 42, 0.9))',
	border: '1px solid rgba(59, 130, 246, 0.35)',
}

const manifestationCardStyle: React.CSSProperties = {
	...cardStyle,
	background: 'linear-gradient(180deg, rgba(40, 24, 78, 0.92), rgba(15, 23, 42, 0.92))',
	border: '1px solid rgba(99, 102, 241, 0.4)',
}

const karmaEntryCardStyle: React.CSSProperties = {
	...cardStyle,
	background: 'linear-gradient(180deg, rgba(15, 42, 32, 0.92), rgba(12, 25, 24, 0.92))',
	border: '1px solid rgba(16, 185, 129, 0.3)',
}

const ghostButtonStyle: React.CSSProperties = {
	background: 'rgba(99, 102, 241, 0.18)',
	border: '1px solid rgba(129, 140, 248, 0.65)',
	color: '#c7d2fe',
	padding: '8px 16px',
	borderRadius: 12,
	fontWeight: 600,
	fontSize: 13,
	cursor: 'pointer',
}

const cardBodyStyle: React.CSSProperties = {
	minHeight: 96,
	display: 'flex',
	alignItems: 'center',
}

const cardBodyTextStyle: React.CSSProperties = {
	fontSize: 15,
	lineHeight: 1.6,
	color: '#cbd5f5',
	margin: 0,
}

const guidanceContextStyle: React.CSSProperties = {
	display: 'flex',
	flexWrap: 'wrap',
	gap: 12,
	fontSize: 12,
	color: '#cbd5f5',
	letterSpacing: '0.05em',
	textTransform: 'uppercase',
}

const guidanceLimitStyle: React.CSSProperties = {
	fontSize: 12,
	color: '#bfdbfe',
	letterSpacing: '0.08em',
	textTransform: 'uppercase',
}

const primaryButtonStyle: React.CSSProperties = {
	background: 'linear-gradient(90deg, #a855f7, #6366f1)',
	border: 'none',
	color: '#f8fafc',
	padding: '12px 18px',
	borderRadius: 14,
	fontWeight: 700,
	fontSize: 14,
	cursor: 'pointer',
	boxShadow: '0 14px 26px rgba(79, 70, 229, 0.4)',
	transition: 'transform 0.15s ease',
}

const secondaryButtonStyle: React.CSSProperties = {
	background: 'rgba(99, 102, 241, 0.15)',
	border: '1px solid rgba(148, 163, 184, 0.35)',
	color: '#cbd5f5',
	padding: '10px 16px',
	borderRadius: 12,
	fontWeight: 600,
	fontSize: 13,
	cursor: 'pointer',
}

const textAreaStyle: React.CSSProperties = {
	minHeight: 120,
	background: 'rgba(15, 23, 42, 0.65)',
	borderRadius: 16,
	border: '1px solid rgba(148, 163, 184, 0.25)',
	padding: '14px 16px',
	color: '#f8fafc',
	fontSize: 14,
	resize: 'vertical',
}

const sentimentRowStyle: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	gap: 10,
}

const sentimentLabelStyle: React.CSSProperties = {
	fontSize: 12,
	color: '#cbd5f5',
	letterSpacing: '0.04em',
	textTransform: 'uppercase',
}

const sentimentButtonsRowStyle: React.CSSProperties = {
	display: 'flex',
	gap: 10,
	flexWrap: 'wrap',
}

const sentimentButtonStyle = (type: 'good' | 'bad' | 'neutral'): React.CSSProperties => {
	const palette =
		type === 'good'
			? '#4ade80'
			: type === 'bad'
			? '#f87171'
			: '#60a5fa'
	return {
		background: palette,
		border: 'none',
		color: '#0f172a',
		padding: '8px 16px',
		borderRadius: 999,
		fontWeight: 600,
		fontSize: 13,
		cursor: 'pointer',
		opacity: 0.65,
	}
}

const sentimentButtonActiveStyle = (type: 'good' | 'bad' | 'neutral'): React.CSSProperties => ({
	...sentimentButtonStyle(type),
	opacity: 1,
	boxShadow: '0 8px 18px rgba(15, 23, 42, 0.25)',
})

const categoryRowStyle: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	gap: 8,
}

const selectStyle: React.CSSProperties = {
	borderRadius: 12,
	background: 'rgba(15, 23, 42, 0.65)',
	border: '1px solid rgba(148, 163, 184, 0.25)',
	padding: '10px 14px',
	color: '#f8fafc',
	fontSize: 13,
}

const errorBannerStyle: React.CSSProperties = {
	background: 'rgba(239, 68, 68, 0.16)',
	border: '1px solid rgba(248, 113, 113, 0.45)',
	color: '#fecaca',
	padding: '10px 14px',
	borderRadius: 10,
	fontSize: 13,
}

const successBannerStyle: React.CSSProperties = {
	background: 'rgba(74, 222, 128, 0.16)',
	border: '1px solid rgba(74, 222, 128, 0.45)',
	color: '#bbf7d0',
	padding: '10px 14px',
	borderRadius: 10,
	fontSize: 13,
}

const karmaRecordCardStyle: React.CSSProperties = {
	borderRadius: 16,
	border: '1px solid rgba(148, 163, 184, 0.2)',
	background: 'rgba(15, 23, 42, 0.6)',
	padding: '14px 16px',
	display: 'grid',
	gap: 8,
}

const avatarPreviewWrapperStyle: React.CSSProperties = {
	borderRadius: 18,
	background: 'rgba(15, 23, 42, 0.55)',
	padding: '32px 18px',
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	minHeight: 280,
	position: 'relative',
	overflow: 'visible', // Changed to visible so avatar can be at edge
}

const avatarUploadingStyle: React.CSSProperties = {
	fontSize: 15,
	color: '#cbd5f5',
}

const avatarContainerStyle: React.CSSProperties = {
	position: 'relative',
	width: '100%',
	height: '100%',
	minHeight: 240,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
}

const avatarImageLeftStyle: React.CSSProperties = {
	position: 'relative',
	width: 175, // Increased by 25% from 140
	height: 175, // Increased by 25% from 140
	borderRadius: 16,
	objectFit: 'cover',
	border: '3px solid rgba(148, 163, 184, 0.35)',
	boxShadow: '0 20px 30px rgba(15, 23, 42, 0.4)',
	display: 'block',
	margin: 0,
}

const avatarEditIconStyle: React.CSSProperties = {
	position: 'absolute',
	top: 8,
	left: 8,
	width: 32,
	height: 32,
	borderRadius: '50%',
	background: 'rgba(99, 102, 241, 0.9)',
	border: '2px solid rgba(255, 255, 255, 0.3)',
	color: '#fff',
	fontSize: 16,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	cursor: 'pointer',
	zIndex: 3,
	boxShadow: '0 4px 12px rgba(99, 102, 241, 0.5)',
	transition: 'all 0.2s ease',
}

const digitalTwinContainerStyle = (cumulativeScore: number): React.CSSProperties => {
	// Use golden-yellow glow as per the image
	const goldenGlow = '#fbbf24'
	return {
		position: 'absolute',
		top: '30%', // Shifted up by 20% on Y-axis (from 50% to 30%)
		left: '60%', // Shifted right from 50% to 60%
		transform: 'translate(-50%, -50%)',
		width: 200,
		height: 280,
		zIndex: 1,
		// Enable 3D perspective for Y-axis rotation
		perspective: '1000px',
		perspectiveOrigin: 'center center',
		// Reduced glow since blend mode will enhance visibility
		// Note: drop-shadow doesn't work well with mix-blend-mode, so we'll rely on the image's own glow
		pointerEvents: 'none', // Allow clicks to pass through
	}
}

const manifestationTileStyle: React.CSSProperties = {
	background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.25), rgba(245, 158, 11, 0.2))',
	border: '2px solid rgba(251, 191, 36, 0.5)',
	borderRadius: 20,
	padding: '20px 24px',
	boxShadow: '0 8px 24px rgba(251, 191, 36, 0.3), 0 0 40px rgba(251, 191, 36, 0.15)',
	position: 'relative',
	overflow: 'hidden',
}

const manifestationTileContentStyle: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	gap: 16,
	position: 'relative',
	zIndex: 1,
}

const manifestationTileIconStyle: React.CSSProperties = {
	fontSize: 32,
	lineHeight: 1,
	filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.8))',
}

const manifestationTileTextContainerStyle: React.CSSProperties = {
	flex: 1,
	display: 'flex',
	flexDirection: 'column',
	gap: 4,
}

const manifestationTileTitleStyle: React.CSSProperties = {
	fontSize: 18,
	fontWeight: 800,
	color: '#fbbf24',
	letterSpacing: '0.15em',
	textTransform: 'uppercase',
	textShadow: '0 0 12px rgba(251, 191, 36, 0.6)',
}

const manifestationTileSubtitleStyle: React.CSSProperties = {
	fontSize: 12,
	color: '#fde68a',
	letterSpacing: '0.05em',
	opacity: 0.9,
}

const manifestationTileButtonStyle: React.CSSProperties = {
	background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
	border: 'none',
	color: '#0f172a',
	padding: '10px 20px',
	borderRadius: 12,
	fontWeight: 700,
	fontSize: 13,
	cursor: 'pointer',
	boxShadow: '0 4px 12px rgba(251, 191, 36, 0.4)',
	transition: 'all 0.2s ease',
	letterSpacing: '0.05em',
}

const digitalTwinFigureStyle: React.CSSProperties = {
	position: 'relative',
	width: 120,
	height: 200,
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
}

const digitalTwinHeadStyle = (cumulativeScore: number): React.CSSProperties => {
	const glowColor = getGlowColor(cumulativeScore)
	const glowColor2 = getGlowColor(cumulativeScore + 10)
	return {
		width: 50,
		height: 50,
		borderRadius: '50%',
		background: `linear-gradient(135deg, ${glowColor}, ${glowColor2})`,
		boxShadow: `0 0 20px ${glowColor}, 0 0 40px ${glowColor}`,
		position: 'relative',
		zIndex: 3,
	}
}

const digitalTwinBodyStyle = (cumulativeScore: number): React.CSSProperties => {
	const glowColor = getGlowColor(cumulativeScore)
	const glowColor2 = getGlowColor(cumulativeScore + 10)
	return {
		width: 60,
		height: 80,
		background: `linear-gradient(135deg, ${glowColor}, ${glowColor2})`,
		borderRadius: '30px 30px 20px 20px',
		boxShadow: `0 0 20px ${glowColor}, 0 0 40px ${glowColor}`,
		marginTop: -5,
		position: 'relative',
		zIndex: 3,
	}
}

const digitalTwinLeftArmStyle = (cumulativeScore: number): React.CSSProperties => {
	const glowColor = getGlowColor(cumulativeScore)
	const glowColor2 = getGlowColor(cumulativeScore + 10)
	return {
		position: 'absolute',
		left: -25,
		top: 60,
		width: 20,
		height: 50,
		background: `linear-gradient(135deg, ${glowColor}, ${glowColor2})`,
		borderRadius: '10px',
		boxShadow: `0 0 15px ${glowColor}`,
		transform: 'rotate(-20deg)',
		zIndex: 2,
	}
}

const digitalTwinRightArmStyle = (cumulativeScore: number): React.CSSProperties => {
	const glowColor = getGlowColor(cumulativeScore)
	const glowColor2 = getGlowColor(cumulativeScore + 10)
	return {
		position: 'absolute',
		right: -25,
		top: 60,
		width: 20,
		height: 50,
		background: `linear-gradient(135deg, ${glowColor}, ${glowColor2})`,
		borderRadius: '10px',
		boxShadow: `0 0 15px ${glowColor}`,
		transform: 'rotate(20deg)',
		zIndex: 2,
	}
}

const digitalTwinLeftLegStyle = (cumulativeScore: number): React.CSSProperties => {
	const glowColor = getGlowColor(cumulativeScore)
	const glowColor2 = getGlowColor(cumulativeScore + 10)
	return {
		position: 'absolute',
		left: 15,
		top: 130,
		width: 18,
		height: 60,
		background: `linear-gradient(135deg, ${glowColor}, ${glowColor2})`,
		borderRadius: '9px',
		boxShadow: `0 0 15px ${glowColor}`,
		zIndex: 2,
	}
}

const digitalTwinRightLegStyle = (cumulativeScore: number): React.CSSProperties => {
	const glowColor = getGlowColor(cumulativeScore)
	const glowColor2 = getGlowColor(cumulativeScore + 10)
	return {
		position: 'absolute',
		right: 15,
		top: 130,
		width: 18,
		height: 60,
		background: `linear-gradient(135deg, ${glowColor}, ${glowColor2})`,
		borderRadius: '9px',
		boxShadow: `0 0 15px ${glowColor}`,
		zIndex: 2,
	}
}

const avatarPlaceholderStyle: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	textAlign: 'center',
	color: '#cbd5f5',
	gap: 12,
}

const avatarActionsStyle: React.CSSProperties = {
	display: 'flex',
	gap: 12,
}

const manifestationActionRowStyle: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	gap: 12,
	flexWrap: 'wrap',
}

const manifestationCategoryChipStyle: React.CSSProperties = {
	padding: '4px 12px',
	borderRadius: 999,
	background: 'rgba(59, 130, 246, 0.28)',
	color: '#dbeafe',
	fontSize: 12,
	letterSpacing: '0.08em',
	textTransform: 'uppercase',
	fontWeight: 600,
}

const manifestationResultBoxStyle: React.CSSProperties = {
	marginTop: 12,
	padding: '16px 18px',
	borderRadius: 16,
	background: 'rgba(17, 24, 39, 0.7)',
	border: '1px solid rgba(129, 140, 248, 0.35)',
	display: 'grid',
	gap: 12,
}

const manifestationProbabilityContainerStyle: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	gap: 8,
	padding: '20px',
	borderRadius: 20,
	background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.15))',
	border: '2px solid rgba(139, 92, 246, 0.4)',
	boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
}

const manifestationProbabilityBadgeStyle: React.CSSProperties = {
	display: 'flex',
	alignItems: 'baseline',
	justifyContent: 'center',
	gap: 4,
}

const manifestationProbabilityValueStyle: React.CSSProperties = {
	fontSize: 64,
	fontWeight: 900,
	lineHeight: 1,
	color: '#fbbf24',
	textShadow: '0 0 20px rgba(251, 191, 36, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3)',
	letterSpacing: '-0.02em',
}

const manifestationProbabilityPercentStyle: React.CSSProperties = {
	fontSize: 32,
	fontWeight: 700,
	color: '#fcd34d',
	textShadow: '0 0 12px rgba(252, 211, 77, 0.4)',
}

const manifestationProbabilityLabelStyle: React.CSSProperties = {
	fontSize: 12,
	fontWeight: 600,
	letterSpacing: '0.15em',
	textTransform: 'uppercase',
	color: '#c7d2fe',
	marginTop: 4,
}

const manifestationSummaryTextStyle: React.CSSProperties = {
	margin: 0,
	fontSize: 14,
	lineHeight: 1.6,
	color: '#e0e7ff',
}

const manifestationGraphSectionStyle: React.CSSProperties = {
	padding: '12px 14px',
	borderRadius: 14,
	background: 'rgba(15, 23, 42, 0.6)',
	border: '1px solid rgba(148, 163, 184, 0.25)',
	display: 'grid',
	gap: 10,
}

const manifestationGraphSectionHeadingStyle: React.CSSProperties = {
	fontSize: 12,
	letterSpacing: '0.08em',
	textTransform: 'uppercase',
	color: '#bfdbfe',
	fontWeight: 600,
}

const manifestationGraphBarsRowStyle: React.CSSProperties = {
	display: 'flex',
	gap: 12,
	padding: '4px 6px',
	overflowX: 'auto',
}

const manifestationGraphColumnStyle: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	minWidth: 90,
	gap: 6,
}

const manifestationGraphBarTrackStyle: React.CSSProperties = {
	height: 140,
	width: 18,
	background: 'rgba(30, 41, 59, 0.75)',
	borderRadius: 14,
	display: 'flex',
	alignItems: 'flex-end',
	justifyContent: 'center',
}

const manifestationGraphBarStyle: React.CSSProperties = {
	width: '100%',
	borderRadius: 12,
	transition: 'height 0.3s ease',
	boxShadow: '0 6px 18px rgba(15, 23, 42, 0.35)',
}

const manifestationGraphLabelStyle: React.CSSProperties = {
	fontSize: 11,
	color: '#cbd5f5',
	textAlign: 'center',
	lineHeight: 1.4,
	maxWidth: 120,
}

const manifestationFactorsGridStyle: React.CSSProperties = {
	display: 'grid',
	gap: 12,
	gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
}

const manifestationFactorHeadingStyle: React.CSSProperties = {
	display: 'block',
	fontSize: 12,
	letterSpacing: '0.08em',
	textTransform: 'uppercase',
	color: '#bfdbfe',
	marginBottom: 6,
	fontWeight: 600,
}

const manifestationFactorListStyle: React.CSSProperties = {
	margin: 0,
	paddingLeft: 18,
	fontSize: 12,
	lineHeight: 1.5,
	color: '#cbd5f5',
}

const alignmentTipsGridStyle: React.CSSProperties = {
	display: 'grid',
	gap: 12,
	marginTop: 8,
}

const alignmentTipSectionStyle: React.CSSProperties = {
	padding: '14px 16px',
	borderRadius: 16,
	background: 'rgba(6, 182, 212, 0.12)',
	border: '1px solid rgba(34, 211, 238, 0.35)',
	display: 'grid',
	gap: 10,
}

const alignmentTipsCardStyle: React.CSSProperties = {
	...cardStyle,
	background: 'linear-gradient(180deg, rgba(8, 47, 73, 0.8), rgba(8, 40, 66, 0.95))',
	border: '1px solid rgba(6, 182, 212, 0.35)',
}

const alignmentTipCategoryHeadingStyle: React.CSSProperties = {
	fontSize: 12,
	letterSpacing: '0.08em',
	textTransform: 'uppercase',
	color: '#93c5fd',
	marginBottom: 8,
	fontWeight: 600,
}

const alignmentTipsListStyle: React.CSSProperties = {
	display: 'grid',
	gap: 10,
}

const alignmentTipListCardStyle: React.CSSProperties = {
	borderRadius: 14,
	border: '1px solid rgba(125, 211, 252, 0.25)',
	background: 'rgba(15, 23, 42, 0.6)',
	padding: '10px 12px',
	display: 'grid',
	gap: 6,
}

const alignmentTipSummaryStyle: React.CSSProperties = {
	fontSize: 12,
	color: '#9ca3af',
}

const alignmentTipScheduleRowStyle: React.CSSProperties = {
	display: 'flex',
	justifyContent: 'space-between',
	gap: 8,
	flexWrap: 'wrap',
	fontSize: 11,
	color: '#c7d2fe',
}

const alignmentTipMetaRowStyle: React.CSSProperties = {
	display: 'flex',
	justifyContent: 'space-between',
	alignItems: 'center',
	fontSize: 11,
	color: '#a5b4fc',
}

const alignmentTipArchiveButtonStyle: React.CSSProperties = {
	border: 'none',
	borderRadius: 999,
	padding: '4px 10px',
	background: 'rgba(248, 113, 113, 0.2)',
	color: '#fecaca',
	fontSize: 11,
	fontWeight: 600,
	cursor: 'pointer',
}

const alignmentTipRestoreButtonStyle: React.CSSProperties = {
	...alignmentTipArchiveButtonStyle,
	background: 'rgba(74, 222, 128, 0.2)',
	color: '#bbf7d0',
}

const alignmentTipCardStyle: React.CSSProperties = {
	padding: '12px 14px',
	borderRadius: 12,
	border: '1px solid rgba(59, 130, 246, 0.35)',
	background: 'rgba(30, 41, 59, 0.6)',
	display: 'flex',
	flexDirection: 'column',
	gap: 10,
}

const alignmentTipButtonStyle: React.CSSProperties = {
	alignSelf: 'flex-start',
	padding: '6px 12px',
	borderRadius: 999,
	border: 'none',
	background: 'linear-gradient(120deg, #8b5cf6, #6366f1)',
	color: '#fff',
	fontSize: 12,
	fontWeight: 600,
	letterSpacing: '0.05em',
	cursor: 'pointer',
}

const karmaSummaryGridStyle: React.CSSProperties = {
	display: 'grid',
	gap: 14,
}

const karmaSummaryCardStyle = (color: string): React.CSSProperties => ({
	background: `linear-gradient(120deg, ${color}, rgba(15, 23, 42, 0.85))`,
	padding: '13px 18px', // Reduced vertical padding by 20% (16px -> 13px) to reduce height
	borderRadius: 16,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	boxShadow: '0 16px 26px rgba(2, 6, 23, 0.45)',
})

const karmaSummaryLabelStyle: React.CSSProperties = {
	fontSize: 13,
	fontWeight: 600,
	color: '#0f172a',
	textTransform: 'uppercase',
	letterSpacing: '0.08em',
}

const karmaSummaryValueStyle: React.CSSProperties = {
	fontSize: 26,
	fontWeight: 700,
	color: '#0f172a',
}

const birthListStyle: React.CSSProperties = {
	listStyle: 'none',
	margin: 0,
	padding: 0,
	display: 'grid',
	gap: 12,
	fontSize: 14,
	color: '#cbd5f5',
}

const toastContainerStyle: React.CSSProperties = {
	position: 'fixed',
	top: 20,
	right: 20,
	zIndex: 10000,
	pointerEvents: 'none',
}

const toastStyle = (type: 'success' | 'error' | 'info'): React.CSSProperties => {
	const baseStyle: React.CSSProperties = {
		display: 'flex',
		alignItems: 'center',
		gap: 12,
		padding: '14px 20px',
		borderRadius: 12,
		fontSize: 14,
		fontWeight: 600,
		boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
		backdropFilter: 'blur(12px)',
		animation: 'slideInRight 0.3s ease-out',
		pointerEvents: 'auto',
		minWidth: 280,
		maxWidth: 400,
	}

	if (type === 'success') {
		return {
			...baseStyle,
			background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.95), rgba(22, 163, 74, 0.9))',
			color: '#fff',
			border: '1px solid rgba(34, 197, 94, 0.5)',
		}
	} else if (type === 'error') {
		return {
			...baseStyle,
			background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(220, 38, 38, 0.9))',
			color: '#fff',
			border: '1px solid rgba(239, 68, 68, 0.5)',
		}
	} else {
		return {
			...baseStyle,
			background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(37, 99, 235, 0.9))',
			color: '#fff',
			border: '1px solid rgba(59, 130, 246, 0.5)',
		}
	}
}

const toastIconStyle = (type: 'success' | 'error' | 'info'): React.CSSProperties => {
	return {
		fontSize: 18,
		fontWeight: 700,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		width: 24,
		height: 24,
		borderRadius: '50%',
		background: type === 'success' 
			? 'rgba(255, 255, 255, 0.3)' 
			: type === 'error' 
			? 'rgba(255, 255, 255, 0.3)' 
			: 'rgba(255, 255, 255, 0.3)',
	}
}

const planButtonStyle: React.CSSProperties = {
	background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
	color: '#fff',
	border: 'none',
	borderRadius: 8,
	padding: '6px 16px',
	fontSize: 12,
	fontWeight: 700,
	letterSpacing: '0.1em',
	textTransform: 'uppercase',
	cursor: 'pointer',
	boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
	transition: 'all 0.2s ease-in-out',
}

const currentPlanBadgeStyle = (plan: string): React.CSSProperties => {
	const colors: Record<string, { bg: string; color: string; border: string }> = {
		awaken: { bg: 'rgba(148, 163, 184, 0.2)', color: '#cbd5e1', border: 'rgba(148, 163, 184, 0.4)' },
		karma_builder: { bg: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', border: 'rgba(59, 130, 246, 0.4)' },
		karma_pro: { bg: 'rgba(139, 92, 246, 0.2)', color: '#c4b5fd', border: 'rgba(139, 92, 246, 0.4)' },
		dharma_master: { bg: 'rgba(251, 191, 36, 0.2)', color: '#fde047', border: 'rgba(251, 191, 36, 0.4)' },
	}
	const style = colors[plan] || colors.awaken
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

const planModalOverlayStyle: React.CSSProperties = {
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

const planModalContentStyle: React.CSSProperties = {
	background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
	borderRadius: 24,
	border: '1px solid rgba(148, 163, 184, 0.2)',
	maxWidth: 1000,
	width: '100%',
	maxHeight: '90vh',
	overflowY: 'auto',
}

const sectionModalContentStyle: React.CSSProperties = {
	background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
	borderRadius: 24,
	border: '1px solid rgba(148, 163, 184, 0.2)',
	maxWidth: 800,
	width: '100%',
	maxHeight: '90vh',
	overflowY: 'auto',
	padding: 0,
}

const sectionModalBodyStyle: React.CSSProperties = {
	padding: '28px 32px',
	display: 'grid',
	gap: 20,
	boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
	position: 'relative',
}

const planModalHeaderStyle: React.CSSProperties = {
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

const planModalTitleStyle: React.CSSProperties = {
	margin: 0,
	fontSize: 24,
	fontWeight: 800,
	color: '#f8fafc',
	letterSpacing: '-0.02em',
}

const planModalCloseButtonStyle: React.CSSProperties = {
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

const planModalBodyStyle: React.CSSProperties = {
	padding: '24px 32px',
	display: 'grid',
	gap: 20,
}

const planCardStyle = (tier: PlanTier, isCurrent: boolean): React.CSSProperties => {
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

const planCardHeaderStyle = (tier: PlanTier): React.CSSProperties => {
	return {
		display: 'flex',
		justifyContent: 'flex-start',
		alignItems: 'flex-start',
		marginBottom: 12,
		gap: 12,
	}
}

const planCardTierStyle: React.CSSProperties = {
	display: 'flex',
	gap: 12,
	alignItems: 'flex-start',
	flex: 1,
}

const planCardTierNumberStyle: React.CSSProperties = {
	fontSize: 28,
	lineHeight: 1,
}

const planCardTitleStyle: React.CSSProperties = {
	margin: 0,
	fontSize: 18,
	fontWeight: 700,
	color: '#f8fafc',
	marginBottom: 4,
}

const planCardTaglineStyle: React.CSSProperties = {
	margin: 0,
	fontSize: 13,
	color: '#94a3b8',
	fontStyle: 'italic',
}

const planCardPriceStyle: React.CSSProperties = {
	background: 'rgba(251, 191, 36, 0.2)',
	color: '#fde047',
	padding: '8px 16px',
	borderRadius: 8,
	fontSize: 14,
	fontWeight: 700,
	border: '1px solid rgba(251, 191, 36, 0.4)',
	whiteSpace: 'nowrap',
}

const planCardPriceCenterStyle: React.CSSProperties = {
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

const planCardBodyStyle: React.CSSProperties = {
	display: 'grid',
	gap: 12,
}

const planCardTargetStyle: React.CSSProperties = {
	fontSize: 13,
	color: '#cbd5e1',
	lineHeight: 1.6,
}

const planCardGoalStyle: React.CSSProperties = {
	fontSize: 13,
	color: '#cbd5e1',
	lineHeight: 1.6,
}

const planCardIncludesStyle: React.CSSProperties = {
	fontSize: 13,
	color: '#cbd5e1',
	lineHeight: 1.6,
}

const planCardListStyle: React.CSSProperties = {
	margin: '8px 0 0 0',
	paddingLeft: 20,
	display: 'grid',
	gap: 6,
}

const planCardListItemStyle: React.CSSProperties = {
	fontSize: 12,
	color: '#94a3b8',
	lineHeight: 1.5,
}

const planCardUnlocksStyle: React.CSSProperties = {
	fontSize: 13,
	color: '#fbbf24',
	lineHeight: 1.6,
	marginTop: 8,
	padding: '8px 12px',
	background: 'rgba(251, 191, 36, 0.1)',
	borderRadius: 8,
	border: '1px solid rgba(251, 191, 36, 0.2)',
}

const planCardCurrentBadgeStyle: React.CSSProperties = {
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

const referralProgressStyle: React.CSSProperties = {
	marginTop: 16,
	padding: '16px',
	borderRadius: 12,
	background: 'rgba(59, 130, 246, 0.1)',
	border: '1px solid rgba(59, 130, 246, 0.3)',
}

const referralProgressHeaderStyle: React.CSSProperties = {
	display: 'flex',
	justifyContent: 'space-between',
	alignItems: 'center',
	marginBottom: 12,
	fontSize: 13,
	color: '#cbd5e1',
}

const referralProgressBarStyle: React.CSSProperties = {
	width: '100%',
	height: 8,
	background: 'rgba(148, 163, 184, 0.2)',
	borderRadius: 999,
	overflow: 'hidden',
	marginBottom: 12,
}

const referralProgressFillStyle: React.CSSProperties = {
	height: '100%',
	background: 'linear-gradient(90deg, #3b82f6, #2563eb)',
	borderRadius: 999,
	transition: 'width 0.3s ease-in-out',
}

const referralCodeDisplayStyle: React.CSSProperties = {
	marginTop: 12,
	fontSize: 12,
	color: '#94a3b8',
}

const referralCodeBoxStyle: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	gap: 8,
	marginTop: 8,
}

const referralCodeTextStyle: React.CSSProperties = {
	background: 'rgba(15, 23, 42, 0.6)',
	padding: '8px 12px',
	borderRadius: 8,
	fontSize: 14,
	fontWeight: 700,
	color: '#fbbf24',
	letterSpacing: '0.1em',
	flex: 1,
	border: '1px solid rgba(251, 191, 36, 0.3)',
}

const copyButtonStyle: React.CSSProperties = {
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

const upgradeButtonStyle: React.CSSProperties = {
	width: '100%',
	marginTop: 16,
	padding: '12px 24px',
	background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
	color: '#064e3b',
	border: 'none',
	borderRadius: 12,
	fontSize: 14,
	fontWeight: 700,
	cursor: 'pointer',
	boxShadow: '0 4px 12px rgba(251, 191, 36, 0.4)',
	transition: 'all 0.2s ease-in-out',
}

export default DashboardPage

