import { describe, expect, it } from 'vitest';
import { getAuthSecret } from './runtime-config';

describe('production authentication configuration', () => {
  it('rejects missing or short production secrets', () => {
    expect(() =>
      getAuthSecret({ NODE_ENV: 'production', AUTH_SECRET: undefined }),
    ).toThrow('AUTH_SECRET must be configured');
    expect(() =>
      getAuthSecret({ NODE_ENV: 'production', AUTH_SECRET: 'too-short' }),
    ).toThrow('AUTH_SECRET must be configured');
  });

  it('allows a strong secret and does not break production builds', () => {
    const secret = 'a'.repeat(32);
    expect(getAuthSecret({ NODE_ENV: 'production', AUTH_SECRET: secret })).toBe(secret);
    expect(
      getAuthSecret({
        NODE_ENV: 'production',
        NEXT_PHASE: 'phase-production-build',
        AUTH_SECRET: undefined,
      }),
    ).toBeUndefined();
  });
});
