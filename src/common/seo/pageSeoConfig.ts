/** Production site origin — keep in sync with index.html canonical and deployments. */
export const SITE_ORIGIN = 'https://ibhakt.com';

export type PageSeo = {
  title: string;
  description: string;
  /** Path only, e.g. `/about` (canonical becomes SITE_ORIGIN + path) */
  canonicalPath: string;
  /** e.g. `noindex, nofollow` for admin and auth shells */
  robots?: string;
};

const FALLBACK: PageSeo = {
  title: 'iBhakt — AI Manifestation & Vedic Kundli',
  description:
    'iBhakt is a premium AI manifestation platform powered by your Vedic Kundli—free birth chart calculator, karma tracking, and cosmic guidance.',
  canonicalPath: '/',
};

/** Exact paths as returned by React Router (leading slash, no trailing slash except `/`). */
export const PAGE_SEO: Record<string, PageSeo> = {
  '/': {
    title: 'iBhakt — AI Manifestation & Vedic Kundli Platform',
    description:
      'Premium AI-powered manifestation aligned to your Vedic birth chart. Free Kundli calculator, karma tracking, and cosmic guidance.',
    canonicalPath: '/',
  },
  '/kundli': {
    title: 'Free Vedic Kundli & Birth Chart Calculator | iBhakt',
    description:
      'Create your Vedic birth chart with houses, planetary positions, and interpretive context—accurate Kundli tools aligned to classical logic on iBhakt.',
    canonicalPath: '/kundli',
  },
  '/horoscope': {
    title: 'Daily Horoscope & Zodiac Guidance | iBhakt',
    description:
      'Read sign-based guidance and align your day with cosmic themes. Horoscope tools on iBhakt complement your chart and manifestation practice.',
    canonicalPath: '/horoscope',
  },
  '/karma': {
    title: 'Karma Journal & Conscious Action Tracking | iBhakt',
    description:
      'Log actions, notice patterns, and reflect on karmic themes with structured prompts—karma tracking that pairs with your chart on iBhakt.',
    canonicalPath: '/karma',
  },
  '/karma/dashboard': {
    title: 'Your Karma Dashboard | iBhakt',
    description: 'Private karma insights and dashboard for your iBhakt account.',
    canonicalPath: '/karma/dashboard',
    robots: 'noindex, follow',
  },
  '/manifestations': {
    title: 'AI Manifestation & Resonance | iBhakt',
    description:
      'Set intentions, explore fulfillment probability, and get grounded AI guidance tied to your Vedic context—manifestation workspace on iBhakt.',
    canonicalPath: '/manifestations',
  },
  '/refer': {
    title: 'Refer Friends to iBhakt | Rewards',
    description:
      'Share iBhakt with friends and unlock referral benefits. Spiritual tech for Kundli, manifestation, and karma in one place.',
    canonicalPath: '/refer',
  },
  '/about': {
    title: 'About iBhakt — Founders, Mission & Vision',
    description:
      'Meet the founders, learn why iBhakt exists, and how we blend Vedic rigor with ethical AI for manifestation, Kundli, and karma tools.',
    canonicalPath: '/about',
  },
  '/contact': {
    title: 'Contact iBhakt — Support & Inquiries',
    description:
      'Reach iBhakt for billing, product questions, or partnerships. We respond to thoughtful inquiries as quickly as we can.',
    canonicalPath: '/contact',
  },
  '/privacy': {
    title: 'Privacy Policy | iBhakt',
    description:
      'How iBhakt collects, uses, and protects your data—including birth details and account information—for our astrology and manifestation services.',
    canonicalPath: '/privacy',
  },
  '/terms': {
    title: 'Terms of Service | iBhakt',
    description:
      'Terms governing use of the iBhakt website and services, including subscriptions, digital content, and acceptable use.',
    canonicalPath: '/terms',
  },
  '/refund': {
    title: 'Refund & Cancellation Policy | iBhakt',
    description:
      'Refunds, cancellations, and billing rules for iBhakt subscriptions and paid digital features—how to request help and what is typically excluded.',
    canonicalPath: '/refund',
  },
  '/pricing-policy': {
    title: 'Pricing & Display Policy | iBhakt',
    description:
      'How iBhakt displays prices, taxes, and plan types so you know what you are buying before checkout.',
    canonicalPath: '/pricing-policy',
  },
  '/disclaimer': {
    title: 'Disclaimer | iBhakt',
    description:
      'Important limitations on using iBhakt: astrology-inspired software for reflection and planning, not a substitute for professional advice.',
    canonicalPath: '/disclaimer',
  },
  '/login': {
    title: 'Sign In | iBhakt',
    description: 'Sign in to your iBhakt account to access Kundli, manifestations, and karma tools.',
    canonicalPath: '/login',
    robots: 'noindex, follow',
  },
  '/signup': {
    title: 'Create Account | iBhakt',
    description: 'Create a free iBhakt account to save your chart, manifestations, and karma activity.',
    canonicalPath: '/signup',
    robots: 'noindex, follow',
  },
  '/profile': {
    title: 'Your Profile | iBhakt',
    description: 'Manage your iBhakt profile and preferences.',
    canonicalPath: '/profile',
    robots: 'noindex, follow',
  },
};

function adminSeo(path: string): PageSeo {
  const segments = path.split('/').filter(Boolean);
  const sub = segments.slice(1);
  const label =
    sub.length === 0
      ? 'Dashboard'
      : sub.map((s) => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ')).join(' — ');
  return {
    title: `${label} | iBhakt Admin`,
    description: 'Secure administration for the iBhakt platform.',
    canonicalPath: path,
    robots: 'noindex, nofollow',
  };
}

export function getSeoForPath(pathname: string): PageSeo {
  const path = pathname.replace(/\/$/, '') || '/';

  if (path.startsWith('/admin')) {
    return adminSeo(path);
  }

  if (PAGE_SEO[path]) {
    return PAGE_SEO[path];
  }

  return { ...FALLBACK, canonicalPath: path };
}
