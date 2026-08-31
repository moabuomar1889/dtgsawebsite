import 'dotenv/config';
import { getPrisma } from '../lib/db';
import {
    fallbackExperience,
    fallbackNews,
    fallbackProjects,
    fallbackServices,
} from '../lib/fallback-data';

const clients = [
    ['Saudi Aramco', '1769854198338-qq4frq.png'],
    ['Air Products', '1769854258788-2c3c48.png'],
    ['National Information Center', '1769888434350-a2bhsf.png'],
    ['JIGPC', '1769860372767-91u5xf.png'],
    ['KENT', '1769857611614-8f1fp.jpg'],
    ['LARSEN & TOUBRO', '1769857954956-d1y75q.jpg'],
    ['SNC LAVALIN', '1769888550146-q14by.png'],
    ['Thales', '1769888541215-q81f9h.png'],
    ['MAADEN', '1769889085565-tnvh4c.png'],
    ['BHIG', '1769889396288-ukj42r.png'],
] as const;

async function seedSettings() {
    if (await getPrisma().settings.count() > 0) return;

    await getPrisma().settings.create({
        data: {
            hero_image_url: '/local-storage/settings/1769422373553-3rg0w9.jpg',
            site_title: 'DURRAT Construction',
            hero_headline: ' Oil & Gas Construction',
            hero_subheadline: 'Building world-class energy infrastructure with precision engineering, proven expertise, and unwavering commitment to safety and quality.',
            contact_email: 'info@dtgsa.com',
            contact_phone: '+966500109053',
            contact_address: 'Riyadh, Saudi Arabia',
        },
    });
}

async function seedClients() {
    if (await getPrisma().client.count() > 0) return;

    await getPrisma().client.createMany({
        data: clients.map(([name, filename], sort_order) => ({
            name,
            logo_url_bw: `/local-storage/clients/${filename}`,
            sort_order,
        })),
    });
}

async function seedPublicSections() {
    if (await getPrisma().experience.count() === 0) {
        await getPrisma().experience.createMany({
            data: fallbackExperience.map(({ id, ...record }) => {
                void id;
                return record;
            }),
        });
    }

    if (await getPrisma().service.count() === 0) {
        await getPrisma().service.createMany({
            data: fallbackServices.map(({ id, ...record }) => {
                void id;
                return record;
            }),
        });
    }

    if (await getPrisma().project.count() === 0) {
        await getPrisma().project.createMany({
            data: fallbackProjects.map(({ id, ...record }) => {
                void id;
                return { ...record, gallery_urls: [] };
            }),
        });
    }

    if (await getPrisma().news.count() === 0) {
        await getPrisma().news.createMany({
            data: fallbackNews.map(({ id, date, ...record }) => {
                void id;
                return { ...record, date: new Date(`${date}T00:00:00.000Z`) };
            }),
        });
    }
}

async function main() {
    await seedSettings();
    await seedClients();
    await seedPublicSections();
    console.log('Public website seed data is ready.');
}

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => getPrisma().$disconnect());
