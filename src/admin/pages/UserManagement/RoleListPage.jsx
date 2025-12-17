import { useState, useEffect } from 'react';
import { adminApi } from '../../../common/api/adminApi';
import { useAdminAuth } from '../../../common/context/AdminAuthContext';
import DataTable from '../../components/DataTable/DataTable';
import RolePermissionDrawer from './RolePermissionDrawer';
import styles from './RoleListPage.module.css';

function RoleListPage() {
  const { hasPermission, isSuperAdmin } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    is_enabled: '',
  });
  const [selectedRole, setSelectedRole] = useState(null);
  const [showPermissionDrawer, setShowPermissionDrawer] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({
    role_name: '',
    role_level: 99,
    is_enabled: true,
  });

  const canManage = isSuperAdmin || hasPermission('MANAGE_ROLES');

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.is_enabled !== '') params.is_enabled = filters.is_enabled === 'true';

      const data = await adminApi.getRoles(params);
      const rolesList = Array.isArray(data) ? data : (data.data || []);
      // Ensure all roles have role_id
      const rolesWithId = rolesList.map(role => ({
        ...role,
        role_id: role.role_id || role.id,
        id: role.id || role.role_id,
      }));
      setRoles(rolesWithId);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({ role_name: '', role_level: 99, is_enabled: true });
    setEditingRole(null);
    setShowAddModal(true);
  };

  const handleEdit = (role) => {
    setFormData({
      role_name: role.role_name,
      role_level: role.role_level || 99,
      is_enabled: role.is_enabled,
    });
    setEditingRole(role);
    setShowAddModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingRole) {
        const roleId = editingRole.role_id || editingRole.id;
        if (!roleId) {
          alert('Role ID is missing');
          return;
        }
        await adminApi.updateRole(roleId, formData);
      } else {
        await adminApi.createRole(formData);
      }
      setShowAddModal(false);
      fetchData();
    } catch (error) {
      console.error('Failed to save role:', error);
      alert(error.message || 'Failed to save role');
    }
  };

  const handleDelete = async (roleId) => {
    if (!confirm('Are you sure you want to delete this role?')) return;
    try {
      await adminApi.deleteRole(roleId);
      fetchData();
    } catch (error) {
      console.error('Failed to delete role:', error);
      alert(error.message || 'Failed to delete role');
    }
  };

  const handleManagePermissions = async (role) => {
    const roleId = role.role_id || role.id;
    if (!roleId) {
      console.error('Role ID is missing in role object:', role);
      alert('Role ID is missing');
      return;
    }
    
    try {
      // Use the role directly from the table, ensuring it has role_id
      const roleWithId = {
        ...role,
        role_id: roleId,
        id: roleId,
      };
      setSelectedRole(roleWithId);
      setShowPermissionDrawer(true);
    } catch (error) {
      console.error('Failed to open permission drawer:', error);
      alert(error.message || 'Failed to load role permissions');
    }
  };

  const columns = [
    { key: 'role_name', label: 'Role Name', sortable: true },
    {
      key: 'role_level',
      label: 'Level',
      sortable: true,
      render: (value) => value || 'N/A',
    },
    {
      key: 'is_enabled',
      label: 'Status',
      render: (value) => (
        <span className={value ? styles.statusActive : styles.statusInactive}>
          {value ? 'Enabled' : 'Disabled'}
        </span>
      ),
    },
    {
      key: 'is_editable',
      label: 'Editable',
      render: (value) => (value ? 'Yes' : 'No'),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, row) => {
        const roleId = row.role_id || row.id;
        return (
          <div className={styles.actions}>
            <button
              onClick={() => handleManagePermissions(row)}
              className={styles.btnPermissions}
              disabled={!roleId}
            >
              Manage Permissions
            </button>
            {canManage && row.is_editable && (
              <>
                <button
                  onClick={() => handleEdit(row)}
                  className={styles.btnEdit}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(roleId)}
                  className={styles.btnDelete}
                  disabled={row.role_name === 'SUPER_ADMIN' || !roleId}
                >
                  Delete
                </button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Roles & Permissions</h1>
        {canManage && (
          <button onClick={handleAdd} className={styles.btnAdd}>
            <i className="bi bi-plus-circle"></i> Add Role
          </button>
        )}
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Search roles..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className={styles.searchInput}
        />
        <select
          value={filters.is_enabled}
          onChange={(e) => setFilters({ ...filters, is_enabled: e.target.value })}
          className={styles.filterSelect}
        >
          <option value="">All Status</option>
          <option value="true">Enabled</option>
          <option value="false">Disabled</option>
        </select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={roles}
        loading={loading}
        emptyMessage="No roles found"
      />

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingRole ? 'Edit Role' : 'Add Role'}</h2>
              <button onClick={() => setShowAddModal(false)} className={styles.modalClose}>
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Role Name</label>
                <input
                  type="text"
                  value={formData.role_name}
                  onChange={(e) => setFormData({ ...formData, role_name: e.target.value })}
                  disabled={editingRole && editingRole.role_name === 'SUPER_ADMIN'}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Role Level (lower = higher privilege)</label>
                <input
                  type="number"
                  value={formData.role_level}
                  onChange={(e) => setFormData({ ...formData, role_level: parseInt(e.target.value) || 99 })}
                  min="1"
                  max="99"
                />
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
                {editingRole ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permission Drawer */}
      {showPermissionDrawer && selectedRole && (
        <RolePermissionDrawer
          role={selectedRole}
          onClose={() => {
            setShowPermissionDrawer(false);
            setSelectedRole(null);
          }}
          onSave={() => {
            setShowPermissionDrawer(false);
            setSelectedRole(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

export default RoleListPage;
