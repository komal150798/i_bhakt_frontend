import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { applyPageSeo } from './applyPageSeo';
import { getSeoForPath } from './pageSeoConfig';

/** Applies SEO head tags whenever the route changes (SPA). */
export function RouteSeo() {
  const { pathname } = useLocation();

  useEffect(() => {
    applyPageSeo(getSeoForPath(pathname));
  }, [pathname]);

  return null;
}
