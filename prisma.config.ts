import 'dotenv/config';

import { defineConfig } from 'prisma/config';

const localDevelopmentDatabaseUrl = 'postgresql://postgres:postgres@localhost:5432/tong_cms';

export default defineConfig({
  datasource: {
    url: process.env['DATABASE_URL'] ?? localDevelopmentDatabaseUrl,
  },
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  schema: 'prisma/schema.prisma',
});
