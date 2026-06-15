import { createClient as createSupabaseClient } from '@/lib/supabase/server';
import {
    fallbackSettings,
    fallbackClients,
    fallbackProjects,
    fallbackNews,
    fallbackExperience,
    fallbackServices,
    skills
} from '@/lib/fallback-data';
import type { Settings, Client, Project, News, Experience, Service } from '@/lib/supabase/types';
import {
    hasUsableSnapshotData,
    readPublicDataSnapshot,
    writePublicDataSnapshot,
    type PublicDataCacheKey,
} from '@/lib/public-data-cache';

// Helper to check if Supabase is configured
function isSupabaseConfigured(): boolean {
    return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

async function getSnapshotOrFallback<T>(key: PublicDataCacheKey, fallback: T): Promise<T> {
    const snapshot = await readPublicDataSnapshot<T>(key);
    return snapshot ?? fallback;
}

async function getPublicDataWithSnapshot<T>(
    key: PublicDataCacheKey,
    fallback: T,
    fetcher: () => Promise<T | null | undefined>
): Promise<T> {
    if (!isSupabaseConfigured()) {
        return getSnapshotOrFallback(key, fallback);
    }

    try {
        const data = await fetcher();

        if (!hasUsableSnapshotData(data)) {
            return getSnapshotOrFallback(key, fallback);
        }

        await writePublicDataSnapshot(key, data);
        return data;
    } catch (error) {
        console.error(`Error fetching ${key}:`, error);
        return getSnapshotOrFallback(key, fallback);
    }
}

export async function getPublicSettings(): Promise<Partial<Settings>> {
    return getPublicDataWithSnapshot<Partial<Settings>>(
        'settings',
        fallbackSettings as Partial<Settings>,
        async () => {
            const supabase = await createSupabaseClient();
            const { data, error } = await supabase
                .from('settings')
                .select('*')
                .single();

            if (error) throw error;
            return data;
        }
    );
}

export async function getPublicClients(): Promise<Partial<Client>[]> {
    return getPublicDataWithSnapshot<Partial<Client>[]>(
        'clients',
        fallbackClients,
        async () => {
            const supabase = await createSupabaseClient();
            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .eq('is_active', true)
                .order('sort_order', { ascending: true });

            if (error) throw error;
            return data;
        }
    );
}

export async function getPublicProjects(): Promise<Partial<Project>[]> {
    return getPublicDataWithSnapshot<Partial<Project>[]>(
        'projects',
        fallbackProjects,
        async () => {
            const supabase = await createSupabaseClient();
            const { data, error } = await supabase
                .from('projects')
                .select('*, client:clients(*)')
                .order('is_featured', { ascending: false })
                .order('sort_order', { ascending: true })
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        }
    );
}

export async function getPublicNews(): Promise<Partial<News>[]> {
    return getPublicDataWithSnapshot<Partial<News>[]>(
        'news',
        fallbackNews,
        async () => {
            const supabase = await createSupabaseClient();
            const { data, error } = await supabase
                .from('news')
                .select('*')
                .eq('is_published', true)
                .order('date', { ascending: false })
                .limit(3);

            if (error) throw error;
            return data;
        }
    );
}

export async function getPublicExperience(): Promise<Partial<Experience>[]> {
    return getPublicDataWithSnapshot<Partial<Experience>[]>(
        'experience',
        fallbackExperience,
        async () => {
            const supabase = await createSupabaseClient();
            const { data, error } = await supabase
                .from('experience')
                .select('*')
                .order('sort_order', { ascending: true });

            if (error) throw error;
            return data;
        }
    );
}

export async function getPublicServices(): Promise<Partial<Service>[]> {
    return getPublicDataWithSnapshot<Partial<Service>[]>(
        'services',
        fallbackServices,
        async () => {
            const supabase = await createSupabaseClient();
            const { data, error } = await supabase
                .from('services')
                .select('*')
                .order('sort_order', { ascending: true });

            if (error) throw error;
            return data;
        }
    );
}

export async function refreshPublicDataSnapshot(key: PublicDataCacheKey): Promise<void> {
    if (!isSupabaseConfigured()) {
        return;
    }

    try {
        switch (key) {
            case 'settings':
                await getPublicSettings();
                break;
            case 'clients':
                await getPublicClients();
                break;
            case 'projects':
                await getPublicProjects();
                break;
            case 'news':
                await getPublicNews();
                break;
            case 'experience':
                await getPublicExperience();
                break;
            case 'services':
                await getPublicServices();
                break;
        }
    } catch (error) {
        console.warn(`Unable to refresh public data snapshot for ${key}:`, error);
    }
}

export function getSkills() {
    return skills;
}
