import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  it('renders semantic button content and forwards interactions', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not invoke handlers while disabled', () => {
    const onClick = vi.fn();
    const { container } = render(
      <Button disabled onClick={onClick}>
        Save
      </Button>,
    );

    fireEvent.click(within(container).getByRole('button', { name: 'Save' }));

    expect(onClick).not.toHaveBeenCalled();
    expect(within(container).getByRole('button')).toBeDisabled();
  });

  it('supports the asChild composition API', () => {
    render(
      <Button asChild>
        <a href="/products">Browse products</a>
      </Button>,
    );

    expect(screen.getByRole('link', { name: 'Browse products' })).toHaveAttribute(
      'href',
      '/products',
    );
  });

  it.each(['default', 'secondary', 'outline', 'ghost', 'destructive'] as const)(
    'renders the %s variant',
    (variant) => {
      render(<Button variant={variant}>{variant}</Button>);

      expect(screen.getByRole('button', { name: variant })).toBeInTheDocument();
    },
  );

  it('forwards a ref to the underlying button', () => {
    const ref = createRef<HTMLButtonElement>();

    render(<Button ref={ref}>Save</Button>);

    expect(ref.current).toHaveTextContent('Save');
    expect(ref.current?.tagName).toBe('BUTTON');
  });
});
