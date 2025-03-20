import { sanityClient } from '@/sanity/lib/client'
import type { Post } from '@/sanity/schemaTypes/postType'
import type { Category } from '@/sanity/schemaTypes/categoryType'
import PostGrid from '@/components/PostGrid'
// Query to fetch posts with all necessary fields
const postsQuery = `*[_type == "post" && !unlisted] | order(publishedAt desc) {
  _id,
  title,
  slug,
  mainImage,
  excerpt,
  categories,
  publishedAt
}`

// Query to fetch all categories
const categoriesQuery = `*[_type == "category"] {
  _id,
  title,
  slug,
  description
}`

export default async function BlogIndex() {
  // Fetch posts and categories in parallel
  const [posts, categories] = await Promise.all([
    sanityClient.fetch<Post[]>(postsQuery),
    sanityClient.fetch<Category[]>(categoriesQuery)
  ])

  return (
    <main className="container mx-auto py-4">
      <div className="mb-8">
        <p className="text-2xl font-bold mb-4">Welcome to my blog, where I share my thoughts and experiences. </p>
      </div>
      
      <PostGrid posts={posts} categories={categories} />
    </main>
  )
}