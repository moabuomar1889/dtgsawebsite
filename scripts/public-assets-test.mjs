import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';

const { fallbackClients, fallbackSettings } = await import('../lib/fallback-data.ts');

const publicAssetUrls = [
    fallbackSettings.hero_image_url,
    ...fallbackClients.map((client) => client.logo_url_bw),
];

for (const assetUrl of publicAssetUrls) {
    assert.match(assetUrl, /^\/local-storage\//);
    await access(new URL(`../public${assetUrl}`, import.meta.url));
}

assert.equal(fallbackClients.length, 10);
assert.equal(new Set(publicAssetUrls).size, publicAssetUrls.length);

console.log('public fallback asset tests passed');
