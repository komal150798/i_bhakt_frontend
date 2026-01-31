import HomePage from '../pages/Home/HomePage';
import KundliPage from '../pages/KundliPage/KundliPage';
import HoroscopePage from '../pages/HoroscopePage/HoroscopePage';
import KarmaPage from '../pages/KarmaPage/KarmaPage';
import KarmaDashboardPage from '../pages/KarmaDashboard/KarmaDashboardPage';
import LoginPage from '../pages/LoginPage/LoginPage';
import SignupPage from '../pages/SignupPage/SignupPage';
import ReferPage from '../pages/ReferPage/ReferPage';
import ProfilePage from '../pages/ProfilePage/ProfilePage';
// Use the correct ManifestationPage with Dashboard (not the form screen)
import ManifestationPage from '../../pages/ManifestationPage';

export const homeRoutes = [
  {
    path: '/',
    element: HomePage,
    index: true,
  },
  {
    path: '/kundli',
    element: KundliPage,
  },
  {
    path: '/horoscope',
    element: HoroscopePage,
  },
  {
    path: '/karma',
    element: KarmaPage,
  },
  {
    path: '/karma/dashboard',
    element: KarmaDashboardPage,
  },
  {
    path: '/login',
    element: LoginPage,
  },
  {
    path: '/signup',
    element: SignupPage,
  },
  {
    path: '/refer',
    element: ReferPage,
  },
  {
    path: '/profile',
    element: ProfilePage,
  },
  {
    path: '/manifestations',
    element: ManifestationPage,
  },
];
