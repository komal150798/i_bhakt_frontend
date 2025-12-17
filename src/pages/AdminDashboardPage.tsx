import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

type AdminInfo = {
	id: number
	username: string
	email: string | null
	is_super_admin: boolean
}

type Stats = {
	total_users: number
	total_karma_records: number
	total_guidance_logs: number
	total_alignment_tips: number
	total_referrals: number
	plan_distribution: Record<string, number>
}

export default function AdminDashboardPage() {
	const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null)
	const [stats, setStats] = useState<Stats | null>(null)
	const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'karma' | 'guidance' | 'tips' | 'config' | 'audit' | 'plan_limits' | 'referrals'>('dashboard')
	const [showChatbot, setShowChatbot] = useState(false)
	const [loading, setLoading] = useState(true)
	const navigate = useNavigate()

	const backendBaseUrl = useMemo(() => {
		const configured = import.meta.env.VITE_BACKEND_URL
		if (typeof configured === 'string' && configured.trim().length > 0) {
			return configured.replace(/\/$/, '')
		}
		// Use relative URL to leverage Vite proxy, fallback to direct URL
		return '' // Empty string means relative URLs will use the Vite proxy
	}, [])

	// VITE_API_URL already includes /api/v1, so use it directly
	const apiBaseUrl = useMemo(() => {
		const configured = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'
		return configured
	}, [])

	const getAuthHeaders = useCallback(() => {
		const token = localStorage.getItem('admin_token')
		return {
			'Authorization': `Bearer ${token}`,
			'Content-Type': 'application/json',
		}
	}, [])

	useEffect(() => {
		const token = localStorage.getItem('admin_token')
		const adminStr = localStorage.getItem('admin_info')
		
		if (!token || !adminStr) {
			navigate('/admin/login')
			return
		}

		setAdminInfo(JSON.parse(adminStr))
		fetchStats()
	}, [navigate])

	const fetchStats = async () => {
		try {
			const res = await fetch(`${apiBaseUrl}/admin/stats`, {
				headers: getAuthHeaders(),
			})
			
			if (!res.ok) {
				if (res.status === 401) {
					// Token expired or invalid
					localStorage.removeItem('admin_token')
					localStorage.removeItem('admin_refresh_token')
					localStorage.removeItem('admin_info')
					navigate('/admin/login', { replace: true })
					return
				}
				throw new Error('Failed to fetch stats')
			}
			
			const response = await res.json()
			// Handle wrapped response: { success, code, message, data }
			const statsData = response.data || response.stats || response
			setStats(statsData)
		} catch (error) {
			console.error('Failed to fetch stats', error)
		} finally {
			setLoading(false)
		}
	}

	const handleLogout = () => {
		localStorage.removeItem('admin_token')
		localStorage.removeItem('admin_info')
		navigate('/admin/login')
	}

	if (loading) {
		return (
			<div style={pageStyle}>
				<div style={loadingStyle}>Loading...</div>
			</div>
		)
	}

	return (
		<div style={pageStyle}>
			<div style={headerStyle}>
				<div>
					<h1 style={titleStyle}>iBhakt Admin Dashboard</h1>
					<p style={subtitleStyle}>Welcome, {adminInfo?.username}</p>
				</div>
				<button onClick={handleLogout} style={logoutButtonStyle}>
					Logout
				</button>
			</div>

			<div style={tabsStyle}>
				{['dashboard', 'users', 'karma', 'guidance', 'tips', 'config', 'audit', 'plan_limits', 'referrals'].map((tab) => (
					<button
						key={tab}
						onClick={() => setActiveTab(tab as any)}
						style={tabButtonStyle(activeTab === tab)}
					>
						{tab.charAt(0).toUpperCase() + tab.slice(1)}
					</button>
				))}
				<button
					onClick={() => setShowChatbot(!showChatbot)}
					style={chatbotToggleStyle}
					title="Admin Assistant"
				>
					💬
				</button>
			</div>

			<div style={contentStyle}>
				{activeTab === 'dashboard' && stats && (
					<DashboardStats stats={stats} />
				)}
				{activeTab === 'users' && <UsersManagement getAuthHeaders={getAuthHeaders} backendBaseUrl={backendBaseUrl} apiBaseUrl={apiBaseUrl} />}
				{activeTab === 'karma' && <KarmaManagement getAuthHeaders={getAuthHeaders} backendBaseUrl={backendBaseUrl} apiBaseUrl={apiBaseUrl} />}
				{activeTab === 'guidance' && <GuidanceManagement getAuthHeaders={getAuthHeaders} backendBaseUrl={backendBaseUrl} apiBaseUrl={apiBaseUrl} />}
				{activeTab === 'tips' && <TipsManagement getAuthHeaders={getAuthHeaders} backendBaseUrl={backendBaseUrl} apiBaseUrl={apiBaseUrl} />}
				{activeTab === 'config' && <ConfigManagement getAuthHeaders={getAuthHeaders} backendBaseUrl={backendBaseUrl} apiBaseUrl={apiBaseUrl} />}
				{activeTab === 'audit' && <AuditLogsManagement getAuthHeaders={getAuthHeaders} backendBaseUrl={backendBaseUrl} apiBaseUrl={apiBaseUrl} />}
				{activeTab === 'plan_limits' && <PlanLimitsManagement getAuthHeaders={getAuthHeaders} backendBaseUrl={backendBaseUrl} apiBaseUrl={apiBaseUrl} />}
				{activeTab === 'referrals' && <ReferralsManagement getAuthHeaders={getAuthHeaders} backendBaseUrl={backendBaseUrl} apiBaseUrl={apiBaseUrl} />}
			</div>
			{showChatbot && (
				<AdminChatbot
					getAuthHeaders={getAuthHeaders}
					backendBaseUrl={backendBaseUrl}
					onClose={() => setShowChatbot(false)}
				/>
			)}
		</div>
	)
}

function DashboardStats({ stats }: { stats: Stats }) {
	return (
		<div style={statsGridStyle}>
			<StatCard title="Total Users" value={stats.total_users} color="#3b82f6" />
			<StatCard title="Karma Records" value={stats.total_karma_records} color="#10b981" />
			<StatCard title="Guidance Logs" value={stats.total_guidance_logs} color="#f59e0b" />
			<StatCard title="Alignment Tips" value={stats.total_alignment_tips} color="#8b5cf6" />
			<StatCard title="Total Referrals" value={stats.total_referrals} color="#ec4899" />
			<div style={planDistributionStyle}>
				<h3 style={sectionTitleStyle}>Plan Distribution</h3>
				{Object.entries(stats.plan_distribution).map(([plan, count]) => (
					<div key={plan} style={planItemStyle}>
						<span style={planNameStyle}>{plan}</span>
						<span style={planCountStyle}>{count}</span>
					</div>
				))}
			</div>
		</div>
	)
}

function StatCard({ title, value, color }: { title: string; value: number; color: string }) {
	return (
		<div style={statCardStyle(color)}>
			<h3 style={statTitleStyle}>{title}</h3>
			<div style={statValueStyle}>{value.toLocaleString()}</div>
		</div>
	)
}

function UsersManagement({ getAuthHeaders, backendBaseUrl, apiBaseUrl }: { getAuthHeaders: () => Record<string, string>; backendBaseUrl: string; apiBaseUrl: string }) {
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

			const res = await fetch(`${apiBaseUrl}/admin/users?${params}`, {
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
			const res = await fetch(`${apiBaseUrl}/admin/export/users?format=${format}`, {
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

	if (loading) return <div>Loading users...</div>

	return (
		<div>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
				<h2 style={sectionTitleStyle}>Users ({total})</h2>
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
		</div>
	)
}

function KarmaManagement({ getAuthHeaders, backendBaseUrl, apiBaseUrl }: { getAuthHeaders: () => Record<string, string>; backendBaseUrl: string; apiBaseUrl: string }) {
	const [records, setRecords] = useState<any[]>([])
	const [loading, setLoading] = useState(true)
	const [currentPage, setCurrentPage] = useState(1)
	const [total, setTotal] = useState(0)
	const [searchTerm, setSearchTerm] = useState('')
	const [statusFilter, setStatusFilter] = useState('')
	const [sourceFilter, setSourceFilter] = useState('')
	const [showCreateModal, setShowCreateModal] = useState(false)
	const [editingRecord, setEditingRecord] = useState<any>(null)
	const limit = 20

	useEffect(() => {
		fetchRecords()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentPage, searchTerm, statusFilter, sourceFilter])

	const fetchRecords = async () => {
		setLoading(true)
		try {
			const params = new URLSearchParams({
				limit: limit.toString(),
				offset: ((currentPage - 1) * limit).toString(),
			})
			if (searchTerm) params.append('search', searchTerm)
			if (statusFilter) params.append('status', statusFilter)
			if (sourceFilter) params.append('source', sourceFilter)

			const res = await fetch(`${apiBaseUrl}/admin/karma-records?${params}`, {
				headers: getAuthHeaders(),
			})
			const data = await res.json()
			setRecords(data.records || [])
			setTotal(data.total || 0)
		} catch (error) {
			console.error('Failed to fetch karma records', error)
		} finally {
			setLoading(false)
		}
	}

	const handleDelete = async (id: number) => {
		if (!confirm('Are you sure you want to delete this karma record?')) return
		try {
			const res = await fetch(`${apiBaseUrl}/admin/karma-records/${id}`, {
				method: 'DELETE',
				headers: getAuthHeaders(),
			})
			if (res.ok) {
				fetchRecords()
				alert('Record deleted successfully')
			}
		} catch (error) {
			console.error('Delete failed', error)
			alert('Delete failed')
		}
	}

	const handleExport = async (format: 'csv' | 'json') => {
		try {
			const res = await fetch(`${apiBaseUrl}/admin/export/karma-records?format=${format}`, {
				headers: getAuthHeaders(),
			})
			const blob = await res.blob()
			const url = window.URL.createObjectURL(blob)
			const a = document.createElement('a')
			a.href = url
			a.download = `karma_records_export.${format}`
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
				<h2 style={sectionTitleStyle}>Karma Records ({total})</h2>
				<div style={{ display: 'flex', gap: 8 }}>
					<button onClick={() => setShowCreateModal(true)} style={createButtonStyle}>+ Create</button>
					<button onClick={() => handleExport('csv')} style={exportButtonStyle}>Export CSV</button>
					<button onClick={() => handleExport('json')} style={exportButtonStyle}>Export JSON</button>
				</div>
			</div>

			<div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
				<input
					type="text"
					placeholder="Search karma records..."
					value={searchTerm}
					onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
					style={searchInputStyle}
				/>
				<select
					value={statusFilter}
					onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }}
					style={filterSelectStyle}
				>
					<option value="">All Status</option>
					<option value="pending">Pending</option>
					<option value="completed">Completed</option>
					<option value="skipped">Skipped</option>
					<option value="not_implemented">Not Implemented</option>
				</select>
				<select
					value={sourceFilter}
					onChange={(e) => { setSourceFilter(e.target.value); setCurrentPage(1) }}
					style={filterSelectStyle}
				>
					<option value="">All Sources</option>
					<option value="user">User</option>
					<option value="guidance">Guidance</option>
					<option value="manifestation_tip">Manifestation Tip</option>
					<option value="admin">Admin</option>
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
									<th style={tableHeaderStyle}>User ID</th>
									<th style={tableHeaderStyle}>Category</th>
									<th style={tableHeaderStyle}>Score</th>
									<th style={tableHeaderStyle}>Status</th>
									<th style={tableHeaderStyle}>Source</th>
									<th style={tableHeaderStyle}>Input Text</th>
									<th style={tableHeaderStyle}>Actions</th>
								</tr>
							</thead>
							<tbody>
								{records.map((record) => (
									<tr key={record.id} style={tableRowStyle}>
										<td style={tableCellStyle}>{record.id}</td>
										<td style={tableCellStyle}>{record.user_id}</td>
										<td style={tableCellStyle}>{record.category_slug || '-'}</td>
										<td style={tableCellStyle}>{record.score_delta}</td>
										<td style={tableCellStyle}>{record.status || '-'}</td>
										<td style={tableCellStyle}>{record.source || '-'}</td>
										<td style={{ ...tableCellStyle, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
											{record.input_text ? (record.input_text.length > 50 ? record.input_text.substring(0, 50) + '...' : record.input_text) : '-'}
										</td>
										<td style={tableCellStyle}>
											<button onClick={() => setEditingRecord(record)} style={editButtonStyle}>Edit</button>
											<button onClick={() => handleDelete(record.id)} style={deleteButtonStyle}>Delete</button>
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

			{showCreateModal && (
				<CreateKarmaModal
					backendBaseUrl={backendBaseUrl}
					getAuthHeaders={getAuthHeaders}
					apiBaseUrl={apiBaseUrl}
					onClose={() => { setShowCreateModal(false); fetchRecords() }}
				/>
			)}

			{editingRecord && (
				<EditKarmaModal
					record={editingRecord}
					backendBaseUrl={backendBaseUrl}
					getAuthHeaders={getAuthHeaders}
					apiBaseUrl={apiBaseUrl}
					onClose={() => { setEditingRecord(null); fetchRecords() }}
				/>
			)}
		</div>
	)
}

function GuidanceManagement({ getAuthHeaders, backendBaseUrl, apiBaseUrl }: { getAuthHeaders: () => Record<string, string>; backendBaseUrl: string; apiBaseUrl: string }) {
	const [logs, setLogs] = useState<any[]>([])
	const [loading, setLoading] = useState(true)
	const [currentPage, setCurrentPage] = useState(1)
	const [total, setTotal] = useState(0)
	const [searchTerm, setSearchTerm] = useState('')
	const [statusFilter, setStatusFilter] = useState('')
	const [editingLog, setEditingLog] = useState<any>(null)
	const limit = 20

	useEffect(() => {
		fetchLogs()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentPage, searchTerm, statusFilter])

	const fetchLogs = async () => {
		setLoading(true)
		try {
			const params = new URLSearchParams({
				limit: limit.toString(),
				offset: ((currentPage - 1) * limit).toString(),
			})
			if (searchTerm) params.append('search', searchTerm)
			if (statusFilter) params.append('status', statusFilter)

			const res = await fetch(`${apiBaseUrl}/admin/guidance?${params}`, {
				headers: getAuthHeaders(),
			})
			const data = await res.json()
			setLogs(data.logs || [])
			setTotal(data.total || 0)
		} catch (error) {
			console.error('Failed to fetch guidance logs', error)
		} finally {
			setLoading(false)
		}
	}

	const handleDelete = async (id: number) => {
		if (!confirm('Are you sure you want to delete this guidance log?')) return
		try {
			const res = await fetch(`${apiBaseUrl}/admin/guidance/${id}`, {
				method: 'DELETE',
				headers: getAuthHeaders(),
			})
			if (res.ok) {
				fetchLogs()
				alert('Guidance log deleted successfully')
			}
		} catch (error) {
			console.error('Delete failed', error)
			alert('Delete failed')
		}
	}

	const totalPages = Math.ceil(total / limit)

	return (
		<div>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
				<h2 style={sectionTitleStyle}>Guidance Logs ({total})</h2>
			</div>

			<div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
				<input
					type="text"
					placeholder="Search guidance..."
					value={searchTerm}
					onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
					style={searchInputStyle}
				/>
				<select
					value={statusFilter}
					onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }}
					style={filterSelectStyle}
				>
					<option value="">All Status</option>
					<option value="pending">Pending</option>
					<option value="completed">Completed</option>
					<option value="skipped">Skipped</option>
					<option value="not_implemented">Not Implemented</option>
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
									<th style={tableHeaderStyle}>User ID</th>
									<th style={tableHeaderStyle}>Guidance Text</th>
									<th style={tableHeaderStyle}>Status</th>
									<th style={tableHeaderStyle}>Created</th>
									<th style={tableHeaderStyle}>Actions</th>
								</tr>
							</thead>
							<tbody>
								{logs.map((log) => (
									<tr key={log.id} style={tableRowStyle}>
										<td style={tableCellStyle}>{log.id}</td>
										<td style={tableCellStyle}>{log.user_id}</td>
										<td style={{ ...tableCellStyle, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
											{log.guidance_text ? (log.guidance_text.length > 60 ? log.guidance_text.substring(0, 60) + '...' : log.guidance_text) : '-'}
										</td>
										<td style={tableCellStyle}>{log.status || '-'}</td>
										<td style={tableCellStyle}>
											{log.created_at ? new Date(log.created_at).toLocaleDateString() : '-'}
										</td>
										<td style={tableCellStyle}>
											<button onClick={() => setEditingLog(log)} style={editButtonStyle}>Edit</button>
											<button onClick={() => handleDelete(log.id)} style={deleteButtonStyle}>Delete</button>
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

			{editingLog && (
				<EditGuidanceModal
					log={editingLog}
					backendBaseUrl={backendBaseUrl}
					getAuthHeaders={getAuthHeaders}
					apiBaseUrl={apiBaseUrl}
					onClose={() => { setEditingLog(null); fetchLogs() }}
				/>
			)}
		</div>
	)
}

function EditGuidanceModal({ log, backendBaseUrl, getAuthHeaders, onClose, apiBaseUrl }: { log: any; backendBaseUrl: string; getAuthHeaders: () => Record<string, string>; onClose: () => void; apiBaseUrl: string }) {
	const [formData, setFormData] = useState({ guidance_text: log.guidance_text || '', status: log.status || 'pending' })
	const [submitting, setSubmitting] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setSubmitting(true)
		try {
			const form = new FormData()
			form.append('guidance_text', formData.guidance_text)
			form.append('status', formData.status)

			const res = await fetch(`${apiBaseUrl}/admin/guidance/${log.id}`, {
				method: 'PUT',
				headers: { 'Authorization': getAuthHeaders().Authorization },
				body: form,
			})

			if (res.ok) {
				alert('Guidance log updated successfully')
				onClose()
			} else {
				const error = await res.json()
				alert(`Error: ${error.detail || 'Failed to update log'}`)
			}
		} catch (error) {
			console.error('Update failed', error)
			alert('Update failed')
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div style={modalOverlayStyle} onClick={onClose}>
			<div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
				<h3 style={{ margin: '0 0 20px 0' }}>Edit Guidance Log</h3>
				<form onSubmit={handleSubmit}>
					<div style={{ marginBottom: 16 }}>
						<label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: '#cbd5e1' }}>Guidance Text</label>
						<textarea
							value={formData.guidance_text}
							onChange={(e) => setFormData({ ...formData, guidance_text: e.target.value })}
							style={{ ...modalInputStyle, minHeight: 120 }}
						/>
					</div>
					<div style={{ marginBottom: 16 }}>
						<label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: '#cbd5e1' }}>Status</label>
						<select
							value={formData.status}
							onChange={(e) => setFormData({ ...formData, status: e.target.value })}
							style={modalInputStyle}
						>
							<option value="pending">Pending</option>
							<option value="completed">Completed</option>
							<option value="skipped">Skipped</option>
							<option value="not_implemented">Not Implemented</option>
						</select>
					</div>
					<div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
						<button type="button" onClick={onClose} style={cancelButtonStyle}>Cancel</button>
						<button type="submit" disabled={submitting} style={saveButtonStyle}>
							{submitting ? 'Updating...' : 'Update'}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

function TipsManagement({ getAuthHeaders, backendBaseUrl, apiBaseUrl }: { getAuthHeaders: () => Record<string, string>; backendBaseUrl: string; apiBaseUrl: string }) {
	const [tips, setTips] = useState<any[]>([])
	const [loading, setLoading] = useState(true)
	const [currentPage, setCurrentPage] = useState(1)
	const [total, setTotal] = useState(0)
	const [searchTerm, setSearchTerm] = useState('')
	const [statusFilter, setStatusFilter] = useState('')
	const [editingTip, setEditingTip] = useState<any>(null)
	const [refreshKey, setRefreshKey] = useState(0) // Force refresh trigger
	const limit = 20

	useEffect(() => {
		fetchTips()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentPage, searchTerm, statusFilter, refreshKey])

	const fetchTips = async () => {
		setLoading(true)
		try {
			const params = new URLSearchParams({
				limit: limit.toString(),
				offset: ((currentPage - 1) * limit).toString(),
			})
			if (searchTerm) params.append('search', searchTerm)
			if (statusFilter) params.append('status', statusFilter)

			const res = await fetch(`${apiBaseUrl}/admin/alignment-tips?${params}`, {
				headers: getAuthHeaders(),
			})
			const data = await res.json()
			setTips(data.tips || [])
			setTotal(data.total || 0)
		} catch (error) {
			console.error('Failed to fetch alignment tips', error)
		} finally {
			setLoading(false)
		}
	}

	const handleDelete = async (id: number) => {
		if (!confirm('Are you sure you want to delete this alignment tip?')) return
		try {
			const res = await fetch(`${apiBaseUrl}/admin/alignment-tips/${id}`, {
				method: 'DELETE',
				headers: getAuthHeaders(),
			})
			if (res.ok) {
				fetchTips()
				alert('Alignment tip deleted successfully')
			}
		} catch (error) {
			console.error('Delete failed', error)
			alert('Delete failed')
		}
	}

	const totalPages = Math.ceil(total / limit)

	return (
		<div>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
				<h2 style={sectionTitleStyle}>Alignment Tips ({total})</h2>
			</div>

			<div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
				<input
					type="text"
					placeholder="Search tips..."
					value={searchTerm}
					onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
					style={searchInputStyle}
				/>
				<select
					value={statusFilter}
					onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }}
					style={filterSelectStyle}
				>
					<option value="">All Status</option>
					<option value="active">Active</option>
					<option value="archived">Archived</option>
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
									<th style={tableHeaderStyle}>User ID</th>
									<th style={tableHeaderStyle}>Tip Text</th>
									<th style={tableHeaderStyle}>Frequency</th>
									<th style={tableHeaderStyle}>Status</th>
									<th style={tableHeaderStyle}>Created</th>
									<th style={tableHeaderStyle}>Actions</th>
								</tr>
							</thead>
							<tbody>
								{tips.map((tip) => (
									<tr key={tip.id} style={tableRowStyle}>
										<td style={tableCellStyle}>{tip.id}</td>
										<td style={tableCellStyle}>{tip.user_id}</td>
										<td style={{ ...tableCellStyle, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
											{tip.tip_text ? (tip.tip_text.length > 60 ? tip.tip_text.substring(0, 60) + '...' : tip.tip_text) : '-'}
										</td>
										<td style={tableCellStyle}>{tip.frequency || '-'}</td>
										<td style={tableCellStyle}>{tip.status || '-'}</td>
										<td style={tableCellStyle}>
											{tip.created_at ? new Date(tip.created_at).toLocaleDateString() : '-'}
										</td>
										<td style={tableCellStyle}>
											<button onClick={() => setEditingTip(tip)} style={editButtonStyle}>Edit</button>
											<button onClick={() => handleDelete(tip.id)} style={deleteButtonStyle}>Delete</button>
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

			{editingTip && (
				<EditTipModal
					tip={editingTip}
					backendBaseUrl={backendBaseUrl}
					getAuthHeaders={getAuthHeaders}
					apiBaseUrl={apiBaseUrl}
					onClose={() => { setEditingTip(null); fetchTips() }}
				/>
			)}
		</div>
	)
}

function EditTipModal({ tip, backendBaseUrl, getAuthHeaders, onClose, apiBaseUrl }: { tip: any; backendBaseUrl: string; getAuthHeaders: () => Record<string, string>; onClose: () => void; apiBaseUrl: string }) {
	const [formData, setFormData] = useState({ tip_text: tip.tip_text || '', status: tip.status || 'active', frequency: tip.frequency || 'daily' })
	const [submitting, setSubmitting] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setSubmitting(true)
		try {
			const form = new FormData()
			form.append('tip_text', formData.tip_text)
			form.append('status', formData.status)
			form.append('frequency', formData.frequency)

			const res = await fetch(`${apiBaseUrl}/admin/alignment-tips/${tip.id}`, {
				method: 'PUT',
				headers: { 'Authorization': getAuthHeaders().Authorization },
				body: form,
			})

			if (res.ok) {
				const data = await res.json()
				alert(data.message || 'Alignment tip updated successfully. Historical data preserved - old tip archived.')
				onClose() // This will trigger fetchTips() in the parent component
			} else {
				const error = await res.json()
				alert(`Error: ${error.detail || 'Failed to update tip'}`)
			}
		} catch (error) {
			console.error('Update failed', error)
			alert('Update failed')
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div style={modalOverlayStyle} onClick={onClose}>
			<div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
				<h3 style={{ margin: '0 0 20px 0' }}>Edit Alignment Tip</h3>
				<form onSubmit={handleSubmit}>
					<div style={{ marginBottom: 16 }}>
						<label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: '#cbd5e1' }}>Tip Text</label>
						<textarea
							value={formData.tip_text}
							onChange={(e) => setFormData({ ...formData, tip_text: e.target.value })}
							style={{ ...modalInputStyle, minHeight: 120 }}
						/>
					</div>
					<div style={{ marginBottom: 16 }}>
						<label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: '#cbd5e1' }}>Status</label>
						<select
							value={formData.status}
							onChange={(e) => setFormData({ ...formData, status: e.target.value })}
							style={modalInputStyle}
						>
							<option value="active">Active</option>
							<option value="archived">Archived</option>
						</select>
					</div>
					<div style={{ marginBottom: 16 }}>
						<label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: '#cbd5e1' }}>Frequency</label>
						<select
							value={formData.frequency}
							onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
							style={modalInputStyle}
						>
							<option value="daily">Daily</option>
							<option value="weekly">Weekly</option>
							<option value="specific_day">Specific Day</option>
						</select>
					</div>
					<div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
						<button type="button" onClick={onClose} style={cancelButtonStyle}>Cancel</button>
						<button type="submit" disabled={submitting} style={saveButtonStyle}>
							{submitting ? 'Updating...' : 'Update'}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

function ConfigManagement({ getAuthHeaders, backendBaseUrl, apiBaseUrl }: { getAuthHeaders: () => Record<string, string>; backendBaseUrl: string; apiBaseUrl: string }) {
	const [configs, setConfigs] = useState<any[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		fetchConfigs()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const fetchConfigs = async () => {
		try {
			const res = await fetch(`${apiBaseUrl}/admin/config`, {
				headers: getAuthHeaders(),
			})
			const data = await res.json()
			setConfigs(data.configs || [])
		} catch (error) {
			console.error('Failed to fetch configs', error)
		} finally {
			setLoading(false)
		}
	}

	const handleUpdate = async (key: string, value: string) => {
		try {
			const formData = new URLSearchParams()
			formData.append('key', key)
			formData.append('value', value)

			const res = await fetch(`${apiBaseUrl}/admin/config`, {
				method: 'POST',
				headers: { 'Authorization': getAuthHeaders().Authorization },
				body: formData.toString(),
			})

			if (res.ok) {
				fetchConfigs()
				alert('Config updated successfully!')
			}
		} catch (error) {
			console.error('Failed to update config', error)
		}
	}

	if (loading) return <div>Loading configs...</div>

	return (
		<div>
			<h2 style={sectionTitleStyle}>Application Configuration</h2>
			<div style={configListStyle}>
				{configs.map((config) => (
					<ConfigItem
						key={config.id}
						config={config}
						onUpdate={handleUpdate}
					/>
				))}
			</div>
		</div>
	)
}

function ConfigItem({ config, onUpdate }: { config: any; onUpdate: (key: string, value: string) => void }) {
	const [value, setValue] = useState(config.value)
	const [editing, setEditing] = useState(false)
	
	useEffect(() => {
		setValue(config.value)
	}, [config.value])

	return (
		<div style={configItemStyle}>
			<div>
				<h4 style={configKeyStyle}>{config.key}</h4>
				{config.description && <p style={configDescStyle}>{config.description}</p>}
			</div>
			{editing ? (
				<div style={configEditStyle}>
					<input
						type="text"
						value={value}
						onChange={(e) => setValue(e.target.value)}
						style={configInputStyle}
					/>
					<button onClick={() => { onUpdate(config.key, value); setEditing(false) }} style={saveButtonStyle}>
						Save
					</button>
					<button onClick={() => { setValue(config.value); setEditing(false) }} style={cancelButtonStyle}>
						Cancel
					</button>
				</div>
			) : (
				<div style={configViewStyle}>
					<span style={configValueStyle}>{value}</span>
					<button onClick={() => setEditing(true)} style={editButtonStyle}>
						Edit
					</button>
				</div>
			)}
		</div>
	)
}

// Styles
const pageStyle: React.CSSProperties = {
	minHeight: '100vh',
	background: 'radial-gradient(circle at top, #1f2937 0%, #0f172a 45%, #020617 100%)',
	color: '#f8fafc',
	padding: '24px',
}

const headerStyle: React.CSSProperties = {
	display: 'flex',
	justifyContent: 'space-between',
	alignItems: 'center',
	marginBottom: 24,
}

const titleStyle: React.CSSProperties = {
	fontSize: 28,
	fontWeight: 700,
	margin: 0,
}

const subtitleStyle: React.CSSProperties = {
	fontSize: 14,
	color: '#94a3b8',
	margin: '4px 0 0 0',
}

const logoutButtonStyle: React.CSSProperties = {
	background: 'rgba(239, 68, 68, 0.2)',
	border: '1px solid rgba(239, 68, 68, 0.4)',
	color: '#fca5a5',
	padding: '10px 20px',
	borderRadius: 8,
	cursor: 'pointer',
	fontSize: 14,
	fontWeight: 600,
}

const tabsStyle: React.CSSProperties = {
	display: 'flex',
	gap: 8,
	marginBottom: 24,
	borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
}

const tabButtonStyle = (active: boolean): React.CSSProperties => ({
	background: active ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
	border: 'none',
	borderBottom: active ? '2px solid #3b82f6' : '2px solid transparent',
	color: active ? '#93c5fd' : '#94a3b8',
	padding: '12px 20px',
	cursor: 'pointer',
	fontSize: 14,
	fontWeight: 600,
	transition: 'all 0.2s',
})

const contentStyle: React.CSSProperties = {
	background: 'rgba(15, 23, 42, 0.6)',
	border: '1px solid rgba(148, 163, 184, 0.2)',
	borderRadius: 12,
	padding: 24,
}

const loadingStyle: React.CSSProperties = {
	textAlign: 'center',
	padding: 48,
	fontSize: 18,
	color: '#94a3b8',
}

const statsGridStyle: React.CSSProperties = {
	display: 'grid',
	gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
	gap: 16,
}

const statCardStyle = (color: string): React.CSSProperties => ({
	background: `linear-gradient(135deg, ${color}20, ${color}10)`,
	border: `1px solid ${color}40`,
	borderRadius: 12,
	padding: 20,
})

const statTitleStyle: React.CSSProperties = {
	fontSize: 13,
	fontWeight: 600,
	color: '#94a3b8',
	textTransform: 'uppercase',
	letterSpacing: '0.05em',
	margin: '0 0 8px 0',
}

const statValueStyle: React.CSSProperties = {
	fontSize: 32,
	fontWeight: 700,
	color: '#f8fafc',
}

const planDistributionStyle: React.CSSProperties = {
	gridColumn: '1 / -1',
	background: 'rgba(30, 41, 59, 0.4)',
	borderRadius: 12,
	padding: 20,
	marginTop: 8,
}

const sectionTitleStyle: React.CSSProperties = {
	fontSize: 20,
	fontWeight: 700,
	margin: '0 0 16px 0',
}

const planItemStyle: React.CSSProperties = {
	display: 'flex',
	justifyContent: 'space-between',
	padding: '12px 0',
	borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
}

const planNameStyle: React.CSSProperties = {
	fontSize: 14,
	color: '#cbd5e1',
	textTransform: 'capitalize',
}

const planCountStyle: React.CSSProperties = {
	fontSize: 16,
	fontWeight: 600,
	color: '#f8fafc',
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

const configListStyle: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	gap: 16,
}

const configItemStyle: React.CSSProperties = {
	background: 'rgba(30, 41, 59, 0.4)',
	border: '1px solid rgba(148, 163, 184, 0.2)',
	borderRadius: 12,
	padding: 20,
	display: 'flex',
	justifyContent: 'space-between',
	alignItems: 'center',
}

const configKeyStyle: React.CSSProperties = {
	fontSize: 16,
	fontWeight: 600,
	color: '#f8fafc',
	margin: '0 0 4px 0',
}

const configDescStyle: React.CSSProperties = {
	fontSize: 13,
	color: '#94a3b8',
	margin: 0,
}

const configViewStyle: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	gap: 12,
}

const configValueStyle: React.CSSProperties = {
	fontSize: 15,
	color: '#cbd5e1',
	fontFamily: 'monospace',
	background: 'rgba(15, 23, 42, 0.6)',
	padding: '8px 12px',
	borderRadius: 6,
}

const editButtonStyle: React.CSSProperties = {
	background: 'rgba(59, 130, 246, 0.2)',
	border: '1px solid rgba(59, 130, 246, 0.4)',
	color: '#93c5fd',
	padding: '8px 16px',
	borderRadius: 6,
	cursor: 'pointer',
	fontSize: 13,
	fontWeight: 600,
}

const configEditStyle: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	gap: 8,
}

const configInputStyle: React.CSSProperties = {
	background: 'rgba(15, 23, 42, 0.6)',
	border: '1px solid rgba(148, 163, 184, 0.3)',
	borderRadius: 6,
	padding: '8px 12px',
	fontSize: 15,
	color: '#f8fafc',
	fontFamily: 'monospace',
	width: 200,
}

const saveButtonStyle: React.CSSProperties = {
	background: 'rgba(16, 185, 129, 0.2)',
	border: '1px solid rgba(16, 185, 129, 0.4)',
	color: '#6ee7b7',
	padding: '8px 16px',
	borderRadius: 6,
	cursor: 'pointer',
	fontSize: 13,
	fontWeight: 600,
}

const cancelButtonStyle: React.CSSProperties = {
	background: 'rgba(148, 163, 184, 0.2)',
	border: '1px solid rgba(148, 163, 184, 0.3)',
	color: '#cbd5e1',
	padding: '8px 16px',
	borderRadius: 6,
	cursor: 'pointer',
	fontSize: 13,
	fontWeight: 600,
}

const chatbotToggleStyle: React.CSSProperties = {
	background: 'rgba(139, 92, 246, 0.2)',
	border: '1px solid rgba(139, 92, 246, 0.4)',
	color: '#c4b5fd',
	padding: '12px 20px',
	borderRadius: 8,
	cursor: 'pointer',
	fontSize: 18,
	marginLeft: 'auto',
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

const createButtonStyle: React.CSSProperties = {
	background: 'rgba(59, 130, 246, 0.2)',
	border: '1px solid rgba(59, 130, 246, 0.4)',
	color: '#93c5fd',
	padding: '10px 20px',
	borderRadius: 8,
	cursor: 'pointer',
	fontSize: 13,
	fontWeight: 600,
}

const deleteButtonStyle: React.CSSProperties = {
	background: 'rgba(239, 68, 68, 0.2)',
	border: '1px solid rgba(239, 68, 68, 0.4)',
	color: '#fca5a5',
	padding: '6px 12px',
	borderRadius: 6,
	cursor: 'pointer',
	fontSize: 12,
	fontWeight: 600,
	marginLeft: 8,
}

// Create Karma Modal
function CreateKarmaModal({ backendBaseUrl, getAuthHeaders, onClose, apiBaseUrl }: { backendBaseUrl: string; getAuthHeaders: () => Record<string, string>; onClose: () => void; apiBaseUrl: string }) {
	const [formData, setFormData] = useState({ user_id: '', input_text: '', category_slug: '', score_delta: '0', source: 'admin' })
	const [submitting, setSubmitting] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setSubmitting(true)
		try {
			const form = new FormData()
			form.append('user_id', formData.user_id)
			form.append('input_text', formData.input_text)
			form.append('category_slug', formData.category_slug)
			form.append('score_delta', formData.score_delta)
			form.append('source', formData.source)

			const res = await fetch(`${apiBaseUrl}/admin/karma-records`, {
				method: 'POST',
				headers: { 'Authorization': getAuthHeaders().Authorization },
				body: form,
			})

			if (res.ok) {
				alert('Karma record created successfully')
				onClose()
			} else {
				const error = await res.json()
				alert(`Error: ${error.detail || 'Failed to create record'}`)
			}
		} catch (error) {
			console.error('Create failed', error)
			alert('Create failed')
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div style={modalOverlayStyle} onClick={onClose}>
			<div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
				<h3 style={{ margin: '0 0 20px 0' }}>Create Karma Record</h3>
				<form onSubmit={handleSubmit}>
					<div style={{ marginBottom: 16 }}>
						<label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: '#cbd5e1' }}>User ID *</label>
						<input
							type="number"
							value={formData.user_id}
							onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
							required
							style={modalInputStyle}
						/>
					</div>
					<div style={{ marginBottom: 16 }}>
						<label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: '#cbd5e1' }}>Input Text *</label>
						<textarea
							value={formData.input_text}
							onChange={(e) => setFormData({ ...formData, input_text: e.target.value })}
							required
							style={{ ...modalInputStyle, minHeight: 80 }}
						/>
					</div>
					<div style={{ marginBottom: 16 }}>
						<label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: '#cbd5e1' }}>Category Slug</label>
						<input
							type="text"
							value={formData.category_slug}
							onChange={(e) => setFormData({ ...formData, category_slug: e.target.value })}
							style={modalInputStyle}
						/>
					</div>
					<div style={{ marginBottom: 16 }}>
						<label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: '#cbd5e1' }}>Score Delta</label>
						<input
							type="number"
							step="0.1"
							value={formData.score_delta}
							onChange={(e) => setFormData({ ...formData, score_delta: e.target.value })}
							style={modalInputStyle}
						/>
					</div>
					<div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
						<button type="button" onClick={onClose} style={cancelButtonStyle}>Cancel</button>
						<button type="submit" disabled={submitting} style={saveButtonStyle}>
							{submitting ? 'Creating...' : 'Create'}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

// Edit Karma Modal
function EditKarmaModal({ record, backendBaseUrl, getAuthHeaders, onClose, apiBaseUrl }: { record: any; backendBaseUrl: string; getAuthHeaders: () => Record<string, string>; onClose: () => void; apiBaseUrl: string }) {
	const [formData, setFormData] = useState({ input_text: record.input_text || '', score_delta: record.score_delta?.toString() || '0', status: record.status || 'pending' })
	const [submitting, setSubmitting] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setSubmitting(true)
		try {
			const form = new FormData()
			form.append('input_text', formData.input_text)
			form.append('score_delta', formData.score_delta)
			form.append('status', formData.status)

			const res = await fetch(`${apiBaseUrl}/admin/karma-records/${record.id}`, {
				method: 'PUT',
				headers: { 'Authorization': getAuthHeaders().Authorization },
				body: form,
			})

			if (res.ok) {
				alert('Karma record updated successfully')
				onClose()
			} else {
				const error = await res.json()
				alert(`Error: ${error.detail || 'Failed to update record'}`)
			}
		} catch (error) {
			console.error('Update failed', error)
			alert('Update failed')
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div style={modalOverlayStyle} onClick={onClose}>
			<div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
				<h3 style={{ margin: '0 0 20px 0' }}>Edit Karma Record</h3>
				<form onSubmit={handleSubmit}>
					<div style={{ marginBottom: 16 }}>
						<label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: '#cbd5e1' }}>Input Text</label>
						<textarea
							value={formData.input_text}
							onChange={(e) => setFormData({ ...formData, input_text: e.target.value })}
							style={{ ...modalInputStyle, minHeight: 80 }}
						/>
					</div>
					<div style={{ marginBottom: 16 }}>
						<label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: '#cbd5e1' }}>Score Delta</label>
						<input
							type="number"
							step="0.1"
							value={formData.score_delta}
							onChange={(e) => setFormData({ ...formData, score_delta: e.target.value })}
							style={modalInputStyle}
						/>
					</div>
					<div style={{ marginBottom: 16 }}>
						<label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: '#cbd5e1' }}>Status</label>
						<select
							value={formData.status}
							onChange={(e) => setFormData({ ...formData, status: e.target.value })}
							style={modalInputStyle}
						>
							<option value="pending">Pending</option>
							<option value="completed">Completed</option>
							<option value="skipped">Skipped</option>
							<option value="not_implemented">Not Implemented</option>
						</select>
					</div>
					<div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
						<button type="button" onClick={onClose} style={cancelButtonStyle}>Cancel</button>
						<button type="submit" disabled={submitting} style={saveButtonStyle}>
							{submitting ? 'Updating...' : 'Update'}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

const modalOverlayStyle: React.CSSProperties = {
	position: 'fixed',
	top: 0,
	left: 0,
	right: 0,
	bottom: 0,
	background: 'rgba(0, 0, 0, 0.7)',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	zIndex: 1000,
}

const modalContentStyle: React.CSSProperties = {
	background: 'rgba(15, 23, 42, 0.95)',
	border: '1px solid rgba(148, 163, 184, 0.3)',
	borderRadius: 12,
	padding: 24,
	minWidth: 400,
	maxWidth: 600,
	maxHeight: '90vh',
	overflow: 'auto',
}

const modalInputStyle: React.CSSProperties = {
	width: '100%',
	background: 'rgba(30, 41, 59, 0.6)',
	border: '1px solid rgba(148, 163, 184, 0.3)',
	borderRadius: 8,
	padding: '10px 12px',
	fontSize: 14,
	color: '#f8fafc',
	outline: 'none',
}

const inputGroupStyle: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	gap: 8,
	marginBottom: 16,
}

const labelStyle: React.CSSProperties = {
	fontSize: 13,
	fontWeight: 600,
	color: '#cbd5e1',
	textTransform: 'uppercase',
	letterSpacing: '0.05em',
}

const inputStyle: React.CSSProperties = {
	width: '100%',
	background: 'rgba(30, 41, 59, 0.6)',
	border: '1px solid rgba(148, 163, 184, 0.3)',
	borderRadius: 8,
	padding: '10px 12px',
	fontSize: 14,
	color: '#f8fafc',
	outline: 'none',
}

// Audit Logs Management
function AuditLogsManagement({ getAuthHeaders, backendBaseUrl, apiBaseUrl }: { getAuthHeaders: () => Record<string, string>; backendBaseUrl: string; apiBaseUrl: string }) {
	const [logs, setLogs] = useState<any[]>([])
	const [loading, setLoading] = useState(true)
	const [currentPage, setCurrentPage] = useState(1)
	const [total, setTotal] = useState(0)
	const [resourceTypeFilter, setResourceTypeFilter] = useState('')
	const limit = 20

	useEffect(() => {
		fetchLogs()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentPage, resourceTypeFilter])

	const fetchLogs = async () => {
		setLoading(true)
		try {
			const params = new URLSearchParams({
				limit: limit.toString(),
				offset: ((currentPage - 1) * limit).toString(),
			})
			if (resourceTypeFilter) params.append('resource_type', resourceTypeFilter)

			const res = await fetch(`${apiBaseUrl}/admin/audit-logs?${params}`, {
				headers: getAuthHeaders(),
			})
			const data = await res.json()
			setLogs(data.logs || [])
			setTotal(data.total || 0)
		} catch (error) {
			console.error('Failed to fetch audit logs', error)
		} finally {
			setLoading(false)
		}
	}

	const totalPages = Math.ceil(total / limit)

	return (
		<div>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
				<h2 style={sectionTitleStyle}>Audit Logs ({total})</h2>
			</div>

			<div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
				<select
					value={resourceTypeFilter}
					onChange={(e) => { setResourceTypeFilter(e.target.value); setCurrentPage(1) }}
					style={filterSelectStyle}
				>
					<option value="">All Resource Types</option>
					<option value="user">User</option>
					<option value="karma_record">Karma Record</option>
					<option value="guidance">Guidance</option>
					<option value="alignment_tip">Alignment Tip</option>
					<option value="config">Config</option>
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
									<th style={tableHeaderStyle}>Admin</th>
									<th style={tableHeaderStyle}>Action</th>
									<th style={tableHeaderStyle}>Resource</th>
									<th style={tableHeaderStyle}>Resource ID</th>
									<th style={tableHeaderStyle}>IP Address</th>
									<th style={tableHeaderStyle}>Created</th>
								</tr>
							</thead>
							<tbody>
								{logs.map((log) => (
									<tr key={log.id} style={tableRowStyle}>
										<td style={tableCellStyle}>{log.id}</td>
										<td style={tableCellStyle}>{log.admin_username || log.admin_id}</td>
										<td style={tableCellStyle}>{log.action}</td>
										<td style={tableCellStyle}>{log.resource_type}</td>
										<td style={tableCellStyle}>{log.resource_id || '-'}</td>
										<td style={tableCellStyle}>{log.ip_address || '-'}</td>
										<td style={tableCellStyle}>
											{log.created_at ? new Date(log.created_at).toLocaleString() : '-'}
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

// Plan Limits Management Component
function ReferralsManagement({ getAuthHeaders, backendBaseUrl, apiBaseUrl }: { getAuthHeaders: () => Record<string, string>; backendBaseUrl: string; apiBaseUrl: string }) {
	const [referrals, setReferrals] = useState<any[]>([])
	const [stats, setStats] = useState<any>(null)
	const [loading, setLoading] = useState(true)
	const [page, setPage] = useState(1)
	const [statusFilter, setStatusFilter] = useState('')
	const [typeFilter, setTypeFilter] = useState('')
	const pageSize = 20

	useEffect(() => {
		fetchReferrals()
		fetchStats()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [page, statusFilter, typeFilter])

	const fetchReferrals = async () => {
		setLoading(true)
		try {
			const params = new URLSearchParams({
				skip: String((page - 1) * pageSize),
				limit: String(pageSize),
			})
			if (statusFilter) params.append('status', statusFilter)
			if (typeFilter) params.append('referral_type', typeFilter)
			
			const res = await fetch(`${apiBaseUrl}/admin/referrals?${params}`, {
				headers: getAuthHeaders(),
			})
			if (!res.ok) throw new Error('Failed to fetch referrals')
			const data = await res.json()
			setReferrals(data.referrals || [])
		} catch (error) {
			console.error('Failed to fetch referrals', error)
			alert('Failed to fetch referrals')
		} finally {
			setLoading(false)
		}
	}

	const fetchStats = async () => {
		try {
			const res = await fetch(`${apiBaseUrl}/admin/referrals/stats`, {
				headers: getAuthHeaders(),
			})
			if (!res.ok) throw new Error('Failed to fetch stats')
			const data = await res.json()
			setStats(data)
		} catch (error) {
			console.error('Failed to fetch referral stats', error)
		}
	}

	return (
		<div>
			{stats && (
				<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
					<div style={{ padding: 16, background: '#1e293b', borderRadius: 8 }}>
						<div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Pending Referrals</div>
						<div style={{ fontSize: 24, fontWeight: 'bold', color: '#fbbf24' }}>{stats.total_pending_referrals}</div>
					</div>
					<div style={{ padding: 16, background: '#1e293b', borderRadius: 8 }}>
						<div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Completed Referrals</div>
						<div style={{ fontSize: 24, fontWeight: 'bold', color: '#34d399' }}>{stats.total_completed_referrals}</div>
					</div>
					<div style={{ padding: 16, background: '#1e293b', borderRadius: 8 }}>
						<div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Total Referrals</div>
						<div style={{ fontSize: 24, fontWeight: 'bold', color: '#60a5fa' }}>{stats.total_referrals}</div>
					</div>
				</div>
			)}
			
			<div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
				<select
					value={statusFilter}
					onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
					style={{ padding: '8px 12px', borderRadius: 6, background: '#1e293b', color: '#f8fafc', border: '1px solid #334155' }}
				>
					<option value="">All Status</option>
					<option value="pending">Pending</option>
					<option value="completed">Completed</option>
				</select>
				<select
					value={typeFilter}
					onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }}
					style={{ padding: '8px 12px', borderRadius: 6, background: '#1e293b', color: '#f8fafc', border: '1px solid #334155' }}
				>
					<option value="">All Types</option>
					<option value="email">Email</option>
					<option value="phone">Phone</option>
				</select>
			</div>

			{loading ? (
				<div>Loading...</div>
			) : (
				<div style={{ overflowX: 'auto' }}>
					<table style={{ width: '100%', borderCollapse: 'collapse' }}>
						<thead>
							<tr style={{ background: '#1e293b', borderBottom: '2px solid #334155' }}>
								<th style={{ padding: 12, textAlign: 'left', color: '#cbd5f5' }}>Referrer</th>
								<th style={{ padding: 12, textAlign: 'left', color: '#cbd5f5' }}>Type</th>
								<th style={{ padding: 12, textAlign: 'left', color: '#cbd5f5' }}>Contact</th>
								<th style={{ padding: 12, textAlign: 'left', color: '#cbd5f5' }}>Status</th>
								<th style={{ padding: 12, textAlign: 'left', color: '#cbd5f5' }}>Referred User</th>
								<th style={{ padding: 12, textAlign: 'left', color: '#cbd5f5' }}>Created</th>
								<th style={{ padding: 12, textAlign: 'left', color: '#cbd5f5' }}>Completed</th>
							</tr>
						</thead>
						<tbody>
							{referrals.map((ref) => (
								<tr key={ref.id} style={{ borderBottom: '1px solid #334155' }}>
									<td style={{ padding: 12, color: '#e0e7ff' }}>
										<div>{ref.referrer_name || 'Unknown'}</div>
										<div style={{ fontSize: 11, color: '#94a3b8' }}>{ref.referrer_phone || '—'}</div>
									</td>
									<td style={{ padding: 12, color: '#cbd5f5' }}>{ref.referral_type === 'email' ? '📧 Email' : '📱 Phone'}</td>
									<td style={{ padding: 12, color: '#cbd5f5' }}>{ref.referral_value}</td>
									<td style={{ padding: 12 }}>
										<span style={{
											padding: '4px 8px',
											borderRadius: 4,
											fontSize: 11,
											background: ref.status === 'completed' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(251, 191, 36, 0.2)',
											color: ref.status === 'completed' ? '#34d399' : '#fbbf24',
										}}>
											{ref.status}
										</span>
									</td>
									<td style={{ padding: 12, color: '#cbd5f5' }}>
										{ref.referred_user_name ? (
											<div>
												<div>{ref.referred_user_name}</div>
												<div style={{ fontSize: 11, color: '#94a3b8' }}>{ref.referred_user_phone || '—'}</div>
											</div>
										) : '—'}
									</td>
									<td style={{ padding: 12, color: '#94a3b8', fontSize: 12 }}>
										{ref.created_at ? new Date(ref.created_at).toLocaleDateString() : '—'}
									</td>
									<td style={{ padding: 12, color: '#94a3b8', fontSize: 12 }}>
										{ref.completed_at ? new Date(ref.completed_at).toLocaleDateString() : '—'}
									</td>
								</tr>
							))}
						</tbody>
					</table>
					{referrals.length === 0 && !loading && (
						<div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>No referrals found</div>
					)}
				</div>
			)}
		</div>
	)
}

function PlanLimitsManagement({ getAuthHeaders, backendBaseUrl, apiBaseUrl }: { getAuthHeaders: () => Record<string, string>; backendBaseUrl: string; apiBaseUrl: string }) {
	const [limits, setLimits] = useState<any[]>([])
	const [loading, setLoading] = useState(true)
	const [editingRow, setEditingRow] = useState<string | null>(null) // Format: "plan-feature"
	const [editingData, setEditingData] = useState<Record<string, any>>({})
	const [planFilter, setPlanFilter] = useState('')

	const plans = ['awaken', 'karma_builder', 'karma_pro', 'dharma_master']
	const features = [
		{ value: 'cosmic_guidance', label: 'Cosmic Guidance' },
		{ value: 'manifestation_check', label: 'Manifestation Fulfillment Probability' },
		{ value: 'karma_record', label: 'Record Your Karma' },
	]

	useEffect(() => {
		fetchLimits()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [planFilter])

	const fetchLimits = async () => {
		setLoading(true)
		try {
			const params = planFilter ? `?plan=${planFilter}` : ''
			const res = await fetch(`${apiBaseUrl}/admin/plan-feature-limits${params}`, {
				headers: getAuthHeaders(),
			})
			if (!res.ok) throw new Error('Failed to fetch limits')
			const data = await res.json()
			setLimits(data.limits || [])
		} catch (error) {
			console.error('Failed to fetch plan limits', error)
			alert('Failed to fetch plan limits')
		} finally {
			setLoading(false)
		}
	}

	const handleStartEdit = (plan: string, feature: string) => {
		const rowKey = `${plan}-${feature}`
		const limit = getLimitForPlanFeature(plan, feature)
		setEditingRow(rowKey)
		setEditingData({
			plan,
			feature,
			max_per_day: limit?.max_per_day ?? '',
			max_per_week: limit?.max_per_week ?? '',
			max_per_month: limit?.max_per_month ?? '',
			karma_ledger_visible: limit?.karma_ledger_visible !== undefined ? limit.karma_ledger_visible : true,
			cosmic_blueprint_visible: limit?.cosmic_blueprint_visible !== undefined ? limit.cosmic_blueprint_visible : true,
		})
	}

	const handleCancelEdit = () => {
		setEditingRow(null)
		setEditingData({})
	}

	const handleSave = async (plan: string, feature: string) => {
		const formData = editingData
		try {
			const form = new FormData()
			form.append('plan', formData.plan)
			form.append('feature', formData.feature)
			if (formData.max_per_day !== null && formData.max_per_day !== undefined && formData.max_per_day !== '') {
				form.append('max_per_day', formData.max_per_day.toString())
			}
			if (formData.max_per_week !== null && formData.max_per_week !== undefined && formData.max_per_week !== '') {
				form.append('max_per_week', formData.max_per_week.toString())
			}
			if (formData.max_per_month !== null && formData.max_per_month !== undefined && formData.max_per_month !== '') {
				form.append('max_per_month', formData.max_per_month.toString())
			}
			form.append('karma_ledger_visible', formData.karma_ledger_visible ? 'true' : 'false')
			form.append('cosmic_blueprint_visible', formData.cosmic_blueprint_visible ? 'true' : 'false')

			const res = await fetch(`${apiBaseUrl}/admin/plan-feature-limits`, {
				method: 'POST',
				headers: { 'Authorization': getAuthHeaders().Authorization },
				body: form,
			})

			if (res.ok) {
				alert('Plan limit saved successfully!')
				setEditingRow(null)
				setEditingData({})
				fetchLimits()
			} else {
				const error = await res.json()
				alert(`Failed to save: ${error.detail || 'Unknown error'}`)
			}
		} catch (error) {
			console.error('Save failed', error)
			alert('Save failed')
		}
	}

	const getLimitForPlanFeature = (plan: string, feature: string) => {
		return limits.find(l => l.plan === plan && l.feature === feature)
	}

	return (
		<div>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
				<h2 style={sectionTitleStyle}>Plan Feature Limits</h2>
				<select
					value={planFilter}
					onChange={(e) => setPlanFilter(e.target.value)}
					style={filterSelectStyle}
				>
					<option value="">All Plans</option>
					{plans.map(p => (
						<option key={p} value={p}>{p.replace('_', ' ').toUpperCase()}</option>
					))}
				</select>
			</div>

			{loading ? (
				<div>Loading...</div>
			) : (
				<div style={tableStyle}>
					<table style={{ width: '100%', borderCollapse: 'collapse' }}>
						<thead>
							<tr style={tableHeaderRowStyle}>
								<th style={tableHeaderStyle}>Plan</th>
								<th style={tableHeaderStyle}>Feature</th>
								<th style={tableHeaderStyle}>Max/Day</th>
								<th style={tableHeaderStyle}>Max/Week</th>
								<th style={tableHeaderStyle}>Max/Month</th>
								<th style={tableHeaderStyle}>Karma Ledger</th>
								<th style={tableHeaderStyle}>Cosmic Blueprint</th>
								<th style={tableHeaderStyle}>Actions</th>
							</tr>
						</thead>
						<tbody>
							{plans.map(plan => 
								features.map(feature => {
									const rowKey = `${plan}-${feature.value}`
									const limit = getLimitForPlanFeature(plan, feature.value)
									const isEditing = editingRow === rowKey
									return (
										<tr key={rowKey} style={tableRowStyle}>
											<td style={tableCellStyle}>{plan.replace('_', ' ').toUpperCase()}</td>
											<td style={tableCellStyle}>{feature.label}</td>
											<td style={tableCellStyle}>
												{isEditing ? (
													<input
														type="number"
														value={editingData.max_per_day ?? ''}
														onChange={(e) => setEditingData({ ...editingData, max_per_day: e.target.value ? parseInt(e.target.value) : null })}
														style={{ ...inputStyle, width: '80px', padding: '4px 8px' }}
														placeholder="Unlimited"
														min="0"
													/>
												) : (
													limit?.max_per_day ?? 'Unlimited'
												)}
											</td>
											<td style={tableCellStyle}>
												{isEditing ? (
													<input
														type="number"
														value={editingData.max_per_week ?? ''}
														onChange={(e) => setEditingData({ ...editingData, max_per_week: e.target.value ? parseInt(e.target.value) : null })}
														style={{ ...inputStyle, width: '80px', padding: '4px 8px' }}
														placeholder="Unlimited"
														min="0"
													/>
												) : (
													limit?.max_per_week ?? 'Unlimited'
												)}
											</td>
											<td style={tableCellStyle}>
												{isEditing ? (
													<input
														type="number"
														value={editingData.max_per_month ?? ''}
														onChange={(e) => setEditingData({ ...editingData, max_per_month: e.target.value ? parseInt(e.target.value) : null })}
														style={{ ...inputStyle, width: '80px', padding: '4px 8px' }}
														placeholder="Unlimited"
														min="0"
													/>
												) : (
													limit?.max_per_month ?? 'Unlimited'
												)}
											</td>
											<td style={tableCellStyle}>
												{isEditing ? (
													<input
														type="checkbox"
														checked={editingData.karma_ledger_visible ?? true}
														onChange={(e) => setEditingData({ ...editingData, karma_ledger_visible: e.target.checked })}
														style={{ cursor: 'pointer' }}
													/>
												) : (
													limit?.karma_ledger_visible !== undefined 
														? (limit.karma_ledger_visible ? '✓' : '✗')
														: '✓'
												)}
											</td>
											<td style={tableCellStyle}>
												{isEditing ? (
													<input
														type="checkbox"
														checked={editingData.cosmic_blueprint_visible ?? true}
														onChange={(e) => setEditingData({ ...editingData, cosmic_blueprint_visible: e.target.checked })}
														style={{ cursor: 'pointer' }}
													/>
												) : (
													limit?.cosmic_blueprint_visible !== undefined
														? (limit.cosmic_blueprint_visible ? '✓' : '✗')
														: '✓'
												)}
											</td>
											<td style={tableCellStyle}>
												{isEditing ? (
													<div style={{ display: 'flex', gap: 8 }}>
														<button
															onClick={() => handleSave(plan, feature.value)}
															style={createButtonStyle}
														>
															Save
														</button>
														<button
															onClick={handleCancelEdit}
															style={deleteButtonStyle}
														>
															Cancel
														</button>
													</div>
												) : (
													<button
														onClick={() => handleStartEdit(plan, feature.value)}
														style={editButtonStyle}
													>
														Edit
													</button>
												)}
											</td>
										</tr>
									)
								})
							)}
						</tbody>
					</table>
				</div>
			)}

		</div>
	)
}

// Admin Chatbot Component
function AdminChatbot({ getAuthHeaders, backendBaseUrl, onClose }: { getAuthHeaders: () => Record<string, string>; backendBaseUrl: string; onClose: () => void }) {
	const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
		{ role: 'assistant', content: 'Hello! I\'m your admin assistant. I can help you navigate the admin panel, find information, and perform actions. What would you like to do?' }
	])
	const [input, setInput] = useState('')
	const [loading, setLoading] = useState(false)

	const handleSend = async () => {
		if (!input.trim()) return

		const userMessage = { role: 'user' as const, content: input }
		setMessages(prev => [...prev, userMessage])
		setInput('')
		setLoading(true)

		// Simple rule-based chatbot (can be enhanced with AI later)
		const response = generateResponse(input.toLowerCase(), backendBaseUrl, getAuthHeaders)
		
		setTimeout(() => {
			setMessages(prev => [...prev, { role: 'assistant', content: response }])
			setLoading(false)
		}, 500)
	}

	return (
		<div style={chatbotContainerStyle}>
			<div style={chatbotHeaderStyle}>
				<h3 style={{ margin: 0 }}>Admin Assistant</h3>
				<button onClick={onClose} style={chatbotCloseStyle}>×</button>
			</div>
			<div style={chatbotMessagesStyle}>
				{messages.map((msg, idx) => (
					<div key={idx} style={msg.role === 'user' ? chatbotUserMessageStyle : chatbotAssistantMessageStyle}>
						{msg.content}
					</div>
				))}
				{loading && <div style={chatbotAssistantMessageStyle}>Thinking...</div>}
			</div>
			<div style={chatbotInputStyle}>
				<input
					type="text"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onKeyPress={(e) => e.key === 'Enter' && handleSend()}
					placeholder="Ask me anything..."
					style={chatbotInputFieldStyle}
				/>
				<button onClick={handleSend} style={chatbotSendButtonStyle}>Send</button>
			</div>
		</div>
	)
}

function generateResponse(query: string, _backendBaseUrl: string, _getAuthHeaders: () => Record<string, string>): string {
	if (query.includes('user') && (query.includes('count') || query.includes('how many'))) {
		return 'I can help you check user statistics. Navigate to the Dashboard tab to see total users, or go to the Users tab to see the full list.'
	}
	if (query.includes('karma') && (query.includes('create') || query.includes('add'))) {
		return 'To create a karma record, go to the Karma tab and click the "+ Create" button. Fill in the user ID, input text, and other details.'
	}
	if (query.includes('export')) {
		return 'You can export data in CSV or JSON format. Look for the "Export CSV" or "Export JSON" buttons in the Users and Karma tabs.'
	}
	if (query.includes('search') || query.includes('find')) {
		return 'Use the search boxes at the top of each tab (Users, Karma, Guidance, Tips) to search and filter records.'
	}
	if (query.includes('config') || query.includes('setting')) {
		return 'Go to the Config tab to view and edit application configurations like referral limits.'
	}
	if (query.includes('audit') || query.includes('log')) {
		return 'Check the Audit tab to see all admin actions and changes made to the system.'
	}
	if (query.includes('help') || query.includes('what can')) {
		return 'I can help you:\n- Navigate to different sections\n- Create/edit/delete records\n- Export data\n- Search and filter\n- View statistics\n- Check audit logs\n\nJust ask me what you need!'
	}
	return 'I understand you\'re asking about: "' + query + '". Try asking about users, karma records, exports, or navigation. Type "help" for more options.'
}

const chatbotContainerStyle: React.CSSProperties = {
	position: 'fixed',
	bottom: 20,
	right: 20,
	width: 400,
	height: 600,
	background: 'rgba(15, 23, 42, 0.95)',
	border: '1px solid rgba(148, 163, 184, 0.3)',
	borderRadius: 12,
	display: 'flex',
	flexDirection: 'column',
	zIndex: 1001,
	boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
}

const chatbotHeaderStyle: React.CSSProperties = {
	padding: '16px 20px',
	borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
	display: 'flex',
	justifyContent: 'space-between',
	alignItems: 'center',
}

const chatbotCloseStyle: React.CSSProperties = {
	background: 'transparent',
	border: 'none',
	color: '#94a3b8',
	fontSize: 24,
	cursor: 'pointer',
	padding: 0,
	width: 30,
	height: 30,
}

const chatbotMessagesStyle: React.CSSProperties = {
	flex: 1,
	overflowY: 'auto',
	padding: 20,
	display: 'flex',
	flexDirection: 'column',
	gap: 12,
}

const chatbotUserMessageStyle: React.CSSProperties = {
	background: 'rgba(59, 130, 246, 0.2)',
	border: '1px solid rgba(59, 130, 246, 0.4)',
	borderRadius: 8,
	padding: '12px 16px',
	color: '#93c5fd',
	fontSize: 14,
	alignSelf: 'flex-end',
	maxWidth: '80%',
}

const chatbotAssistantMessageStyle: React.CSSProperties = {
	background: 'rgba(30, 41, 59, 0.6)',
	border: '1px solid rgba(148, 163, 184, 0.3)',
	borderRadius: 8,
	padding: '12px 16px',
	color: '#cbd5e1',
	fontSize: 14,
	alignSelf: 'flex-start',
	maxWidth: '80%',
	whiteSpace: 'pre-wrap',
}

const chatbotInputStyle: React.CSSProperties = {
	padding: '16px 20px',
	borderTop: '1px solid rgba(148, 163, 184, 0.2)',
	display: 'flex',
	gap: 8,
}

const chatbotInputFieldStyle: React.CSSProperties = {
	flex: 1,
	background: 'rgba(30, 41, 59, 0.6)',
	border: '1px solid rgba(148, 163, 184, 0.3)',
	borderRadius: 8,
	padding: '10px 12px',
	fontSize: 14,
	color: '#f8fafc',
	outline: 'none',
}

const chatbotSendButtonStyle: React.CSSProperties = {
	background: 'rgba(59, 130, 246, 0.2)',
	border: '1px solid rgba(59, 130, 246, 0.4)',
	color: '#93c5fd',
	padding: '10px 20px',
	borderRadius: 8,
	cursor: 'pointer',
	fontSize: 13,
	fontWeight: 600,
}

