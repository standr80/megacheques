/**
 * Build-time client for the NBLB Content API (Megacheques workspace).
 *
 * Blog content lives in the NBLB platform (Clem). These helpers run at BUILD
 * time so every post is prerendered to static HTML with real URLs, head and
 * schema. All fetches are resilient: API unreachable -> empty data, never a
 * crashed deploy.
 */

const API_ORIGIN = 'https://www.nobrandleftbehind.com';
const TENANT = 'megacheques';
const BASE = `${API_ORIGIN}/api/content/v1/tenants/${TENANT}`;

export interface AuthorLink {
  label: string;
  url: string;
}

export interface PostSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  meta_description: string;
  tags: string[];
  hero_image: string;
  hero_image_alt: string;
  author: string;
  author_title: string;
  author_slug: string;
  published_at: string;
  updated_at: string;
  url: string;
}

export interface Post extends PostSummary {
  body_html: string;
  author_bio: string;
  author_links: AuthorLink[];
}

async function getJSON<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** Every published post (summaries), newest first. Resilient to API failure. */
export async function getAllPosts(): Promise<PostSummary[]> {
  const all: PostSummary[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const data = await getJSON<{ posts: PostSummary[]; total_pages: number }>(
      `${BASE}/posts?page=${page}&per_page=100`,
    );
    if (!data) break;
    all.push(...(data.posts ?? []));
    totalPages = data.total_pages || 1;
    page++;
  } while (page <= totalPages);
  return all;
}

/** A single post including rendered body HTML. Null if not found/unreachable. */
export async function getPost(slug: string): Promise<Post | null> {
  return getJSON<Post>(`${BASE}/posts/${encodeURIComponent(slug)}`);
}

// ── Navigation helpers (pure — used to prerender pagination + tag pages) ──────

export const PAGE_SIZE = 6;

export interface TagCount {
  tag: string;
  count: number;
  slug: string;
}

/** URL-safe slug for a tag: "Charity Cheques" -> "charity-cheques". */
export function tagToSlug(tag: string): string {
  return tag
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Top tags across all posts by frequency (for the "Browse by topic" sidebar). */
export function topTags(posts: PostSummary[], limit = 8): TagCount[] {
  const counts = new Map<string, number>();
  for (const p of posts) for (const t of p.tags || []) counts.set(t, (counts.get(t) || 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([tag, count]) => ({ tag, count, slug: tagToSlug(tag) }));
}

/** Group posts by tag, newest-first within each, for prerendering tag pages. */
export function groupByTag(posts: PostSummary[]): { tag: string; slug: string; posts: PostSummary[] }[] {
  const map = new Map<string, PostSummary[]>();
  for (const p of posts) for (const t of p.tags || []) {
    if (!map.has(t)) map.set(t, []);
    map.get(t)!.push(p);
  }
  return [...map.entries()].map(([tag, ps]) => ({ tag, slug: tagToSlug(tag), posts: ps }));
}

/** Total pages for the index given the page size. */
export function pageCount(total: number, size = PAGE_SIZE): number {
  return Math.max(1, Math.ceil(total / size));
}
