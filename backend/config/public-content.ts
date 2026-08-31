import type { PublicContent } from '@/backend/models/public-content';
import { NoOpPublicDataSnapshotRepository } from '@/backend/repositories/no-op-public-data-snapshot-repository';
import { PrismaPublicContentRepository } from '@/backend/repositories/prisma-public-content-repository';
import { PublicContentService } from '@/backend/services/public-content-service';
import {
    fallbackClients,
    fallbackExperience,
    fallbackNews,
    fallbackProjects,
    fallbackServices,
    fallbackSettings,
} from '@/lib/fallback-data';

const fallbackContent: PublicContent = {
    settings: fallbackSettings,
    clients: fallbackClients,
    projects: fallbackProjects,
    news: fallbackNews,
    experience: fallbackExperience,
    services: fallbackServices,
};

let publicContentService: PublicContentService | null = null;

export function getPublicContentService(): PublicContentService {
    if (!publicContentService) {
        publicContentService = new PublicContentService(
            new PrismaPublicContentRepository(),
            new NoOpPublicDataSnapshotRepository(),
            fallbackContent,
            () => Boolean(process.env.DATABASE_URL)
        );
    }

    return publicContentService;
}
