import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.foxleigh.me';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/studio/',
        '/admin/',
        '/_next/',
        '/server-sitemap.xml',
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}