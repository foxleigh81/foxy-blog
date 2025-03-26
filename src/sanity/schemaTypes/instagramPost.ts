import { defineType, defineField } from 'sanity';

export const instagramPost = defineType({
  name: 'instagram',
  type: 'object',
  title: 'Instagram Post',
  fields: [
    defineField({
      name: 'url',
      type: 'url',
      title: 'Instagram URL',
      description: 'The URL of the Instagram post (e.g., https://www.instagram.com/p/CpzRZPmNxXO/)',
      validation: (Rule) =>
        Rule.required().uri({
          scheme: ['http', 'https'],
        }),
    }),
  ],
  preview: {
    select: {
      url: 'url',
    },
    prepare({ url }) {
      return {
        title: 'Instagram Post',
        subtitle: url,
      };
    },
  },
});
