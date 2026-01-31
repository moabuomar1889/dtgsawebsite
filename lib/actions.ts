"use server";

import { createClient as createSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type {
    Settings, SettingsUpdate,
    Client, ClientInsert, ClientUpdate,
    Project, ProjectInsert, ProjectUpdate,
    News, NewsInsert, NewsUpdate,
    Experience, ExperienceInsert, ExperienceUpdate,
    Service, ServiceInsert, ServiceUpdate
} from '@/lib/supabase/types';

const SCHEMA = 'dtgsawebsite';

// ========================================
// SETTINGS
// ========================================

export async function getSettings(): Promise<Settings | null> {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single();

    if (error) {
        console.error('Error fetching settings:', error);
        return null;
    }
    return data;
}

export async function updateSettings(updates: SettingsUpdate): Promise<{ success: boolean; error?: string }> {
    const supabase = await createSupabaseClient();

    const { data: settings } = await supabase
        .from('settings')
        .select('id')
        .single();

    if (!settings) {
        return { success: false, error: 'Settings not found' };
    }

    const { error } = await supabase
        .from('settings')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', settings.id);

    if (error) {
        console.error('Error updating settings:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/');
    revalidatePath('/admin/settings');
    return { success: true };
}

// ========================================
// CLIENTS
// ========================================

export async function getClients(activeOnly = false): Promise<Client[]> {
    const supabase = await createSupabaseClient();
    let query = supabase
        .from('clients')
        .select('*')
        .order('sort_order', { ascending: true });

    if (activeOnly) {
        query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching clients:', error);
        return [];
    }
    return data || [];
}

export async function addClient(client: ClientInsert): Promise<{ success: boolean; data?: Client; error?: string }> {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
        .from('clients')
        .insert(client)
        .select()
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/clients');
    revalidatePath('/');
    return { success: true, data };
}

export async function updateClient(id: string, updates: ClientUpdate): Promise<{ success: boolean; error?: string }> {
    const supabase = await createSupabaseClient();
    const { error } = await supabase
        .from('clients')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/clients');
    revalidatePath('/');
    return { success: true };
}

export async function deleteClient(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createSupabaseClient();
    const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/clients');
    revalidatePath('/');
    return { success: true };
}

// ========================================
// PROJECTS
// ========================================

export async function getProjects(): Promise<Project[]> {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
        .from('projects')
        .select('*, client:clients(*)')
        .order('sort_order', { ascending: true });

    if (error) {
        console.error('Error fetching projects:', error);
        return [];
    }
    return data || [];
}

export async function createProject(project: ProjectInsert): Promise<{ success: boolean; data?: Project; error?: string }> {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
        .from('projects')
        .insert(project)
        .select()
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/projects');
    revalidatePath('/');
    return { success: true, data };
}

export async function updateProject(id: string, updates: ProjectUpdate): Promise<{ success: boolean; error?: string }> {
    const supabase = await createSupabaseClient();
    const { error } = await supabase
        .from('projects')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/projects');
    revalidatePath('/');
    return { success: true };
}

export async function deleteProject(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createSupabaseClient();
    const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/projects');
    revalidatePath('/');
    return { success: true };
}

// ========================================
// NEWS
// ========================================

export async function getNews(publishedOnly = false): Promise<News[]> {
    const supabase = await createSupabaseClient();
    let query = supabase
        .from('news')
        .select('*')
        .order('date', { ascending: false });

    if (publishedOnly) {
        query = query.eq('is_published', true);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching news:', error);
        return [];
    }
    return data || [];
}

export async function createNews(news: NewsInsert): Promise<{ success: boolean; data?: News; error?: string }> {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
        .from('news')
        .insert(news)
        .select()
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/news');
    revalidatePath('/');
    return { success: true, data };
}

export async function updateNews(id: string, updates: NewsUpdate): Promise<{ success: boolean; error?: string }> {
    const supabase = await createSupabaseClient();
    const { error } = await supabase
        .from('news')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/news');
    revalidatePath('/');
    return { success: true };
}

export async function deleteNews(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createSupabaseClient();
    const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/news');
    revalidatePath('/');
    return { success: true };
}

// ========================================
// EXPERIENCE
// ========================================

export async function getExperience(): Promise<Experience[]> {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
        .from('experience')
        .select('*')
        .order('sort_order', { ascending: true });

    if (error) {
        console.error('Error fetching experience:', error);
        return [];
    }
    return data || [];
}

export async function createExperience(exp: ExperienceInsert): Promise<{ success: boolean; data?: Experience; error?: string }> {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
        .from('experience')
        .insert(exp)
        .select()
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/experience');
    revalidatePath('/');
    return { success: true, data };
}

export async function updateExperience(id: string, updates: ExperienceUpdate): Promise<{ success: boolean; error?: string }> {
    const supabase = await createSupabaseClient();
    const { error } = await supabase
        .from('experience')
        .update(updates)
        .eq('id', id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/experience');
    revalidatePath('/');
    return { success: true };
}

export async function deleteExperience(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createSupabaseClient();
    const { error } = await supabase
        .from('experience')
        .delete()
        .eq('id', id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/experience');
    revalidatePath('/');
    return { success: true };
}

// ========================================
// SERVICES
// ========================================

export async function getServices(): Promise<Service[]> {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('sort_order', { ascending: true });

    if (error) {
        console.error('Error fetching services:', error);
        return [];
    }
    return data || [];
}

export async function createService(service: ServiceInsert): Promise<{ success: boolean; data?: Service; error?: string }> {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
        .from('services')
        .insert(service)
        .select()
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/services');
    revalidatePath('/');
    return { success: true, data };
}

export async function updateService(id: string, updates: ServiceUpdate): Promise<{ success: boolean; error?: string }> {
    const supabase = await createSupabaseClient();
    const { error } = await supabase
        .from('services')
        .update(updates)
        .eq('id', id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/services');
    revalidatePath('/');
    return { success: true };
}

export async function deleteService(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createSupabaseClient();
    const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/services');
    revalidatePath('/');
    return { success: true };
}

// ========================================
// CONTACT MESSAGES
// ========================================

export async function getContactMessages(): Promise<{ id: string; name: string; email: string; message: string; created_at: string }[]> {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching messages:', error);
        return [];
    }
    return data || [];
}

export async function submitContactMessage(message: { name: string; email: string; message: string }): Promise<{ success: boolean; error?: string }> {
    const supabase = await createSupabaseClient();
    const { error } = await supabase
        .from('contact_messages')
        .insert(message);

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true };
}
