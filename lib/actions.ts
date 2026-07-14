"use server";

import { createClient as createSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { refreshPublicDataSnapshot } from '@/lib/data-fetching';
import { requireAdminUser, unauthorizedResult } from '@/lib/auth/admin';
import { normalizeAssetUrl, normalizeAssetUrls } from '@/lib/asset-url';
import type {
    Settings, SettingsUpdate,
    Client, ClientInsert, ClientUpdate,
    Project, ProjectInsert, ProjectUpdate,
    News, NewsInsert, NewsUpdate,
    Experience, ExperienceInsert, ExperienceUpdate,
    Service, ServiceInsert, ServiceUpdate
} from '@/lib/supabase/types';

const CONTACT_NAME_MAX_LENGTH = 120;
const CONTACT_EMAIL_MAX_LENGTH = 254;
const CONTACT_MESSAGE_MAX_LENGTH = 3000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getSupabaseErrorMessage(error: unknown): string {
    if (!error || typeof error !== 'object') {
        return 'Unknown Supabase error';
    }

    const details = error as {
        code?: string;
        message?: string;
        details?: string | null;
        hint?: string | null;
    };

    return [
        details.code,
        details.message,
        details.details,
        details.hint,
    ].filter(Boolean).join(' | ') || 'Unknown Supabase error';
}

async function refreshPublicSection(key: Parameters<typeof refreshPublicDataSnapshot>[0]) {
    await refreshPublicDataSnapshot(key);
    revalidatePath('/');
}

function normalizeSettingsAssets(settings: Settings): Settings {
    return {
        ...settings,
        hero_image_url: normalizeAssetUrl(settings.hero_image_url),
        about_image_url: normalizeAssetUrl(settings.about_image_url),
        contact_bg_url: normalizeAssetUrl(settings.contact_bg_url),
    };
}

function normalizeClientAssets(client: Client): Client {
    return {
        ...client,
        logo_url_bw: normalizeAssetUrl(client.logo_url_bw),
    };
}

function normalizeProjectAssets(project: Project): Project {
    return {
        ...project,
        image_url: normalizeAssetUrl(project.image_url),
        gallery_urls: normalizeAssetUrls(project.gallery_urls),
        client: project.client ? normalizeClientAssets(project.client) : project.client,
    };
}

function normalizeNewsAssets(news: News): News {
    return {
        ...news,
        image_url: normalizeAssetUrl(news.image_url),
    };
}

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
    return normalizeSettingsAssets(data);
}

export async function updateSettings(updates: SettingsUpdate): Promise<{ success: boolean; error?: string }> {
    const supabase = await createSupabaseClient();
    try {
        await requireAdminUser(supabase);
    } catch {
        return unauthorizedResult();
    }

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

    revalidatePath('/admin/settings');
    await refreshPublicSection('settings');
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
    try {
        await requireAdminUser(supabase);
    } catch {
        return unauthorizedResult();
    }

    const { data, error } = await supabase
        .from('clients')
        .insert(client)
        .select()
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/clients');
    await refreshPublicSection('clients');
    return { success: true, data };
}

export async function updateClient(id: string, updates: ClientUpdate): Promise<{ success: boolean; error?: string }> {
    const supabase = await createSupabaseClient();
    try {
        await requireAdminUser(supabase);
    } catch {
        return unauthorizedResult();
    }

    const { error } = await supabase
        .from('clients')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/clients');
    await refreshPublicSection('clients');
    return { success: true };
}

export async function deleteClient(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createSupabaseClient();
    try {
        await requireAdminUser(supabase);
    } catch {
        return unauthorizedResult();
    }

    const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/clients');
    await refreshPublicSection('clients');
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
        console.warn('Error fetching projects with clients:', getSupabaseErrorMessage(error));

        const fallback = await supabase
            .from('projects')
            .select('*')
            .order('sort_order', { ascending: true });

        if (fallback.error) {
            console.warn('Error fetching projects:', getSupabaseErrorMessage(fallback.error));
            return [];
        }

        return (fallback.data || []).map(normalizeProjectAssets);
    }
    return (data || []).map(normalizeProjectAssets);
}

export async function createProject(project: ProjectInsert): Promise<{ success: boolean; data?: Project; error?: string }> {
    const supabase = await createSupabaseClient();
    try {
        await requireAdminUser(supabase);
    } catch {
        return unauthorizedResult();
    }

    const { data, error } = await supabase
        .from('projects')
        .insert(project)
        .select()
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/projects');
    await refreshPublicSection('projects');
    return { success: true, data };
}

export async function updateProject(id: string, updates: ProjectUpdate): Promise<{ success: boolean; error?: string }> {
    const supabase = await createSupabaseClient();
    try {
        await requireAdminUser(supabase);
    } catch {
        return unauthorizedResult();
    }

    const { error } = await supabase
        .from('projects')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/projects');
    await refreshPublicSection('projects');
    return { success: true };
}

export async function deleteProject(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createSupabaseClient();
    try {
        await requireAdminUser(supabase);
    } catch {
        return unauthorizedResult();
    }

    const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/projects');
    await refreshPublicSection('projects');
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
    return (data || []).map(normalizeNewsAssets);
}

export async function createNews(news: NewsInsert): Promise<{ success: boolean; data?: News; error?: string }> {
    const supabase = await createSupabaseClient();
    try {
        await requireAdminUser(supabase);
    } catch {
        return unauthorizedResult();
    }

    const { data, error } = await supabase
        .from('news')
        .insert(news)
        .select()
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/news');
    await refreshPublicSection('news');
    return { success: true, data };
}

export async function updateNews(id: string, updates: NewsUpdate): Promise<{ success: boolean; error?: string }> {
    const supabase = await createSupabaseClient();
    try {
        await requireAdminUser(supabase);
    } catch {
        return unauthorizedResult();
    }

    const { error } = await supabase
        .from('news')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/news');
    await refreshPublicSection('news');
    return { success: true };
}

export async function deleteNews(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createSupabaseClient();
    try {
        await requireAdminUser(supabase);
    } catch {
        return unauthorizedResult();
    }

    const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/news');
    await refreshPublicSection('news');
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
    try {
        await requireAdminUser(supabase);
    } catch {
        return unauthorizedResult();
    }

    const { data, error } = await supabase
        .from('experience')
        .insert(exp)
        .select()
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/experience');
    await refreshPublicSection('experience');
    return { success: true, data };
}

export async function updateExperience(id: string, updates: ExperienceUpdate): Promise<{ success: boolean; error?: string }> {
    const supabase = await createSupabaseClient();
    try {
        await requireAdminUser(supabase);
    } catch {
        return unauthorizedResult();
    }

    const { error } = await supabase
        .from('experience')
        .update(updates)
        .eq('id', id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/experience');
    await refreshPublicSection('experience');
    return { success: true };
}

export async function deleteExperience(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createSupabaseClient();
    try {
        await requireAdminUser(supabase);
    } catch {
        return unauthorizedResult();
    }

    const { error } = await supabase
        .from('experience')
        .delete()
        .eq('id', id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/experience');
    await refreshPublicSection('experience');
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
    try {
        await requireAdminUser(supabase);
    } catch {
        return unauthorizedResult();
    }

    const { data, error } = await supabase
        .from('services')
        .insert(service)
        .select()
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/services');
    await refreshPublicSection('services');
    return { success: true, data };
}

export async function updateService(id: string, updates: ServiceUpdate): Promise<{ success: boolean; error?: string }> {
    const supabase = await createSupabaseClient();
    try {
        await requireAdminUser(supabase);
    } catch {
        return unauthorizedResult();
    }

    const { error } = await supabase
        .from('services')
        .update(updates)
        .eq('id', id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/services');
    await refreshPublicSection('services');
    return { success: true };
}

export async function deleteService(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createSupabaseClient();
    try {
        await requireAdminUser(supabase);
    } catch {
        return unauthorizedResult();
    }

    const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/services');
    await refreshPublicSection('services');
    return { success: true };
}

// ========================================
// CONTACT MESSAGES
// ========================================

export async function getContactMessages(): Promise<{ id: string; name: string; email: string; message: string; created_at: string }[]> {
    const supabase = await createSupabaseClient();
    try {
        await requireAdminUser(supabase);
    } catch {
        return [];
    }

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
    const name = message.name.trim();
    const email = message.email.trim().toLowerCase();
    const text = message.message.trim();

    if (
        name.length < 2
        || name.length > CONTACT_NAME_MAX_LENGTH
        || email.length > CONTACT_EMAIL_MAX_LENGTH
        || !EMAIL_PATTERN.test(email)
        || text.length < 10
        || text.length > CONTACT_MESSAGE_MAX_LENGTH
    ) {
        return { success: false, error: 'Invalid message details' };
    }

    const supabase = await createSupabaseClient();
    const { error } = await supabase
        .from('contact_messages')
        .insert({ name, email, message: text });

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true };
}
