import { Outlet, useLocation } from 'react-router-dom';
import HomeHeader from './HomeHeader';
import HomeFooter from './HomeFooter';

/** Full-screen app pages ship their own chrome; avoid double header/footer. */
function HomeLayout() {
  const location = useLocation();
  const isDashboardOnly = location.pathname === '/dashboard';

  return (
    <div className="d-flex flex-column min-vh-100">
      {!isDashboardOnly && <HomeHeader />}

      <main className="flex-grow-1" style={{ paddingTop: 0 }}>
        <Outlet />
      </main>

      {!isDashboardOnly && <HomeFooter />}
    </div>
  );
}

export default HomeLayout;

