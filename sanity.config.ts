import { defineConfig } from 'sanity'
import { schemaTypes } from './sanity-schemas'
import { visionTool } from '@sanity/vision'
import { structureTool } from 'sanity/structure'
import { codeInput } from '@sanity/code-input'
import { youtubeInput } from 'sanity-plugin-youtube-input'
import { unsplashImageAsset } from 'sanity-plugin-asset-source-unsplash'
import { markdownSchema } from 'sanity-plugin-markdown'

export default defineConfig({
  name: 'default',
  title: 'The Foxy Blog',

  projectId: process.env.SANITY_STUDIO_PROJECT_ID || '',
  dataset: process.env.SANITY_STUDIO_DATASET || '',

  plugins: [
    structureTool(),
    visionTool(),
    unsplashImageAsset(),
    codeInput(),
    markdownSchema(),
    youtubeInput({ apiKey: process.env.SANITY_STUDIO_YOUTUBE_API_KEY || '' }),
  ],

  schema: {
    types: schemaTypes,
  },
})