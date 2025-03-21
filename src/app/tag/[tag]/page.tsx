import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { sanityClient } from '@/sanity/lib/client';
import { groq } from 'next-sanity';
import type { Post } from '@/sanity/schemaTypes/postType';
import type { Category } from '@/sanity/schemaTypes/categoryType';
import type { Tag } from '@/sanity/schemaTypes/tagType';
import PostGrid from '@/components/PostGrid';
import Breadcrumbs from '@/components/Breadcrumbs';

import { metadata as siteMetadata } from '../../layout';

// Query to fetch tag data
const tagDataQuery = groq`*[_type == "tag" && name == $name][0] {
  _id,
  name,
  color
}`;

// Query to fetch posts by tag reference
const postsByTagQuery = groq`*[_type == "post" && references(*[_type == "tag" && name == $name]._id) && !unlisted] | order(publishedAt desc) {
  _id,
  title,
  slug,
  publishedAt,
  excerpt,
  mainImage,
  categories,
  tags
}`;

// Query to fetch all categories
const categoriesQuery = groq`*[_type == "category"] {
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
  const tagName = resolvedParams.tag;

  // Fetch tag data to get proper name
  const tagData = await sanityClient.fetch<Tag | null>(tagDataQuery, { name: tagName });

  // If tag not found, use the URL parameter
  if (!tagData) {
    return {
      title: `#${tagName} | ${siteMetadata.title}`,
      description: `Articles tagged with #${tagName}`,
      openGraph: {
        title: `#${tagName} | ${siteMetadata.title}`,
        description: `Articles tagged with #${tagName}`,
        type: 'website',
        url: `/tag/${tagName}`,
      },
    };
  }

  return {
    title: `#${tagData.name} | ${siteMetadata.title}`,
    description: `Articles tagged with #${tagData.name}`,
    openGraph: {
      title: `#${tagData.name} | ${siteMetadata.title}`,
      description: `Articles tagged with #${tagData.name}`,
      type: 'website',
      url: `/tag/${tagData.name}`,
    },
  };
}

export default async function TagPage({ params }: TagPageProps) {
  // Ensure params is awaited
  const resolvedParams = await Promise.resolve(params);
  const tagName = resolvedParams.tag;

  // Fetch tag data
  const tagData = await sanityClient.fetch<Tag | null>(tagDataQuery, { name: tagName });

  // If tag not found, return 404
  if (!tagData) {
    notFound();
  }

  // Fetch posts for this tag
  const posts: Post[] = await sanityClient.fetch<Post[]>(postsByTagQuery, {
    name: tagName
  });

  // Fetch all categories for reference
  const categories: Category[] = await sanityClient.fetch(categoriesQuery);

  return (
    <main className="container mx-auto px-4">
      <Breadcrumbs tagName={tagData.name} />

      <div className="mt-4 py-6 rounded-lg">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">
            #{tagData.name}
          </h1>
        </div>
        <p className="text-xl mt-2">
          Articles tagged with #{tagData.name}
        </p>
      </div>

      <PostGrid posts={posts} categories={categories} />
    </main>
  );
}

// Generate static paths for all tags
export async function generateStaticParams() {
  const tags = await sanityClient.fetch(groq`
    *[_type == "tag"] {
      "tag": name
    }
  `);

  return tags;
}
