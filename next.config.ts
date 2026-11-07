import type { NextConfig } from "next";
const origin = "https://www.thebenzzcreations.com";
const legacyServices: Record<string, string> = {
  websites: "website-development",
  "mobile-apps": "mobile-app-development",
  "custom-software": "custom-software-development",
  "ai-automation": "ai-integration-automation",
  ecommerce: "ecommerce-development",
  "seo-support": "digital-marketing",
  "brand-identity": "ui-ux-design",
  "ai-visuals": "ui-ux-design",
};
const nextConfig: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  trailingSlash: false,
  compress: true,
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "thebenzzcreations.com" }],
        destination: `${origin}/:path*`,
        permanent: true,
      },
      ...(process.env.NODE_ENV === "production"
        ? [
            {
              source: "/:path*",
              has: [
                { type: "host" as const, value: "www.thebenzzcreations.com" },
                {
                  type: "header" as const,
                  key: "x-forwarded-proto",
                  value: "http",
                },
              ],
              destination: `${origin}/:path*`,
              permanent: true,
            },
          ]
        : []),
      { source: "/index.html", destination: "/", permanent: true },
      ...["process", "faq"].flatMap((section) => [
        { source: `/${section}`, destination: `/#${section}`, permanent: true },
        {
          source: `/${section}.html`,
          destination: `/#${section}`,
          permanent: true,
        },
      ]),
      { source: "/services.html", destination: "/services", permanent: true },
      { source: "/service.html", destination: "/services", permanent: true },
      { source: "/work.html", destination: "/work", permanent: true },
      { source: "/solutions", destination: "/#build", permanent: true },

      ...Object.entries(legacyServices).map(([from, to]) => ({
        source: `/services/${from}`,
        destination: `/services/${to}`,
        permanent: true,
      })),
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        source: "/api/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/social/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=2592000",
          },
        ],
      },
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/vendor/three-r128.min.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};
export default nextConfig;
