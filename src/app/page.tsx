import { Metadata } from 'next';
import { sanityClient } from '@/sanity/lib/client';
import { groq } from 'next-sanity';
import type { Post } from '@/sanity/schemaTypes/postType';
import type { Category } from '@/sanity/schemaTypes/categoryType';
import PostGrid from '@/components/PostGrid';
import Pagination from '@/components/Pagination';
import { paginateItems, getPaginationParams } from '@/utils/pagination';

// Query to fetch posts with all necessary fields
const postsQuery = groq`*[_type == "post" && !unlisted] | order(publishedAt desc) {
  _id,
  title,
  slug,
  mainImage {
    asset->{
      _id,
      _type,
      metadata {
        dimensions {
          width,
          height
        },
        lqip
      }
    },
    alt
  },
  excerpt,
  categories,
  publishedAt,
  tags,
  noindex
}`;

// Query to fetch all categories
const categoriesQuery = groq`*[_type == "category"] {
  _id,
  title,
  slug,
  description
}`;

// Query to fetch the most recent featured post with all necessary fields
const featuredPostQuery = groq`*[_type == "featuredPost"][-1] {
  "post": post->{
    _id,
    title,
    slug,
    mainImage {
      asset->{
        _id,
        _type,
        metadata {
          dimensions {
            width,
            height
          },
          lqip
        }
      },
      alt
    },
    excerpt,
    categories,
    publishedAt,
    tags,
    noindex
  }
}.post`;

interface HomePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const title = "Foxy's Tale - The inane mutterings of Alexander Foxleigh";
const description =
  "Hi. I'm Alex, I'm a senior full-stack developer with a passion for building performant, accessible and highly usable web applications.\nYou can find out more about me by reading my blog, taking a look at my website or having a look at my social links which are below in the footer.\nHere is an assorted collection of my rants, ravings and general ramblings. I apologise in advance.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    type: 'website',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/foxy-tail-logo.png`,
        width: 512,
        height: 512,
        alt: "Foxy's Tale Logo",
      },
    ],
    siteName: "Foxy's Tale",
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    creator: '@foxleigh81',
    images: [`${process.env.NEXT_PUBLIC_SITE_URL}/foxy-tail-logo.png`],
  },
};

// Enable static rendering with revalidation
export const revalidate = 3600; // Revalidate every hour

export default async function BlogIndex({ searchParams }: HomePageProps) {
  // Await the searchParams
  const resolvedSearchParams = await searchParams;

  // Get pagination parameters
  const paginationParams = getPaginationParams(resolvedSearchParams);

  try {
    // Fetch posts, categories, and featured post in parallel
    const [allPosts, categories, featuredPost] = await Promise.all([
      sanityClient.fetch<Post[]>(postsQuery),
      sanityClient.fetch<Category[]>(categoriesQuery),
      sanityClient.fetch<Post | null>(featuredPostQuery),
    ]);

    // Filter out the featured post from regular posts if it exists
    const filteredPosts = featuredPost
      ? allPosts.filter((post) => post._id !== featuredPost._id)
      : allPosts;

    // Combine featured post with filtered posts if it exists
    const posts = featuredPost ? [featuredPost, ...filteredPosts] : filteredPosts;

    // Paginate the posts with 8 items per page if there's a featured post
    const {
      items: paginatedPosts,
      currentPage,
      totalPages,
    } = paginateItems(posts, paginationParams, featuredPost ? 8 : 9);

    // Create JSON-LD for website
    const websiteJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: "Foxy's Tale",
      url: process.env.NEXT_PUBLIC_SITE_URL,
      description,
      author: {
        '@type': 'Person',
        name: 'Alexander Foxleigh',
        url: 'https://www.alexfoxleigh.com',
        sameAs: [
          'https://www.alexfoxleigh.com',
          'https://www.linkedin.com/in/alexfoxleigh/',
          'https://github.com/foxleigh81',
          'https://www.instagram.com/foxleigh81',
          'https://bsky.app/profile/foxleigh81.bsky.social',
        ],
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL}/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
      sameAs: [
        'https://www.linkedin.com/in/alexfoxleigh/',
        'https://github.com/foxleigh81',
        'https://www.instagram.com/foxleigh81',
        'https://bsky.app/profile/foxleigh81.bsky.social',
      ],
      copyrightYear: new Date().getFullYear(),
      copyrightHolder: {
        '@type': 'Person',
        name: 'Alexander Foxleigh',
        url: 'https://www.alexfoxleigh.com',
      },
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <main className="container mx-auto py-4 px-4">
          <div className="mb-8">
            <p className="text-lg font-bold mb-4">
              Hi. I&apos;m Alex, I&apos;m a senior full-stack developer with a passion for building
              performant, accessible and highly usable web applications.
            </p>
            <p className="mb-4 text-sm">
              You can find out more about me by reading my blog,{' '}
              <a
                className="underline text-purple-700 hover:text-purple-800 hover:no-underline hover:underline-offset-4 transition-colors"
                href="https://www.alexfoxleigh.com"
              >
                taking a look at my website
              </a>{' '}
              or having a look at my social links which are below in the footer.
            </p>
            <p className="mb-4 text-sm">
              Here is an assorted collection of my rants, ravings and general ramblings. I apologise
              in advance.
            </p>
          </div>

          <PostGrid
            posts={paginatedPosts}
            categories={categories}
            includesFeatured={!!featuredPost}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath="/"
            searchParams={Object.fromEntries(
              Object.entries(resolvedSearchParams).filter(([key]) => key !== 'page')
            )}
          />
        </main>
      </>
    );
  } catch (error) {
    console.error('Error fetching data:', error);
    // Return a fallback UI or error state
    return (
      <main className="container mx-auto py-4 px-4">
        <div className="text-center py-10">
          <p className="text-gray-500">
            Something went wrong loading the posts. Please try again later.
          </p>
        </div>
        <PostGrid posts={[]} categories={[]} includesFeatured={false} />
      </main>
    );
  }
}
