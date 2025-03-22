import React from 'react';
import { Post } from '@/sanity/schemaTypes/postType';
import { Category } from '@/sanity/schemaTypes/categoryType';
import PostCard from '../PostCard';

interface PostGridProps {
  posts: Post[];
  categories: Category[];
}

const PostGrid: React.FC<PostGridProps> = ({ posts, categories }) => {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No posts found.</p>
      </div>
    );
  }

  // Calculate position information for each post
  const postsWithPositionInfo = posts.map((post, index) => {
    const isFeatured = !!post.featured;

    // Calculate position in grid - important for preventing orphan columns
    // In a 3-column grid (desktop), featured posts should start at position 0, 3, 6, etc.
    // In a 2-column grid (tablet), featured posts should start at position 0, 2, 4, etc.
    const positionInGrid = index;

    return {
      post,
      isFeatured,
      positionInGrid,
      // For a 2-column grid (sm screens), ensure featured posts start at even positions
      needsPositionAdjustment: isFeatured && (positionInGrid % 2 !== 0)
    };
  });

  // Rearrange posts if needed to avoid orphaned columns
  const optimizedPosts = [...postsWithPositionInfo];
  for (let i = 0; i < optimizedPosts.length; i++) {
    const current = optimizedPosts[i];

    // If a featured post doesn't start at an even position, try to swap with previous post
    if (current.needsPositionAdjustment && i > 0) {
      const temp = optimizedPosts[i - 1];
      optimizedPosts[i - 1] = current;
      optimizedPosts[i] = temp;
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {optimizedPosts.map(({ post }) => {
        // Find the first category for this post - all posts have at least one category
        const firstCategoryRef = post.categories?.[0]?._ref;

        // Find the category object that matches the reference
        const firstCategory = categories.find(cat => cat._id === firstCategoryRef)!;

        // Generate the URL path for the post using the category slug and post slug
        const postUrl = `/${firstCategory.slug.current}/${post.slug.current}`;

        return (
          <PostCard
            key={post._id || post.slug.current}
            post={post}
            category={firstCategory}
            postUrl={postUrl}
          />
        );
      })}
    </div>
  );
};

export default PostGrid;
