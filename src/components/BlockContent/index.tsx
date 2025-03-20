"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { urlFor } from '@/sanity/lib/image';
import { BlockContent as BlockContentType } from '@/sanity/schemaTypes/blockContentType';
import { PortableText } from '@portabletext/react';
import YouTube from 'react-youtube';

interface BlockContentProps {
  content: BlockContentType;
}

const BlockContent: React.FC<BlockContentProps> = ({ content }) => {
  const components = {
    types: {
      image: ({ value }: any) => {
        if (!value?.asset?._ref) {
          return null;
        }
        return (
          <figure className="my-8">
            <div className="relative w-full h-auto min-h-[300px] rounded-lg overflow-hidden">
              <Image
                src={urlFor(value).width(800).url()}
                alt={value.alt || 'Blog post image'}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 80vw, 800px"
              />
            </div>
            {value.caption && (
              <figcaption className="mt-2 text-sm text-gray-600 text-center">
                {value.caption}
                {value.attribution && <span className="text-gray-500"> - {value.attribution}</span>}
              </figcaption>
            )}
          </figure>
        );
      },
      youtube: ({ value }: any) => {
        if (!value?.video?.id) {
          return null;
        }
        
        return (
          <div className="my-8 aspect-video">
            <YouTube
              videoId={value.video.id}
              opts={{
                width: '100%',
                height: '100%',
                playerVars: {
                  autoplay: value.autoplay ? 1 : 0,
                  controls: value.controls ? 1 : 0,
                },
              }}
              className="w-full h-full"
            />
          </div>
        );
      },
      code: ({ value }: any) => {
        return (
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4">
            <code>{value.code}</code>
          </pre>
        );
      },
    },
    block: {
      h1: ({ children }: any) => <h1 className="text-3xl font-bold mt-8 mb-4">{children}</h1>,
      h2: ({ children }: any) => <h2 className="text-2xl font-bold mt-8 mb-4">{children}</h2>,
      h3: ({ children }: any) => <h3 className="text-xl font-bold mt-6 mb-3">{children}</h3>,
      h4: ({ children }: any) => <h4 className="text-lg font-bold mt-4 mb-2">{children}</h4>,
      normal: ({ children }: any) => <p className="mb-4 leading-relaxed">{children}</p>,
      blockquote: ({ children }: any) => (
        <blockquote className="border-l-4 border-primary pl-4 italic my-6">{children}</blockquote>
      ),
    },
    marks: {
      link: ({ children, value }: any) => {
        const rel = !value.href.startsWith('/') ? 'noreferrer noopener' : undefined;
        return (
          <Link 
            href={value.href} 
            rel={rel} 
            className="text-primary underline hover:text-primary/80 transition-colors"
          >
            {children}
          </Link>
        );
      },
      strong: ({ children }: any) => <strong className="font-bold">{children}</strong>,
      em: ({ children }: any) => <em className="italic">{children}</em>,
    },
    list: {
      bullet: ({ children }: any) => <ul className="list-disc pl-6 mb-4">{children}</ul>,
    },
    listItem: {
      bullet: ({ children }: any) => <li className="mb-1">{children}</li>,
    },
  };

  return (
    <div className="prose prose-lg max-w-none">
      <PortableText value={content} components={components} />
    </div>
  );
};

export default BlockContent;
