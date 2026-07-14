const LEGACY_SUPABASE_ASSET_HOST = 'https://cxpyiibkethevsbotuui.supabase.co';
const PRIVATE_SUPABASE_ASSET_HOST = 'https://api.dtgsa.online';

export function normalizeAssetUrl(url: string | null | undefined): string | null {
    if (!url) {
        return null;
    }

    return url.startsWith(LEGACY_SUPABASE_ASSET_HOST)
        ? `${PRIVATE_SUPABASE_ASSET_HOST}${url.slice(LEGACY_SUPABASE_ASSET_HOST.length)}`
        : url;
}

export function normalizeAssetUrls(urls: string[] | null | undefined): string[] {
    if (!Array.isArray(urls)) {
        return [];
    }

    return urls.map((url) => normalizeAssetUrl(url)).filter((url): url is string => Boolean(url));
}
