import 'dotenv/config';
import { getPrisma } from '../lib/db';
import { hashPassword } from '../lib/auth/password';

async function main() {
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
        throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD for this one-time command. Do not commit either value.');
    }
    if (password.length < 12) throw new Error('ADMIN_PASSWORD must contain at least 12 characters.');

    const passwordHash = await hashPassword(password);
    await getPrisma().adminUser.upsert({
        where: { email },
        update: { password_hash: passwordHash, role: 'admin', is_active: true },
        create: { email, password_hash: passwordHash },
    });
    console.log(`Admin account is ready for ${email}.`);
}

main()
    .catch((error) => {
        console.error(error instanceof Error ? error.message : error);
        process.exitCode = 1;
    })
    .finally(async () => getPrisma().$disconnect());
