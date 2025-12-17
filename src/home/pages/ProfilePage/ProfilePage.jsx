import { useState, useEffect } from 'react';
import { useAuth } from '../../../common/hooks/useAuth';
import { useLanguage } from '../../../common/i18n/LanguageContext';
import { useToast } from '../../../common/hooks/useToast';
import { Navigate } from 'react-router-dom';
import { getCustomerProfile, updateCustomerProfile } from '../../../common/api/customerApi';
import styles from './ProfilePage.module.css';

function ProfilePage() {
  const { user, isAuthenticated, token } = useAuth();
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    date_of_birth: '',
    time_of_birth: '',
    place_name: '',
    latitude: '',
    longitude: '',
    timezone: '',
    gender: '',
  });

  useEffect(() => {
    if (isAuthenticated && token) {
      loadProfile();
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || '',
        date_of_birth: profile.date_of_birth ? profile.date_of_birth.split('T')[0] : '',
        time_of_birth: profile.time_of_birth || '',
        place_name: profile.place_name || '',
        latitude: profile.latitude || '',
        longitude: profile.longitude || '',
        timezone: profile.timezone || 'Asia/Kolkata',
        gender: profile.gender || '',
      });
    }
  }, [profile]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profileData = await getCustomerProfile(token);
      setProfile(profileData);
    } catch (error) {
      console.error('Failed to load profile:', error);
      showError(error.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);

      // Prepare update data (only include fields that have values)
      const updateData = {};
      if (formData.first_name) updateData.first_name = formData.first_name;
      if (formData.last_name) updateData.last_name = formData.last_name;
      if (formData.email) updateData.email = formData.email;
      if (formData.date_of_birth) updateData.date_of_birth = formData.date_of_birth;
      if (formData.time_of_birth) updateData.time_of_birth = formData.time_of_birth;
      if (formData.place_name) updateData.place_name = formData.place_name;
      if (formData.latitude) updateData.latitude = parseFloat(formData.latitude);
      if (formData.longitude) updateData.longitude = parseFloat(formData.longitude);
      if (formData.timezone) updateData.timezone = formData.timezone;
      if (formData.gender) updateData.gender = formData.gender;

      const updated = await updateCustomerProfile(token, updateData);
      setProfile(updated);
      setIsEditing(false);
      showSuccess('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      showError(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className={styles.profilePage}>
        <div className="container py-5">
          <div className="text-center">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.profilePage}>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card">
              <div className="card-body p-4 p-md-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h1>{t('profile.title') || 'My Profile'}</h1>
                  {!isEditing && (
                    <button
                      className="btn btn-primary"
                      onClick={() => setIsEditing(true)}
                    >
                      {t('profile.edit') || 'Edit Profile'}
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">
                          {t('profile.firstName') || 'First Name'}
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">
                          {t('profile.lastName') || 'Last Name'}
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">
                        {t('profile.email') || 'Email'}
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">
                        {t('profile.dateOfBirth') || 'Date of Birth'} *
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        name="date_of_birth"
                        value={formData.date_of_birth}
                        onChange={handleInputChange}
                        required
                      />
                      <small className="text-muted">
                        Required for personalized horoscope and kundli
                      </small>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">
                        {t('profile.timeOfBirth') || 'Time of Birth'}
                      </label>
                      <input
                        type="time"
                        className="form-control"
                        name="time_of_birth"
                        value={formData.time_of_birth}
                        onChange={handleInputChange}
                        step="1"
                      />
                      <small className="text-muted">
                        Format: HH:MM:SS (e.g., 10:30:00)
                      </small>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">
                        {t('profile.placeOfBirth') || 'Place of Birth'}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="place_name"
                        value={formData.place_name}
                        onChange={handleInputChange}
                        placeholder="e.g., Mumbai, India"
                      />
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">
                          {t('profile.latitude') || 'Latitude'}
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          name="latitude"
                          value={formData.latitude}
                          onChange={handleInputChange}
                          step="any"
                          placeholder="e.g., 19.0760"
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">
                          {t('profile.longitude') || 'Longitude'}
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          name="longitude"
                          value={formData.longitude}
                          onChange={handleInputChange}
                          step="any"
                          placeholder="e.g., 72.8777"
                        />
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">
                          {t('profile.timezone') || 'Timezone'}
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="timezone"
                          value={formData.timezone}
                          onChange={handleInputChange}
                          placeholder="e.g., Asia/Kolkata"
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">
                          {t('profile.gender') || 'Gender'}
                        </label>
                        <select
                          className="form-control"
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="d-flex gap-2 mt-4">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={saving}
                      >
                        {saving ? 'Saving...' : (t('profile.save') || 'Save Changes')}
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setIsEditing(false);
                          if (profile) {
                            setFormData({
                              first_name: profile.first_name || '',
                              last_name: profile.last_name || '',
                              email: profile.email || '',
                              date_of_birth: profile.date_of_birth ? profile.date_of_birth.split('T')[0] : '',
                              time_of_birth: profile.time_of_birth || '',
                              place_name: profile.place_name || '',
                              latitude: profile.latitude || '',
                              longitude: profile.longitude || '',
                              timezone: profile.timezone || 'Asia/Kolkata',
                              gender: profile.gender || '',
                            });
                          }
                        }}
                      >
                        {t('profile.cancel') || 'Cancel'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className={styles.profileSection}>
                    <div className={styles.avatarSection}>
                      <div className={styles.avatar}>
                        {profile?.first_name
                          ? profile.first_name[0].toUpperCase()
                          : user?.name
                          ? user.name[0].toUpperCase()
                          : user?.email?.[0].toUpperCase() || 'U'}
                      </div>
                      <h2 className={styles.userName}>
                        {profile?.first_name && profile?.last_name
                          ? `${profile.first_name} ${profile.last_name}`
                          : profile?.first_name || user?.name || 'User'}
                      </h2>
                      <p className={styles.userEmail}>{profile?.email || user?.email}</p>
                    </div>

                    <div className={styles.infoSection}>
                      <div className={styles.infoItem}>
                        <label>{t('profile.email') || 'Email'}</label>
                        <p>{profile?.email || user?.email || 'Not provided'}</p>
                      </div>
                      <div className={styles.infoItem}>
                        <label>{t('profile.dateOfBirth') || 'Date of Birth'}</label>
                        <p>
                          {profile?.date_of_birth
                            ? new Date(profile.date_of_birth).toLocaleDateString()
                            : 'Not provided'}
                        </p>
                      </div>
                      <div className={styles.infoItem}>
                        <label>{t('profile.timeOfBirth') || 'Time of Birth'}</label>
                        <p>{profile?.time_of_birth || 'Not provided'}</p>
                      </div>
                      <div className={styles.infoItem}>
                        <label>{t('profile.placeOfBirth') || 'Place of Birth'}</label>
                        <p>{profile?.place_name || 'Not provided'}</p>
                      </div>
                      {profile?.gender && (
                        <div className={styles.infoItem}>
                          <label>{t('profile.gender') || 'Gender'}</label>
                          <p>{profile.gender}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
