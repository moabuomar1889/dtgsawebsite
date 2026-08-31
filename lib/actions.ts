'use server';

import { revalidatePath } from 'next/cache';
import { getPrisma } from '@/lib/db';
import { refreshPublicDataSnapshot } from '@/lib/data-fetching';
import { requireAdminUser, unauthorizedResult } from '@/lib/auth/admin';
import { mapClient, mapNews, mapProject, mapSettings } from '@/backend/mappers/public-content';
import { normalizeNewsAssets, normalizeProjectAssets, normalizeSettingsAssets } from '@/lib/public-content-assets';
import type {
    Settings, SettingsUpdate,
    Client, ClientInsert, ClientUpdate,
    Project, ProjectInsert, ProjectUpdate,
    News, NewsInsert, NewsUpdate,
    Experience, ExperienceInsert, ExperienceUpdate,
    Service, ServiceInsert, ServiceUpdate,
    ContactMessage,
} from '@/lib/types/content';

const CONTACT_NAME_MAX_LENGTH = 120;
const CONTACT_EMAIL_MAX_LENGTH = 254;
const CONTACT_MESSAGE_MAX_LENGTH = 3000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ActionResult<T = never> = {
    success: boolean;
    data?: T;
    error?: string;
};

function errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Database operation failed';
}

async function authorizeAdmin(): Promise<boolean> {
    try {
        await requireAdminUser();
        return true;
    } catch {
        return false;
    }
}

async function refreshPublicSection(key: Parameters<typeof refreshPublicDataSnapshot>[0]) {
    await refreshPublicDataSnapshot(key);
    revalidatePath('/');
}

function newsDate(value: string): Date {
    return new Date(`${value}T00:00:00.000Z`);
}

export async function getSettings(): Promise<Settings | null> {
    try {
        const record = await getPrisma().settings.findFirst();
        return record ? normalizeSettingsAssets(mapSettings(record)) : null;
    } catch (error) {
        console.error('Error fetching settings:', errorMessage(error));
        return null;
    }
}

export async function updateSettings(updates: SettingsUpdate): Promise<ActionResult> {
    if (!await authorizeAdmin()) return unauthorizedResult();

    try {
        const settings = await getPrisma().settings.findFirst({ select: { id: true } });
        if (!settings) return { success: false, error: 'Settings not found' };

        await getPrisma().settings.update({ where: { id: settings.id }, data: updates });
        revalidatePath('/admin/settings');
        await refreshPublicSection('settings');
        return { success: true };
    } catch (error) {
        return { success: false, error: errorMessage(error) };
    }
}

export async function getClients(activeOnly = false): Promise<Client[]> {
    try {
        const records = await getPrisma().client.findMany({
            where: activeOnly ? { is_active: true } : undefined,
            orderBy: { sort_order: 'asc' },
        });
        return records.map(mapClient);
    } catch (error) {
        console.error('Error fetching clients:', errorMessage(error));
        return [];
    }
}

export async function addClient(client: ClientInsert): Promise<ActionResult<Client>> {
    if (!await authorizeAdmin()) return unauthorizedResult();

    try {
        const record = await getPrisma().client.create({ data: client });
        revalidatePath('/admin/clients');
        await refreshPublicSection('clients');
        return { success: true, data: mapClient(record) };
    } catch (error) {
        return { success: false, error: errorMessage(error) };
    }
}

export async function updateClient(id: string, updates: ClientUpdate): Promise<ActionResult> {
    if (!await authorizeAdmin()) return unauthorizedResult();

    try {
        await getPrisma().client.update({ where: { id }, data: updates });
        revalidatePath('/admin/clients');
        await refreshPublicSection('clients');
        return { success: true };
    } catch (error) {
        return { success: false, error: errorMessage(error) };
    }
}

export async function deleteClient(id: string): Promise<ActionResult> {
    if (!await authorizeAdmin()) return unauthorizedResult();

    try {
        await getPrisma().client.delete({ where: { id } });
        revalidatePath('/admin/clients');
        await refreshPublicSection('clients');
        return { success: true };
    } catch (error) {
        return { success: false, error: errorMessage(error) };
    }
}

export async function getProjects(): Promise<Project[]> {
    try {
        const records = await getPrisma().project.findMany({
            include: { client: true },
            orderBy: { sort_order: 'asc' },
        });
        return records.map(mapProject).map(normalizeProjectAssets);
    } catch (error) {
        console.error('Error fetching projects:', errorMessage(error));
        return [];
    }
}

export async function createProject(project: ProjectInsert): Promise<ActionResult<Project>> {
    if (!await authorizeAdmin()) return unauthorizedResult();

    try {
        const record = await getPrisma().project.create({ data: project });
        revalidatePath('/admin/projects');
        await refreshPublicSection('projects');
        return { success: true, data: mapProject(record) };
    } catch (error) {
        return { success: false, error: errorMessage(error) };
    }
}

export async function updateProject(id: string, updates: ProjectUpdate): Promise<ActionResult> {
    if (!await authorizeAdmin()) return unauthorizedResult();

    try {
        await getPrisma().project.update({ where: { id }, data: updates });
        revalidatePath('/admin/projects');
        await refreshPublicSection('projects');
        return { success: true };
    } catch (error) {
        return { success: false, error: errorMessage(error) };
    }
}

export async function deleteProject(id: string): Promise<ActionResult> {
    if (!await authorizeAdmin()) return unauthorizedResult();

    try {
        await getPrisma().project.delete({ where: { id } });
        revalidatePath('/admin/projects');
        await refreshPublicSection('projects');
        return { success: true };
    } catch (error) {
        return { success: false, error: errorMessage(error) };
    }
}

export async function getNews(publishedOnly = false): Promise<News[]> {
    try {
        const records = await getPrisma().news.findMany({
            where: publishedOnly ? { is_published: true } : undefined,
            orderBy: { date: 'desc' },
        });
        return records.map(mapNews).map(normalizeNewsAssets);
    } catch (error) {
        console.error('Error fetching news:', errorMessage(error));
        return [];
    }
}

export async function createNews(news: NewsInsert): Promise<ActionResult<News>> {
    if (!await authorizeAdmin()) return unauthorizedResult();

    try {
        const record = await getPrisma().news.create({
            data: { ...news, date: newsDate(news.date) },
        });
        revalidatePath('/admin/news');
        await refreshPublicSection('news');
        return { success: true, data: mapNews(record) };
    } catch (error) {
        return { success: false, error: errorMessage(error) };
    }
}

export async function updateNews(id: string, updates: NewsUpdate): Promise<ActionResult> {
    if (!await authorizeAdmin()) return unauthorizedResult();

    try {
        const { date, ...rest } = updates;
        await getPrisma().news.update({
            where: { id },
            data: { ...rest, ...(date ? { date: newsDate(date) } : {}) },
        });
        revalidatePath('/admin/news');
        await refreshPublicSection('news');
        return { success: true };
    } catch (error) {
        return { success: false, error: errorMessage(error) };
    }
}

export async function deleteNews(id: string): Promise<ActionResult> {
    if (!await authorizeAdmin()) return unauthorizedResult();

    try {
        await getPrisma().news.delete({ where: { id } });
        revalidatePath('/admin/news');
        await refreshPublicSection('news');
        return { success: true };
    } catch (error) {
        return { success: false, error: errorMessage(error) };
    }
}

export async function getExperience(): Promise<Experience[]> {
    try {
        return await getPrisma().experience.findMany({ orderBy: { sort_order: 'asc' } });
    } catch (error) {
        console.error('Error fetching experience:', errorMessage(error));
        return [];
    }
}

export async function createExperience(exp: ExperienceInsert): Promise<ActionResult<Experience>> {
    if (!await authorizeAdmin()) return unauthorizedResult();

    try {
        const data = await getPrisma().experience.create({ data: exp });
        revalidatePath('/admin/experience');
        await refreshPublicSection('experience');
        return { success: true, data };
    } catch (error) {
        return { success: false, error: errorMessage(error) };
    }
}

export async function updateExperience(id: string, updates: ExperienceUpdate): Promise<ActionResult> {
    if (!await authorizeAdmin()) return unauthorizedResult();

    try {
        await getPrisma().experience.update({ where: { id }, data: updates });
        revalidatePath('/admin/experience');
        await refreshPublicSection('experience');
        return { success: true };
    } catch (error) {
        return { success: false, error: errorMessage(error) };
    }
}

export async function deleteExperience(id: string): Promise<ActionResult> {
    if (!await authorizeAdmin()) return unauthorizedResult();

    try {
        await getPrisma().experience.delete({ where: { id } });
        revalidatePath('/admin/experience');
        await refreshPublicSection('experience');
        return { success: true };
    } catch (error) {
        return { success: false, error: errorMessage(error) };
    }
}

export async function getServices(): Promise<Service[]> {
    try {
        return await getPrisma().service.findMany({ orderBy: { sort_order: 'asc' } });
    } catch (error) {
        console.error('Error fetching services:', errorMessage(error));
        return [];
    }
}

export async function createService(service: ServiceInsert): Promise<ActionResult<Service>> {
    if (!await authorizeAdmin()) return unauthorizedResult();

    try {
        const data = await getPrisma().service.create({ data: service });
        revalidatePath('/admin/services');
        await refreshPublicSection('services');
        return { success: true, data };
    } catch (error) {
        return { success: false, error: errorMessage(error) };
    }
}

export async function updateService(id: string, updates: ServiceUpdate): Promise<ActionResult> {
    if (!await authorizeAdmin()) return unauthorizedResult();

    try {
        await getPrisma().service.update({ where: { id }, data: updates });
        revalidatePath('/admin/services');
        await refreshPublicSection('services');
        return { success: true };
    } catch (error) {
        return { success: false, error: errorMessage(error) };
    }
}

export async function deleteService(id: string): Promise<ActionResult> {
    if (!await authorizeAdmin()) return unauthorizedResult();

    try {
        await getPrisma().service.delete({ where: { id } });
        revalidatePath('/admin/services');
        await refreshPublicSection('services');
        return { success: true };
    } catch (error) {
        return { success: false, error: errorMessage(error) };
    }
}

export async function getContactMessages(): Promise<ContactMessage[]> {
    if (!await authorizeAdmin()) return [];

    try {
        const records = await getPrisma().contactMessage.findMany({ orderBy: { created_at: 'desc' } });
        return records.map((record) => ({ ...record, created_at: record.created_at.toISOString() }));
    } catch (error) {
        console.error('Error fetching messages:', errorMessage(error));
        return [];
    }
}

export async function submitContactMessage(message: { name: string; email: string; message: string }): Promise<ActionResult> {
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

    try {
        await getPrisma().contactMessage.create({ data: { name, email, message: text } });
        return { success: true };
    } catch (error) {
        return { success: false, error: errorMessage(error) };
    }
}
