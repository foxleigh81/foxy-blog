import {TagIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export type Tag = {
  _id: string;
  name: string;
  color: {
    hex: string;
    hsl: {
      h: number;
      s: number;
      l: number;
      a: number;
    };
    hsv: {
      h: number;
      s: number;
      v: number;
      a: number;
    };
    rgb: {
      r: number;
      g: number;
      b: number;
      a: number;
    };
    alpha: number;
  };
};

// The actual schema goes into the schema types directory
export const tagType = defineType({
  name: 'tag',
  title: 'Tag',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Tag Name',
      description: 'Must be in lower-kebab-case format (e.g., "react-hooks" or "next-js")',
      type: 'string',
      validation: Rule => Rule.required()
        .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
          name: 'lower-kebab-case',
          invert: false
        })
        .error('Tag name must be in lower-kebab-case format (only lowercase letters, numbers, and hyphens)'),
    }),
    defineField({
      name: 'color',
      title: 'Color',
      description: 'Choose a color for this tag',
      type: 'color',
      validation: Rule => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'name',
      color: 'color',
    },
    prepare: ({title, color}) => {
      return {
        title,
        subtitle: color?.hex || 'No color selected',
        media: TagIcon
      }
    }
  },
})
