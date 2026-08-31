import type {
    Client as ClientRecord,
    News as NewsRecord,
    Project as ProjectRecord,
    Settings as SettingsRecord,
} from '@/generated/prisma/client';
import type { Client, News, Project, Settings } from '@/lib/types/content';

export function mapSettings(record: SettingsRecord): Settings {
    return { ...record, updated_at: record.updated_at.toISOString() };
}

export function mapClient(record: ClientRecord): Client {
    return {
        ...record,
        created_at: record.created_at.toISOString(),
        updated_at: record.updated_at.toISOString(),
    };
}

export function mapNews(record: NewsRecord): News {
    return {
        ...record,
        date: record.date.toISOString().slice(0, 10),
        created_at: record.created_at.toISOString(),
        updated_at: record.updated_at.toISOString(),
    };
}

type ProjectWithClient = ProjectRecord & { client?: ClientRecord | null };

export function mapProject(record: ProjectWithClient): Project {
    const { client, ...project } = record;

    return {
        ...project,
        description: project.description ?? undefined,
        year: project.year ?? undefined,
        site: project.site ?? undefined,
        duration: project.duration ?? undefined,
        created_at: project.created_at.toISOString(),
        updated_at: project.updated_at.toISOString(),
        client: client ? mapClient(client) : undefined,
    };
}
