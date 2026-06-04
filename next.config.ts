import type { NextConfig } from "next";
const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    qualities: [75, 100]
  },
  headers: async () => {
    if (!isProd) return [];

    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY"
          }, 
          {
            key: "X-Content-Type-Options",
            value: "nosniff"
          }, 
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; img-src 'self' data: blob: https://*.tile.openstreetmap.org https://*.openstreetmap.org; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; connect-src 'self' https://*.tile.openstreetmap.org https://*.openstreetmap.org; worker-src blob:;"
          }, 
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin"
          }, 
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload"
          }
        ]
      }
    ]
  }
};

export default nextConfig;
