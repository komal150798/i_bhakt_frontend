import React from 'react';
import ManifestationDashboard from '../components/Manifestation/ManifestationDashboard';

function ManifestationPage() {
  // Ensure dashboard shows first - this is the main manifestation page
  React.useEffect(() => {
    console.log('[ManifestationPage] Rendering dashboard view');
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at top, #1f2937 0%, #0f172a 45%, #020617 100%)',
      color: '#f8fafc',
      padding: '24px',
    }}>
      <ManifestationDashboard />
    </div>
  );
}

export default ManifestationPage;
