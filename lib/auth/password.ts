import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
const HASH_BYTES = 64;
const PASSWORD_FORMAT = 'scrypt-v1';

export async function hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16);
    const derivedKey = await scrypt(password, salt, HASH_BYTES) as Buffer;
    return [PASSWORD_FORMAT, salt.toString('base64url'), derivedKey.toString('base64url')].join('$');
}

export async function verifyPassword(password: string, encodedHash: string): Promise<boolean> {
    const [format, saltValue, hashValue] = encodedHash.split('$');
    if (format !== PASSWORD_FORMAT || !saltValue || !hashValue) return false;

    try {
        const expected = Buffer.from(hashValue, 'base64url');
        const actual = await scrypt(password, Buffer.from(saltValue, 'base64url'), expected.length) as Buffer;
        return expected.length === actual.length && timingSafeEqual(expected, actual);
    } catch {
        return false;
    }
}
