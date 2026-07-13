import { getPublicContentService } from '@/backend/config/public-content';
import type { PublicContentKey } from '@/backend/models/public-content';
import { skills } from '@/lib/fallback-data';

const publicContent = getPublicContentService();

export const getPublicSettings = () => publicContent.getSettings();
export const getPublicClients = () => publicContent.getClients();
export const getPublicProjects = () => publicContent.getProjects();
export const getPublicNews = () => publicContent.getNews();
export const getPublicExperience = () => publicContent.getExperience();
export const getPublicServices = () => publicContent.getServices();

export async function refreshPublicDataSnapshot(key: PublicContentKey): Promise<void> {
    await publicContent.refreshSnapshot(key);
}

export function getSkills() {
    return skills;
}
