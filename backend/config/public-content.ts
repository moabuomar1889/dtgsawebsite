import type { PublicContent } from '@/backend/models/public-content';
import { FilePublicDataSnapshotRepository } from '@/backend/repositories/file-public-data-snapshot-repository';
import { SupabasePublicContentRepository } from '@/backend/repositories/supabase-public-content-repository';
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
            new SupabasePublicContentRepository(),
            new FilePublicDataSnapshotRepository(),
            fallbackContent,
            () => Boolean(
                process.env.NEXT_PUBLIC_SUPABASE_URL
                && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            )
        );
    }

    return publicContentService;
}
