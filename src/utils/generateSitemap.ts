import { sanityClient } from '@/sanity/lib/client';
import { groq } from 'next-sanity';

interface SitemapEntry {
  url: string;
  lastModified: string;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

interface SanityPost {
  _id: string;
  slug: {
    current: string;
  };
  publishedAt: string;
  categories: Array<{
    slug: {
      current: string;
    };
  }>;
}

interface SanityCategory {
  _id: string;
  slug: {
    current: string;
  };
}

interface SanityTag {
  _id: string;
  name: string;
}

interface SanityAuthor {
  _id: string;
  slug: {
    current: string;
  };
}

// Static routes that don't need to be fetched from Sanity
const staticRoutes: SitemapEntry[] = [
  {
    url: '/',
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily',
    priority: 1,
  },
  {
    url: '/search',
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily',
    priority: 0.8,
  },
];

// Query to fetch all posts
const postsQuery = groq`*[_type == "post" && !unlisted] {
  _id,
  slug,
  publishedAt,
  categories[]-> {
    slug
  }
}`;

// Query to fetch all categories
const categoriesQuery = groq`*[_type == "category"] {
  _id,
  slug
}`;

// Query to fetch all tags
const tagsQuery = groq`*[_type == "tag"] {
  _id,
  name
}`;

// Query to fetch all authors
const authorsQuery = groq`*[_type == "author"] {
  _id,
  slug
}`;

export async function generateSitemap(): Promise<string> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  // Fetch all dynamic content
  const [posts, categories, tags, authors] = await Promise.all([
    sanityClient.fetch<SanityPost[]>(postsQuery),
    sanityClient.fetch<SanityCategory[]>(categoriesQuery),
    sanityClient.fetch<SanityTag[]>(tagsQuery),
    sanityClient.fetch<SanityAuthor[]>(authorsQuery),
  ]);

  // Generate entries for posts
  const postEntries: SitemapEntry[] = posts.map((post) => ({
    url: `${siteUrl}/${post.categories[0]?.slug.current}/${post.slug.current}`,
    lastModified: post.publishedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Generate entries for categories
  const categoryEntries: SitemapEntry[] = categories.map((category) => ({
    url: `${siteUrl}/${category.slug.current}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // Generate entries for tags
  const tagEntries: SitemapEntry[] = tags.map((tag) => ({
    url: `${siteUrl}/tag/${tag.name}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  // Generate entries for authors
  const authorEntries: SitemapEntry[] = authors.map((author) => ({
    url: `${siteUrl}/author/${author.slug.current}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  // Combine all entries
  const allEntries = [
    ...staticRoutes,
    ...postEntries,
    ...categoryEntries,
    ...tagEntries,
    ...authorEntries,
  ];

  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allEntries
    .map(
      (entry) => `
  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified}</lastmod>
    ${entry.changeFrequency ? `<changefreq>${entry.changeFrequency}</changefreq>` : ''}
    ${entry.priority ? `<priority>${entry.priority}</priority>` : ''}
  </url>`
    )
    .join('')}
</urlset>`;

  return xml;
}
