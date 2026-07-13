import type { PublicContent, PublicContentKey } from '@/backend/models/public-content';

export interface PublicDataSnapshotRepository {
    read<Key extends PublicContentKey>(key: Key): Promise<PublicContent[Key] | null>;
    write<Key extends PublicContentKey>(key: Key, data: PublicContent[Key]): Promise<boolean>;
}
