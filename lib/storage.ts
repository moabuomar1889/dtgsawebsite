"use server";

import { createClient as createSupabaseClient } from '@/lib/supabase/server';
import { requireAdminUser, unauthorizedResult } from '@/lib/auth/admin';

const BUCKET = 'dtgsa-website-assets';
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_UPLOAD_FOLDERS = new Set([
    'clients',
    'images',
    'news',
    'projects',
    'projects/gallery',
    'services',
    'settings',
]);

export interface MediaAsset {
    name: string;
    path: string;
    url: string;
    folder: string;
    size: number | null;
    mimeType: string | null;
    updatedAt: string | null;
    createdAt: string | null;
}

function getFileExtension(file: File): string {
    const mimeExtension = {
        'image/avif': 'avif',
        'image/gif': 'gif',
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/svg+xml': 'svg',
        'image/webp': 'webp',
    }[file.type];

    if (mimeExtension) {
        return mimeExtension;
    }

    const extension = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '');
    return extension || 'img';
}

function normalizeStoragePath(path: string): string {
    return path.replace(/^\/+/, '').replace(/\/+/g, '/');
}

function isAllowedStoragePath(path: string): boolean {
    const normalizedPath = normalizeStoragePath(path);

    if (normalizedPath.includes('..')) {
        return false;
    }

    return Array.from(ALLOWED_UPLOAD_FOLDERS).some((folder) => normalizedPath.startsWith(`${folder}/`));
}

export async function uploadImage(
    formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> {
    const supabase = await createSupabaseClient();
    try {
        await requireAdminUser(supabase);
    } catch {
        return unauthorizedResult();
    }

    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'images';

    if (!file) {
        return { success: false, error: 'No file provided' };
    }

    if (!file.type.startsWith('image/')) {
        return { success: false, error: 'Only image uploads are allowed' };
    }

    if (file.size > MAX_FILE_SIZE) {
        return { success: false, error: 'Image must be less than 5MB after optimization' };
    }

    if (!ALLOWED_UPLOAD_FOLDERS.has(folder)) {
        return { success: false, error: 'Upload folder is not allowed' };
    }

    // Generate unique filename
    const ext = getFileExtension(file);
    const filename = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

    const { data, error } = await supabase.storage
        .from(BUCKET)
        .upload(filename, file, {
            cacheControl: '31536000',
            contentType: file.type || undefined,
            upsert: false,
        });

    if (error) {
        console.error('Upload error:', error);
        return { success: false, error: error.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(data.path);

    return { success: true, url: urlData.publicUrl };
}

export async function listMediaAssets(
    folder: string = 'images'
): Promise<{ success: boolean; data?: MediaAsset[]; error?: string }> {
    const supabase = await createSupabaseClient();
    try {
        await requireAdminUser(supabase);
    } catch {
        return unauthorizedResult();
    }

    if (!ALLOWED_UPLOAD_FOLDERS.has(folder)) {
        return { success: false, error: 'Media folder is not allowed' };
    }

    const { data, error } = await supabase.storage
        .from(BUCKET)
        .list(folder, {
            limit: 200,
            offset: 0,
            sortBy: { column: 'updated_at', order: 'desc' },
        });

    if (error) {
        return { success: false, error: error.message };
    }

    const assets = (data || [])
        .filter((item) => item.id)
        .map((item) => {
            const path = `${folder}/${item.name}`;
            const { data: urlData } = supabase.storage
                .from(BUCKET)
                .getPublicUrl(path);

            return {
                name: item.name,
                path,
                url: urlData.publicUrl,
                folder,
                size: typeof item.metadata?.size === 'number' ? item.metadata.size : null,
                mimeType: typeof item.metadata?.mimetype === 'string' ? item.metadata.mimetype : null,
                updatedAt: item.updated_at || null,
                createdAt: item.created_at || null,
            };
        });

    return { success: true, data: assets };
}

export async function deleteMediaAsset(path: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createSupabaseClient();
    try {
        await requireAdminUser(supabase);
    } catch {
        return unauthorizedResult();
    }

    const normalizedPath = normalizeStoragePath(path);

    if (!isAllowedStoragePath(normalizedPath)) {
        return { success: false, error: 'Media path is not allowed' };
    }

    const { error } = await supabase.storage
        .from(BUCKET)
        .remove([normalizedPath]);

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true };
}

export async function deleteImage(url: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createSupabaseClient();
    try {
        await requireAdminUser(supabase);
    } catch {
        return unauthorizedResult();
    }

    // Extract path from URL
    const match = url.match(new RegExp(`/storage/v1/object/public/${BUCKET}/(.+)$`));
    if (!match) {
        return { success: false, error: 'Invalid URL' };
    }

    const path = normalizeStoragePath(match[1]);

    if (!isAllowedStoragePath(path)) {
        return { success: false, error: 'Media path is not allowed' };
    }

    const { error } = await supabase.storage
        .from(BUCKET)
        .remove([path]);

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true };
}
