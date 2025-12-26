import React from 'react';
import ManifestationResonanceScreen from '../../../components/Manifestation/ManifestationResonanceScreen';

function ManifestationPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at top, #1f2937 0%, #0f172a 45%, #020617 100%)',
      color: '#f8fafc',
    }}>
      <ManifestationResonanceScreen />
    </div>
  );
}

export default ManifestationPage;


