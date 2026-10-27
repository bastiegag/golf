import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { CategoryForm } from './category-form';

describe('CategoryForm', () => {
  it('suggests a slug and preserves a manually edited slug', async () => {
    const user = userEvent.setup();
    render(
      <CategoryForm
        initialValues={{ name: '', slug: '', isActive: true }}
        action={async () => ({})}
        submitLabel="Create category"
      />,
    );

    await user.type(screen.getByLabelText('Name'), 'Café Goods');
    expect(screen.getByLabelText('Slug')).toHaveValue('cafe-goods');
    await user.clear(screen.getByLabelText('Slug'));
    await user.type(screen.getByLabelText('Slug'), 'custom-goods');
    await user.clear(screen.getByLabelText('Name'));
    await user.type(screen.getByLabelText('Name'), 'New Goods');
    expect(screen.getByLabelText('Slug')).toHaveValue('custom-goods');
  });
});
