import { useState, useEffect } from 'react';
import { adminApi } from '../../../common/api/adminApi';
import DataTable from '../../components/DataTable/DataTable';
import styles from './AdminKarmaOverviewPage.module.css';

function AdminKarmaOverviewPage() {
  const [karmaRecords, setKarmaRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  useEffect(() => {
    fetchKarmaRecords();
  }, [currentPage]);

  const fetchKarmaRecords = async () => {
    try {
      setLoading(true);
      const params = {
        limit,
        offset: (currentPage - 1) * limit,
      };
      const data = await adminApi.getKarmaOverview(params);
      setKarmaRecords(data.records || data.items || []);
      setTotalPages(Math.ceil((data.total || 0) / limit));
    } catch (error) {
      console.error('Failed to fetch karma records:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'user_id', label: 'User ID', sortable: true },
    { key: 'action_type', label: 'Action', sortable: true },
    { key: 'karma_score', label: 'Score', sortable: true },
    { key: 'added_date', label: 'Date', sortable: true, render: (value) => value ? new Date(value).toLocaleDateString() : '-' },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Karma Overview</h1>
      </div>

      <DataTable
        columns={columns}
        data={karmaRecords}
        loading={loading}
        emptyMessage="No karma records found"
        pagination={{
          currentPage,
          totalPages,
        }}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

export default AdminKarmaOverviewPage;

