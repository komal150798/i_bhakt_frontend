import { lazy } from 'react';

const HomePage = lazy(() => import('../pages/Home/HomePage'));
const KundliPage = lazy(() => import('../pages/KundliPage/KundliPage'));
const HoroscopePage = lazy(() => import('../pages/HoroscopePage/HoroscopePage'));
const KarmaPage = lazy(() => import('../pages/KarmaPage/KarmaPage'));
const KarmaDashboardPage = lazy(() => import('../pages/KarmaDashboard/KarmaDashboardPage'));
const LoginPage = lazy(() => import('../pages/LoginPage/LoginPage'));
const SignupPage = lazy(() => import('../pages/SignupPage/SignupPage'));
const ReferPage = lazy(() => import('../pages/ReferPage/ReferPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage/ProfilePage'));
const ManifestationPage = lazy(() => import('../../pages/ManifestationPage'));
const DashboardPage = lazy(() => import('../../pages/DashboardPage'));
const PricingPage = lazy(() => import('../../pages/PricingPage'));

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
  {
    path: '/dashboard',
    element: DashboardPage,
  },
  {
    path: '/pricing',
    element: PricingPage,
  },
];
