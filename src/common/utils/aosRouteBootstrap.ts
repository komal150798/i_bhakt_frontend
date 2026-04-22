/** Routes that render `data-aos` sections (skip loading AOS on app shells like /login). */

const AOS_EXACT = new Set([
  '/',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/refund',
  '/pricing-policy',
  '/disclaimer',
]);

export function pathNeedsAos(pathname: string): boolean {
  const p = pathname.replace(/\/$/, '') || '/';
  return AOS_EXACT.has(p);
}
