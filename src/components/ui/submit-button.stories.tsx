import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { SubmitButton } from './submit-button';

const meta = {
  title: 'UI/Actions/SubmitButton',
  component: SubmitButton,
  tags: ['autodocs'],
  args: {
    children: 'Save changes',
    pendingText: 'Saving…',
  },
} satisfies Meta<typeof SubmitButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <form action={() => undefined}>
      <SubmitButton {...args} />
    </form>
  ),
};
