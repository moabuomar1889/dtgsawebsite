import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const databaseUrl =
    process.env.MIGRATION_DATABASE_URL?.trim() ||
    process.env.DATABASE_URL?.trim();

export default defineConfig({
    schema: 'prisma/schema.prisma',
    migrations: {
        path: 'prisma/migrations',
        seed: 'tsx prisma/seed.ts',
    },
    ...(databaseUrl ? { datasource: { url: databaseUrl } } : {}),
});
