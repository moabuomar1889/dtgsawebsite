"use server";

import { createClient as createSupabaseClient } from '@/lib/supabase/server';

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

export async function uploadImage(
    formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> {
    const supabase = await createSupabaseClient();

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

export async function deleteImage(url: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createSupabaseClient();

    // Extract path from URL
    const match = url.match(new RegExp(`/storage/v1/object/public/${BUCKET}/(.+)$`));
    if (!match) {
        return { success: false, error: 'Invalid URL' };
    }

    const path = match[1];

    const { error } = await supabase.storage
        .from(BUCKET)
        .remove([path]);

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true };
}
