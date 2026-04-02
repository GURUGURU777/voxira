/** @type {import('next').NextConfig} */
const nextConfig = {
  generateBuildId: () => Date.now().toString(),
};

export default nextConfig;
