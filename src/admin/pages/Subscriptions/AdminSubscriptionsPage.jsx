import { useState, useEffect } from 'react';
import { adminApi } from '../../../common/api/adminApi';
import DataTable from '../../components/DataTable/DataTable';
import styles from './AdminSubscriptionsPage.module.css';

function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [formData, setFormData] = useState({
    user_id: '',
    plan_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
  });

  useEffect(() => {
    fetchSubscriptions();
    fetchAvailablePlans();
  }, [currentPage, searchTerm, planFilter, statusFilter]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit,
        ...(searchTerm && { search: searchTerm }),
        ...(planFilter && { plan_type: planFilter }),
        ...(statusFilter !== '' && { is_active: statusFilter === 'active' }),
      };
      const response = await adminApi.getSubscriptions(params);
      const data = response.data || response;
      const meta = response.meta || {};
      setSubscriptions(Array.isArray(data) ? data : []);
      setTotalPages(meta.totalPages || Math.ceil((meta.total || 0) / limit));
      setTotal(meta.total || 0);
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
      alert('Failed to load subscriptions: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailablePlans = async () => {
    try {
      const response = await adminApi.getAvailablePlans();
      const data = response.data || response;
      setAvailablePlans(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    }
  };

  const handleAdd = () => {
    setFormData({
      user_id: '',
      plan_id: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
    });
    setShowAddModal(true);
  };

  const handleEdit = (subscription) => {
    setEditingSubscription(subscription);
    setFormData({
      user_id: subscription.user_id,
      plan_id: subscription.plan_id,
      start_date: subscription.start_date ? new Date(subscription.start_date).toISOString().split('T')[0] : '',
      end_date: subscription.end_date ? new Date(subscription.end_date).toISOString().split('T')[0] : '',
      is_active: subscription.is_active,
    });
    setShowEditModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (showAddModal) {
        await adminApi.createSubscription({
          user_id: parseInt(formData.user_id),
          plan_id: parseInt(formData.plan_id),
          start_date: formData.start_date,
          end_date: formData.end_date || undefined,
        });
        alert('Subscription created successfully!');
      } else {
        await adminApi.updateSubscription(editingSubscription.id, {
          plan_id: parseInt(formData.plan_id),
          start_date: formData.start_date,
          end_date: formData.end_date || null,
          is_active: formData.is_active,
        });
        alert('Subscription updated successfully!');
      }
      setShowAddModal(false);
      setShowEditModal(false);
      setEditingSubscription(null);
      fetchSubscriptions();
    } catch (error) {
      console.error('Failed to save subscription:', error);
      alert('Failed to save subscription: ' + (error.message || 'Unknown error'));
    }
  };

  const handleCancel = async (subscription) => {
    if (!confirm(`Are you sure you want to cancel subscription for ${subscription.user_name || subscription.user_email}?`)) {
      return;
    }

    try {
      const reason = prompt('Cancellation reason (optional):');
      await adminApi.cancelSubscription(subscription.id, reason || undefined);
      alert('Subscription cancelled successfully!');
      fetchSubscriptions();
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      alert('Failed to cancel subscription: ' + (error.message || 'Unknown error'));
    }
  };

  const columns = [
    { key: 'id', label: 'ID', sortable: true },
    {
      key: 'user_name',
      label: 'User',
      sortable: true,
      render: (value, row) => (
        <div>
          <div>{value || row.user_email || 'N/A'}</div>
          <small style={{ color: '#94a3b8', fontSize: '0.75rem' }}>ID: {row.user_id}</small>
        </div>
      ),
    },
    {
      key: 'plan_name',
      label: 'Plan',
      sortable: true,
      render: (value, row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{value || row.plan_type || 'N/A'}</div>
          <small style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{row.plan_type}</small>
        </div>
      ),
    },
    {
      key: 'start_date',
      label: 'Start Date',
      sortable: true,
      render: (value) => (value ? new Date(value).toLocaleDateString() : '-'),
    },
    {
      key: 'end_date',
      label: 'End Date',
      sortable: true,
      render: (value) => (value ? new Date(value).toLocaleDateString() : '-'),
    },
    {
      key: 'is_active',
      label: 'Status',
      sortable: true,
      render: (value, row) => (
        <span
          style={{
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: 600,
            backgroundColor: value ? '#10b981' : '#ef4444',
            color: '#fff',
          }}
        >
          {value ? 'Active' : 'Cancelled'}
        </span>
      ),
    },
    {
      key: 'cancelled_at',
      label: 'Cancelled',
      sortable: true,
      render: (value) => (value ? new Date(value).toLocaleDateString() : '-'),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleEdit(row)}
            style={{
              padding: '4px 12px',
              background: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            Edit
          </button>
          {row.is_active && (
            <button
              onClick={() => handleCancel(row)}
              style={{
                padding: '4px 12px',
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              Cancel
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1>Subscription Management</h1>
        <button onClick={handleAdd} className={styles.addButton}>
          + Add Subscription
        </button>
      </div>

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Search by user email, name, or plan..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className={styles.searchInput}
        />
        <select
          value={planFilter}
          onChange={(e) => {
            setPlanFilter(e.target.value);
            setCurrentPage(1);
          }}
          className={styles.filterSelect}
        >
          <option value="">All Plans</option>
          <option value="awaken">Awaken</option>
          <option value="karma_builder">Karma Builder</option>
          <option value="karma_pro">Karma Pro</option>
          <option value="dharma_master">Dharma Master</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className={styles.filterSelect}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <DataTable
        data={subscriptions}
        columns={columns}
        loading={loading}
        pagination={{
          currentPage,
          totalPages,
          total,
          limit,
          onPageChange: setCurrentPage,
        }}
      />

      {/* Add Modal */}
      {showAddModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>Add New Subscription</h2>
            <form onSubmit={handleSave}>
              <div className={styles.formGroup}>
                <label>User ID *</label>
                <input
                  type="number"
                  value={formData.user_id}
                  onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Plan *</label>
                <select
                  value={formData.plan_id}
                  onChange={(e) => setFormData({ ...formData, plan_id: e.target.value })}
                  required
                >
                  <option value="">Select Plan</option>
                  {availablePlans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} ({plan.plan_type})
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Start Date *</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>End Date (optional)</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
                <small>Leave empty to auto-calculate from plan billing cycle</small>
              </div>
              <div className={styles.modalActions}>
                <button type="submit" className={styles.saveButton}>
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingSubscription && (
        <div className={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>Edit Subscription</h2>
            <form onSubmit={handleSave}>
              <div className={styles.formGroup}>
                <label>User</label>
                <input
                  type="text"
                  value={editingSubscription.user_name || editingSubscription.user_email || editingSubscription.user_id}
                  disabled
                />
              </div>
              <div className={styles.formGroup}>
                <label>Plan *</label>
                <select
                  value={formData.plan_id}
                  onChange={(e) => setFormData({ ...formData, plan_id: e.target.value })}
                  required
                >
                  <option value="">Select Plan</option>
                  {availablePlans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} ({plan.plan_type})
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Start Date *</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>End Date</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  Active
                </label>
              </div>
              <div className={styles.modalActions}>
                <button type="submit" className={styles.saveButton}>
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminSubscriptionsPage;


