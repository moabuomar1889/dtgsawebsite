import type { PublicContentRepository } from '@/backend/repositories/public-content-repository';
import { mapClient, mapNews, mapProject, mapSettings } from '@/backend/mappers/public-content';
import { getPrisma } from '@/lib/db';

export class PrismaPublicContentRepository implements PublicContentRepository {
    async loadSettings() {
        const record = await getPrisma().settings.findFirst();
        return record ? mapSettings(record) : null;
    }

    async loadClients() {
        const records = await getPrisma().client.findMany({
            where: { is_active: true },
            orderBy: { sort_order: 'asc' },
        });
        return records.map(mapClient);
    }

    async loadProjects() {
        const records = await getPrisma().project.findMany({
            include: { client: true },
            orderBy: [
                { is_featured: 'desc' },
                { sort_order: 'asc' },
                { created_at: 'desc' },
            ],
        });
        return records.map(mapProject);
    }

    async loadNews() {
        const records = await getPrisma().news.findMany({
            where: { is_published: true },
            orderBy: { date: 'desc' },
            take: 3,
        });
        return records.map(mapNews);
    }

    loadExperience() {
        return getPrisma().experience.findMany({ orderBy: { sort_order: 'asc' } });
    }

    loadServices() {
        return getPrisma().service.findMany({ orderBy: { sort_order: 'asc' } });
    }
}
