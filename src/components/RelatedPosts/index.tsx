import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Category } from '@/sanity/schemaTypes/categoryType';
import { urlFor } from '@/sanity/lib/image';
import { formatDate } from '@/utils/formatDate';
import type { RelatedPost } from '@/types/post';

interface RelatedPostsProps {
  posts: RelatedPost[];
  categories: Category[];
}

const RelatedPosts: React.FC<RelatedPostsProps> = ({ posts, categories }) => {
  if (!posts.length) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-bold mb-4">Related Posts</h3>
      <div className="space-y-4">
        {posts.map((post) => {
          const category = post.categories?.[0]
            ? categories.find((c) => c._id === post.categories![0]._ref)
            : null;

          return (
            <Link
              key={post._id}
              href={`/${category?.slug.current || ''}/${post.slug.current}`}
              className="block group"
            >
              <div className="flex gap-4">
                {post.mainImage?.asset && (
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <Image
                      src={urlFor(post.mainImage)
                        .width(96)
                        .height(96)
                        .fit('crop')
                        .crop('entropy')
                        .url()}
                      alt={post.mainImage.alt || post.title}
                      fill
                      className="object-cover rounded-lg"
                      sizes="96px"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h4>
                  {post.publishedAt && (
                    <time className="text-sm text-gray-500">{formatDate(post.publishedAt)}</time>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default RelatedPosts;
