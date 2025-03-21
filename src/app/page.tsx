import { sanityClient } from '@/sanity/lib/client'
import { groq } from 'next-sanity'
import type { Post } from '@/sanity/schemaTypes/postType'
import type { Category } from '@/sanity/schemaTypes/categoryType'
import PostGrid from '@/components/PostGrid'
import Pagination from '@/components/Pagination'
import { paginateItems, getPaginationParams } from '@/utils/pagination'

// Query to fetch posts with all necessary fields
const postsQuery = groq`*[_type == "post" && !unlisted] | order(publishedAt desc) {
  _id,
  title,
  slug,
  mainImage,
  excerpt,
  categories,
  publishedAt,
  tags
}`

// Query to fetch all categories
const categoriesQuery = groq`*[_type == "category"] {
  _id,
  title,
  slug,
  description
}`

interface HomePageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function BlogIndex({ searchParams }: HomePageProps) {
  // Get pagination parameters
  const paginationParams = getPaginationParams(searchParams);
  
  // Fetch posts and categories in parallel
  const [allPosts, categories] = await Promise.all([
    sanityClient.fetch<Post[]>(postsQuery),
    sanityClient.fetch<Category[]>(categoriesQuery)
  ])

  // Paginate the posts
  const { items: posts, currentPage, totalPages } = paginateItems(allPosts, paginationParams);

  return (
    <main className="container mx-auto py-4 px-4">
      <div className="mb-8">
        <p className="text-2xl font-bold mb-4">Welcome to my blog, where I share my thoughts and experiences.</p>
      </div>
      
      <PostGrid posts={posts} categories={categories} />
      
      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        basePath="/" 
        searchParams={Object.fromEntries(
          Object.entries(searchParams).filter(([key]) => key !== 'page')
        )}
      />
    </main>
  )
}