import { sanityClient } from '@/sanity/lib/client'
import type { Post } from '@/sanity/schemaTypes/postType'
import type { Category } from '@/sanity/schemaTypes/categoryType'
import BlogHeader from '@/components/BlogHeader'
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
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <BlogHeader 
        title="The Foxy Blog" 
        subtitle="Thoughts, stories and ideas from Alex Foxleigh" 
      />
      
      <PostGrid posts={posts} categories={categories} />
    </main>
  )
}