import { Metadata } from 'next';
import { sanityClient } from '@/sanity/lib/client';
import type { Post } from '@/sanity/schemaTypes/postType';
import type { Category } from '@/sanity/schemaTypes/categoryType';
import BlogHeader from '@/components/BlogHeader';
import PostGrid from '@/components/PostGrid';

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
  const category = await sanityClient.fetch(categoryQuery, { category: params.category });
  
  return {
    title: `${category.title} | The Foxy Blog`,
    description: category.description || `Articles in the ${category.title} category`,
    openGraph: {
      title: `${category.title} | The Foxy Blog`,
      description: category.description || `Articles in the ${category.title} category`,
      type: 'website',
      url: `/${params.category}`,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  // Fetch posts for this category
  const posts: Post[] = await sanityClient.fetch(postsByCategoryQuery, { 
    category: params.category 
  });
  
  // Fetch all categories for reference
  const categories: Category[] = await sanityClient.fetch(categoriesQuery);
  
  // Fetch the current category
  const category: Category = await sanityClient.fetch(categoryQuery, { 
    category: params.category 
  });

  return (
    <main className="container mx-auto px-4 py-8">
      <BlogHeader 
        title={category.title} 
        subtitle={category.description || `Articles in the ${category.title} category`} 
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
