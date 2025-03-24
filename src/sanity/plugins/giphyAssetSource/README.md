# Giphy Asset Source for Sanity

This is a custom asset source plugin for Sanity, allowing you to search and select GIFs from Giphy directly within the Sanity Studio.

## Usage

This plugin is already configured in the Sanity Studio. When inserting an image, you'll see a "Giphy" option in the asset source dropdown.

## Configuration

The plugin requires a Giphy API key to be set in the environment variables:

```
SANITY_STUDIO_GIPHY_API_KEY=your_giphy_api_key
```

You can get a Giphy API key by signing up at the [Giphy Developer Portal](https://developers.giphy.com/).

## Implementation Details

This plugin uses the Sanity v3 plugin system and asset source API to integrate Giphy search functionality directly into the Studio.

### Files:

- `GiphyAssetSource.tsx`: The main component that handles the search UI and selection logic
- `index.ts`: The plugin definition that registers the asset source with Sanity
