/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['cdn.sanity.io', 'storage.ko-fi.com'],
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

module.exports = nextConfig;
