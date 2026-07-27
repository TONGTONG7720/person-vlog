import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '@/generated/prisma/client';

type GlobalWithCmsDatabase = typeof globalThis & {
  cmsDatabase?: PrismaClient;
};

const globalWithCmsDatabase: GlobalWithCmsDatabase = globalThis;

export class CmsDatabaseConfigurationError extends Error {
  public constructor() {
    super('CMS database is not configured.');
    this.name = 'CmsDatabaseConfigurationError';
  }
}

export function isCmsDatabaseConfigured(): boolean {
  return (process.env['DATABASE_URL']?.trim().length ?? 0) > 0;
}

export function getCmsDatabase(): PrismaClient | undefined {
  const databaseUrl = process.env['DATABASE_URL']?.trim();

  if (databaseUrl === undefined || databaseUrl.length === 0) {
    return undefined;
  }

  if (globalWithCmsDatabase.cmsDatabase !== undefined) {
    return globalWithCmsDatabase.cmsDatabase;
  }

  const database = new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  });

  if (process.env['NODE_ENV'] !== 'production') {
    globalWithCmsDatabase.cmsDatabase = database;
  }

  return database;
}

export function requireCmsDatabase(): PrismaClient {
  const database = getCmsDatabase();

  if (database === undefined) {
    throw new CmsDatabaseConfigurationError();
  }

  return database;
}
