import { describe, expect, it } from 'vitest';
import { parseOrderFilters } from './schemas';

describe('order filters', () => {
  it('normalizes invalid pages and safely orders reversed date boundaries', () => {
    expect(
      parseOrderFilters({
        page: '0',
        from: '2026-10-20',
        to: '2026-10-01',
      }),
    ).toMatchObject({ page: 1, from: '2026-10-01', to: '2026-10-20' });
  });

  it('drops malformed dates instead of sending unsafe values to the query', () => {
    expect(parseOrderFilters({ from: 'not-a-date', to: '2026-10-01' })).toMatchObject({
      from: undefined,
      to: '2026-10-01',
    });
  });
});
