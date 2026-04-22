import { SITE_ORIGIN, type PageSeo } from './pageSeoConfig';

const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/favicon.png`;

function setMetaName(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setMetaProperty(property: string, content: string) {
  let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(href: string) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function removeMetaName(name: string) {
  document.querySelector(`meta[name="${name}"]`)?.remove();
}

/**
 * Updates document title, meta description, canonical, Open Graph, and Twitter tags after navigation.
 * Crawlers that execute JS (including Google) see the route-specific values.
 */
export function applyPageSeo(seo: PageSeo) {
  document.title = seo.title;

  setMetaName('description', seo.description);

  const canonical = `${SITE_ORIGIN}${seo.canonicalPath.startsWith('/') ? seo.canonicalPath : `/${seo.canonicalPath}`}`;
  setCanonical(canonical);

  setMetaProperty('og:type', 'website');
  setMetaProperty('og:url', canonical);
  setMetaProperty('og:title', seo.title);
  setMetaProperty('og:description', seo.description);
  setMetaProperty('og:image', DEFAULT_OG_IMAGE);

  setMetaName('twitter:card', 'summary_large_image');
  setMetaName('twitter:title', seo.title);
  setMetaName('twitter:description', seo.description);
  setMetaName('twitter:image', DEFAULT_OG_IMAGE);

  if (seo.robots) {
    setMetaName('robots', seo.robots);
  } else {
    removeMetaName('robots');
  }
}
