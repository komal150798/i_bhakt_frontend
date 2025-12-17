import { useState, useEffect } from 'react';
import { adminApi } from '../../../common/api/adminApi';
import { useAdminAuth } from '../../../common/context/AdminAuthContext';
import DataTable from '../../components/DataTable/DataTable';
import styles from './AdminUserListPage.module.css';

function AdminUserListPage() {
  const { hasPermission, isSuperAdmin } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [adminUsers, setAdminUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    role_id: '',
    is_enabled: '',
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role_id: '',
    is_enabled: true,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const canManage = isSuperAdmin || hasPermission('MANAGE_ADMINS');

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [filters, pagination.page]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (filters.search) params.search = filters.search;
      if (filters.role_id) params.role_id = parseInt(filters.role_id, 10);
      if (filters.is_enabled !== '') params.is_enabled = filters.is_enabled === 'true';

      const response = await adminApi.getAdminUsers(params);
      const data = response.data || response;
      const meta = response.meta || {};
      setAdminUsers(Array.isArray(data) ? data : []);
      setPagination(prev => ({
        ...prev,
        total: meta.total || 0,
        totalPages: meta.totalPages || 1,
      }));
    } catch (error) {
      console.error('Failed to fetch admin users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const data = await adminApi.getRoles();
      setRoles(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    }
  };

  const handleAdd = () => {
    setFormData({ name: '', email: '', role_id: '', is_enabled: true });
    setEditingUser(null);
    setShowAddModal(true);
  };

  const handleEdit = (user) => {
    setFormData({
      name: user.name,
      email: user.email,
      role_id: user.role_id || '',
      is_enabled: user.is_enabled,
    });
    setEditingUser(user);
    setShowAddModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingUser) {
        await adminApi.updateAdminUser(editingUser.admin_id, formData);
      } else {
        await adminApi.createAdminUser(formData);
      }
      setShowAddModal(false);
      fetchData();
    } catch (error) {
      console.error('Failed to save admin user:', error);
      alert(error.message || 'Failed to save admin user');
    }
  };

  const handleChangeRole = async (userId, roleId) => {
    try {
      await adminApi.updateAdminUserRole(userId, roleId);
      fetchData();
    } catch (error) {
      console.error('Failed to update role:', error);
      alert(error.message || 'Failed to update role');
    }
  };

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    {
      key: 'role_name',
      label: 'Role',
      sortable: true,
      render: (value, row) => (
        <select
          value={row.role_id || ''}
          onChange={(e) => handleChangeRole(row.admin_id, parseInt(e.target.value))}
          disabled={!canManage || row.role_name === 'SUPER_ADMIN'}
          className={styles.roleSelect}
        >
          <option value="">No Role</option>
          {roles.map((role) => (
            <option key={role.role_id} value={role.role_id}>
              {role.role_name}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: 'is_enabled',
      label: 'Status',
      render: (value) => (
        <span className={value ? styles.statusActive : styles.statusInactive}>
          {value ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'last_login_at',
      label: 'Last Login',
      render: (value) => (value ? new Date(value).toLocaleString() : 'Never'),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, row) => (
        <div className={styles.actions}>
          {canManage && (
            <>
              <button
                onClick={() => handleEdit(row)}
                className={styles.btnEdit}
                disabled={row.role_name === 'SUPER_ADMIN'}
              >
                Edit
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Admin Users</h1>
        {canManage && (
          <button onClick={handleAdd} className={styles.btnAdd}>
            <i className="bi bi-plus-circle"></i> Add Admin User
          </button>
        )}
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className={styles.searchInput}
        />
        <select
          value={filters.role_id}
          onChange={(e) => setFilters({ ...filters, role_id: e.target.value })}
          className={styles.filterSelect}
        >
          <option value="">All Roles</option>
          {roles.map((role) => (
            <option key={role.role_id} value={role.role_id}>
              {role.role_name}
            </option>
          ))}
        </select>
        <select
          value={filters.is_enabled}
          onChange={(e) => setFilters({ ...filters, is_enabled: e.target.value })}
          className={styles.filterSelect}
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={adminUsers}
        loading={loading}
        emptyMessage="No admin users found"
        pagination={{
          currentPage: pagination.page,
          totalPages: pagination.totalPages,
        }}
        onPageChange={(page) => setPagination({ ...pagination, page })}
      />

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingUser ? 'Edit Admin User' : 'Add Admin User'}</h2>
              <button onClick={() => setShowAddModal(false)} className={styles.modalClose}>
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Role</label>
                <select
                  value={formData.role_id}
                  onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                >
                  <option value="">Select Role</option>
                  {roles.map((role) => (
                    <option key={role.role_id} value={role.role_id}>
                      {role.role_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>
                  <input
                    type="checkbox"
                    checked={formData.is_enabled}
                    onChange={(e) => setFormData({ ...formData, is_enabled: e.target.checked })}
                  />
                  Enabled
                </label>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button onClick={() => setShowAddModal(false)} className={styles.btnCancel}>
                Cancel
              </button>
              <button onClick={handleSave} className={styles.btnSave}>
                {editingUser ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUserListPage;
