import type { PublicContent } from '@/backend/models/public-content';

export interface PublicContentRepository {
    loadSettings(): Promise<PublicContent['settings'] | null>;
    loadClients(): Promise<PublicContent['clients'] | null>;
    loadProjects(): Promise<PublicContent['projects'] | null>;
    loadNews(): Promise<PublicContent['news'] | null>;
    loadExperience(): Promise<PublicContent['experience'] | null>;
    loadServices(): Promise<PublicContent['services'] | null>;
}
