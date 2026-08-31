'use server';

import { getPrisma } from '@/lib/db';
import { requireAdminUser, unauthorizedResult } from '@/lib/auth/admin';

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
const ALLOWED_IMAGE_TYPES = new Set([
    'image/avif',
    'image/gif',
    'image/jpeg',
    'image/png',
    'image/webp',
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

type MediaActionResult = {
    success: boolean;
    data?: MediaAsset[];
    url?: string;
    error?: string;
};

function getFileExtension(file: File): string {
    return {
        'image/avif': 'avif',
        'image/gif': 'gif',
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
    }[file.type] ?? 'img';
}

function normalizeStoragePath(path: string): string {
    return path.replace(/^\/+/, '').replace(/\/+/g, '/');
}

function isAllowedStoragePath(path: string): boolean {
    const normalizedPath = normalizeStoragePath(path);
    return !normalizedPath.includes('..')
        && Array.from(ALLOWED_UPLOAD_FOLDERS).some((folder) => normalizedPath.startsWith(`${folder}/`));
}

async function isAuthorized(): Promise<boolean> {
    try {
        await requireAdminUser();
        return true;
    } catch {
        return false;
    }
}

export async function uploadImage(formData: FormData): Promise<MediaActionResult> {
    if (!await isAuthorized()) return unauthorizedResult();

    const file = formData.get('file');
    const folderValue = formData.get('folder');
    const folder = typeof folderValue === 'string' ? folderValue : 'images';

    if (!(file instanceof File)) return { success: false, error: 'No file provided' };
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) return { success: false, error: 'Unsupported image type' };
    if (file.size > MAX_FILE_SIZE) return { success: false, error: 'Image must be less than 5MB after optimization' };
    if (!ALLOWED_UPLOAD_FOLDERS.has(folder)) return { success: false, error: 'Upload folder is not allowed' };

    try {
        const name = `${Date.now()}-${crypto.randomUUID()}.${getFileExtension(file)}`;
        const path = `${folder}/${name}`;
        const record = await getPrisma().mediaAsset.create({
            data: {
                name,
                path,
                folder,
                mime_type: file.type,
                size: file.size,
                bytes: new Uint8Array(await file.arrayBuffer()),
            },
        });
        return { success: true, url: `/api/media/${record.id}` };
    } catch (error) {
        console.error('Image upload failed', error);
        return { success: false, error: 'Image upload failed' };
    }
}

export async function listMediaAssets(folder = 'images'): Promise<MediaActionResult> {
    if (!await isAuthorized()) return unauthorizedResult();
    if (!ALLOWED_UPLOAD_FOLDERS.has(folder)) return { success: false, error: 'Media folder is not allowed' };

    try {
        const records = await getPrisma().mediaAsset.findMany({
            where: { folder },
            orderBy: { updated_at: 'desc' },
            take: 200,
            omit: { bytes: true },
        });
        const data: MediaAsset[] = records.map((record) => ({
            name: record.name,
            path: record.path,
            url: `/api/media/${record.id}`,
            folder: record.folder,
            size: record.size,
            mimeType: record.mime_type,
            updatedAt: record.updated_at.toISOString(),
            createdAt: record.created_at.toISOString(),
        }));
        return { success: true, data };
    } catch (error) {
        console.error('Unable to list media assets', error);
        return { success: false, error: 'Unable to list media assets' };
    }
}

export async function deleteMediaAsset(path: string): Promise<MediaActionResult> {
    if (!await isAuthorized()) return unauthorizedResult();

    const normalizedPath = normalizeStoragePath(path);
    if (!isAllowedStoragePath(normalizedPath)) return { success: false, error: 'Media path is not allowed' };

    try {
        await getPrisma().mediaAsset.delete({ where: { path: normalizedPath } });
        return { success: true };
    } catch {
        return { success: false, error: 'Media asset was not found' };
    }
}

export async function deleteImage(url: string): Promise<MediaActionResult> {
    if (!await isAuthorized()) return unauthorizedResult();

    const id = url.match(/\/api\/media\/([0-9a-f-]{36})(?:$|[?#])/i)?.[1];
    if (!id) return { success: false, error: 'Invalid media URL' };

    try {
        await getPrisma().mediaAsset.delete({ where: { id } });
        return { success: true };
    } catch {
        return { success: false, error: 'Media asset was not found' };
    }
}
