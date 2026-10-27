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

  it('accepts leap days only in leap years and rejects impossible dates', () => {
    expect(parseOrderFilters({ from: '2024-02-29' }).from).toBe('2024-02-29');
    expect(parseOrderFilters({ from: '2025-02-29' }).from).toBeUndefined();
    expect(parseOrderFilters({ from: '2026-02-30' }).from).toBeUndefined();
    expect(parseOrderFilters({ from: '2026-13-01' }).from).toBeUndefined();
    expect(parseOrderFilters({ from: '2026-00-10' }).from).toBeUndefined();
  });

  it('keeps UTC calendar boundaries independent of the local timezone', () => {
    expect(parseOrderFilters({ from: '2026-10-26', to: '2026-10-26' })).toMatchObject({
      from: '2026-10-26',
      to: '2026-10-26',
    });
  });
});
