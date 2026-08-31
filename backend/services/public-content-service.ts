import type { PublicContent, PublicContentKey } from '@/backend/models/public-content';
import type { PublicContentRepository } from '@/backend/repositories/public-content-repository';
import type { PublicDataSnapshotRepository } from '@/backend/repositories/public-data-snapshot-repository';
import { hasUsableData } from '@/backend/shared/has-usable-data';
import {
    normalizeClientAssets,
    normalizeNewsAssets,
    normalizeProjectAssets,
    normalizeSettingsAssets,
} from '@/lib/public-content-assets';

function describeError(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }

    if (error && typeof error === 'object') {
        try {
            return JSON.stringify(error);
        } catch {
            return 'Unknown data source error';
        }
    }

    return String(error);
}

export class PublicContentService {
    constructor(
        private readonly contentRepository: PublicContentRepository,
        private readonly snapshotRepository: PublicDataSnapshotRepository,
        private readonly fallbackContent: PublicContent,
        private readonly isDataSourceConfigured: () => boolean
    ) {}

    async getSettings(): Promise<PublicContent['settings']> {
        const settings = await this.load('settings', () => this.contentRepository.loadSettings());
        return normalizeSettingsAssets(settings);
    }

    async getClients(): Promise<PublicContent['clients']> {
        const clients = await this.load('clients', () => this.contentRepository.loadClients());
        return clients.map(normalizeClientAssets);
    }

    async getProjects(): Promise<PublicContent['projects']> {
        const projects = await this.load('projects', () => this.contentRepository.loadProjects());
        return projects.map(normalizeProjectAssets);
    }

    async getNews(): Promise<PublicContent['news']> {
        const news = await this.load('news', () => this.contentRepository.loadNews());
        return news.map(normalizeNewsAssets);
    }

    getExperience(): Promise<PublicContent['experience']> {
        return this.load('experience', () => this.contentRepository.loadExperience());
    }

    getServices(): Promise<PublicContent['services']> {
        return this.load('services', () => this.contentRepository.loadServices());
    }

    async refreshSnapshot(key: PublicContentKey): Promise<void> {
        if (!this.isDataSourceConfigured()) {
            return;
        }

        const refreshers: Record<PublicContentKey, () => Promise<unknown>> = {
            settings: () => this.getSettings(),
            clients: () => this.getClients(),
            projects: () => this.getProjects(),
            news: () => this.getNews(),
            experience: () => this.getExperience(),
            services: () => this.getServices(),
        };

        try {
            await refreshers[key]();
        } catch (error) {
            console.warn(`Unable to refresh public data snapshot for ${key}:`, error);
        }
    }

    private async load<Key extends PublicContentKey>(
        key: Key,
        loader: () => Promise<PublicContent[Key] | null>
    ): Promise<PublicContent[Key]> {
        if (!this.isDataSourceConfigured()) {
            return this.readSnapshotOrFallback(key);
        }

        try {
            const data = await loader();

            if (!hasUsableData(data)) {
                return this.readSnapshotOrFallback(key);
            }

            await this.snapshotRepository.write(key, data);
            return data;
        } catch (error) {
            console.warn(
                `Unable to fetch ${key}; using the local snapshot or fallback data: ${describeError(error)}`
            );
            return this.readSnapshotOrFallback(key);
        }
    }

    private async readSnapshotOrFallback<Key extends PublicContentKey>(
        key: Key
    ): Promise<PublicContent[Key]> {
        const snapshot = await this.snapshotRepository.read(key);
        return snapshot ?? this.fallbackContent[key];
    }
}
