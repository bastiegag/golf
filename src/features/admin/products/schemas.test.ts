import { describe, expect, it } from 'vitest';
import {
  parseProductFilters,
  productInputSchema,
  slugifyProductName,
} from './schemas';

const validProduct = {
  name: 'Field Notes',
  slug: 'field-notes',
  description: 'A useful notebook.',
  price: '18.50',
  imageUrl: '/products/placeholder.svg',
  categoryId: 'category-1',
  isActive: true,
};

describe('product administration schemas', () => {
  it('accepts a valid product and rejects invalid prices', () => {
    expect(productInputSchema.safeParse(validProduct).success).toBe(true);
    expect(
      productInputSchema.safeParse({ ...validProduct, price: '-1.00' }).success,
    ).toBe(false);
    expect(
      productInputSchema.safeParse({ ...validProduct, price: '18.999' }).success,
    ).toBe(false);
  });

  it('only accepts local image paths', () => {
    expect(
      productInputSchema.safeParse({
        ...validProduct,
        imageUrl: 'https://example.com/image.jpg',
      }).success,
    ).toBe(false);
    expect(
      productInputSchema.safeParse({
        ...validProduct,
        imageUrl: '/products/image.jpg',
      }).success,
    ).toBe(true);
  });

  it('generates editable URL-safe slugs from names', () => {
    expect(slugifyProductName('  Café & Field Notes! ')).toBe(
      'cafe-field-notes',
    );
  });

  it('normalizes invalid pagination and filters', () => {
    expect(
      parseProductFilters({
        page: '0',
        status: 'invalid',
        query: '  clubs ',
      }),
    ).toEqual({
      page: 1,
      status: 'all',
      query: 'clubs',
      categoryId: '',
    });

  });

  it.each(['0', '-2', 'not-a-number'])(
    'falls back to page 1 for invalid page %s',
    (page) => {
      expect(parseProductFilters({ page }).page).toBe(1);
    },
  );
});
