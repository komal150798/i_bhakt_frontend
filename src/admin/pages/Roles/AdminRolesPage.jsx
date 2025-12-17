import { useState, useEffect } from 'react';
import { adminApi } from '../../../common/api/adminApi';
import DataTable from '../../components/DataTable/DataTable';
import styles from './AdminRolesPage.module.css';

function AdminRolesPage() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      // Assuming endpoint exists - adjust as needed
      const data = await adminApi.getUsers({ role_filter: true });
      setRoles(data.roles || []);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Role Name', sortable: true },
    { key: 'permissions_count', label: 'Permissions', sortable: true },
    { key: 'users_count', label: 'Users', sortable: true },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Roles & Permissions</h1>
      </div>

      <DataTable
        columns={columns}
        data={roles}
        loading={loading}
        emptyMessage="No roles found"
      />
    </div>
  );
}

export default AdminRolesPage;

