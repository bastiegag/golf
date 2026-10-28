import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Container } from './container';

describe('Container', () => {
  it('renders the selected width and padding conventions', () => {
    render(
      <Container size="md" padding="lg">
        Content
      </Container>,
    );

    expect(screen.getByText('Content')).toHaveClass(
      'w-full',
      'max-w-5xl',
      'px-6',
      'sm:px-10',
      'lg:px-12',
      'mx-auto',
    );
  });

  it('supports an unconstrained full-width layout', () => {
    render(
      <Container size="full" padding="none" centered={false}>
        Full width
      </Container>,
    );

    expect(screen.getByText('Full width')).toHaveClass('max-w-none', 'px-0');
    expect(screen.getByText('Full width')).not.toHaveClass('mx-auto');
  });
});
