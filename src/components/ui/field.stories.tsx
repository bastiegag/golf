import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Field, FieldDescription, FieldError, FieldLabel } from './field';
import { Input } from './input';
import { Select } from './select';

const meta = {
  title: 'UI/Forms/Field',
  component: Field,
  tags: ['autodocs'],
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithDescription: Story = {
  render: () => (
    <Field className="w-80">
      <FieldLabel htmlFor="field-name">Name</FieldLabel>
      <Input
        id="field-name"
        name="name"
        aria-describedby="field-name-description"
      />
      <FieldDescription id="field-name-description">
        Use the name shown on your account.
      </FieldDescription>
    </Field>
  ),
};

export const WithServerError: Story = {
  render: () => (
    <Field className="w-80" required>
      <FieldLabel htmlFor="field-email" required>
        Email
      </FieldLabel>
      <Input
        id="field-email"
        name="email"
        type="email"
        defaultValue="not-an-email"
        aria-invalid="true"
        aria-errormessage="field-email-error"
        aria-describedby="field-email-error"
      />
      <FieldError id="field-email-error">
        Enter a valid email address.
      </FieldError>
    </Field>
  ),
};

export const NativeFormComposition: Story = {
  render: () => (
    <form
      className="grid w-80 gap-4"
      onSubmit={(event) => event.preventDefault()}
    >
      <Field>
        <FieldLabel htmlFor="contact-name">Name</FieldLabel>
        <Input id="contact-name" name="name" defaultValue="Alex" />
      </Field>
      <Field>
        <FieldLabel htmlFor="contact-type" optional>
          Type
        </FieldLabel>
        <Select id="contact-type" name="type" defaultValue="question">
          <option value="question">Question</option>
          <option value="feedback">Feedback</option>
        </Select>
      </Field>
    </form>
  ),
};
