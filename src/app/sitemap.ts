import { generateSitemap } from '@/utils/generateSitemap';
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const xml = await generateSitemap();

  // Use a simple regex-based approach to parse the XML
  const urlRegex = /<url>([\s\S]*?)<\/url>/g;
  const locRegex = /<loc>(.*?)<\/loc>/;
  const lastmodRegex = /<lastmod>(.*?)<\/lastmod>/;
  const changefreqRegex = /<changefreq>(.*?)<\/changefreq>/;
  const priorityRegex = /<priority>(.*?)<\/priority>/;

  const urls: MetadataRoute.Sitemap = [];
  let match;

  while ((match = urlRegex.exec(xml)) !== null) {
    const urlContent = match[1];
    const loc = locRegex.exec(urlContent)?.[1] || '';
    const lastmod = lastmodRegex.exec(urlContent)?.[1] || '';
    const changefreq = changefreqRegex.exec(urlContent)?.[1] as
      | 'always'
      | 'hourly'
      | 'daily'
      | 'weekly'
      | 'monthly'
      | 'yearly'
      | 'never'
      | undefined;
    const priority = priorityRegex.exec(urlContent)?.[1]
      ? parseFloat(priorityRegex.exec(urlContent)?.[1] || '0')
      : undefined;

    urls.push({
      url: loc,
      lastModified: lastmod,
      changeFrequency: changefreq,
      priority,
    });
  }

  return urls;
}
