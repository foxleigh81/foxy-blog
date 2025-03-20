import { Metadata } from 'next';
import { sanityClient } from '@/sanity/lib/client';
import type { Post } from '@/sanity/schemaTypes/postType';
import type { Category } from '@/sanity/schemaTypes/categoryType';
import PostGrid from '@/components/PostGrid';

import { metadata as siteMetadata } from '../../layout';

// Query to fetch posts by tag
const postsByTagQuery = `*[_type == "post" && $tagName in tags && !unlisted] | order(publishedAt desc) {
  _id,
  title,
  slug,
  publishedAt,
  excerpt,
  mainImage,
  categories
}`;

// Query to fetch all categories
const categoriesQuery = `*[_type == "category"] {
  _id,
  title,
  slug,
  description
}`;

interface TagPageProps {
  params: {
    tag: string;
  };
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  // Ensure params is awaited
  const resolvedParams = await Promise.resolve(params);
  const tag = resolvedParams.tag;
  
  return {
    title: `#${tag} | ${siteMetadata.title}`,
    description: `Articles tagged with #${tag}`,
    openGraph: {
      title: `#${tag} | ${siteMetadata.title}`,
      description: `Articles tagged with #${tag}`,
      type: 'website',
      url: `/tag/${tag}`,
    },
  };
}

export default async function TagPage({ params }: TagPageProps) {
  // Ensure params is awaited
  const resolvedParams = await Promise.resolve(params);
  const tag = resolvedParams.tag;
  
  // Fetch posts for this tag
  const posts: Post[] = await sanityClient.fetch<Post[]>(postsByTagQuery, { 
    tagName: tag 
  });
  
  // Fetch all categories for reference
  const categories: Category[] = await sanityClient.fetch(categoriesQuery);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">#{tag}</h1>
        <p className="text-xl text-gray-600">Articles tagged with #{tag}</p>
      </div>
      
      <PostGrid posts={posts} categories={categories} />
    </main>
  );
}

// Generate static paths for all tags
export async function generateStaticParams() {
  const tags = await sanityClient.fetch(`
    *[_type == "post" && defined(tags) && !unlisted] {
      tags
    }
  `);
  
  // Extract unique tags
  const uniqueTags = new Set<string>();
  tags.forEach((post: { tags: string[] }) => {
    if (post.tags) {
      post.tags.forEach((tag: string) => uniqueTags.add(tag));
    }
  });
  
  return Array.from(uniqueTags).map((tag) => ({
    tag,
  }));
}
