'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { BlockContent as BlockContentType } from '@/sanity/schemaTypes/blockContentType';
import {
  PortableText,
  PortableTextComponentProps,
  PortableTextReactComponents,
} from '@portabletext/react';
import ImageContainer from '../ImageContainer';
import { urlFor } from '@/sanity/lib/image';

const YouTube = dynamic(() => import('react-youtube'), { ssr: false });
const InstagramEmbed = dynamic(() => import('../InstagramEmbed'), { ssr: false });

interface BlockContentProps {
  content: BlockContentType;
}

const BlockContent: React.FC<BlockContentProps> = ({ content }) => {
  const components: Partial<PortableTextReactComponents> = {
    types: {
      image: ({
        value,
      }: PortableTextComponentProps<{
        _type: 'image';
        asset?: {
          _id: string;
          _type: 'sanity.imageAsset';
          metadata: {
            dimensions: {
              width: number;
              height: number;
            };
            lqip?: string;
          };
        };
        alt?: string;
        caption?: string;
        attribution?: string;
        alignment?: 'full' | 'left' | 'right' | 'center';
      }>) => {
        if (!value?.asset?._id) {
          return null;
        }

        return (
          <ImageContainer
            dimensions={value.asset.metadata.dimensions}
            src={urlFor(value.asset).url()}
            alt={value.alt || 'Blog post image'}
            caption={value.caption}
            attribution={value.attribution}
            alignment={value.alignment || 'full'}
            blurDataURL={value.asset.metadata.lqip || undefined}
          />
        );
      },
      youtube: ({
        value,
      }: PortableTextComponentProps<{
        video?: { id: string };
        autoplay?: boolean;
        controls?: boolean;
      }>) => {
        if (!value?.video?.id) {
          return null;
        }

        return (
          <div className="my-4 aspect-video clear-both">
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
      code: ({ value }: PortableTextComponentProps<{ code?: string }>) => {
        return (
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4 clear-both">
            <code>{value.code}</code>
          </pre>
        );
      },
      instagram: ({ value }: PortableTextComponentProps<{ url?: string }>) => {
        if (!value?.url) {
          return null;
        }
        return (
          <div className="clear-both">
            <InstagramEmbed url={value.url} />
          </div>
        );
      },
      hr: () => {
        return <hr className="my-8 border-t-2 border-gray-200 clear-both" />;
      },
    },
    block: {
      h1: ({ children }) => <h1 className="text-3xl font-bold mt-4 mb-4 clear-both">{children}</h1>,
      h2: ({ children }) => <h2 className="text-2xl font-bold mt-4 mb-4 clear-both">{children}</h2>,
      h3: ({ children }) => <h3 className="text-xl font-bold mt-4 mb-3 clear-both">{children}</h3>,
      h4: ({ children }) => <h4 className="text-lg font-bold mt-4 mb-2 clear-both">{children}</h4>,
      normal: ({ children }) => <p className="mb-4 mt-0 leading-relaxed">{children}</p>,
      blockquote: ({ children }) => (
        <blockquote className="border-l-4 border-primary pl-4 italic my-6 clear-both">
          {children}
        </blockquote>
      ),
      hr: () => <hr className="my-8 border-t-2 border-gray-200 clear-both" />,
    },
    marks: {
      link: ({ children, value }) => {
        const rel = !value.href.startsWith('/') ? 'noreferrer noopener' : undefined;
        return (
          <Link
            href={value.href}
            rel={rel}
            className="underline underline-offset-4 text-purple-700 hover:text-purple-800 hover:no-underline transition-colors"
          >
            {children}
          </Link>
        );
      },
      strong: ({ children }) => <strong className="font-bold">{children}</strong>,
      em: ({ children }) => <em className="italic">{children}</em>,
    },
    list: {
      bullet: ({ children }) => <ul className="list-disc pl-6 mb-4 clear-both">{children}</ul>,
    },
    listItem: {
      bullet: ({ children }) => <li className="mb-1">{children}</li>,
    },
  };

  return (
    <div className="prose prose-lg max-w-none">
      <PortableText value={content} components={components} />
    </div>
  );
};

export default BlockContent;
