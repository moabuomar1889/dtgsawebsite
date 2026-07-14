import assert from 'node:assert/strict';

process.env.ADMIN_EMAILS = 'admin@example.com, second@example.com';

const { isAdminUser } = await import('../lib/auth/admin.ts');

assert.equal(isAdminUser(null), false);
assert.equal(isAdminUser({ email: 'user@example.com', app_metadata: {} }), false);
assert.equal(isAdminUser({ email: 'admin@example.com', app_metadata: {} }), true);
assert.equal(isAdminUser({ email: 'ADMIN@example.com', app_metadata: {} }), true);
assert.equal(isAdminUser({ email: 'user@example.com', app_metadata: { role: 'admin' } }), true);
assert.equal(isAdminUser({ email: 'mo.abuomar@dtgsa.com', app_metadata: {} }), true);

console.log('security smoke tests passed');
