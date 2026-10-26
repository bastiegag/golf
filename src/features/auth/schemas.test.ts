import { describe, expect, it } from 'vitest';
import { adminProvisioningSchema, loginSchema } from './schemas';

describe('authentication schemas', () => {
  it('normalizes valid login emails', () => {
    expect(
      loginSchema.parse({ email: ' Admin@Example.com ', password: 'secret' }),
    ).toEqual({ email: 'admin@example.com', password: 'secret' });
  });

  it('rejects invalid login credentials', () => {
    expect(loginSchema.safeParse({ email: 'invalid', password: '' }).success).toBe(
      false,
    );
  });

  it('requires a strong provisioning password', () => {
    expect(
      adminProvisioningSchema.safeParse({
        email: 'admin@example.com',
        password: 'short',
      }).success,
    ).toBe(false);
    expect(
      adminProvisioningSchema.safeParse({
        email: 'admin@example.com',
        password: 'a sufficiently long password',
      }).success,
    ).toBe(true);
  });
});
