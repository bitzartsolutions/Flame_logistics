import { rewrite, next } from '@vercel/functions';

// Mirrors the User-Agent based detection in server.js (used for local dev),
// so production behaves the same way: clean URLs like /home, /services, etc.
// are served directly without redirecting to /pages/desktop/... or /pages/mobile/...
const MOBILE_UA_REGEX = /Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|Windows Phone|Mobile(?!.*iPad)/i;

// Every page that actually exists under pages/desktop/ and pages/mobile/.
// "admin" is deliberately excluded - it's a single unified file handled by
// the existing vercel.json rewrite, not split into desktop/mobile versions.
const KNOWN_PAGES = new Set([
  'about', 'blog-post', 'blog', 'careers', 'contact',
  'container-transportation', 'customs-clearance', 'documentation-services',
  'exhibition-cargo-handling', 'gallery', 'global-network', 'home',
  'industrial-crating', 'industries', 'job-detail', 'land-transportation',
  'last-mile-delivery', 'office-shifting', 'packing-moving',
  'project-cargo-handling', 'services', 'solutions', 'terminal-services',
  'warehousing-distribution'
]);

export const config = {
  matcher: '/((?!api|assets|components|pages|admin|favicon.ico).*)',
};

export default function middleware(request) {
  const url = new URL(request.url);

  // Redirect any trailing-slash URL (e.g. /services/) to its slash-less form
  // (/services). Without this, a relative link like href="solutions" on that
  // page would resolve against the trailing slash into a broken
  // /services/solutions instead of /solutions.
  if (url.pathname !== '/' && url.pathname.endsWith('/')) {
    const target = new URL(url.pathname.slice(0, -1) + url.search, request.url);
    return Response.redirect(target, 308);
  }

  let pageName = url.pathname === '/' ? 'home' : url.pathname.replace(/^\//, '');

  if (pageName.endsWith('.html')) {
    pageName = pageName.slice(0, -5);
  }

  // Skip anything with extra path segments or an unrecognized page name -
  // let normal static routing / 404 handling take over.
  if (pageName.includes('/') || !KNOWN_PAGES.has(pageName)) {
    return next();
  }

  const userAgent = request.headers.get('user-agent') || '';
  const folder = MOBILE_UA_REGEX.test(userAgent) ? 'mobile' : 'desktop';

  const target = new URL(`/pages/${folder}/${pageName}.html${url.search}`, request.url);
  return rewrite(target);
}
