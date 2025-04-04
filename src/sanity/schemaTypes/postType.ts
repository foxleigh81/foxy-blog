import { DocumentTextIcon } from '@sanity/icons';
import { defineArrayMember, defineField, defineType } from 'sanity';
import { BlockContent } from './blockContentType';

export type Post = {
  _id: string;
  title: string;
  subtitle?: string;
  slug: {
    current: string;
  };
  author: {
    _ref: string;
    _type: 'reference';
  };
  mainImage?: {
    asset: {
      _id: string;
      _type: string;
      metadata: {
        dimensions: {
          width: number;
          height: number;
        };
        lqip: string;
      };
    };
    alt?: string;
  };
  categories?: Array<{
    _ref: string;
    _type: 'reference';
  }>;
  publishedAt?: string;
  body: BlockContent;
  excerpt?: string;
  tags?: Array<{
    _ref: string;
    _type: 'reference';
  }>;
  disableComments?: boolean;
  unlisted?: boolean;
  noindex?: boolean;
  relatedPosts?: Array<{
    _ref: string;
    _type: 'reference';
  }>;
  youtube?: {
    _key: string;
    _type: string;
    autoplay: boolean;
    controls: boolean;
    video: {
      id: string;
      title: string;
      description: string;
      publishedAt: string;
      thumbnails: Array<string>;
    };
  };
};

export const postType = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'subtitle',
      title: 'An optional subtitle',
      type: 'string',
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {
        source: 'title',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'author',
      type: 'reference',
      to: { type: 'author' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'mainImage',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
          validation: (Rule) =>
            Rule.custom((alt, context) => {
              if (context?.document?.mainImage && !alt) {
                return 'The mainImage image must have an alt description';
              }
              return true;
            }),
          hidden: ({ document }) => !document?.mainImage,
        },
        {
          name: 'attribution',
          type: 'string',
          title: 'Attribution',
          description: 'Credit for the image (e.g., "Photo by John Doe")',
          hidden: ({ document }) => !document?.mainImage,
        },
      ],
    }),
    defineField({
      name: 'categories',
      type: 'array',
      of: [defineArrayMember({ type: 'reference', to: { type: 'category' } })],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
    }),
    defineField({
      name: 'body',
      type: 'blockContent',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'excerpt',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tags',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'tag' } }],
      options: {
        layout: 'tags',
      },
    }),
    defineField({
      name: 'disableComments',
      title: 'Disable comments',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'unlisted',
      title: 'Hide this article from list pages',
      description:
        'When enabled, this post will not appear in any list views (like the homepage or category pages)',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'noindex',
      title: 'Prevent search engine indexing',
      description: 'When enabled, this post will not be indexed by search engines',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'relatedPosts',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'post' } }],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'mainImage',
    },
    prepare(selection) {
      const { author } = selection;
      return { ...selection, subtitle: author && `by ${author}` };
    },
  },
});
