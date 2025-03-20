/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["cdn.sanity.io"],
  },
  experimental: {
    allowedDevOrigins: ['localhost', '127.0.0.1'],
  },
};

module.exports = nextConfig;
