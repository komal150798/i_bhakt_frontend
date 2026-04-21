import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../../../common/api/adminApi';
import DataTable from '../../components/DataTable/DataTable';
import styles from './AdminTestimonialsPage.module.css';

const CATEGORIES = [
  { value: 'manifestation', label: 'Manifestation' },
  { value: 'career', label: 'Career' },
  { value: 'love', label: 'Love' },
  { value: 'spiritual', label: 'Spiritual' },
  { value: 'karma', label: 'Karma' },
];

const emptyForm = () => ({
  name: '',
  message: '',
  rating: 5,
  category: 'manifestation',
  location: '',
  avatar_url: '',
  is_featured: false,
  is_enabled: true,
  display_order: 0,
});

function AdminTestimonialsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [okMsg, setOkMsg] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getTestimonialsAdmin();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || 'Failed to load testimonials');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm());
    setEditingId(null);
  };

  const startEdit = (row) => {
    setEditingId(row.id);
    setForm({
      name: row.name || '',
      message: row.message || '',
      rating: row.rating ?? 5,
      category: row.category || 'manifestation',
      location: row.location || '',
      avatar_url: row.avatar_url || '',
      is_featured: !!row.is_featured,
      is_enabled: row.is_enabled !== false,
      display_order: row.display_order ?? 0,
    });
    setError(null);
    setOkMsg(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const buildPayload = () => {
    const payload = {
      name: form.name.trim(),
      message: form.message.trim(),
      rating: Number(form.rating),
      category: form.category,
      is_featured: !!form.is_featured,
      is_enabled: !!form.is_enabled,
      display_order: Number(form.display_order) || 0,
    };
    const loc = form.location.trim();
    const av = form.avatar_url.trim();
    if (loc) payload.location = loc;
    if (av) payload.avatar_url = av;
    return payload;
  };

  const validateLocal = () => {
    if (form.name.trim().length < 2) return 'Name must be at least 2 characters.';
    if (form.message.trim().length < 10) return 'Message must be at least 10 characters.';
    if (!CATEGORIES.some((c) => c.value === form.category)) return 'Pick a valid category.';
    const r = Number(form.rating);
    if (r < 1 || r > 5 || Number.isNaN(r)) return 'Rating must be between 1 and 5.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setOkMsg(null);
    const v = validateLocal();
    if (v) {
      setError(v);
      return;
    }
    const payload = buildPayload();
    try {
      if (editingId) {
        await adminApi.updateTestimonial(editingId, payload);
        setOkMsg('Testimonial updated.');
      } else {
        await adminApi.createTestimonial(payload);
        setOkMsg('Testimonial created.');
      }
      resetForm();
      await load();
    } catch (err) {
      setError(err.message || 'Save failed');
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete testimonial from "${row.name}"? This removes it from the site.`)) return;
    setError(null);
    setOkMsg(null);
    try {
      await adminApi.deleteTestimonial(row.id);
      setOkMsg('Testimonial deleted.');
      if (editingId === row.id) resetForm();
      await load();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  const columns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'rating', label: 'Rating', sortable: true },
    {
      key: 'is_featured',
      label: 'Featured',
      sortable: true,
      render: (v) => (v ? 'Yes' : 'No'),
    },
    {
      key: 'is_enabled',
      label: 'Enabled',
      sortable: true,
      render: (v) => (v !== false ? 'Yes' : 'No'),
    },
    { key: 'display_order', label: 'Order', sortable: true },
    {
      key: '_actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="d-flex gap-2 flex-wrap">
          <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => startEdit(row)}>
            Edit
          </button>
          <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(row)}>
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Testimonials</h1>
        <p className={styles.hint}>
          Featured + enabled items appear on the home page (up to 6). Other rows are stored but not shown publicly
          unless enabled and featured as appropriate.
        </p>
      </div>

      {error && <div className={styles.alertError}>{error}</div>}
      {okMsg && <div className={styles.alertOk}>{okMsg}</div>}

      <div className={styles.formCard}>
        <h2 className="h5 mb-3">{editingId ? `Edit #${editingId}` : 'Add testimonial'}</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            <div>
              <label className="form-label">Name *</label>
              <input
                className="form-control"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                maxLength={100}
              />
            </div>
            <div>
              <label className="form-label">Category *</label>
              <select className="form-select" value={form.category} onChange={(e) => setField('category', e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Rating *</label>
              <select className="form-select" value={form.rating} onChange={(e) => setField('rating', e.target.value)}>
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} stars
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Display order</label>
              <input
                type="number"
                className="form-control"
                value={form.display_order}
                onChange={(e) => setField('display_order', e.target.value)}
                min={0}
              />
            </div>
            <div>
              <label className="form-label">Location</label>
              <input
                className="form-control"
                value={form.location}
                onChange={(e) => setField('location', e.target.value)}
                maxLength={100}
                placeholder="City, Country"
              />
            </div>
            <div>
              <label className="form-label">Avatar URL</label>
              <input
                className="form-control"
                value={form.avatar_url}
                onChange={(e) => setField('avatar_url', e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="d-flex align-items-center gap-3 mt-2">
              <div className="form-check">
                <input
                  id="tf-featured"
                  type="checkbox"
                  className="form-check-input"
                  checked={form.is_featured}
                  onChange={(e) => setField('is_featured', e.target.checked)}
                />
                <label className="form-check-label" htmlFor="tf-featured">
                  Featured on home
                </label>
              </div>
              <div className="form-check">
                <input
                  id="tf-enabled"
                  type="checkbox"
                  className="form-check-input"
                  checked={form.is_enabled}
                  onChange={(e) => setField('is_enabled', e.target.checked)}
                />
                <label className="form-check-label" htmlFor="tf-enabled">
                  Enabled
                </label>
              </div>
            </div>
            <div className={styles.fullRow}>
              <label className="form-label">Message *</label>
              <textarea
                className="form-control"
                rows={4}
                value={form.message}
                onChange={(e) => setField('message', e.target.value)}
                maxLength={1000}
              />
            </div>
          </div>
          <div className={styles.actions}>
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Update' : 'Create'}
            </button>
            {editingId && (
              <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>
                Cancel edit
              </button>
            )}
          </div>
        </form>
      </div>

      <DataTable columns={columns} data={rows} loading={loading} emptyMessage="No testimonials yet" />
    </div>
  );
}

export default AdminTestimonialsPage;
