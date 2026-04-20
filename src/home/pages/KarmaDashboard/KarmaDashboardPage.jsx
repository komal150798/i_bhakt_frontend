import { Navigate } from 'react-router-dom';

/** Legacy URL: /karma/dashboard → single Karma experience at /karma */
function KarmaDashboardPage() {
  return <Navigate to="/karma" replace />;
}

export default KarmaDashboardPage;
