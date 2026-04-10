import type { NextConfig } from "next";
import withPWA from 'next-pwa';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.youtube.com https://www.google.com https://s.ytimg.com https://www.gstatic.com",
              "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: http:",
              "font-src 'self' data:",
              "connect-src 'self' https://youtube-transcript-api.vercel.app https://api.mymemory.translated.net https://www.youtube.com",
              "media-src 'self' https://www.youtube.com https://*.googlevideo.com",
              "worker-src 'self' blob:",
              "child-src 'self' https://www.youtube.com blob:",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default withNextIntl(withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})(nextConfig));
