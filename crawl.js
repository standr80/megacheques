import 'dotenv/config';
import FirecrawlApp from '@mendable/firecrawl-js';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const { FIRECRAWL_API_KEY } = process.env;
if (!FIRECRAWL_API_KEY) {
  console.error('Missing FIRECRAWL_API_KEY. Add it to .env.');
  process.exit(1);
}

const TARGET_URL = 'https://www.megacheques.co.uk';
const OUT_DIR    = path.join(process.cwd(), 'crawl-output');
const IMAGE_RE   = /https?:\/\/[^\s"')<>]*\.(?:jpe?g|png|gif|webp|svg)[^\s"')<>]*/gi;

const firecrawl = new FirecrawlApp({ apiKey: FIRECRAWL_API_KEY });

function slugFrom(rawUrl) {
  try {
    const { pathname } = new URL(rawUrl);
    const clean = pathname.replace(/\/$/, '') || 'index';
    return clean.replace(/^\//, '').replace(/\//g, '__') || 'index';
  } catch {
    return 'index';
  }
}

function extractImages(texts) {
  const combined = texts.filter(Boolean).join('\n');
  const matches  = combined.match(IMAGE_RE) ?? [];
  return [...new Set(matches)];
}

async function main() {
  console.log(`\nStarting crawl of ${TARGET_URL} …\n`);

  const crawlResult = await firecrawl.crawlUrl(TARGET_URL, {
    limit: 200,
    scrapeOptions: {
      formats: ['markdown', 'html'],
      onlyMainContent: true,
      waitFor: 3000,
    },
  });

  if (!crawlResult.success) {
    throw new Error(`Crawl failed: ${crawlResult.error}`);
  }

  const pages = crawlResult.data ?? [];
  console.log(`Crawled ${pages.length} page(s). Saving locally …\n`);

  await mkdir(path.join(OUT_DIR, 'markdown'), { recursive: true });
  await mkdir(path.join(OUT_DIR, 'html'), { recursive: true });

  const allImages = new Set();
  const index = [];

  for (const page of pages) {
    const sourceURL = page.metadata?.sourceURL ?? page.url ?? '';
    const slug      = slugFrom(sourceURL);
    const title     = page.metadata?.title ?? '';
    const desc      = page.metadata?.description ?? '';
    const md        = page.markdown ?? '';
    const html      = page.html ?? '';

    await writeFile(path.join(OUT_DIR, 'markdown', `${slug}.md`), md, 'utf8');
    await writeFile(path.join(OUT_DIR, 'html', `${slug}.html`), html, 'utf8');

    for (const img of extractImages([md, html])) allImages.add(img);

    index.push({ slug, url: sourceURL, title, description: desc });
    console.log(`  [OK] ${slug}  →  ${sourceURL}`);
  }

  await writeFile(
    path.join(OUT_DIR, 'index.json'),
    JSON.stringify(index, null, 2),
    'utf8'
  );
  await writeFile(
    path.join(OUT_DIR, 'images.json'),
    JSON.stringify([...allImages], null, 2),
    'utf8'
  );

  console.log(`
─────────────────────────────────────────
Pages saved   : ${pages.length}
Images found  : ${allImages.size}
Output dir    : ${OUT_DIR}
─────────────────────────────────────────
Done.
`);
}

main().catch((err) => {
  console.error('\nFatal error:', err.message);
  process.exit(1);
});
