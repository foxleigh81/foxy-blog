import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { sanityClient } from '@/sanity/lib/client';
import { groq } from 'next-sanity';
import type { Post } from '@/sanity/schemaTypes/postType';
import type { Category } from '@/sanity/schemaTypes/categoryType';
import BlogHeader from '@/components/BlogHeader';
import PostGrid from '@/components/PostGrid';
import Breadcrumbs from '@/components/Breadcrumbs';
import Pagination from '@/components/Pagination';
import { paginateItems, getPaginationParams } from '@/utils/pagination';

import { metadata } from '../layout';

// Query to fetch posts by category
const postsByCategoryQuery = groq`*[_type == "post" && references(*[_type == "category" && slug.current == $category]._id) && !unlisted] | order(publishedAt desc) {
  _id,
  title,
  slug,
  publishedAt,
  excerpt,
  mainImage {
    asset->{
      _id,
      _type,
      metadata {
        lqip
      }
    },
    alt
  },
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

// Query to fetch a specific category
const categoryQuery = groq`*[_type == "category" && slug.current == $category][0] {
  _id,
  title,
  description
}`;

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  // Ensure params is awaited
  const resolvedParams = await Promise.resolve(params);
  const categorySlug = resolvedParams.category;

  const category = await sanityClient.fetch(categoryQuery, { category: categorySlug });

  // If category doesn't exist, return 404
  if (!category) {
    return {
      title: `Category Not Found | ${metadata.title}`,
      description: 'The requested category does not exist.',
    };
  }

  return {
    title: `${category.title} | ${metadata.title}`,
    description: category.description || `Articles in the ${category.title} category`,
    openGraph: {
      title: `${category.title} | ${metadata.title}`,
      description: category.description || `Articles in the ${category.title} category`,
      type: 'website',
      url: `/${categorySlug}`,
    },
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  // Ensure params is awaited
  const resolvedParams = await Promise.resolve(params);
  const categorySlug = resolvedParams.category;

  // Get pagination parameters
  const paginationParams = getPaginationParams(await Promise.resolve(searchParams));

  // Fetch the current category
  const category: Category | null = await sanityClient.fetch(categoryQuery, {
    category: categorySlug,
  });

  // If category doesn't exist, return 404
  if (!category) {
    notFound();
  }

  // Fetch posts for this category
  const allPosts: Post[] = await sanityClient.fetch(postsByCategoryQuery, {
    category: categorySlug,
  });

  // Paginate the posts
  const { items: posts, currentPage, totalPages } = paginateItems(allPosts, paginationParams);

  // Fetch all categories for reference
  const categories: Category[] = await sanityClient.fetch(categoriesQuery);

  return (
    <main className="container mx-auto px-4">
      <Breadcrumbs category={category} />

      <BlogHeader
        title={category.title}
        subtitle={category.description || `Articles in the ${category.title} category`}
        categories={[]}
        className="mt-4"
      />

      <PostGrid posts={posts} categories={categories} />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={`/${categorySlug}`}
        searchParams={Object.fromEntries(
          Object.entries(await Promise.resolve(searchParams)).filter(([key]) => key !== 'page')
        )}
      />
    </main>
  );
}

// Generate static paths for all categories
export async function generateStaticParams() {
  const categories: Category[] = await sanityClient.fetch(categoriesQuery);

  return categories.map((category) => ({
    category: category.slug.current,
  }));
}
