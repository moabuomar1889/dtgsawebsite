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

// Helper to check if Supabase is configured
function isSupabaseConfigured(): boolean {
    return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export async function getPublicSettings(): Promise<Partial<Settings>> {
    if (!isSupabaseConfigured()) {
        return fallbackSettings as Partial<Settings>;
    }

    try {
        const supabase = await createSupabaseClient();
        const { data, error } = await supabase
            .from('settings')
            .select('*')
            .single();

        if (error || !data) {
            return fallbackSettings as Partial<Settings>;
        }
        return data;
    } catch {
        return fallbackSettings as Partial<Settings>;
    }
}

export async function getPublicClients(): Promise<Partial<Client>[]> {
    if (!isSupabaseConfigured()) {
        return fallbackClients;
    }

    try {
        const supabase = await createSupabaseClient();
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true });

        if (error || !data || data.length === 0) {
            return fallbackClients;
        }
        return data;
    } catch {
        return fallbackClients;
    }
}

export async function getPublicProjects(): Promise<Partial<Project>[]> {
    if (!isSupabaseConfigured()) {
        return fallbackProjects;
    }

    try {
        const supabase = await createSupabaseClient();
        const { data, error } = await supabase
            .from('projects')
            .select('*, client:clients(*)')
            .order('is_featured', { ascending: false })
            .order('sort_order', { ascending: true })
            .order('created_at', { ascending: false });

        if (error || !data || data.length === 0) {
            return fallbackProjects;
        }
        return data;
    } catch {
        return fallbackProjects;
    }
}

export async function getPublicNews(): Promise<Partial<News>[]> {
    if (!isSupabaseConfigured()) {
        return fallbackNews;
    }

    try {
        const supabase = await createSupabaseClient();
        const { data, error } = await supabase
            .from('news')
            .select('*')
            .eq('is_published', true)
            .order('date', { ascending: false })
            .limit(3);

        if (error || !data || data.length === 0) {
            return fallbackNews;
        }
        return data;
    } catch {
        return fallbackNews;
    }
}

export async function getPublicExperience(): Promise<Partial<Experience>[]> {
    if (!isSupabaseConfigured()) {
        return fallbackExperience;
    }

    try {
        const supabase = await createSupabaseClient();
        const { data, error } = await supabase
            .from('experience')
            .select('*')
            .order('sort_order', { ascending: true });

        if (error || !data || data.length === 0) {
            return fallbackExperience;
        }
        return data;
    } catch {
        return fallbackExperience;
    }
}

export async function getPublicServices(): Promise<Partial<Service>[]> {
    if (!isSupabaseConfigured()) {
        return fallbackServices;
    }

    try {
        const supabase = await createSupabaseClient();
        const { data, error } = await supabase
            .from('services')
            .select('*')
            .order('sort_order', { ascending: true });

        if (error || !data || data.length === 0) {
            return fallbackServices;
        }
        return data;
    } catch {
        return fallbackServices;
    }
}

export function getSkills() {
    return skills;
}
