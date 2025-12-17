import { useState, useEffect } from 'react';
import { adminApi } from '../../../api/adminApi';
import Table from '../../components/Table/Table';
import Loader from '../../../common/components/Loader/Loader';
import styles from './UsersPage.module.css';

const COLUMNS = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  {
    key: 'createdAt',
    label: 'Joined',
    render: (value) => (value ? new Date(value).toLocaleDateString() : '-'),
  },
];

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await adminApi.getUsers();
        setUsers(data.users || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load users');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleRowClick = (user) => {
    // Navigate to user detail or open modal
    console.log('User clicked:', user);
  };

  if (isLoading) {
    return <Loader fullScreen />;
  }

  return (
    <div className={styles.usersPage}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Users</h1>
        <button className="btn btn-primary">Add User</button>
      </div>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      <Table columns={COLUMNS} data={users} onRowClick={handleRowClick} />
    </div>
  );
}

export default UsersPage;

