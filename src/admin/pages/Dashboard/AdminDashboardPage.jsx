import { useState, useEffect } from 'react';
import { adminApi } from '../../../common/api/adminApi';
import StatsCard from '../../components/StatsCard/StatsCard';
import DataTable from '../../components/DataTable/DataTable';
import styles from './AdminDashboardPage.module.css';

function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard summary
      const summaryData = await adminApi.getDashboardSummary();
      setStats(summaryData);

      // Fetch charts data
      try {
        const chartsData = await adminApi.getDashboardCharts();
        setCharts(chartsData);
      } catch (error) {
        console.warn('Charts data not available:', error);
      }

      // Fetch recent activity (from stats or separate endpoint)
      if (summaryData.recent_users) {
        setRecentActivity(summaryData.recent_users);
      }

      // Fetch notifications
      try {
        const notificationsData = await adminApi.getNotifications(3);
        setNotifications(notificationsData.notifications || notificationsData || []);
      } catch (error) {
        console.warn('Notifications not available:', error);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsColumns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'created_at', label: 'Joined', sortable: true, render: (value) => new Date(value).toLocaleDateString() },
  ];

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loading}>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>Dashboard Overview</h1>
        <p>Welcome back! Here's what's happening with your platform.</p>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <StatsCard
          title="Total Users"
          value={stats?.total_users || 0}
          change={stats?.users_today}
          changeType={stats?.users_today >= 0 ? 'positive' : 'negative'}
          icon="bi-people"
          color="primary"
        />
        <StatsCard
          title="Total Admins"
          value={stats?.total_admins || 0}
          subtitle={`${stats?.admin_count || 0} Admin, ${stats?.super_admin_count || 0} Super Admin`}
          icon="bi-shield-check"
          color="accent"
        />
        <StatsCard
          title="Active Users"
          value={stats?.active_users || 0}
          change={stats?.active_users_change}
          changeType={stats?.active_users_change >= 0 ? 'positive' : 'negative'}
          icon="bi-person-check"
          color="success"
        />
        <StatsCard
          title="Verified Users"
          value={stats?.verified_users || 0}
          icon="bi-check-circle"
          color="info"
        />
        <StatsCard
          title="Users This Week"
          value={stats?.users_this_week || 0}
          icon="bi-calendar-week"
          color="warning"
        />
        <StatsCard
          title="Users This Month"
          value={stats?.users_this_month || 0}
          icon="bi-calendar-month"
          color="secondary"
        />
      </div>

      {/* Charts Section */}
      {charts && (
        <div className={styles.chartsSection}>
          <div className={styles.chartCard}>
            <h2>Karma Trends</h2>
            <div className={styles.chartPlaceholder}>
              {/* Placeholder for chart - integrate chart library here */}
              <p>Chart visualization will be rendered here</p>
              <pre>{JSON.stringify(charts.karma_trends || {}, null, 2)}</pre>
            </div>
          </div>
          <div className={styles.chartCard}>
            <h2>User Signups</h2>
            <div className={styles.chartPlaceholder}>
              {/* Placeholder for chart */}
              <p>Chart visualization will be rendered here</p>
              <pre>{JSON.stringify(charts.user_signups || {}, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity & Notifications */}
      <div className={styles.bottomSection}>
        <div className={styles.section}>
          <h2>Recent Users</h2>
          <DataTable
            columns={statsColumns}
            data={recentActivity}
            loading={loading}
            emptyMessage="No recent users"
          />
        </div>

        <div className={styles.section}>
          <h2>System Notices</h2>
          <div className={styles.notificationsList}>
            {notifications.length === 0 ? (
              <div className={styles.empty}>No notifications</div>
            ) : (
              notifications.map((notification) => (
                <div key={notification.id} className={styles.notificationItem}>
                  <h4>{notification.title}</h4>
                  <p>{notification.message}</p>
                  <span className={styles.time}>
                    {notification.relative_time || notification.created_at}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;

