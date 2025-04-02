'use client';

/**
 * This configuration is used to for the Sanity Studio that's mounted on the `/app/studio/[[...tool]]/page.tsx` route
 */

import { visionTool } from '@sanity/vision';
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { dashboardTool } from '@sanity/dashboard';
import { projectInfoWidget } from '@sanity/dashboard';
import { documentListWidget } from 'sanity-plugin-dashboard-widget-document-list';

// Plugins
import { codeInput } from '@sanity/code-input';
import { youtubeInput } from 'sanity-plugin-youtube-input';
import { unsplashImageAsset } from 'sanity-plugin-asset-source-unsplash';
import { markdownSchema } from 'sanity-plugin-markdown';
import { colorInput } from '@sanity/color-input';
// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import { apiVersion, dataset, projectId, singleAuthorMode } from './src/sanity/env';
import { schema } from './src/sanity/schemaTypes';
import { structure } from './src/sanity/structure';
import { setDefaultAuthorAction } from './src/sanity/actions/setDefaultAuthor';
import { giphyAssetSourcePlugin } from './src/sanity/plugins/giphyAssetSource';

export default defineConfig({
  name: 'default',
  title: 'The Foxy Blog',
  basePath: '/studio',
  cors: ['https://www.foxleigh.me', 'https://www.foxyblog.com', 'http://localhost:3000'],
  projectId,
  dataset,
  // Add and edit the content schema in the './sanity/schemaTypes' folder
  schema,
  plugins: [
    dashboardTool({
      widgets: [
        projectInfoWidget(),
        documentListWidget({
          title: 'Recent Posts',
          order: '_createdAt desc',
          limit: 5,
          types: ['post'],
          createButtonText: 'Create new post',
        }),
      ],
    }),
    structureTool({ structure }),
    // Vision is for querying with GROQ from inside the Studio
    // https://www.sanity.io/docs/the-vision-plugin
    visionTool({ defaultApiVersion: apiVersion }),
    unsplashImageAsset(),
    codeInput(),
    markdownSchema(),
    youtubeInput({ apiKey: process.env.SANITY_STUDIO_YOUTUBE_API_KEY || '' }),
    colorInput(),
    giphyAssetSourcePlugin(),
  ],
  document: {
    // Only add the default author action if single author mode is enabled
    actions: (prev, context) => {
      if (singleAuthorMode && context.schemaType === 'post') {
        // Add our custom action to the beginning of the list
        return [setDefaultAuthorAction, ...prev];
      }
      return prev;
    },
  },
});
