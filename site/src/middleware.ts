import { defineMiddleware } from 'astro:middleware';
// @ts-ignore — plain .mjs module shared with astro.config.mjs
import { legacyRedirects } from './data/legacy-redirects.mjs';

// The edge routes handle exact legacy URLs ("/contact-us"); requests with a
// trailing slash ("/contact-us/") fall through to the server function, where
// this middleware 301s them to the new page instead of returning a 404.
export const onRequest = defineMiddleware((context, next) => {
  const path = context.url.pathname.replace(/\/+$/, '') || '/';
  const dest = (legacyRedirects as Record<string, string>)[path];
  if (dest && dest !== context.url.pathname) {
    return context.redirect(dest, 301);
  }
  return next();
});
