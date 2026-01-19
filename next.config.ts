import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  async headers(){
    return [
      {
        source: "/api/(.*)",
        headers:[
          {
            key: "Access-Control-Allow-Origin",
            value:"*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value:"GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:"Content-Type, Authorization",
          },
          {
            key: "Content-Range",
            value:"bytes : 0-9/*",
          },
        ]
      }
    ]
  }
};

export default nextConfig;
