import { Outlet } from 'react-router-dom';
import HomeHeader from './HomeHeader';
import HomeFooter from './HomeFooter';

function HomeLayout() {
  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Sticky Header */}
      <HomeHeader />
      
      {/* Main Content - Hero carousel and pages render here */}
      <main className="flex-grow-1" style={{ paddingTop: 0 }}>
        <Outlet />
      </main>
      
      {/* Footer */}
      <HomeFooter />
    </div>
  );
}

export default HomeLayout;

