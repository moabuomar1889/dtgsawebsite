import { promises as fs } from 'fs';
import path from 'path';

export type PublicDataCacheKey =
    | 'settings'
    | 'clients'
    | 'projects'
    | 'news'
    | 'experience'
    | 'services';

interface PublicDataSnapshot<T> {
    version: 1;
    key: PublicDataCacheKey;
    savedAt: string;
    data: T;
}

const VALID_KEYS = new Set<PublicDataCacheKey>([
    'settings',
    'clients',
    'projects',
    'news',
    'experience',
    'services',
]);

function getCacheRoot() {
    return process.env.PUBLIC_DATA_CACHE_DIR || path.join(process.cwd(), '.data', 'public-cache');
}

function getCacheFilePath(key: PublicDataCacheKey) {
    if (!VALID_KEYS.has(key)) {
        throw new Error(`Invalid public data cache key: ${key}`);
    }

    return path.join(getCacheRoot(), `${key}.json`);
}

export function hasUsableSnapshotData<T>(data: T | null | undefined): data is T {
    if (data == null) return false;
    if (Array.isArray(data)) return data.length > 0;
    if (typeof data === 'object') return Object.keys(data).length > 0;
    return true;
}

export async function readPublicDataSnapshot<T>(key: PublicDataCacheKey): Promise<T | null> {
    try {
        const file = await fs.readFile(getCacheFilePath(key), 'utf8');
        const snapshot = JSON.parse(file) as PublicDataSnapshot<T>;

        if (!snapshot || snapshot.version !== 1 || snapshot.key !== key) {
            return null;
        }

        return hasUsableSnapshotData(snapshot.data) ? snapshot.data : null;
    } catch {
        return null;
    }
}

export async function writePublicDataSnapshot<T>(
    key: PublicDataCacheKey,
    data: T
): Promise<boolean> {
    if (!hasUsableSnapshotData(data)) {
        return false;
    }

    try {
        const cacheFile = getCacheFilePath(key);
        const cacheDir = path.dirname(cacheFile);
        const tempFile = `${cacheFile}.${process.pid}.${Date.now()}.tmp`;
        const snapshot: PublicDataSnapshot<T> = {
            version: 1,
            key,
            savedAt: new Date().toISOString(),
            data,
        };

        await fs.mkdir(cacheDir, { recursive: true });
        await fs.writeFile(tempFile, JSON.stringify(snapshot, null, 2), 'utf8');
        await fs.rename(tempFile, cacheFile);
        return true;
    } catch (error) {
        console.warn(`Unable to write public data snapshot for ${key}:`, error);
        return false;
    }
}
