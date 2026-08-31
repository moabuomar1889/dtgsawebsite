import assert from 'node:assert/strict';

const { hashPassword, verifyPassword } = await import('../lib/auth/password.ts');

const password = 'a secure admin password';
const hash = await hashPassword(password);

assert.match(hash, /^scrypt-v1\$/);
assert.equal(await verifyPassword(password, hash), true);
assert.equal(await verifyPassword('wrong password', hash), false);
assert.equal(await verifyPassword(password, 'invalid'), false);

console.log('security smoke tests passed');
