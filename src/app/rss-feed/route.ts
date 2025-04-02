import { sanityClient } from '@/sanity/lib/client';
import { rssFeedQuery } from '@/sanity/lib/queries';

type RssPost = {
  _id: string;
  title: string;
  subtitle?: string;
  slug: string;
  author: string;
  publishedAt: string;
  excerpt: string;
  categories: string[];
  mainImage?: string;
};

export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

export async function GET(): Promise<Response> {
  const posts = await sanityClient.fetch<RssPost[]>(rssFeedQuery);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Foxy's Tale</title>
    <link>${baseUrl}</link>
    <description>The inane mutterings of Alexander Foxleigh</description>
    <language>en-gb</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss-feed" rel="self" type="application/rss+xml" />
    ${posts
      .map(
        (post: RssPost) => `
    <item>
      <title><![CDATA[${post.title}${post.subtitle ? ` - ${post.subtitle}` : ''}]]></title>
      <link>${baseUrl}/blog/${post.slug}</link>
      <guid>${baseUrl}/blog/${post.slug}</guid>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <description><![CDATA[${post.excerpt}]]></description>
      ${post.mainImage ? `<enclosure url="${post.mainImage}" type="image/jpeg" />` : ''}
      ${post.categories
        .map((category: string) => `<category>${category}</category>`)
        .join('\n      ')}
      <author>${post.author}</author>
    </item>`
      )
      .join('\n')}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
