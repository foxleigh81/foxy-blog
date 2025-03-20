import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { sanityClient } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import type { Post } from '@/sanity/schemaTypes/postType';
import type { Category } from '@/sanity/schemaTypes/categoryType';
import type { Author } from '@/sanity/schemaTypes/authorType';
import BlockContent from '@/components/BlockContent';
import { formatDate } from '@/utils/formatDate';
import { getCategoryColor, getCategoryTextColor } from '@/utils/categoryColors';

// Query to fetch a specific post
const postQuery = `*[_type == "post" && slug.current == $slug][0] {
  _id,
  title,
  subtitle,
  slug,
  author->{
    _id,
    name,
    slug,
    image,
    bio
  },
  mainImage,
  categories,
  publishedAt,
  body,
  excerpt,
  tags,
  youtube,
  relatedPosts[]->{
    _id,
    title,
    slug,
    mainImage,
    excerpt,
    categories,
    publishedAt
  }
}`;

// Query to fetch all categories
const categoriesQuery = `*[_type == "category"] {
  _id,
  title,
  slug,
  description
}`;

interface PostPageProps {
  params: {
    category: string;
    slug: string;
  };
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const post: Post = await sanityClient.fetch(postQuery, { slug: params.slug });
  
  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }
  
  // Get the canonical URL
  const canonicalUrl = `/${params.category}/${params.slug}`;
  
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      url: canonicalUrl,
      images: post.mainImage ? [
        {
          url: urlFor(post.mainImage).width(1200).height(630).url(),
          width: 1200,
          height: 630,
          alt: post.mainImage.alt || post.title,
        }
      ] : undefined,
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: post.mainImage ? [urlFor(post.mainImage).width(1200).height(630).url()] : undefined,
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  // Fetch the post
  const post: Post = await sanityClient.fetch(postQuery, { slug: params.slug });
  
  // If post not found, return 404
  if (!post) {
    notFound();
  }
  
  // Fetch all categories for reference
  const categories: Category[] = await sanityClient.fetch(categoriesQuery);
  
  // Find the post categories
  const postCategories = post.categories
    ? post.categories
        .map(cat => categories.find(c => c._id === cat._ref))
        .filter(Boolean) as Category[]
    : [];
  
  // Get the first category (for breadcrumb)
  const firstCategory = postCategories.length > 0 ? postCategories[0] : null;
  
  return (
    <article className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          <li>
            <Link href="/" className="text-gray-500 hover:text-primary">
              Home
            </Link>
          </li>
          <li className="flex items-center space-x-2">
            <span className="text-gray-400">/</span>
            {firstCategory && (
              <Link 
                href={`/${firstCategory.slug.current}`} 
                className="text-gray-500 hover:text-primary"
              >
                {firstCategory.title}
              </Link>
            )}
          </li>
          <li className="flex items-center space-x-2">
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium" aria-current="page">
              {post.title}
            </span>
          </li>
        </ol>
      </nav>
      
      {/* Article header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        {post.subtitle && (
          <p className="text-xl text-gray-600 mb-4">{post.subtitle}</p>
        )}
        
        {/* Meta information */}
        <div className="flex flex-wrap items-center text-sm text-gray-600 mb-6">
          {post.publishedAt && (
            <time dateTime={post.publishedAt} className="mr-6">
              {formatDate(post.publishedAt)}
            </time>
          )}
          
          {post.author && (
            <div className="flex items-center mr-6">
              <span>By </span>
              <Link 
                href={`/author/${post.author.slug?.current}`} 
                className="font-medium text-primary ml-1 hover:underline"
              >
                {post.author.name}
              </Link>
            </div>
          )}
          
          {/* Categories */}
          {postCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
              {postCategories.map((category) => (
                <Link 
                  key={category._id} 
                  href={`/${category.slug.current}`}
                  className={`${getCategoryColor(category.slug.current)} ${getCategoryTextColor(category.slug.current)} px-3 py-1 rounded-full text-xs font-medium`}
                >
                  {category.title}
                </Link>
              ))}
            </div>
          )}
        </div>
        
        {/* Featured image */}
        {post.mainImage?.asset && (
          <div className="relative w-full h-auto aspect-video mb-8 rounded-lg overflow-hidden">
            <Image
              src={urlFor(post.mainImage).width(1200).height(675).url()}
              alt={post.mainImage.alt || post.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
            />
          </div>
        )}
      </header>
      
      {/* Article content */}
      <div className="max-w-3xl mx-auto">
        <BlockContent content={post.body} />
        
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-12 pt-6 border-t border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link 
                  key={tag} 
                  href={`/tag/${tag}`}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        )}
        
        {/* Author bio */}
        {post.author && (
          <div className="mt-12 pt-6 border-t border-gray-200">
            <div className="flex items-center">
              {post.author.image?.asset && (
                <div className="mr-4 relative w-16 h-16 rounded-full overflow-hidden">
                  <Image
                    src={urlFor(post.author.image).width(64).height(64).url()}
                    alt={post.author.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div>
                <h3 className="font-bold text-lg">
                  <Link href={`/author/${post.author.slug?.current}`} className="hover:text-primary">
                    {post.author.name}
                  </Link>
                </h3>
                {post.author.bio && (
                  <p className="text-gray-600 text-sm">{post.author.bio[0].children[0].text}</p>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Related posts */}
        {post.relatedPosts && post.relatedPosts.length > 0 && (
          <div className="mt-12 pt-6 border-t border-gray-200">
            <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {post.relatedPosts.map((relatedPost) => {
                // Find the first category for this post
                const firstCategoryRef = relatedPost.categories?.[0]?._ref;
                const firstCategory = categories.find(cat => cat._id === firstCategoryRef)!;
                const postUrl = `/${firstCategory.slug.current}/${relatedPost.slug.current}`;
                
                return (
                  <Link key={relatedPost._id} href={postUrl} className="group block">
                    <div className="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col">
                      {relatedPost.mainImage?.asset ? (
                        <div className="relative h-48 w-full">
                          <Image
                            src={urlFor(relatedPost.mainImage).width(400).height(240).url()}
                            alt={relatedPost.mainImage.alt || relatedPost.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 640px) 100vw, 400px"
                          />
                        </div>
                      ) : (
                        <div className="h-48 bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400">No image</span>
                        </div>
                      )}
                      <div className="p-4 flex-grow">
                        <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                          {relatedPost.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2">{relatedPost.excerpt}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

// Generate static paths for all posts
export async function generateStaticParams() {
  const posts = await sanityClient.fetch(`
    *[_type == "post" && !unlisted] {
      "slug": slug.current,
      "category": *[_type == "category" && _id == ^.categories[0]._ref][0].slug.current
    }
  `);
  
  return posts.map((post: { slug: string; category: string }) => ({
    category: post.category,
    slug: post.slug,
  }));
}
