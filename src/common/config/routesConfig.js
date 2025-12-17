import { ROUTES } from '../utils/constants';

export const homeRoutes = [
  { path: ROUTES.HOME, name: 'Home' },
  { path: ROUTES.KUNDLI, name: 'Kundli' },
  { path: ROUTES.HOROSCOPE, name: 'Daily Horoscope' },
  { path: ROUTES.REFER, name: 'Refer & Earn' },
];

export const adminRoutes = [
  { path: ROUTES.ADMIN_DASHBOARD, name: 'Dashboard', icon: 'bi-speedometer2' },
  { path: ROUTES.ADMIN_USERS, name: 'Users', icon: 'bi-people' },
  { path: ROUTES.ADMIN_CONTENT, name: 'Content', icon: 'bi-file-text' },
  { path: ROUTES.ADMIN_SETTINGS, name: 'Settings', icon: 'bi-gear' },
];

