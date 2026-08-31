const LEGACY_STORAGE_PREFIX = '/storage/v1/object/public/dtgsa-website-assets/';
const LOCAL_STORAGE_PREFIX = '/local-storage/';

function getLocalAssetUrl(url: string): string | null {
    try {
        const pathname = new URL(url).pathname;
        const assetIndex = pathname.indexOf(LEGACY_STORAGE_PREFIX);

        if (assetIndex === -1) {
            return null;
        }

        const assetPath = pathname.slice(assetIndex + LEGACY_STORAGE_PREFIX.length);
        return assetPath.startsWith('clients/') || assetPath.startsWith('settings/')
            ? `${LOCAL_STORAGE_PREFIX}${assetPath}`
            : null;
    } catch {
        return null;
    }
}

export function normalizeAssetUrl(url: string | null | undefined): string | null {
    if (!url) {
        return null;
    }

    if (url.includes(LEGACY_STORAGE_PREFIX)) {
        return getLocalAssetUrl(url);
    }

    return url;
}

export function normalizeAssetUrls(urls: string[] | null | undefined): string[] {
    if (!Array.isArray(urls)) {
        return [];
    }

    return urls.map((url) => normalizeAssetUrl(url)).filter((url): url is string => Boolean(url));
}
