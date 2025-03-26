import { defineField, defineType } from 'sanity';
import { StarIcon } from '@sanity/icons';

export const featuredPostType = defineType({
  name: 'featuredPost',
  title: 'Featured Post',
  type: 'document',
  icon: StarIcon,
  fields: [
    defineField({
      name: 'post',
      title: 'Featured Post',
      type: 'reference',
      to: [{ type: 'post' }],
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'post.title',
      media: 'post.mainImage',
    },
    prepare(selection) {
      const { title } = selection;
      return {
        title: title ? `Featured: ${title}` : 'No featured post selected',
      };
    },
  },
});
