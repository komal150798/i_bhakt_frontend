import { useState, useEffect } from 'react';
import { adminApi } from '../../../common/api/adminApi';
import DataTable from '../../components/DataTable/DataTable';
import styles from './AdminTemplatesPage.module.css';

function AdminTemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sms'); // 'sms' or 'email'

  useEffect(() => {
    fetchTemplates();
  }, [activeTab]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = activeTab === 'sms' 
        ? await adminApi.getSmsTemplates()
        : await adminApi.getEmailTemplates();
      setTemplates(data.templates || data || []);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'template_code', label: 'Code', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'is_active', label: 'Active', sortable: true, render: (value) => value ? 'Yes' : 'No' },
    { key: 'added_date', label: 'Created', sortable: true, render: (value) => value ? new Date(value).toLocaleDateString() : '-' },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Templates Management</h1>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'sms' ? styles.active : ''}`}
            onClick={() => setActiveTab('sms')}
          >
            SMS Templates
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'email' ? styles.active : ''}`}
            onClick={() => setActiveTab('email')}
          >
            Email Templates
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={templates}
        loading={loading}
        emptyMessage={`No ${activeTab} templates found`}
      />
    </div>
  );
}

export default AdminTemplatesPage;

