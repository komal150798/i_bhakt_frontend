import { useEffect, useState } from 'react';
import { adminApi } from '../../../common/api/adminApi';
import styles from './AdminPlansPage.module.css';

const PLAN_TYPES = ['awaken', 'karma_builder', 'karma_pro', 'dharma_master'];

const DEFAULT_FORM = {
  plan_type: 'awaken',
  name: '',
  description: '',
  tagline: '',
  monthly_price: '0',
  yearly_price: '',
  currency: 'INR',
  billing_cycle_days: '',
  referral_count_required: '',
  is_popular: false,
  is_featured: false,
  is_enabled: true,
  usage_limits_json: '{}',
  features_json: '[]',
};

function AdminPlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterEnabled, setFilterEnabled] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getPlans();
      setPlans(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      alert(`Failed to fetch plans: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingPlan(null);
    setFormData(DEFAULT_FORM);
    setShowModal(true);
  };

  const openEditModal = (plan) => {
    setEditingPlan(plan);
    setFormData({
      plan_type: plan.plan_type || 'awaken',
      name: plan.name || '',
      description: plan.description || '',
      tagline: plan.tagline || '',
      monthly_price: String(plan.monthly_price ?? 0),
      yearly_price: plan.yearly_price !== null && plan.yearly_price !== undefined ? String(plan.yearly_price) : '',
      currency: plan.currency || 'INR',
      billing_cycle_days:
        plan.billing_cycle_days !== null && plan.billing_cycle_days !== undefined
          ? String(plan.billing_cycle_days)
          : '',
      referral_count_required:
        plan.referral_count_required !== null && plan.referral_count_required !== undefined
          ? String(plan.referral_count_required)
          : '',
      is_popular: !!plan.is_popular,
      is_featured: !!plan.is_featured,
      is_enabled: plan.is_enabled !== false,
      usage_limits_json: JSON.stringify(plan.usage_limits || {}, null, 2),
      features_json: JSON.stringify(plan.features || [], null, 2),
    });
    setShowModal(true);
  };

  const closeModal = () => {
    if (submitting) return;
    setShowModal(false);
    setEditingPlan(null);
    setFormData(DEFAULT_FORM);
  };

  const parseJsonField = (value, label) => {
    try {
      return JSON.parse(value || (label === 'features' ? '[]' : '{}'));
    } catch {
      throw new Error(`Invalid JSON in ${label}`);
    }
  };

  const buildPayload = () => {
    const usage_limits = parseJsonField(formData.usage_limits_json, 'usage_limits');
    const features = parseJsonField(formData.features_json, 'features');

    return {
      plan_type: formData.plan_type,
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      tagline: formData.tagline.trim() || null,
      monthly_price: Number(formData.monthly_price || 0),
      yearly_price: formData.yearly_price === '' ? null : Number(formData.yearly_price),
      currency: formData.currency.trim() || 'INR',
      billing_cycle_days: formData.billing_cycle_days === '' ? null : Number(formData.billing_cycle_days),
      referral_count_required:
        formData.referral_count_required === '' ? null : Number(formData.referral_count_required),
      is_popular: !!formData.is_popular,
      is_featured: !!formData.is_featured,
      is_enabled: !!formData.is_enabled,
      usage_limits,
      features,
    };
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = buildPayload();
      if (!payload.name) {
        throw new Error('Plan name is required');
      }

      if (editingPlan) {
        await adminApi.updatePlan(editingPlan.unique_id, payload);
        alert('Plan updated successfully');
      } else {
        await adminApi.createPlan(payload);
        alert('Plan created successfully');
      }
      closeModal();
      fetchPlans();
    } catch (error) {
      console.error('Failed to save plan:', error);
      alert(error.message || 'Failed to save plan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (plan) => {
    if (!window.confirm(`Delete plan "${plan.name}"?`)) return;
    try {
      await adminApi.deletePlan(plan.unique_id);
      alert('Plan deleted successfully');
      fetchPlans();
    } catch (error) {
      console.error('Failed to delete plan:', error);
      alert(error.message || 'Failed to delete plan');
    }
  };

  const handleToggleEnabled = async (plan) => {
    try {
      await adminApi.updatePlan(plan.unique_id, { is_enabled: !plan.is_enabled });
      fetchPlans();
    } catch (error) {
      console.error('Failed to toggle plan status:', error);
      alert(error.message || 'Failed to update plan status');
    }
  };

  const filteredPlans = plans.filter((plan) => {
    if (filterEnabled === 'enabled') return plan.is_enabled === true;
    if (filterEnabled === 'disabled') return plan.is_enabled === false;
    return true;
  });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Plans Management</h1>
        <button className={styles.primaryBtn} onClick={openCreateModal}>
          + Add Plan
        </button>
      </div>

      <div className={styles.filters}>
        <label>Status:</label>
        <select value={filterEnabled} onChange={(e) => setFilterEnabled(e.target.value)}>
          <option value="all">All</option>
          <option value="enabled">Enabled</option>
          <option value="disabled">Disabled</option>
        </select>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading plans...</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Plan Type</th>
                <th>Yearly Price</th>
                <th>Monthly Price</th>
                <th>Enabled</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlans.map((plan) => (
                <tr key={plan.unique_id}>
                  <td>
                    <div className={styles.name}>{plan.name}</div>
                    <small>{plan.tagline || '-'}</small>
                  </td>
                  <td>{plan.plan_type}</td>
                  <td>{plan.yearly_price ?? '-'}</td>
                  <td>{plan.monthly_price ?? '-'}</td>
                  <td>
                    <button
                      className={plan.is_enabled ? styles.enabled : styles.disabled}
                      onClick={() => handleToggleEnabled(plan)}
                    >
                      {plan.is_enabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button onClick={() => openEditModal(plan)}>Edit</button>
                      <button className={styles.deleteBtn} onClick={() => handleDelete(plan)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPlans.length === 0 && (
                <tr>
                  <td colSpan={6} className={styles.empty}>
                    No plans found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>{editingPlan ? 'Edit Plan' : 'Create Plan'}</h2>
            <form onSubmit={handleSave} className={styles.form}>
              <div className={styles.row}>
                <label>Plan Type</label>
                <select
                  value={formData.plan_type}
                  onChange={(e) => setFormData({ ...formData, plan_type: e.target.value })}
                  disabled={!!editingPlan}
                >
                  {PLAN_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.row}>
                <label>Name</label>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className={styles.row}>
                <label>Tagline</label>
                <input
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                />
              </div>

              <div className={styles.row}>
                <label>Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className={styles.grid}>
                <div className={styles.row}>
                  <label>Monthly Price</label>
                  <input
                    type="number"
                    value={formData.monthly_price}
                    onChange={(e) => setFormData({ ...formData, monthly_price: e.target.value })}
                  />
                </div>
                <div className={styles.row}>
                  <label>Yearly Price</label>
                  <input
                    type="number"
                    value={formData.yearly_price}
                    onChange={(e) => setFormData({ ...formData, yearly_price: e.target.value })}
                  />
                </div>
                <div className={styles.row}>
                  <label>Billing Days</label>
                  <input
                    type="number"
                    value={formData.billing_cycle_days}
                    onChange={(e) => setFormData({ ...formData, billing_cycle_days: e.target.value })}
                  />
                </div>
                <div className={styles.row}>
                  <label>Referral Count Required</label>
                  <input
                    type="number"
                    value={formData.referral_count_required}
                    onChange={(e) =>
                      setFormData({ ...formData, referral_count_required: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className={styles.row}>
                <label>Usage Limits (JSON)</label>
                <textarea
                  rows={4}
                  value={formData.usage_limits_json}
                  onChange={(e) => setFormData({ ...formData, usage_limits_json: e.target.value })}
                />
              </div>

              <div className={styles.row}>
                <label>Features (JSON Array)</label>
                <textarea
                  rows={4}
                  value={formData.features_json}
                  onChange={(e) => setFormData({ ...formData, features_json: e.target.value })}
                />
              </div>

              <div className={styles.checks}>
                <label>
                  <input
                    type="checkbox"
                    checked={formData.is_enabled}
                    onChange={(e) => setFormData({ ...formData, is_enabled: e.target.checked })}
                  />
                  Enabled
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={formData.is_popular}
                    onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                  />
                  Popular
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  />
                  Featured
                </label>
              </div>

              <div className={styles.modalActions}>
                <button type="submit" className={styles.primaryBtn} disabled={submitting}>
                  {submitting ? 'Saving...' : editingPlan ? 'Update Plan' : 'Create Plan'}
                </button>
                <button type="button" className={styles.secondaryBtn} onClick={closeModal}>
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

export default AdminPlansPage;
