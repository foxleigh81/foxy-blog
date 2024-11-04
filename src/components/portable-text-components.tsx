import React, { ReactNode } from 'react';
import {
  internalGroqTypeReferenceTo,
  SanityImageCrop,
  SanityImageHotspot
} from '../../sanity.types';
import { imageBuilder } from '../sanity';
import {
  PortableTextComponentProps,
  PortableTextComponents as TPortableTextComponents
} from '@portabletext/react';

type SanityImage = {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
    _weak?: boolean;
    [internalGroqTypeReferenceTo]?: 'sanity.imageAsset';
  };
  hotspot?: SanityImageHotspot;
  crop?: SanityImageCrop;
  alt: string;
  attribution?: string;
  caption?: string;
};

type LinkMark = {
  _type: 'link';
  href: string;
};

export const PortableTextComponents: TPortableTextComponents = {
  types: {
    image: ({ value }: PortableTextComponentProps<SanityImage>) => (
      <>
        <img src={imageBuilder.image(value).url()} alt={value.alt} />
        {value.attribution && <p>credit: {value.attribution}</p>}
        {value.caption && <p>{value.caption}</p>}
      </>
    ),
    youtube: ({ value }) => {
      return (
        <div
          className="w-full my-4"
          style={{ position: 'relative', paddingBottom: '56.25%' }}
        >
          <iframe
            src={`https://www.youtube.com/embed/${value.video.id}`}
            title={value.title}
            className="absolute top-0 left-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }
  },
  marks: {
    link: ({ value, children }) => {
      const target = (value?.href || '').startsWith('http')
        ? '_blank'
        : undefined;
      return (
        <a
          href={value?.href}
          target={target}
          rel={target === '_blank' ? 'noindex nofollow' : undefined}
        >
          {children}
        </a>
      );
    }
  },
  block: {
    code: ({ children }) => {
      return (
        <pre className="bg-gray-900 text-white p-4 rounded-md overflow-auto">
          <code className="text-sm font-mono">{children}</code>
        </pre>
      );
    },
    normal: ({ children }) => {
      return (
        <p className="text-base text-gray-800 leading-relaxed mb-1">
          {children}
        </p>
      );
    },
    h1: () => {
      throw new Error('h1 is not allowed in PortableText');
    },
    h2: ({ children }) => {
      return (
        <h2 className="text-3xl font-semibold text-gray-900 mb-5 mt-4">
          {children}
        </h2>
      );
    },
    h3: ({ children }) => {
      return (
        <h3 className="text-2xl font-semibold text-gray-900 mb-4 mt-4">
          {children}
        </h3>
      );
    },
    h4: ({ children }) => {
      return (
        <h4 className="text-xl font-medium text-gray-900 mb-3 mt-2">
          {children}
        </h4>
      );
    },
    h5: ({ children }) => {
      return (
        <h5 className="text-lg font-medium text-gray-900 mb-2">{children}</h5>
      );
    },
    h6: ({ children }) => {
      return (
        <h6 className="text-base font-medium text-gray-900 mb-1">{children}</h6>
      );
    },
    blockquote: ({ children }) => {
      return (
        <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-700 mb-4">
          {children}
        </blockquote>
      );
    },
    hr: () => {
      return (
        <hr
          className="border-t border-gray-800 my-6"
          style={{ height: '1px' }}
        />
      );
    }
  },
  list: {
    bullet: ({ children }) => {
      return <ul className="list-disc list-inside mb-4 ml-4">{children}</ul>;
    },
    number: ({ children }) => {
      return <ol className="list-decimal list-inside mb-4 ml-4">{children}</ol>;
    }
  },
  listItem: ({ children }) => {
    return <li className="mb-1">{children}</li>;
  }
};
