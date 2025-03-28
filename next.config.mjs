/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/bull-board/:path*",
        destination: "http://localhost:3001/api/bull-board/:path*",
      },
    ];
  },
};

export default nextConfig;
