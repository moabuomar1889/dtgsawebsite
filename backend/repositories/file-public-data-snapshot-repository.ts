import { promises as fs } from 'fs';
import path from 'path';

import type { PublicContent, PublicContentKey } from '@/backend/models/public-content';
import type { PublicDataSnapshotRepository } from '@/backend/repositories/public-data-snapshot-repository';
import { hasUsableData } from '@/backend/shared/has-usable-data';

interface PublicDataSnapshot<Key extends PublicContentKey> {
    version: 1;
    key: Key;
    savedAt: string;
    data: PublicContent[Key];
}

const VALID_KEYS = new Set<PublicContentKey>([
    'settings',
    'clients',
    'projects',
    'news',
    'experience',
    'services',
]);

export class FilePublicDataSnapshotRepository implements PublicDataSnapshotRepository {
    async read<Key extends PublicContentKey>(key: Key): Promise<PublicContent[Key] | null> {
        try {
            const file = await fs.readFile(this.getCacheFilePath(key), 'utf8');
            const snapshot = JSON.parse(file) as PublicDataSnapshot<Key>;

            if (!snapshot || snapshot.version !== 1 || snapshot.key !== key) {
                return null;
            }

            return hasUsableData(snapshot.data) ? snapshot.data : null;
        } catch {
            return null;
        }
    }

    async write<Key extends PublicContentKey>(
        key: Key,
        data: PublicContent[Key]
    ): Promise<boolean> {
        if (!hasUsableData(data)) {
            return false;
        }

        try {
            const cacheFile = this.getCacheFilePath(key);
            const cacheDir = path.dirname(cacheFile);
            const tempFile = `${cacheFile}.${process.pid}.${Date.now()}.tmp`;
            const snapshot: PublicDataSnapshot<Key> = {
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

    private getCacheFilePath(key: PublicContentKey): string {
        if (!VALID_KEYS.has(key)) {
            throw new Error(`Invalid public data cache key: ${key}`);
        }

        const cacheRoot = process.env.PUBLIC_DATA_CACHE_DIR
            || path.join(process.cwd(), '.data', 'public-cache');

        return path.join(cacheRoot, `${key}.json`);
    }
}
