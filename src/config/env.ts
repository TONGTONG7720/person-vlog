import { z } from 'zod';

const publicEnvironmentSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
});

const publicEnvironment = publicEnvironmentSchema.parse({
  NEXT_PUBLIC_SITE_URL: process.env['NEXT_PUBLIC_SITE_URL'],
});

const siteUrl = publicEnvironment.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
const isLocalSiteUrl = new URL(siteUrl).hostname === 'localhost';

export const env = {
  isProductionSite:
    process.env['VERCEL_ENV'] === 'production' ||
    (process.env['NODE_ENV'] === 'production' && !isLocalSiteUrl),
  siteUrl,
} as const;
