import { useState, useEffect } from 'react';
import { adminApi } from '../../../api/adminApi';
import Loader from '../../../common/components/Loader/Loader';
import styles from './SettingsPage.module.css';

function SettingsPage() {
  const [settings, setSettings] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await adminApi.getSettings();
        setSettings(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await adminApi.updateSettings(settings);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <Loader fullScreen />;
  }

  return (
    <div className={styles.settingsPage}>
      <h1 className="mb-4">Settings</h1>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className="alert alert-success" role="alert">
          Settings saved successfully!
        </div>
      )}
      <div className="card">
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="siteName" className="form-label">
                Site Name
              </label>
              <input
                type="text"
                className="form-control"
                id="siteName"
                name="siteName"
                value={settings.siteName || ''}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="siteEmail" className="form-label">
                Site Email
              </label>
              <input
                type="email"
                className="form-control"
                id="siteEmail"
                name="siteEmail"
                value={settings.siteEmail || ''}
                onChange={handleChange}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;

