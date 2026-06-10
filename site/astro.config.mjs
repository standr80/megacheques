// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import { legacyRedirects } from './src/data/legacy-redirects.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.megacheques.co.uk',
  output: 'static',   // static by default; API routes opt in to server rendering via prerender=false
  adapter: vercel(),
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/order-confirmed'),
    }),
  ],
  // Permanent redirects from old WordPress URLs so existing Google
  // rankings and inbound links survive the migration. Edge routes catch the
  // exact paths; src/middleware.ts catches trailing-slash variants.
  redirects: legacyRedirects,
  vite: {
    plugins: [tailwindcss()]
  }
});
