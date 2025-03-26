import { defineType } from 'sanity';

export const hr = defineType({
  name: 'hr',
  title: 'Horizontal Rule',
  type: 'object',
  fields: [
    {
      name: 'style',
      title: 'Style',
      type: 'string',
      initialValue: 'default',
      options: {
        list: [{ title: 'Default', value: 'default' }],
      },
      hidden: true,
    },
  ],
  preview: {
    prepare() {
      return {
        title: 'Horizontal Rule',
      };
    },
  },
});
