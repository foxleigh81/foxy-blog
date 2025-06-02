/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
      {
        protocol: 'https',
        hostname: 'storage.ko-fi.com',
      },
      {
        protocol: 'https',
        hostname: 'anziyfomjxqromwfamme.supabase.co',
      },
    ],
  },
  experimental: {
    allowedDevOrigins: ['localhost', '127.0.0.1'],
  },
  async redirects() {
    return [
      {
        source: '/digital-industry/diary-of-a-new-contractor',
        destination: '/digital-industry/becoming-a-contractor',
        permanent: true,
      },
      {
        source:
          '/technically-minded/five-months-later-a-disgruntled-re-review-of-the-motorola-milestone',
        destination: '/meta/this-article-displeased-me',
        permanent: true,
      },
      {
        source: '/technically-minded/android-update-for-milestone-finally-hits-the-uk',
        destination: '/meta/this-article-displeased-me',
        permanent: true,
      },
      {
        source: '/technically-minded/adobe-cs5-launch-the-creative-suite-feature-run-down',
        destination: '/meta/this-article-displeased-me',
        permanent: true,
      },
      {
        source: '/technically-minded/review-motorola-milestone-uk',
        destination: '/meta/this-article-displeased-me',
        permanent: true,
      },
      {
        source: '/technically-minded/head-cloud-justified-rant-technology',
        destination: '/technically-minded/head-in-the-cloud',
        permanent: true,
      },
      {
        source: '/meandering-insanity/i-without-internet',
        destination: '/meandering-insanity/where-would-i-be-without-the-internet',
        permanent: true,
      },
      {
        source: '/rise-against/internet-changing-face-politics/',
        destination: '/meandering-insanity/how-the-internet-is-changing-the-face-of-politics',
        permanent: true,
      },
    ];
  },
};

// Injected content via Sentry wizard below
import { withSentryConfig } from '@sentry/nextjs';

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: 'space-nectar',
  project: 'foxys-tale',

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: '/monitoring',

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
});
