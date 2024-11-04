import React from 'react';

import { getPostsByCategory, imageBuilder } from '../sanity';
import { Post, Slug } from '../../sanity.types';
import { useParams } from 'react-router-dom';

interface PostWithCategory extends Omit<Post, 'category'> {
  category: {
    name: string;
    slug: Slug;
  };
}

type Result = {
  name: string;
  posts: PostWithCategory[];
};

export default function CategoryPage() {
  const { category } = useParams();

  const [categoryName, setCategoryName] = React.useState<string>('');
  const [posts, setPosts] = React.useState<PostWithCategory[]>([]);

  React.useEffect(() => {
    getPostsByCategory(category || '').then((posts: Result) => {
      setPosts(posts.posts);
      setCategoryName(posts.name);
    });
  }, [category]);

  return (
    <div className="grid grid-cols-3 gap-4">
      <h1 className="col-span-3 text-2xl font-bold">{categoryName}</h1>

      {posts.map((post) => (
        <div
          key={`${post.category.slug}-${post.slug}`}
          className="bg-white p-4 rounded-md"
        >
          {post.hero && (
            <div className="mb-4">
              <img
                src={imageBuilder.image(post.hero).url() as string}
                alt={post.heroAlt}
                className="w-full rounded-md"
              />
            </div>
          )}
          <h2 className="text-xl font-bold">{post.title}</h2>
          <p>{post.excerpt}</p>
          <a
            href={`${post.category && 'slug' in post.category ? (post?.category?.slug as Slug).current : ''}/${post?.slug?.current}`}
          >
            Read more
          </a>
        </div>
      ))}
    </div>
  );
}
