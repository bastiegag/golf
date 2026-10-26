import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from './password';

describe('password hashing', () => {
  it('hashes passwords and verifies only the original value', async () => {
    const hash = await hashPassword('a secure administrator password');

    expect(hash).toMatch(/^scrypt\$N=16384,r=8,p=1\$/);
    await expect(
      verifyPassword('a secure administrator password', hash),
    ).resolves.toBe(true);
    await expect(verifyPassword('not the password', hash)).resolves.toBe(false);
  });

  it('rejects malformed stored hashes', async () => {
    await expect(verifyPassword('password', 'not-a-password-hash')).resolves.toBe(
      false,
    );
  });
});
