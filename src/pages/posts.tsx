import React from 'react';

import { getPosts, imageBuilder } from '../sanity';
import { Post, Slug } from '../../sanity.types';
import { ensurePostType } from '../helpers';

export default function PostsList() {
  const [posts, setPosts] = React.useState<Post[]>([]);
  React.useEffect(() => {
    getPosts().then((posts) => {
      setPosts(ensurePostType(posts));
    });
  }, []);

  return (
    <div className="grid grid-cols-3 gap-4">
      {posts.map((post) => (
        <div key={post._id} className="bg-white p-4 rounded-md">
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
