/** Defer Bootstrap’s bundle so initial JS parse on mobile stays smaller; needed for Pricing FAQ / legacy Header collapse. */
export function scheduleBootstrapJs(): void {
  if (typeof window === 'undefined') return;

  const load = () => {
    void import('bootstrap/dist/js/bootstrap.bundle.min.js');
  };

  const ric = window.requestIdleCallback;
  if (typeof ric === 'function') {
    ric.call(window, () => load(), { timeout: 2500 });
  } else {
    window.setTimeout(load, 200);
  }
}
