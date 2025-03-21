import { defineType } from 'sanity'

export const hr = defineType({
  name: 'hr',
  title: 'Horizontal Rule',
  type: 'object',
  fields: [],
  preview: {
    prepare() {
      return {
        title: 'Horizontal Rule'
      }
    }
  }
})
