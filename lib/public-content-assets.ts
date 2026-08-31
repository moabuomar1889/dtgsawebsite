import { normalizeAssetUrl, normalizeAssetUrls } from '@/lib/asset-url';
import type { Client, News, Project, Settings } from '@/lib/types/content';

export function normalizeSettingsAssets<T extends Partial<Settings>>(settings: T): T {
    return {
        ...settings,
        hero_image_url: normalizeAssetUrl(settings.hero_image_url),
        about_image_url: normalizeAssetUrl(settings.about_image_url),
        contact_bg_url: normalizeAssetUrl(settings.contact_bg_url),
    } as T;
}

export function normalizeClientAssets<T extends Partial<Client>>(client: T): T {
    return {
        ...client,
        logo_url_bw: normalizeAssetUrl(client.logo_url_bw),
    } as T;
}

export function normalizeProjectAssets<T extends Partial<Project>>(project: T): T {
    return {
        ...project,
        image_url: normalizeAssetUrl(project.image_url),
        gallery_urls: normalizeAssetUrls(project.gallery_urls),
        client: project.client ? normalizeClientAssets(project.client) : project.client,
    } as T;
}

export function normalizeNewsAssets<T extends Partial<News>>(news: T): T {
    return {
        ...news,
        image_url: normalizeAssetUrl(news.image_url),
    } as T;
}
