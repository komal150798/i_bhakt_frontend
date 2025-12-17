import { useState, useEffect } from 'react';
import { adminApi } from '../../../common/api/adminApi';
import { useAdminAuth } from '../../../common/context/AdminAuthContext';
import DataTable from '../../components/DataTable/DataTable';
import styles from './EmailTemplatesPage.module.css';

function EmailTemplatesPage() {
  const { hasPermission, isSuperAdmin } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    template_code: '',
    name: '',
    subject: '',
    body: '',
    description: '',
    is_html: true,
    is_active: true,
  });

  const canManage = isSuperAdmin || hasPermission('MANAGE_TEMPLATES');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getEmailTemplates();
      setTemplates(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch Email templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({
      template_code: '',
      name: '',
      subject: '',
      body: '',
      description: '',
      is_html: true,
      is_active: true,
    });
    setEditingTemplate(null);
    setShowAddModal(true);
  };

  const handleEdit = (template) => {
    setFormData({
      template_code: template.template_code,
      name: template.name,
      subject: template.subject,
      body: template.body,
      description: template.description || '',
      is_html: template.is_html !== undefined ? template.is_html : true,
      is_active: template.is_active,
    });
    setEditingTemplate(template);
    setShowAddModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingTemplate) {
        await adminApi.updateEmailTemplate(editingTemplate.id, formData);
      } else {
        await adminApi.createEmailTemplate(formData);
      }
      setShowAddModal(false);
      fetchTemplates();
    } catch (error) {
      console.error('Failed to save template:', error);
      alert(error.message || 'Failed to save template');
    }
  };

  const handleToggleStatus = async (templateId, currentStatus) => {
    try {
      await adminApi.toggleEmailTemplateStatus(templateId, !currentStatus);
      fetchTemplates();
    } catch (error) {
      console.error('Failed to toggle template status:', error);
      alert(error.message || 'Failed to update template status');
    }
  };

  const handleDelete = async (templateId) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      await adminApi.deleteEmailTemplate(templateId);
      fetchTemplates();
    } catch (error) {
      console.error('Failed to delete template:', error);
      alert(error.message || 'Failed to delete template');
    }
  };

  const columns = [
    { key: 'template_code', label: 'Template Code', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'subject', label: 'Subject', sortable: true },
    {
      key: 'is_html',
      label: 'Type',
      render: (value) => (value ? 'HTML' : 'Text'),
    },
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
          {canManage && (
            <>
              <button
                onClick={() => handleEdit(row)}
                className={styles.btnEdit}
                title="Edit"
              >
                <i className="bi bi-pencil"></i>
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

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Email Templates</h1>
        {canManage && (
          <button onClick={handleAdd} className={styles.btnAdd}>
            <i className="bi bi-plus-circle"></i> Add Email Template
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={templates}
        loading={loading}
        emptyMessage="No Email templates found"
      />

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingTemplate ? 'Edit Email Template' : 'Add Email Template'}</h2>
              <button onClick={() => setShowAddModal(false)} className={styles.modalClose}>
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Template Code *</label>
                <input
                  type="text"
                  value={formData.template_code}
                  onChange={(e) => setFormData({ ...formData, template_code: e.target.value })}
                  placeholder="e.g., WELCOME_EMAIL"
                  disabled={!!editingTemplate}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Template name"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Subject *</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Email subject"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Body *</label>
                <textarea
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  placeholder="Email body (HTML or text). Use {{variable}} for placeholders"
                  rows={8}
                />
                <small>Use {{variable}} for placeholders. HTML is supported if "Is HTML" is checked.</small>
              </div>
              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Template description"
                  rows={2}
                />
              </div>
              <div className={styles.formGroup}>
                <label>
                  <input
                    type="checkbox"
                    checked={formData.is_html}
                    onChange={(e) => setFormData({ ...formData, is_html: e.target.checked })}
                  />
                  Is HTML
                </label>
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
                {editingTemplate ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmailTemplatesPage;
