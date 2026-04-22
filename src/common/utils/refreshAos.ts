/**
 * Refresh AOS after layout/content changes without statically importing `aos` in the page chunk.
 * Safe if AOS is not loaded yet (e.g. devtools); no-op on failure.
 */
export function refreshAos(): void {
  void import('aos')
    .then(({ default: AOS }) => {
      AOS.refresh();
    })
    .catch(() => {});
}
