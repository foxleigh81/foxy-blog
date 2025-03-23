import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { sanityClient } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import type { Post as BasePost } from '@/sanity/schemaTypes/postType';
import type { Category } from '@/sanity/schemaTypes/categoryType';
import type { Author } from '@/sanity/schemaTypes/authorType';

// Import components
import Breadcrumbs from '@/components/Breadcrumbs';
import BlogHeader from '@/components/BlogHeader';
import BlogArticle from '@/components/BlogArticle';
import Tags, { TagData } from '@/components/Tags';
import AuthorBio from '@/components/AuthorBio';
import RelatedPosts from '@/components/RelatedPosts';
import LegacyBanner from '@/components/LegacyBanner';
import OpinionBanner from '@/components/OpinionBanner';

// Define a type for related posts which are expanded in the query
type RelatedPost = {
  _id: string;
  title: string;
  subtitle?: string;
  slug: {
    current: string;
  };
  mainImage?: {
    asset: {
      _ref: string;
      _type: "reference";
    };
    alt?: string;
  };
  excerpt?: string;
  categories?: Array<{
    _ref: string;
    _type: "reference";
  }>;
  publishedAt?: string;
};

// Extended Post type that includes expanded references
type Post = Omit<BasePost, 'author' | 'relatedPosts'> & {
  author: Author;
  relatedPosts?: RelatedPost[];
};

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

// Query to fetch tag data
const tagsQuery = `*[_type == "tag" && _id in $ids] {
  _id,
  name,
  color
}`;

interface PostPageProps {
  params: Promise<{
    category: string;
    slug: string;
  }>;
  searchParams?: Promise<Record<string, string | string[]>>;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  // Await the params
  const resolvedParams = await params;
  const post: Post = await sanityClient.fetch(postQuery, { slug: resolvedParams.slug });

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  // Get the canonical URL
  const canonicalUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/${resolvedParams.category}/${resolvedParams.slug}`;

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
  // Await the params
  const resolvedParams = await params;

  // Fetch the post
  const post: Post = await sanityClient.fetch(postQuery, { slug: resolvedParams.slug });

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
        .filter((cat): cat is Category => Boolean(cat))
    : [];

  // Get the first category (for breadcrumb)
  const firstCategory = postCategories.length > 0 ? postCategories[0] : null;

  // Fetch additional posts for related posts section if needed
  let relatedPosts = post.relatedPosts || [];

  // If we don't have enough related posts (less than 3), fetch more
  if (relatedPosts.length < 3) {
    // First try to find posts with the same tags and categories
    if (post.tags && post.tags.length > 0 && post.categories) {
      const firstCategoryRef = post.categories[0]?._ref;
      const firstTagRef = post.tags[0]?._ref;

      if (firstTagRef) {
        const tagsQuery = `*[_type == "post" && _id != $postId && references($tagId) && references($categoryId) && !unlisted] | order(publishedAt desc)[0...${(3 - relatedPosts.length).toString()}] {
          _id,
          title,
          slug,
          mainImage,
          excerpt,
          categories,
          publishedAt
        }`;

        const tagRelatedPosts = await sanityClient.fetch<RelatedPost[]>(tagsQuery, {
          postId: post._id,
          tagId: firstTagRef,
          categoryId: firstCategoryRef
        });

        // Add posts that aren't already in relatedPosts
        const existingIds = new Set(relatedPosts.map(p => p._id));
        tagRelatedPosts.forEach((p: RelatedPost) => {
          if (!existingIds.has(p._id)) {
            relatedPosts.push(p);
            existingIds.add(p._id);
          }
        });
      }
    }

    // If we still don't have enough, get posts from the same category
    if (relatedPosts.length < 3 && post.categories) {
      const firstCategoryRef = post.categories[0]?._ref;
      const categoryQuery = `*[_type == "post" && _id != $postId && references($categoryId) && !unlisted] | order(publishedAt desc)[0...${(3 - relatedPosts.length).toString()}] {
        _id,
        title,
        slug,
        mainImage,
        excerpt,
        categories,
        publishedAt
      }`;

      const categoryRelatedPosts = await sanityClient.fetch<RelatedPost[]>(categoryQuery, {
        postId: post._id,
        categoryId: firstCategoryRef
      });

      // Add posts that aren't already in relatedPosts
      const existingIds = new Set(relatedPosts.map(p => p._id));
      categoryRelatedPosts.forEach((p: RelatedPost) => {
        if (!existingIds.has(p._id)) {
          relatedPosts.push(p);
          existingIds.add(p._id);
        }
      });
    }

    // If we still don't have enough, get the most recent posts
    if (relatedPosts.length < 3) {
      const recentQuery = `*[_type == "post" && _id != $postId && !unlisted] | order(publishedAt desc)[0...${(3 - relatedPosts.length).toString()}] {
        _id,
        title,
        slug,
        mainImage,
        excerpt,
        categories,
        publishedAt
      }`;

      const recentPosts = await sanityClient.fetch(recentQuery, {
        postId: post._id
      });

      // Add posts that aren't already in relatedPosts
      const existingIds = new Set(relatedPosts.map(p => p._id));
      recentPosts.forEach((p: RelatedPost) => {
        if (!existingIds.has(p._id)) {
          relatedPosts.push(p);
          existingIds.add(p._id);
        }
      });
    }
  }

  // Limit to 3 posts
  relatedPosts = relatedPosts.slice(0, 3);

  // Fetch tag data for all tags in this post
  let tagData: TagData[] = [];
  if (post.tags && post.tags.length > 0) {
    const tagIds = post.tags.map(tag => tag._ref);
    tagData = await sanityClient.fetch<TagData[]>(tagsQuery, { ids: tagIds });
    // Sort tags by name
    tagData.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Check if legacy tag is present
  const isLegacy = tagData.some(tag => tag.name.toLowerCase() === 'legacy');
  const isOpinion = tagData.some(tag => tag.name.toLowerCase() === 'opinion');
  return (
    <>
    <Breadcrumbs category={firstCategory} postTitle={post.title} />
    <article className="container mx-auto mt-4">
      <BlogHeader
        title={post.title}
        subtitle={post.subtitle}
        publishedAt={post.publishedAt}
        author={post.author}
        categories={postCategories}
        mainImage={post.mainImage}
      />

      {isLegacy && <LegacyBanner year={post.publishedAt?.split('-')[0] || ''} />}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 mt-4">
          {isOpinion && <OpinionBanner />}
          <BlogArticle content={post.body} />

          {post.author && <AuthorBio author={post.author} />}
        </div>

        <div className="lg:col-span-4">
          {relatedPosts.length > 0 && (
            <RelatedPosts posts={relatedPosts} categories={categories} />
          )}

          {tagData.length > 0 && <Tags tagData={tagData} />}

          {/* Ko-fi Donation Panel */}
          <div className="mt-8 bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-bold mb-4">Support This Blog</h3>
            <p className="text-sm mb-4">
              At the moment, this site is not ad-supported but if you want to support me, please use the Ko-fi donation link below and thank you in advance!
            </p>

            <div className="flex flex-col items-center space-y-4">
              <a
                href='https://ko-fi.com/I3I21FRCN'
                target='_blank'
                rel="noopener noreferrer"
                className="bg-[#d110a4] text-white py-3 px-6 rounded-lg font-bold text-center hover:bg-[#b50e8f] transition-colors w-full"
              >
                Support me on Ko-fi
              </a>
            </div>
          </div>
        </div>
      </div>
    </article>
    </>
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
