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
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BlogIndex({ searchParams }: HomePageProps) {
  // Await the searchParams
  const resolvedSearchParams = await searchParams;

  // Get pagination parameters
  const paginationParams = getPaginationParams(resolvedSearchParams);

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
        <p className="text-lg font-bold mb-4">
          Hi. I&apos;m Alex, I&apos;m a senior full-stack developer with a passion for building performant, accessible and highly usable web applications.
        </p>
        <p className="mb-4 text-sm">
          You can find out more about me by reading my blog, <a className="underline text-purple-700 hover:text-purple-800 hover:no-underline" href="https://www.alexfoxleigh.com">taking a look at my website</a> or having a look at my social links which are below in the footer.
        </p>
        <p className="mb-4 text-sm">Here is an assorted collection of my rants, ravings and general ramblings. I apologise in advance.</p>
      </div>

      <PostGrid posts={posts} categories={categories} />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/"
        searchParams={Object.fromEntries(
          Object.entries(resolvedSearchParams).filter(([key]) => key !== 'page')
        )}
      />
    </main>
  )
}
