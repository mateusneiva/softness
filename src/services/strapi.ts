/**
 * Public storefront → Strapi (read-only CMS content).
 * Catalog/commerce stays on the Fastify API via `apiClient`.
 */

import axios from 'axios';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL?.replace(/\/$/, '') || '';
const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_TOKEN || process.env.STRAPI_API_TOKEN || '';

export function isStrapiConfigured() {
  return Boolean(STRAPI_URL);
}

export const strapiClient = axios.create({
  timeout: 15000,
});

strapiClient.interceptors.request.use((config) => {
  if (!STRAPI_URL) {
    return Promise.reject(new Error('Strapi is not configured'));
  }

  const path = config.url?.startsWith('/') ? config.url : `/${config.url ?? ''}`;
  config.baseURL = STRAPI_URL;
  config.url = path;
  config.headers['Content-Type'] = 'application/json';
  if (STRAPI_TOKEN) {
    config.headers.Authorization = `Bearer ${STRAPI_TOKEN}`;
  }
  return config;
});

strapiClient.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error),
);

type StrapiListResponse<T> = {
  data: Array<{ id: number; attributes: T }>;
};

export async function getStrapiBanners() {
  if (!isStrapiConfigured()) return null;

  const payload = await strapiClient.get<
    StrapiListResponse<{
      title: string;
      subtitle?: string;
      link?: string;
      buttonText?: string;
      image?: { data?: { attributes?: { url?: string } } };
    }>,
    StrapiListResponse<{
      title: string;
      subtitle?: string;
      link?: string;
      buttonText?: string;
      image?: { data?: { attributes?: { url?: string } } };
    }>
  >('/api/banners?populate=image&filters[active][$eq]=true&sort=order:asc');

  return payload.data.map((entry) => {
    const imagePath = entry.attributes.image?.data?.attributes?.url;
    return {
      id: String(entry.id),
      title: entry.attributes.title,
      subtitle: entry.attributes.subtitle ?? null,
      link: entry.attributes.link ?? null,
      buttonText: entry.attributes.buttonText ?? null,
      imageUrl: imagePath ? (imagePath.startsWith('http') ? imagePath : `${STRAPI_URL}${imagePath}`) : '',
      order: 0,
      active: true,
    };
  });
}
