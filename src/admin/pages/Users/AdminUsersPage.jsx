import { useState, useEffect } from 'react';
import { adminApi } from '../../../common/api/adminApi';
import DataTable from '../../components/DataTable/DataTable';
import styles from './AdminUsersPage.module.css';

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit,
        ...(searchTerm && { search: searchTerm }),
      };
      const response = await adminApi.getUsers(params);
      const data = response.data || response;
      const meta = response.meta || {};
      setUsers(Array.isArray(data) ? data : []);
      setTotalPages(meta.totalPages || Math.ceil((meta.total || 0) / limit));
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'first_name', label: 'First Name', sortable: true },
    { key: 'last_name', label: 'Last Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'phone_number', label: 'Phone', sortable: true },
    { key: 'current_plan', label: 'Plan', sortable: true },
    { key: 'is_verified', label: 'Verified', sortable: true, render: (value) => value ? 'Yes' : 'No' },
    { key: 'is_active', label: 'Active', sortable: true, render: (value) => value ? 'Yes' : 'No' },
    { key: 'added_date', label: 'Joined', sortable: true, render: (value) => value ? new Date(value).toLocaleDateString() : '-' },
    { key: 'last_login', label: 'Last Login', sortable: true, render: (value) => value ? new Date(value).toLocaleString() : 'Never' },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Users Management</h1>
        <div className={styles.actions}>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        emptyMessage="No users found"
        pagination={{
          currentPage,
          totalPages,
        }}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

export default AdminUsersPage;

