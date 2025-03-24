import { definePlugin } from 'sanity'
import { giphyAssetSource } from './GiphyAssetSource.js'

export const giphyAssetSourcePlugin = definePlugin({
  name: 'giphy-asset-source',
  form: {
    image: {
      assetSources: (prev) => {
        return [...prev, giphyAssetSource]
      },
    },
  },
})
