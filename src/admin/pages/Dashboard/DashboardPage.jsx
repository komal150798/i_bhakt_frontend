import { useState, useEffect } from 'react';
import { adminApi } from '../../../api/adminApi';
import StatsCards from '../../components/StatsCards/StatsCards';
import Loader from '../../../common/components/Loader/Loader';
import styles from './DashboardPage.module.css';

function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminApi.getDashboardStats();
        setStats(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard stats');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return <Loader fullScreen />;
  }

  return (
    <div className={styles.dashboardPage}>
      <h1 className="mb-4">Dashboard</h1>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      <StatsCards />
      <div className="mt-5">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Recent Activity</h5>
            <p className="text-muted">Activity feed will be displayed here</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;

