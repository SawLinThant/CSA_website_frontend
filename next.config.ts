import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hyttogquyukmgowygxfe.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async headers() {
    const csp = [
      "default-src 'self'",
      // Allow images from your backend/CDN (and data URIs for Next/image placeholders).
      "img-src 'self' data: https:",
      // Next + Tailwind typically require inline styles for some generated CSS.
      "style-src 'self' 'unsafe-inline'",
      // Scripts are only from self (Next serves hashed bundles from self).
      "script-src 'self'",
      // Backend calls for SSR.
      "connect-src 'self' https: http:",
      // Prevent clickjacking.
      "frame-ancestors 'none'",
      // Keep the rest tight.
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ");

    const commonHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      },
      { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
      { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
    ];

    // Next.js dev mode uses inline scripts for dev overlays/HMR. CSP in dev commonly breaks reload/HMR.
    if (process.env.NODE_ENV !== "production") {
      return [
        {
          source: "/(.*)",
          headers: commonHeaders,
        },
      ];
    }

    return [
      {
        source: "/(.*)",
        headers: [...commonHeaders, { key: "Content-Security-Policy", value: csp }],
      },
    ];
  },
};

export default nextConfig;
