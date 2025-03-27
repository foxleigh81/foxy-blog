import React from 'react';
import Image from 'next/image';
import { Category } from '@/sanity/schemaTypes/categoryType';
import { RelatedPost } from '@/types/post';
import { urlFor } from '@/sanity/lib/image';

interface RelatedPostsProps {
  posts: RelatedPost[];
  categories: Category[];
}

const RelatedPosts: React.FC<RelatedPostsProps> = ({ posts, categories }) => {
  if (!posts || posts.length === 0) return null;

  return (
    <div className="mt-8 lg:mt-0">
      <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
      <div className="grid grid-cols-1 gap-6">
        {posts.map((relatedPost) => {
          // Find the first category for this post
          const firstCategoryRef = relatedPost.categories?.[0]?._ref;
          const firstCategory = categories.find((cat) => cat._id === firstCategoryRef);
          const postUrl = firstCategory
            ? `/${firstCategory.slug.current}/${relatedPost.slug.current}`
            : `/post/${relatedPost.slug.current}`;

          return (
            <div
              key={relatedPost._id}
              className="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col"
            >
              <a href={postUrl} className="block group">
                {relatedPost.mainImage?.asset && (
                  <div className="relative h-48 w-full">
                    <Image
                      src={urlFor(relatedPost.mainImage)
                        .width(400)
                        .height(240)
                        .fit('crop')
                        .crop('entropy')
                        .url()}
                      alt={relatedPost.mainImage.alt || relatedPost.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, 400px"
                      placeholder="blur"
                      blurDataURL={relatedPost.mainImage.asset.metadata.lqip}
                    />
                  </div>
                )}
                <div className="p-4 flex-grow">
                  <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                    {relatedPost.title}
                  </h3>
                  {relatedPost.excerpt && (
                    <p className="text-gray-600 text-sm line-clamp-2">{relatedPost.excerpt}</p>
                  )}
                </div>
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RelatedPosts;
