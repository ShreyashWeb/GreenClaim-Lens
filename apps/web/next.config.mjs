/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@greenclaim/core', '@greenclaim/retrieval', '@greenclaim/sdk'],
};

export default nextConfig;
