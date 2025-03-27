import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { sanityClient } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import { groq } from 'next-sanity';
import type { Author } from '@/sanity/schemaTypes/authorType';
import type { Post } from '@/sanity/schemaTypes/postType';
import BlockContent from '@/components/BlockContent';
import PostGrid from '@/components/PostGrid';
import Breadcrumbs from '@/components/Breadcrumbs';
import Pagination from '@/components/Pagination';
import { paginateItems, getPaginationParams } from '@/utils/pagination';
import { metadata as siteMetadata } from '../../layout';

// Query to fetch author data
const authorQuery = groq`*[_type == "author" && slug.current == $slug][0] {
  _id,
  name,
  slug,
  image {
    asset->{
      _id,
      _type,
      metadata {
        lqip
      }
    }
  },
  bio
}`;

// Query to fetch posts by this author
const postsByAuthorQuery = groq`*[_type == "post" && author._ref == $authorId && !unlisted] | order(publishedAt desc) {
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

// Query to fetch all categories for reference
const categoriesQuery = groq`*[_type == "category"] {
  _id,
  title,
  slug,
  description
}`;

interface AuthorPageProps {
  params: Promise<{
    author: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  // Ensure params is awaited
  const resolvedParams = await Promise.resolve(params);
  const authorSlug = resolvedParams.author;

  // Fetch author data
  const authorData = await sanityClient.fetch<Author | null>(authorQuery, { slug: authorSlug });

  if (!authorData) {
    return {
      title: 'Author Not Found',
    };
  }

  return {
    title: `${authorData.name} | ${siteMetadata.title}`,
    description: `Articles by ${authorData.name}`,
    openGraph: {
      title: `${authorData.name} | ${siteMetadata.title}`,
      description: `Articles by ${authorData.name}`,
      type: 'profile',
      url: `/author/${authorSlug}`,
      images: authorData.image
        ? [
            {
              url: urlFor(authorData.image).width(1200).height(630).url(),
              width: 1200,
              height: 630,
              alt: authorData.name,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${authorData.name} | ${siteMetadata.title}`,
      description: `Articles by ${authorData.name}`,
      images: authorData.image
        ? [urlFor(authorData.image).width(1200).height(630).url()]
        : undefined,
    },
  };
}

export default async function AuthorPage({ params, searchParams }: AuthorPageProps) {
  // Ensure params is properly awaited
  const resolvedParams = await Promise.resolve(params);
  const authorSlug = resolvedParams.author;

  // Get pagination parameters
  const paginationParams = getPaginationParams(await Promise.resolve(searchParams));

  // Fetch author data
  const authorData = await sanityClient.fetch<Author | null>(authorQuery, { slug: authorSlug });

  // If author not found, return 404
  if (!authorData) {
    notFound();
  }

  // Fetch posts by this author
  const allPosts: Post[] = await sanityClient.fetch<Post[]>(postsByAuthorQuery, {
    authorId: authorData._id,
  });

  // Paginate the posts
  const { items: posts, currentPage, totalPages } = paginateItems(allPosts, paginationParams);

  // Fetch all categories for reference
  const categories = await sanityClient.fetch(categoriesQuery);

  return (
    <main className="container mx-auto px-4">
      <Breadcrumbs authorName={authorData.name} />

      <div className="mb-12 mt-4">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          {authorData.image?.asset && (
            <div className="relative w-40 h-40 flex-shrink-0">
              <Image
                src={urlFor(authorData.image).width(160).height(160).url()}
                alt={authorData.name}
                fill
                className="object-cover rounded-full"
              />
            </div>
          )}

          <div className="flex-grow text-center md:text-left">
            <h1 className="text-3xl font-bold mb-4">{authorData.name}</h1>

            {authorData.bio && (
              <div className="prose max-w-none">
                <BlockContent content={authorData.bio} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-8">
        <h2 className="text-2xl font-bold mb-6">Articles by {authorData.name}</h2>

        {posts.length > 0 ? (
          <>
            <PostGrid posts={posts} categories={categories} />

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath={`/author/${authorSlug}`}
              searchParams={Object.fromEntries(
                Object.entries(await Promise.resolve(searchParams)).filter(
                  ([key]) => key !== 'page'
                )
              )}
            />
          </>
        ) : (
          <p className="text-gray-600">No articles found by this author.</p>
        )}
      </div>
    </main>
  );
}

// Generate static paths for all authors
export async function generateStaticParams() {
  const authors = await sanityClient.fetch(groq`
    *[_type == "author"] {
      "author": slug.current
    }
  `);

  return authors;
}
