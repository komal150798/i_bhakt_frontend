import React from 'react';
import ManifestationDashboard from '../components/Manifestation/ManifestationDashboard';
import ManifestationResonanceScreen from '../components/Manifestation/ManifestationResonanceScreen';

function ManifestationPage() {
  const isLoggedIn = !!localStorage.getItem('ibhakt_token');

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at top, #1f2937 0%, #0f172a 45%, #020617 100%)',
      color: '#f8fafc',
      padding: '24px',
    }}>
      {isLoggedIn ? <ManifestationDashboard /> : <ManifestationResonanceScreen />}
    </div>
  );
}

export default ManifestationPage;
