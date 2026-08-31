import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, type Prisma } from '../generated/prisma/client';
import { requireBootstrapDatabaseUrl } from '../lib/database-urls';
import {
    fallbackClients,
    fallbackExperience,
    fallbackNews,
    fallbackProjects,
    fallbackServices,
    fallbackSettings,
} from '../lib/fallback-data';

const BOOTSTRAP_LOCK_ID = BigInt('44554477100109053');

async function seedSettings(database: Prisma.TransactionClient) {
    if (await database.settings.count() > 0) return;

    await database.settings.create({
        data: fallbackSettings,
    });
}

async function seedClients(database: Prisma.TransactionClient) {
    if (await database.client.count() > 0) return;

    await database.client.createMany({
        data: fallbackClients.map(({ id, ...client }) => {
            void id;
            return client;
        }),
    });
}

async function seedPublicSections(database: Prisma.TransactionClient) {
    if (await database.experience.count() === 0) {
        await database.experience.createMany({
            data: fallbackExperience.map(({ id, ...record }) => {
                void id;
                return record;
            }),
        });
    }

    if (await database.service.count() === 0) {
        await database.service.createMany({
            data: fallbackServices.map(({ id, ...record }) => {
                void id;
                return record;
            }),
        });
    }

    if (await database.project.count() === 0) {
        await database.project.createMany({
            data: fallbackProjects.map(({ id, ...record }) => {
                void id;
                return { ...record, gallery_urls: [] };
            }),
        });
    }

    if (await database.news.count() === 0) {
        await database.news.createMany({
            data: fallbackNews.map(({ id, date, ...record }) => {
                void id;
                return { ...record, date: new Date(`${date}T00:00:00.000Z`) };
            }),
        });
    }
}

async function main() {
    const connectionString = requireBootstrapDatabaseUrl();
    const prisma = new PrismaClient({
        adapter: new PrismaPg({ connectionString }),
    });

    try {
        await prisma.$transaction(async (database) => {
            await database.$queryRaw`SELECT pg_advisory_xact_lock(${BOOTSTRAP_LOCK_ID})`;
            await seedSettings(database);
            await seedClients(database);
            await seedPublicSections(database);
        });
        console.log('Public website bootstrap data is ready.');
    } finally {
        await prisma.$disconnect();
    }
}

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
