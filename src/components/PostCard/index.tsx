"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Post } from '@/sanity/schemaTypes/postType';
import { Category } from '@/sanity/schemaTypes/categoryType';
import { urlFor } from '@/sanity/lib/image';
import { formatDate } from '@/utils/formatDate';
import { getCategoryColor, getCategoryTextColor } from '@/utils/categoryColors';

interface PostCardProps {
  post: Post;
  category: Category;
  postUrl: string;
}

const PostCard: React.FC<PostCardProps> = ({ post, category, postUrl }) => {
  // Get the category color and text color based on the category slug
  const categoryColor = getCategoryColor(category.slug.current);
  const categoryTextColor = getCategoryTextColor();

  // Check if post is featured
  const isFeatured = !!(post as Post & { featured?: boolean }).featured;

  return (
    <Link
      href={postUrl}
      className="block group"
      style={isFeatured ? { gridColumn: '1 / 3' } : undefined}
    >
      <div className="rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl bg-white h-full flex flex-col transform group-hover:scale-105">
        <div className="relative h-60">
          {post.mainImage?.asset ? (
            <>
              <Image
                src={urlFor(post.mainImage)
                  .width(500)
                  .height(300)
                  .fit('crop')
                  .crop('entropy')
                  .url()}
                alt={post.mainImage.alt || post.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30"></div>
            </>
          ) : (
            <div className="h-full bg-gray-800 flex items-center justify-center">
              <span className="text-gray-400">No image</span>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h2 className="font-headers text-2xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {post.title}
            </h2>

            {post.publishedAt && (
              <div className="text-white/80 text-xs font-medium mt-2">
                {formatDate(post.publishedAt)}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 flex-grow">
          <p className="font-body text-gray-600 text-m line-clamp-3">
            {post.excerpt}
          </p>
        </div>

        <div className={`${categoryColor} ${categoryTextColor} px-4 py-2 text-sm font-medium`}>
          {category.title}
        </div>
      </div>
    </Link>
  );
};

export default PostCard;
