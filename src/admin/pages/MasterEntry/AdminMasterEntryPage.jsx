import { useState, useEffect } from 'react';
import { adminApi } from '../../../common/api/adminApi';
import DataTable from '../../components/DataTable/DataTable';
import styles from './AdminMasterEntryPage.module.css';

function AdminMasterEntryPage() {
  const [masterData, setMasterData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('categories'); // categories, tags, etc.
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchMasterData();
  }, [activeTab]);

  const fetchMasterData = async () => {
    try {
      setLoading(true);
      // This would call an API endpoint for master data
      // For now, using placeholder data
      const data = [];
      setMasterData(data);
    } catch (error) {
      console.error('Failed to fetch master data:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'code', label: 'Code', sortable: true },
    { key: 'status', label: 'Status', sortable: true, render: (value) => value ? 'Active' : 'Inactive' },
    { key: 'created_at', label: 'Created', sortable: true, render: (value) => value ? new Date(value).toLocaleDateString() : '-' },
  ];

  const handleAdd = () => {
    setFormData({});
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      // API call to save master entry
      await fetchMasterData();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to save master entry:', error);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Master Entry</h1>
        <button className={styles.addButton} onClick={handleAdd}>
          <i className="bi bi-plus-circle"></i> Add New
        </button>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'categories' ? styles.active : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          Categories
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'tags' ? styles.active : ''}`}
          onClick={() => setActiveTab('tags')}
        >
          Tags
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'locations' ? styles.active : ''}`}
          onClick={() => setActiveTab('locations')}
        >
          Locations
        </button>
      </div>

      <DataTable
        columns={columns}
        data={masterData}
        loading={loading}
        emptyMessage={`No ${activeTab} found`}
      />

      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Add {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
              <button className={styles.closeButton} onClick={() => setShowModal(false)}>
                <i className="bi bi-x"></i>
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Name</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Code</label>
                <input
                  type="text"
                  value={formData.code || ''}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Status</label>
                <select
                  value={formData.status !== undefined ? formData.status : true}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value === 'true' })}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelButton} onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className={styles.saveButton} onClick={handleSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminMasterEntryPage;
