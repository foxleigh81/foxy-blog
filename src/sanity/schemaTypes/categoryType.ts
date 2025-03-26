import { TagIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

export type Category = {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  description?: string;
};

export const categoryType = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {
        source: 'title',
      },
    }),
    defineField({
      name: 'description',
      type: 'text',
    }),
  ],
});
