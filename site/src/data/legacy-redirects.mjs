// Single source of truth for redirects from old WordPress URLs.
// Used by astro.config.mjs (edge 301 routes, exact match without trailing slash)
// and by src/middleware.ts (catches trailing-slash variants that fall through
// to the server function).
export const legacyRedirects = {
  '/buy/reusable-cheque': '/products/reusable-cheque/',
  '/buy/single-use-cheque': '/products/single-use-cheque/',
  '/contact-us': '/contact/',
  '/privacy-policy': '/privacy/',
  '/terms-conditions-of-purchase': '/terms/',
  '/mega-cheque-gallery': '/gallery/',
  '/shop': '/products/',
  '/checkout': '/products/',
  '/giant-cheque-details': '/products/',
  '/technical-details': '/cheque-sizes/',
  '/delivery': '/how-it-works/',
  '/ordering-online': '/how-it-works/',
  '/customer-dashboard': '/',
  '/author/laura-hughes': '/',
  '/category/uncategorized': '/',
};
