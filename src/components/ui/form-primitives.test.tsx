import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { Checkbox } from './checkbox';
import { Field, FieldDescription, FieldError, FieldLabel } from './field';
import { Input } from './input';
import { Select } from './select';
import { Textarea } from './textarea';

describe('form primitives', () => {
  it('forwards refs and submits native input values', () => {
    const ref = createRef<HTMLInputElement>();
    const { container } = render(
      <form>
        <Input ref={ref} name="email" defaultValue="alex@example.com" aria-label="Email" />
      </form>,
    );

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(new FormData(container.querySelector('form')!).get('email')).toBe(
      'alex@example.com',
    );
  });

  it('supports textarea values and invalid state', () => {
    render(
      <Textarea
        name="message"
        defaultValue="Hello"
        aria-label="Message"
        aria-invalid="true"
      />,
    );

    expect(screen.getByRole('textbox', { name: 'Message' })).toHaveValue('Hello');
    expect(screen.getByRole('textbox', { name: 'Message' })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  it('supports select values and disabled state', () => {
    render(
      <Select aria-label="Category" defaultValue="clothing" disabled>
        <option value="clothing">Clothing</option>
      </Select>,
    );

    expect(screen.getByRole('combobox', { name: 'Category' })).toHaveValue('clothing');
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('omits unchecked checkboxes from FormData and includes checked ones', () => {
    const { container } = render(
      <form>
        <Checkbox name="unchecked" aria-label="Unchecked" />
        <Checkbox name="checked" defaultChecked aria-label="Checked" />
      </form>,
    );

    const form = container.querySelector('form')!;
    const data = new FormData(form);
    expect(data.has('unchecked')).toBe(false);
    expect(data.get('checked')).toBe('on');
  });

  it('sets the native indeterminate state', () => {
    render(<Checkbox indeterminate aria-label="Select all" />);

    expect(screen.getByRole('checkbox', { name: 'Select all' })).toHaveProperty(
      'indeterminate',
      true,
    );
  });

  it('associates labels, descriptions, and errors explicitly', () => {
    render(
      <Field>
        <FieldLabel htmlFor="profile-name">Name</FieldLabel>
        <Input
          id="profile-name"
          aria-describedby="profile-description profile-error"
          aria-errormessage="profile-error"
          aria-invalid="true"
        />
        <FieldDescription id="profile-description">
          Public display name.
        </FieldDescription>
        <FieldError id="profile-error">Name is required.</FieldError>
      </Field>,
    );

    const input = screen.getByRole('textbox', { name: 'Name' });
    expect(input).toHaveAttribute(
      'aria-describedby',
      'profile-description profile-error',
    );
    expect(input).toHaveAttribute('aria-errormessage', 'profile-error');
    expect(screen.getByText('Name is required.')).toBeInTheDocument();
  });

  it('supports controlled input updates', () => {
    render(<Input aria-label="Controlled" value="Before" onChange={() => {}} />);

    fireEvent.change(screen.getByRole('textbox', { name: 'Controlled' }), {
      target: { value: 'After' },
    });

    expect(screen.getByRole('textbox', { name: 'Controlled' })).toHaveValue(
      'Before',
    );
  });
});
