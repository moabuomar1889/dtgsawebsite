const SITE_URL_ENV_VAR = 'SITE_URL';

export function getSiteUrl(): URL | undefined {
    const value = process.env[SITE_URL_ENV_VAR]?.trim();

    if (!value) {
        return undefined;
    }

    let siteUrl: URL;

    try {
        siteUrl = new URL(value);
    } catch {
        throw new Error(`${SITE_URL_ENV_VAR} must be an absolute HTTP or HTTPS URL.`);
    }

    if (!['http:', 'https:'].includes(siteUrl.protocol)) {
        throw new Error(`${SITE_URL_ENV_VAR} must use the HTTP or HTTPS protocol.`);
    }

    if (
        siteUrl.username ||
        siteUrl.password ||
        siteUrl.pathname !== '/' ||
        siteUrl.search ||
        siteUrl.hash
    ) {
        throw new Error(`${SITE_URL_ENV_VAR} must contain only the public site origin.`);
    }

    return siteUrl;
}
