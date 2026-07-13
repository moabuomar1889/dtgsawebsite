import { getPublicContentService } from '@/backend/config/public-content';
import type { PublicContentKey } from '@/backend/models/public-content';

const publicContent = getPublicContentService();

export async function refreshPublicDataSnapshot(key: PublicContentKey): Promise<void> {
    await publicContent.refreshSnapshot(key);
}
