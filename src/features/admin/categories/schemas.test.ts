import { describe, expect, it } from 'vitest';
import { categoryInputSchema, slugifyCategoryName } from './schemas';

describe('category administration schemas', () => {
  const valid = { name: 'Clothing', slug: 'clothing', isActive: true };

  it('validates names, slugs, and status values', () => {
    expect(categoryInputSchema.safeParse(valid).success).toBe(true);
    expect(categoryInputSchema.safeParse({ ...valid, name: '' }).success).toBe(false);
    expect(categoryInputSchema.safeParse({ ...valid, slug: 'Not valid' }).success).toBe(false);
    expect(categoryInputSchema.safeParse({ ...valid, isActive: 'true' }).success).toBe(false);
  });

  it('normalizes unicode names into editable slugs', () => {
    expect(slugifyCategoryName('  Café & Goods! ')).toBe('cafe-goods');
  });
});
