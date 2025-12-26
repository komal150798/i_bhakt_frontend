import { useState, useEffect } from 'react';
import { adminApi } from '../../../common/api/adminApi';
import { useAdminAuth } from '../../../common/context/AdminAuthContext';
import DataTable from '../../components/DataTable/DataTable';
import styles from './AIPromptsPage.module.css';

function AIPromptsPage() {
  const { hasPermission, isSuperAdmin } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [prompts, setPrompts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingPrompt, setViewingPrompt] = useState(null);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [filters, setFilters] = useState({
    scope: '',
    type: '',
    is_active: '',
  });
  const [formData, setFormData] = useState({
    key: '',
    scope: '',
    type: 'system',
    template: '',
    description: '',
    model_hint: '',
    language: 'en',
    is_active: true,
  });

  const canManage = isSuperAdmin || hasPermission('MANAGE_AI_PROMPTS');

  useEffect(() => {
    fetchPrompts();
  }, [filters]);

  const fetchPrompts = async () => {
    try {
      setLoading(true);
      const filterParams = {};
      if (filters.scope) filterParams.scope = filters.scope;
      if (filters.type) filterParams.type = filters.type;
      if (filters.is_active !== '') filterParams.is_active = filters.is_active === 'true';
      
      const data = await adminApi.getAIPrompts(filterParams);
      setPrompts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch AI prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({
      key: '',
      scope: '',
      type: 'system',
      template: '',
      description: '',
      model_hint: '',
      language: 'en',
      is_active: true,
    });
    setEditingPrompt(null);
    setShowAddModal(true);
  };

  const handleView = (prompt) => {
    setViewingPrompt(prompt);
    setShowViewModal(true);
  };

  const handleEdit = (prompt) => {
    setFormData({
      key: prompt.key,
      scope: prompt.scope,
      type: prompt.type,
      template: prompt.template,
      description: prompt.description || '',
      model_hint: prompt.model_hint || '',
      language: prompt.language || 'en',
      is_active: prompt.is_active !== undefined ? prompt.is_active : true,
    });
    setEditingPrompt(prompt);
    setShowAddModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingPrompt) {
        await adminApi.updateAIPrompt(editingPrompt.id, formData);
      } else {
        await adminApi.createAIPrompt(formData);
      }
      setShowAddModal(false);
      fetchPrompts();
    } catch (error) {
      console.error('Failed to save prompt:', error);
      alert(error.message || 'Failed to save prompt');
    }
  };

  const handleToggleStatus = async (promptId, currentStatus) => {
    try {
      await adminApi.updateAIPrompt(promptId, { is_active: !currentStatus });
      fetchPrompts();
    } catch (error) {
      console.error('Failed to toggle prompt status:', error);
      alert(error.message || 'Failed to update prompt status');
    }
  };

  const handleDelete = async (promptId) => {
    if (!confirm('Are you sure you want to delete this prompt?')) return;
    try {
      await adminApi.deleteAIPrompt(promptId);
      fetchPrompts();
    } catch (error) {
      console.error('Failed to delete prompt:', error);
      alert(error.message || 'Failed to delete prompt');
    }
  };

  const handleClearCache = async (promptId) => {
    try {
      await adminApi.clearAIPromptCache(promptId);
      alert('Cache cleared successfully');
    } catch (error) {
      console.error('Failed to clear cache:', error);
      alert(error.message || 'Failed to clear cache');
    }
  };

  const columns = [
    { key: 'key', label: 'Key', sortable: true },
    { key: 'scope', label: 'Scope', sortable: true },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (value) => <span className={styles.typeBadge}>{value}</span>,
    },
    {
      key: 'template',
      label: 'Template',
      render: (value) => (
        <div className={styles.templatePreviewCell} title={value}>
          {value && value.length > 80 ? `${value.substring(0, 80)}...` : value}
        </div>
      ),
    },
    { key: 'language', label: 'Language', sortable: true },
    {
      key: 'is_active',
      label: 'Status',
      render: (value, row) => (
        <div className={styles.statusCell}>
          <span className={value ? styles.statusActive : styles.statusInactive}>
            {value ? 'Active' : 'Inactive'}
          </span>
          {canManage && (
            <button
              onClick={() => handleToggleStatus(row.id, value)}
              className={styles.toggleBtn}
              title={value ? 'Disable' : 'Enable'}
            >
              <i className={`bi ${value ? 'bi-toggle-on' : 'bi-toggle-off'}`}></i>
            </button>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, row) => (
        <div className={styles.actions}>
          <button
            onClick={() => handleView(row)}
            className={styles.btnView}
            title="View"
          >
            <i className="bi bi-eye"></i> View
          </button>
          {canManage && (
            <>
              <button
                onClick={() => handleEdit(row)}
                className={styles.btnEdit}
                title="Edit"
              >
                <i className="bi bi-pencil"></i> Edit
              </button>
              <button
                onClick={() => handleClearCache(row.id)}
                className={styles.btnCache}
                title="Clear Cache"
              >
                <i className="bi bi-arrow-clockwise"></i>
              </button>
              <button
                onClick={() => handleDelete(row.id)}
                className={styles.btnDelete}
                title="Delete"
              >
                <i className="bi bi-trash"></i>
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  const scopeOptions = ['', 'karma', 'manifestation', 'user_profile', 'admin', 'chatbot'];
  const typeOptions = ['', 'system', 'user', 'tool', 'instruction'];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>AI Prompts</h1>
        <div className={styles.headerActions}>
          {canManage && (
            <>
              <button onClick={handleAdd} className={styles.btnAdd}>
                <i className="bi bi-plus-circle"></i> Add AI Prompt
              </button>
              <button
                onClick={async () => {
                  if (confirm('Clear all prompt caches?')) {
                    try {
                      await adminApi.clearAllAIPromptCache();
                      alert('All caches cleared successfully');
                    } catch (error) {
                      alert(error.message || 'Failed to clear caches');
                    }
                  }
                }}
                className={styles.btnClearCache}
              >
                <i className="bi bi-arrow-clockwise"></i> Clear All Cache
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label>Scope:</label>
          <select
            value={filters.scope}
            onChange={(e) => setFilters({ ...filters, scope: e.target.value })}
          >
            {scopeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt || 'All Scopes'}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label>Type:</label>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          >
            {typeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt || 'All Types'}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label>Status:</label>
          <select
            value={filters.is_active}
            onChange={(e) => setFilters({ ...filters, is_active: e.target.value })}
          >
            <option value="">All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={prompts}
        loading={loading}
        emptyMessage="No AI prompts found"
      />

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingPrompt ? 'Edit AI Prompt' : 'Add AI Prompt'}</h2>
              <button onClick={() => setShowAddModal(false)} className={styles.modalClose}>
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Key *</label>
                <input
                  type="text"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  placeholder="e.g., karma.classification.system"
                  disabled={!!editingPrompt}
                />
                <small>Unique identifier for the prompt (e.g., scope.function.type)</small>
              </div>
              <div className={styles.formGroup}>
                <label>Scope *</label>
                <select
                  value={formData.scope}
                  onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                >
                  <option value="">Select Scope</option>
                  <option value="karma">Karma</option>
                  <option value="manifestation">Manifestation</option>
                  <option value="user_profile">User Profile</option>
                  <option value="admin">Admin</option>
                  <option value="chatbot">Chatbot</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="system">System</option>
                  <option value="user">User</option>
                  <option value="tool">Tool</option>
                  <option value="instruction">Instruction</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Template *</label>
                <textarea
                  value={formData.template}
                  onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                  placeholder="Prompt template. Use {'{{variable}}'} for placeholders"
                  rows={10}
                />
                <small>Use {'{{variable}}'} for placeholders (e.g., {'{{user_name}}'}, {'{{context}}'})</small>
              </div>
              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description of what this prompt does"
                  rows={3}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Model Hint</label>
                <input
                  type="text"
                  value={formData.model_hint}
                  onChange={(e) => setFormData({ ...formData, model_hint: e.target.value })}
                  placeholder="e.g., gpt-4, gemini-pro, claude-3"
                />
                <small>Optional: Preferred AI model for this prompt</small>
              </div>
              <div className={styles.formGroup}>
                <label>Language</label>
                <input
                  type="text"
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  placeholder="en"
                />
                <small>Language code (default: en)</small>
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
            </div>
            <div className={styles.modalFooter}>
              <button onClick={() => setShowAddModal(false)} className={styles.btnCancel}>
                Cancel
              </button>
              <button onClick={handleSave} className={styles.btnSave}>
                {editingPrompt ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewingPrompt && (
        <div className={styles.modalOverlay} onClick={() => setShowViewModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>View AI Prompt</h2>
              <button onClick={() => setShowViewModal(false)} className={styles.modalClose}>
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.viewSection}>
                <div className={styles.viewField}>
                  <label>Key:</label>
                  <div className={styles.viewValue}>{viewingPrompt.key}</div>
                </div>
                <div className={styles.viewField}>
                  <label>Scope:</label>
                  <div className={styles.viewValue}>{viewingPrompt.scope}</div>
                </div>
                <div className={styles.viewField}>
                  <label>Type:</label>
                  <div className={styles.viewValue}>
                    <span className={styles.typeBadge}>{viewingPrompt.type}</span>
                  </div>
                </div>
                <div className={styles.viewField}>
                  <label>Language:</label>
                  <div className={styles.viewValue}>{viewingPrompt.language || 'en'}</div>
                </div>
                {viewingPrompt.model_hint && (
                  <div className={styles.viewField}>
                    <label>Model Hint:</label>
                    <div className={styles.viewValue}>{viewingPrompt.model_hint}</div>
                  </div>
                )}
                {viewingPrompt.description && (
                  <div className={styles.viewField}>
                    <label>Description:</label>
                    <div className={styles.viewValue}>{viewingPrompt.description}</div>
                  </div>
                )}
                <div className={styles.viewField}>
                  <label>Status:</label>
                  <div className={styles.viewValue}>
                    <span className={viewingPrompt.is_active ? styles.statusActive : styles.statusInactive}>
                      {viewingPrompt.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className={styles.viewField}>
                  <label>Version:</label>
                  <div className={styles.viewValue}>{viewingPrompt.version || 1}</div>
                </div>
                <div className={styles.viewField}>
                  <label>Template:</label>
                  <div className={styles.viewValue}>
                    <pre className={styles.templatePreview}>{viewingPrompt.template}</pre>
                  </div>
                </div>
                <div className={styles.viewField}>
                  <label>Created At:</label>
                  <div className={styles.viewValue}>
                    {viewingPrompt.created_at ? new Date(viewingPrompt.created_at).toLocaleString() : 'N/A'}
                  </div>
                </div>
                <div className={styles.viewField}>
                  <label>Updated At:</label>
                  <div className={styles.viewValue}>
                    {viewingPrompt.updated_at ? new Date(viewingPrompt.updated_at).toLocaleString() : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button onClick={() => setShowViewModal(false)} className={styles.btnCancel}>
                Close
              </button>
              {canManage && (
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleEdit(viewingPrompt);
                  }}
                  className={styles.btnEdit}
                >
                  <i className="bi bi-pencil"></i> Edit
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AIPromptsPage;

