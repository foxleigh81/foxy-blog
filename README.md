# The Foxy Blog

A modern, responsive blog built with [Next.js](https://nextjs.org), [Tailwind CSS](https://tailwindcss.com), and [Sanity CMS](https://www.sanity.io). This project serves as the personal blog for me, Alexander Foxleigh, featuring various categories of content including technical articles, digital industry insights, and personal musings.

## Features

- **Modern Stack**: Built with Next.js, TypeScript, and Tailwind CSS
- **Content Management**: Powered by Sanity CMS for easy content creation and management
- **Rich Content**: Support for embedded content including YouTube videos and Instagram posts

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- A Sanity account (for CMS functionality)

### Environment Setup

1. Clone this repository
2. Copy `.env.sample` to `.env.local` and fill in the required values:

   ```
   NEXT_PUBLIC_SANITY_PROJECT_ID="your-sanity-project-id"
   NEXT_PUBLIC_SANITY_DATASET="production"
   NEXT_PUBLIC_SANITY_API_VERSION="2023-05-03"
   SANITY_STUDIO_YOUTUBE_API_KEY="your-youtube-api-key" (if using YouTube integration)

   # Optional: Enable single author mode (if you're the only author)
   SANITY_STUDIO_SINGLE_AUTHOR_MODE="true"
   ```

### Installation

```bash
# Install dependencies
yarn install

# Run the development server (includes Sanity Studio)
yarn dev
```

The site will be available at [http://localhost:3000](http://localhost:3000).

### Sanity Studio

The Sanity Studio will be available at [http://localhost:3333](http://localhost:3333).

## Development

### Adding New Components

Place new components in the `src/components` directory with their own folder:

```
src/components/ComponentName/index.tsx
```

### Styling

This project uses Tailwind CSS for styling. The configuration can be found in `tailwind.config.js`.

### Content Management

Content is managed through Sanity Studio. The schemas are defined in the `src/sanity/schemaTypes` directory.

### Instagram Embeds

You can embed Instagram posts in your blog content using the Instagram embed block in the Sanity editor. Simply:

1. In the Sanity editor, place your cursor where you want to embed the Instagram post
2. Click the "+" button to add a block
3. Select "Instagram"
4. Paste the Instagram post URL (e.g., `https://www.instagram.com/p/CpzRZPmNxXO/` or `https://www.instagram.com/reel/CpzRZPmNxXO/`)

The Instagram post will be embedded in your content and will be responsive on all devices.

### Single Author Mode

If you're the only author of your blog, you can enable single author mode by setting the following environment variables:

```
SANITY_STUDIO_SINGLE_AUTHOR_MODE="true"
```

When single author mode is enabled:

1. New posts will automatically use the first author in your Sanity dataset as the default
2. The author field will still be visible and editable if you need to change it
3. This simplifies the post creation process for single-author blogs

You can still use this mode even if you have multiple authors, it just means the first author will be used by default.

## Deployment

The site can be deployed to any platform that supports Next.js applications, such as Vercel or Netlify.

```bash
# Build for production
yarn build

# Start production server
yarn start
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Alexander Foxleigh](http://www.alexfoxleigh.com) - Creator and maintainer
- [Next.js](https://nextjs.org) team for the amazing framework
- [Sanity](https://www.sanity.io) team for the flexible CMS
- [Tailwind CSS](https://tailwindcss.com) for the utility-first CSS framework (I still don't like you)
