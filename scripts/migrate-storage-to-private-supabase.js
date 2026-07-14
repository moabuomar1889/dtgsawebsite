const fs = require('fs/promises');
const path = require('path');

const OLD_HOST = 'cxpyiibkethevsbotuui.supabase.co';
const BUCKET = 'dtgsa-website-assets';

function parseEnv(content) {
    const env = {};
    for (const line of content.split(/\r?\n/)) {
        if (!line || line.trim().startsWith('#') || !line.includes('=')) continue;
        const [key, ...rest] = line.split('=');
        env[key.trim()] = rest.join('=').trim().replace(/^"|"$/g, '');
    }
    return env;
}

function sqlString(value) {
    if (value === null || value === undefined) return 'NULL';
    return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlTextArray(values) {
    return `ARRAY[${values.map(sqlString).join(', ')}]::text[]`;
}

function getStoragePath(url) {
    if (!url || typeof url !== 'string') return null;
    let parsed;
    try {
        parsed = new URL(url);
    } catch {
        return null;
    }

    if (parsed.hostname !== OLD_HOST) return null;

    const marker = `/storage/v1/object/public/${BUCKET}/`;
    const index = parsed.pathname.indexOf(marker);
    if (index === -1) return null;

    return decodeURIComponent(parsed.pathname.slice(index + marker.length));
}

function mimeFromPath(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return {
        '.avif': 'image/avif',
        '.gif': 'image/gif',
        '.jpeg': 'image/jpeg',
        '.jpg': 'image/jpeg',
        '.png': 'image/png',
        '.svg': 'image/svg+xml',
        '.webp': 'image/webp',
    }[ext] || 'application/octet-stream';
}

async function fetchJson(url, anonKey) {
    const response = await fetch(url, {
        headers: {
            apikey: anonKey,
            Authorization: `Bearer ${anonKey}`,
        },
    });
    if (!response.ok) {
        throw new Error(`${response.status} ${await response.text()}`);
    }
    return response.json();
}

async function uploadObject(baseUrl, anonKey, storagePath, bytes) {
    const url = `${baseUrl}/storage/v1/object/${BUCKET}/${storagePath.split('/').map(encodeURIComponent).join('/')}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            apikey: anonKey,
            Authorization: `Bearer ${anonKey}`,
            'Content-Type': mimeFromPath(storagePath),
            'Cache-Control': '31536000',
            'x-upsert': 'true',
        },
        body: bytes,
    });

    if (!response.ok) {
        throw new Error(`Upload failed for ${storagePath}: ${response.status} ${await response.text()}`);
    }
}

async function migrateUrl(url, baseUrl, anonKey, urlMap) {
    const storagePath = getStoragePath(url);
    if (!storagePath) return url;

    if (urlMap.has(url)) return urlMap.get(url);

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Download failed for ${url}: ${response.status}`);
    }

    const bytes = Buffer.from(await response.arrayBuffer());
    await uploadObject(baseUrl, anonKey, storagePath, bytes);

    const newUrl = `${baseUrl}/storage/v1/object/public/${BUCKET}/${storagePath.split('/').map(encodeURIComponent).join('/')}`;
    urlMap.set(url, newUrl);
    return newUrl;
}

async function main() {
    const repoRoot = process.argv[2] || process.cwd();
    const env = parseEnv(await fs.readFile(path.join(repoRoot, '.env.local'), 'utf8'));
    const baseUrl = env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, '');
    const anonKey = process.env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!baseUrl || !anonKey) {
        throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }

    const [settingsRows, clients, projects] = await Promise.all([
        fetchJson(`${baseUrl}/rest/v1/settings?select=*`, anonKey),
        fetchJson(`${baseUrl}/rest/v1/clients?select=*`, anonKey),
        fetchJson(`${baseUrl}/rest/v1/projects?select=*`, anonKey),
    ]);

    const urlMap = new Map();
    const sql = ['BEGIN;'];
    const stats = { settings: 0, clients: 0, projects: 0, urls: 0 };

    for (const settings of settingsRows) {
        const updates = {};
        for (const field of ['hero_image_url', 'about_image_url', 'contact_bg_url']) {
            const oldUrl = settings[field];
            const newUrl = await migrateUrl(oldUrl, baseUrl, anonKey, urlMap);
            if (newUrl !== oldUrl) updates[field] = newUrl;
        }

        if (Object.keys(updates).length > 0) {
            stats.settings += 1;
            sql.push(
                `UPDATE public.settings SET ${Object.entries(updates).map(([key, value]) => `${key} = ${sqlString(value)}`).join(', ')}, updated_at = now() WHERE id = ${sqlString(settings.id)}::uuid;`
            );
        }
    }

    for (const client of clients) {
        const newUrl = await migrateUrl(client.logo_url_bw, baseUrl, anonKey, urlMap);
        if (newUrl !== client.logo_url_bw) {
            stats.clients += 1;
            sql.push(`UPDATE public.clients SET logo_url_bw = ${sqlString(newUrl)}, updated_at = now() WHERE id = ${sqlString(client.id)}::uuid;`);
        }
    }

    for (const project of projects) {
        const newImageUrl = await migrateUrl(project.image_url, baseUrl, anonKey, urlMap);
        const oldGallery = Array.isArray(project.gallery_urls) ? project.gallery_urls : [];
        const newGallery = [];
        for (const url of oldGallery) {
            newGallery.push(await migrateUrl(url, baseUrl, anonKey, urlMap));
        }

        const changedImage = newImageUrl !== project.image_url;
        const changedGallery = JSON.stringify(newGallery) !== JSON.stringify(oldGallery);
        if (changedImage || changedGallery) {
            stats.projects += 1;
            sql.push(`UPDATE public.projects SET image_url = ${sqlString(newImageUrl)}, gallery_urls = ${sqlTextArray(newGallery)}, updated_at = now() WHERE id = ${sqlString(project.id)}::uuid;`);
        }
    }

    stats.urls = urlMap.size;
    sql.push("NOTIFY pgrst, 'reload schema';");
    sql.push('COMMIT;');

    const outPath = path.join(repoRoot, '.data', 'storage-migration-update.sql');
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, sql.join('\n'), 'utf8');

    console.log(JSON.stringify({ stats, sql: outPath }, null, 2));
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
