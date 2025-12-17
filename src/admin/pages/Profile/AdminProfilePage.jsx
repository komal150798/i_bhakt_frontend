import { useState, useEffect } from 'react';
import { adminApi } from '../../../common/api/adminApi';
import { useAdminAuth } from '../../../common/context/AdminAuthContext';
import styles from './AdminProfilePage.module.css';

function AdminProfilePage() {
  const { adminUser } = useAdminAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAdminProfile();
      setProfile(data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      // Fallback to adminUser from context
      if (adminUser) {
        setProfile(adminUser);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await adminApi.updateAdminProfile(profile);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading profile...</div>;
  }

  const displayProfile = profile || adminUser || {};

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>My Profile</h1>
        <button
          className={styles.saveButton}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className={styles.profileCard}>
        <div className={styles.avatarSection}>
          <div className={styles.avatar}>
            {displayProfile.avatar_url ? (
              <img src={displayProfile.avatar_url} alt={displayProfile.name} />
            ) : (
              <div className={styles.avatarInitials}>
                {(displayProfile.name || displayProfile.email || 'A')[0].toUpperCase()}
              </div>
            )}
          </div>
          <h2>{displayProfile.name || displayProfile.email || 'Admin'}</h2>
          <p className={styles.role}>
            {displayProfile.role === 'super_admin' ? 'Super Admin' : 
             displayProfile.role === 'admin' ? 'Admin' : 
             displayProfile.role || 'User'}
          </p>
        </div>

        <div className={styles.formSection}>
          <div className={styles.formGroup}>
            <label>Name</label>
            <input
              type="text"
              value={displayProfile.name || ''}
              onChange={(e) => setProfile({ ...displayProfile, name: e.target.value })}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Email</label>
            <input
              type="email"
              value={displayProfile.email || ''}
              onChange={(e) => setProfile({ ...displayProfile, email: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminProfilePage;

