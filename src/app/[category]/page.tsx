import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { sanityClient } from '@/sanity/lib/client';
import type { Post } from '@/sanity/schemaTypes/postType';
import type { Category } from '@/sanity/schemaTypes/categoryType';
import BlogHeader from '@/components/BlogHeader';
import PostGrid from '@/components/PostGrid';
import Breadcrumbs from '@/components/Breadcrumbs';

import { metadata } from '../layout';

// Query to fetch posts by category
const postsByCategoryQuery = `*[_type == "post" && references(*[_type == "category" && slug.current == $category]._id) && !unlisted] | order(publishedAt desc) {
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

// Query to fetch a specific category
const categoryQuery = `*[_type == "category" && slug.current == $category][0] {
  _id,
  title,
  description
}`;

interface CategoryPageProps {
  params: {
    category: string;
  };
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

export default async function CategoryPage({ params }: CategoryPageProps) {
  // Ensure params is awaited
  const resolvedParams = await Promise.resolve(params);
  const categorySlug = resolvedParams.category;
  
  // Fetch the current category
  const category: Category | null = await sanityClient.fetch(categoryQuery, { 
    category: categorySlug 
  });
  
  // If category doesn't exist, return 404
  if (!category) {
    notFound();
  }
  
  // Fetch posts for this category
  const posts: Post[] = await sanityClient.fetch(postsByCategoryQuery, { 
    category: categorySlug 
  });
  
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
