import type { PublicContent, PublicContentKey } from '@/backend/models/public-content';
import type { PublicDataSnapshotRepository } from '@/backend/repositories/public-data-snapshot-repository';

export class NoOpPublicDataSnapshotRepository implements PublicDataSnapshotRepository {
    async read<Key extends PublicContentKey>(_key: Key): Promise<PublicContent[Key] | null> {
        void _key;
        return null;
    }

    async write<Key extends PublicContentKey>(_key: Key, _data: PublicContent[Key]): Promise<boolean> {
        void _key;
        void _data;
        return false;
    }
}
