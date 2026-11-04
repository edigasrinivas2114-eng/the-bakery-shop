/** @type {import('next').NextConfig} */
const isPreview = process.env.PREVIEW_EXPORT === '1';
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  // Relative asset paths only for the static preview build (hosted under a sub-path).
  assetPrefix: isPreview ? '.' : undefined,
  reactStrictMode: true,
};
export default nextConfig;
