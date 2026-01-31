"use server";

import { createClient as createSupabaseClient } from '@/lib/supabase/server';

const BUCKET = 'dtgsa-website-assets';

export async function uploadImage(
    formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> {
    const supabase = await createSupabaseClient();

    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'images';

    if (!file) {
        return { success: false, error: 'No file provided' };
    }

    // Generate unique filename
    const ext = file.name.split('.').pop();
    const filename = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

    const { data, error } = await supabase.storage
        .from(BUCKET)
        .upload(filename, file, {
            cacheControl: '3600',
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
    const match = url.match(/\/storage\/v1\/object\/public\/dtgsa-assets\/(.+)$/);
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
