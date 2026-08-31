import type {
    Client,
    Experience,
    News,
    Project,
    Service,
    Settings,
} from '@/lib/types/content';

export interface PublicContent {
    settings: Partial<Settings>;
    clients: Partial<Client>[];
    projects: Partial<Project>[];
    news: Partial<News>[];
    experience: Partial<Experience>[];
    services: Partial<Service>[];
}

export type PublicContentKey = keyof PublicContent;
