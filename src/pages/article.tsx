import React from 'react';
import { PortableText } from '@portabletext/react';
import { useParams } from 'react-router-dom';

import { getPostBySlug, imageBuilder } from '../sanity';
import { Post } from '../../sanity.types';

import { PortableTextComponents } from '../components/portable-text-components';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';

export default function ArticlePage() {
  const { slug } = useParams();
  const [post, setPost] = React.useState<Post>();

  React.useEffect(() => {
    getPostBySlug(slug || '').then((post) => {
      setPost(post);
    });
  }, [slug]);

  if (!post) {
    return <div>Loading...</div>;
  }

  const getOrdinalSuffix = (day: number) => {
    if (day > 3 && day < 21) return 'th'; // Special case for 11th–13th
    switch (day % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  };

  const date = new Date(post.publishedAt as string);
  const day = date.getDate();
  const month = date.toLocaleDateString('en-GB', { month: 'long' });
  const year = date.getFullYear();

  const friendlyDate = `${day}${getOrdinalSuffix(day)} ${month}, ${year}`;

  return (
    <article className="flex flex-col">
      {post.tags?.includes('legacy') && (
        <div className="bg-yellow-200 text-yellow-800 p-2 mb-4 rounded-md text-center">
          <ExclamationTriangleIcon className="h-6 w-6 inline-block mr-2" />
          <strong>Note:</strong> This is a legacy post from{' '}
          {friendlyDate.split(',').pop()} and may contain outdated information,
          broken links, or other issues.
        </div>
      )}
      <h1 className="text-3xl font-black mb-4">{post.title}</h1>
      {post.subtitle && (
        <span className="text-xl font-semibold text-gray-800 mb-4">
          {post.subtitle}
        </span>
      )}
      {post.hero && (
        <div className="mb-4">
          <img
            src={imageBuilder.image(post.hero).url() as string}
            alt={post.heroAlt}
            className="w-full rounded-md"
          />
        </div>
      )}
      {post.body && (
        <PortableText value={post.body} components={PortableTextComponents} />
      )}
    </article>
  );
}
