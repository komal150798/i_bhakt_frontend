// Enhanced Admin Components with Pagination, CRUD, Search, Export, and Chatbot
// This file contains reusable components for the admin dashboard

import { useState, useEffect, useMemo } from 'react'

// Enhanced UsersManagement with Pagination, Search, Export
export function EnhancedUsersManagement({ getAuthHeaders, backendBaseUrl }: { getAuthHeaders: () => Record<string, string>; backendBaseUrl: string }) {
	const [users, setUsers] = useState<any[]>([])
	const [loading, setLoading] = useState(true)
	const [currentPage, setCurrentPage] = useState(1)
	const [total, setTotal] = useState(0)
	const [searchTerm, setSearchTerm] = useState('')
	const [planFilter, setPlanFilter] = useState('')
	const limit = 20

	useEffect(() => {
		fetchUsers()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentPage, searchTerm, planFilter])

	const fetchUsers = async () => {
		setLoading(true)
		try {
			const params = new URLSearchParams({
				limit: limit.toString(),
				offset: ((currentPage - 1) * limit).toString(),
			})
			if (searchTerm) params.append('search', searchTerm)
			if (planFilter) params.append('plan', planFilter)

			const res = await fetch(`${backendBaseUrl}/api/admin/users?${params}`, {
				headers: getAuthHeaders(),
			})
			const data = await res.json()
			setUsers(data.users || [])
			setTotal(data.total || 0)
		} catch (error) {
			console.error('Failed to fetch users', error)
		} finally {
			setLoading(false)
		}
	}

	const handleExport = async (format: 'csv' | 'json') => {
		try {
			const res = await fetch(`${backendBaseUrl}/api/admin/export/users?format=${format}`, {
				headers: getAuthHeaders(),
			})
			const blob = await res.blob()
			const url = window.URL.createObjectURL(blob)
			const a = document.createElement('a')
			a.href = url
			a.download = `users_export.${format}`
			document.body.appendChild(a)
			a.click()
			window.URL.revokeObjectURL(url)
			document.body.removeChild(a)
		} catch (error) {
			console.error('Export failed', error)
			alert('Export failed')
		}
	}

	const totalPages = Math.ceil(total / limit)

	return (
		<div>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
				<h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Users ({total})</h2>
				<div style={{ display: 'flex', gap: 8 }}>
					<button onClick={() => handleExport('csv')} style={exportButtonStyle}>Export CSV</button>
					<button onClick={() => handleExport('json')} style={exportButtonStyle}>Export JSON</button>
				</div>
			</div>

			<div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
				<input
					type="text"
					placeholder="Search users..."
					value={searchTerm}
					onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
					style={searchInputStyle}
				/>
				<select
					value={planFilter}
					onChange={(e) => { setPlanFilter(e.target.value); setCurrentPage(1) }}
					style={filterSelectStyle}
				>
					<option value="">All Plans</option>
					<option value="awaken">Awaken</option>
					<option value="karma_builder">Karma Builder</option>
					<option value="karma_pro">Karma Pro</option>
					<option value="dharma_master">Dharma Master</option>
				</select>
			</div>

			{loading ? (
				<div>Loading...</div>
			) : (
				<>
					<div style={tableStyle}>
						<table style={{ width: '100%', borderCollapse: 'collapse' }}>
							<thead>
								<tr style={tableHeaderRowStyle}>
									<th style={tableHeaderStyle}>ID</th>
									<th style={tableHeaderStyle}>Name</th>
									<th style={tableHeaderStyle}>Phone</th>
									<th style={tableHeaderStyle}>Plan</th>
									<th style={tableHeaderStyle}>Referral Code</th>
									<th style={tableHeaderStyle}>Created</th>
								</tr>
							</thead>
							<tbody>
								{users.map((user) => (
									<tr key={user.id} style={tableRowStyle}>
										<td style={tableCellStyle}>{user.id}</td>
										<td style={tableCellStyle}>{user.first_name} {user.last_name}</td>
										<td style={tableCellStyle}>{user.phone_number}</td>
										<td style={tableCellStyle}>{user.plan}</td>
										<td style={tableCellStyle}>{user.referral_code || '-'}</td>
										<td style={tableCellStyle}>
											{user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					{totalPages > 1 && (
						<Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
					)}
				</>
			)}
		</div>
	)
}

// Pagination Component
function Pagination({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (page: number) => void }) {
	const pages = []
	for (let i = 1; i <= totalPages; i++) {
		if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
			pages.push(i)
		} else if (i === currentPage - 3 || i === currentPage + 3) {
			pages.push('...')
		}
	}

	return (
		<div style={paginationStyle}>
			<button
				onClick={() => onPageChange(currentPage - 1)}
				disabled={currentPage === 1}
				style={paginationButtonStyle(currentPage > 1)}
			>
				Previous
			</button>
			{pages.map((page, idx) => (
				page === '...' ? (
					<span key={idx} style={paginationEllipsisStyle}>...</span>
				) : (
					<button
						key={page}
						onClick={() => onPageChange(page as number)}
						style={paginationButtonStyle(true, currentPage === page)}
					>
						{page}
					</button>
				)
			))}
			<button
				onClick={() => onPageChange(currentPage + 1)}
				disabled={currentPage === totalPages}
				style={paginationButtonStyle(currentPage < totalPages)}
			>
				Next
			</button>
		</div>
	)
}

// Styles
const searchInputStyle: React.CSSProperties = {
	background: 'rgba(30, 41, 59, 0.6)',
	border: '1px solid rgba(148, 163, 184, 0.3)',
	borderRadius: 8,
	padding: '10px 16px',
	fontSize: 14,
	color: '#f8fafc',
	flex: 1,
	outline: 'none',
}

const filterSelectStyle: React.CSSProperties = {
	background: 'rgba(30, 41, 59, 0.6)',
	border: '1px solid rgba(148, 163, 184, 0.3)',
	borderRadius: 8,
	padding: '10px 16px',
	fontSize: 14,
	color: '#f8fafc',
	cursor: 'pointer',
	outline: 'none',
}

const exportButtonStyle: React.CSSProperties = {
	background: 'rgba(16, 185, 129, 0.2)',
	border: '1px solid rgba(16, 185, 129, 0.4)',
	color: '#6ee7b7',
	padding: '10px 20px',
	borderRadius: 8,
	cursor: 'pointer',
	fontSize: 13,
	fontWeight: 600,
}

const tableStyle: React.CSSProperties = {
	overflowX: 'auto',
}

const tableHeaderRowStyle: React.CSSProperties = {
	background: 'rgba(30, 41, 59, 0.6)',
}

const tableHeaderStyle: React.CSSProperties = {
	padding: '12px 16px',
	textAlign: 'left',
	fontSize: 12,
	fontWeight: 600,
	color: '#94a3b8',
	textTransform: 'uppercase',
	letterSpacing: '0.05em',
}

const tableRowStyle: React.CSSProperties = {
	borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
}

const tableCellStyle: React.CSSProperties = {
	padding: '12px 16px',
	fontSize: 14,
	color: '#cbd5e1',
}

const paginationStyle: React.CSSProperties = {
	display: 'flex',
	gap: 8,
	alignItems: 'center',
	marginTop: 20,
	justifyContent: 'center',
}

const paginationButtonStyle = (enabled: boolean, active?: boolean): React.CSSProperties => ({
	background: active ? 'rgba(59, 130, 246, 0.3)' : enabled ? 'rgba(30, 41, 59, 0.6)' : 'rgba(30, 41, 59, 0.3)',
	border: `1px solid ${active ? 'rgba(59, 130, 246, 0.5)' : enabled ? 'rgba(148, 163, 184, 0.3)' : 'rgba(148, 163, 184, 0.1)'}`,
	color: enabled ? (active ? '#93c5fd' : '#cbd5e1') : '#64748b',
	padding: '8px 12px',
	borderRadius: 6,
	cursor: enabled ? 'pointer' : 'not-allowed',
	fontSize: 13,
	fontWeight: 600,
})

const paginationEllipsisStyle: React.CSSProperties = {
	color: '#94a3b8',
	padding: '0 4px',
}

