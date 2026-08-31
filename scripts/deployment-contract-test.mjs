import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migrationUrl = 'postgresql://migration-role@example.test/database';
const runtimeUrl = 'postgresql://runtime-role@example.test/database';

process.env.MIGRATION_DATABASE_URL = migrationUrl;
process.env.DATABASE_URL = runtimeUrl;

const prismaConfig = (await import('../prisma.config.ts')).default;
const {
    getRuntimeDatabaseUrl,
    requireBootstrapDatabaseUrl,
} = await import('../lib/database-urls.ts');

assert.equal(prismaConfig.datasource?.url, migrationUrl);
assert.equal(getRuntimeDatabaseUrl(process.env), runtimeUrl);
assert.equal(
    requireBootstrapDatabaseUrl({
        MIGRATION_DATABASE_URL: migrationUrl,
        DATABASE_URL: runtimeUrl,
        DTG_DATABASE_BOOTSTRAP_ENABLED: 'true',
    }),
    migrationUrl,
);
assert.throws(
    () => requireBootstrapDatabaseUrl({
        MIGRATION_DATABASE_URL: migrationUrl,
        DATABASE_URL: runtimeUrl,
    }),
    /Database bootstrap is disabled/,
);
assert.throws(
    () => requireBootstrapDatabaseUrl({
        DATABASE_URL: runtimeUrl,
        DTG_DATABASE_BOOTSTRAP_ENABLED: 'true',
    }),
    /MIGRATION_DATABASE_URL is required/,
);

const packageJson = JSON.parse(
    await readFile(new URL('../package.json', import.meta.url), 'utf8'),
);
assert.match(packageJson.scripts.start, /^prisma migrate deploy && next start /);
assert.doesNotMatch(packageJson.scripts.start, /prisma db seed/);

console.log('deployment contract tests passed');
