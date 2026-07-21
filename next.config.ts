import type { NextConfig } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5555';

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      '*.svg': {
        loaders: [
          {
            loader: '@svgr/webpack',
            options: {
              icon: true,
            },
          },
        ],
        as: '*.js',
      },
    },
  },
  webpack(config) {
    const fileLoaderRule = config.module.rules.find((rule: unknown) => {
      if (typeof rule !== 'object' || rule === null || !('test' in rule)) return false;
      const test = (rule as { test?: unknown }).test;
      return test instanceof RegExp && test.test('.svg');
    }) as
      | {
          test: RegExp;
          exclude?: RegExp;
          issuer?: unknown;
          resourceQuery?: { not: RegExp[] };
        }
      | undefined;

    if (fileLoaderRule) {
      config.module.rules.push(
        {
          ...fileLoaderRule,
          test: /\.svg$/i,
          resourceQuery: /url/,
        },
        {
          test: /\.svg$/i,
          issuer: fileLoaderRule.issuer,
          resourceQuery: { not: [...(fileLoaderRule.resourceQuery?.not ?? []), /url/] },
          use: [
            {
              loader: '@svgr/webpack',
              options: {
                icon: true,
              },
            },
          ],
        }
      );
      fileLoaderRule.exclude = /\.svg$/i;
    }

    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5555',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '5555',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'fastly.picsum.photos',
        pathname: '/**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: API_URL,
  },
};

export default nextConfig;
