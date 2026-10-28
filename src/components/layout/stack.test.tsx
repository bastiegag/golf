import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { Stack } from './stack';

describe('Stack', () => {
  it('renders a vertical stack with configured layout classes', () => {
    render(
      <Stack direction="vertical" gap="lg" align="center" justify="between" wrap>
        <span>First</span>
        <span>Second</span>
      </Stack>,
    );

    const stack = screen.getByText('First').parentElement;
    expect(stack).toHaveClass(
      'flex',
      'flex-col',
      'gap-6',
      'items-center',
      'justify-between',
      'flex-wrap',
    );
  });

  it('forwards standard attributes and refs', () => {
    const ref = createRef<HTMLDivElement>();

    render(
      <Stack ref={ref} aria-label="Content stack">
        Content
      </Stack>,
    );

    expect(screen.getByLabelText('Content stack')).toBe(ref.current);
  });
});
