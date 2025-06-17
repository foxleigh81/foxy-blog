import { defineType, defineArrayMember } from 'sanity';
import { ImageIcon } from '@sanity/icons';
import { internalLinkType } from './internalLinkType';

/**
 * This is the schema type for block content used in the post document type
 * Importing this type into the studio configuration's `schema` property
 * lets you reuse it in other document types with:
 *  {
 *    name: 'someName',
 *    title: 'Some title',
 *    type: 'blockContent'
 *  }
 */

export type BlockContent = Array<
  | {
      _type: 'block';
      children: Array<{
        _type: 'span';
        text: string;
        marks?: Array<'strong' | 'em' | 'code' | 'strike-through'>;
      }>;
      style?: 'normal' | 'h1' | 'h2' | 'h3' | 'h4' | 'blockquote';
      markDefs?: Array<
        | {
            _key: string;
            _type: 'link';
            href: string;
          }
        | {
            _key: string;
            _type: 'internalLink';
            reference: {
              _type: 'post' | 'category' | 'author';
              slug: {
                current: string;
              };
              categories?: {
                slug: {
                  current: string;
                };
              };
            };
          }
      >;
    }
  | {
      _type: 'image';
      asset: {
        _ref: string;
        _type: 'reference';
      };
      alt?: string;
      caption?: string;
      attribution?: string;
      alignment?: 'full' | 'left' | 'right' | 'center';
    }
  | {
      _type: 'instagram';
      url: string;
    }
  | {
      _type: 'hr';
    }
  | {
      _type: 'code';
      code?: string;
      language?: string;
    }
>;

export const blockContentType = defineType({
  title: 'Block Content',
  name: 'blockContent',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      // Styles let you define what blocks can be marked up as. The default
      // set corresponds with HTML tags, but you can set any title or value
      // you want, and decide how you want to deal with it where you want to
      // use your content.
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'H1', value: 'h1' },
        { title: 'H2', value: 'h2' },
        { title: 'H3', value: 'h3' },
        { title: 'H4', value: 'h4' },
        { title: 'Quote', value: 'blockquote' },
      ],
      lists: [{ title: 'Bullet', value: 'bullet' }],
      // Marks let you mark up inline text in the Portable Text Editor
      marks: {
        // Annotations can be any object structure – e.g. a link or a footnote.
        annotations: [
          {
            title: 'URL',
            name: 'link',
            type: 'object',
            fields: [
              {
                title: 'URL',
                name: 'href',
                type: 'url',
              },
            ],
          },
          internalLinkType,
        ],
      },
    }),
    // You can add additional types here. Note that you can't use
    // primitive types such as 'string' and 'number' in the same array
    // as a block type.
    defineArrayMember({
      type: 'image',
      icon: ImageIcon,
      options: {
        hotspot: true,
        metadata: ['image', 'location'],
      },
      fields: [
        {
          title: 'Caption',
          name: 'caption',
          type: 'string',
        },
        {
          title: 'Attribution',
          name: 'attribution',
          type: 'string',
        },
        {
          title: 'Alt text',
          name: 'alt',
          type: 'string',
          validation: (Rule) => Rule.required(),
        },
        {
          title: 'Alignment',
          name: 'alignment',
          type: 'string',
          options: {
            list: [
              { title: 'Full width', value: 'full' },
              { title: 'Left', value: 'left' },
              { title: 'Right', value: 'right' },
              { title: 'Center', value: 'center' },
            ],
            layout: 'radio',
          },
          initialValue: 'full',
        },
      ],
    }),
    defineArrayMember({
      type: 'object',
      name: 'code',
      title: 'Code Block',
      fields: [
        {
          name: 'code',
          type: 'text',
          title: 'Code',
        },
        {
          name: 'language',
          type: 'string',
          title: 'Language',
          options: {
            list: [
              { title: 'Plain Text', value: 'plaintext' },
              { title: 'JavaScript', value: 'javascript' },
              { title: 'TypeScript', value: 'typescript' },
              { title: 'HTML', value: 'markup' },
              { title: 'CSS', value: 'css' },
              { title: 'Python', value: 'python' },
              { title: 'Java', value: 'java' },
              { title: 'C++', value: 'cpp' },
              { title: 'C#', value: 'csharp' },
              { title: 'Ruby', value: 'ruby' },
              { title: 'PHP', value: 'php' },
              { title: 'Go', value: 'go' },
              { title: 'Rust', value: 'rust' },
              { title: 'Swift', value: 'swift' },
              { title: 'Kotlin', value: 'kotlin' },
              { title: 'Bash', value: 'bash' },
              { title: 'SQL', value: 'sql' },
              { title: 'JSON', value: 'json' },
              { title: 'YAML', value: 'yaml' },
            ],
          },
          initialValue: 'plaintext',
        },
      ],
    }),
    defineArrayMember({
      name: 'youtube',
      type: 'object',
      fields: [
        {
          name: 'video',
          type: 'youtubeVideo',
        },
        {
          name: 'autoplay',
          type: 'boolean',
          initialValue: false,
        },
        {
          name: 'controls',
          type: 'boolean',
          initialValue: true,
        },
      ],
    }),
    // Instagram embed
    defineArrayMember({
      type: 'instagram',
    }),
    // Horizontal rule
    defineArrayMember({
      type: 'hr',
      title: 'Horizontal Rule',
    }),
  ],
});
