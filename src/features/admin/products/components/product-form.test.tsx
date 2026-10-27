import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ProductForm } from './product-form';

const initialValues = {
  name: '',
  slug: '',
  description: '',
  price: '',
  imageUrl: '/products/placeholder.svg',
  categoryId: '',
  isActive: true,
};

const action = async () => ({});

describe('ProductForm', () => {
  it('suggests a slug while leaving a manually edited slug untouched', async () => {
    const user = userEvent.setup();
    render(
      <ProductForm
        categories={[{ id: 'cat-1', name: 'Clothing' }]}
        initialValues={initialValues}
        action={action}
        submitLabel="Create product"
      />,
    );

    const name = screen.getByLabelText('Name');
    const slug = screen.getByLabelText('Slug');
    await user.type(name, 'Café Club');
    expect(slug).toHaveValue('cafe-club');

    await user.clear(slug);
    await user.type(slug, 'custom-club');
    await user.clear(name);
    await user.type(name, 'New Name');
    expect(slug).toHaveValue('custom-club');
  });

  it('uses controlled values for all editable fields', async () => {
    const user = userEvent.setup();
    render(
      <ProductForm
        categories={[{ id: 'cat-1', name: 'Clothing' }]}
        initialValues={{ ...initialValues, name: 'Existing', categoryId: 'cat-1' }}
        action={action}
        submitLabel="Save changes"
      />,
    );

    await user.clear(screen.getByLabelText('Description'));
    await user.type(screen.getByLabelText('Description'), 'Updated description');
    await user.selectOptions(screen.getByLabelText('Category'), 'cat-1');
    const activeCheckbox = screen.getAllByRole('checkbox', {
      name: 'Active in the public storefront',
    })[0];
    await user.click(activeCheckbox);

    expect(screen.getByLabelText('Description')).toHaveValue('Updated description');
    expect(screen.getByLabelText('Category')).toHaveValue('cat-1');
    expect(activeCheckbox).not.toBeChecked();
  });
});
