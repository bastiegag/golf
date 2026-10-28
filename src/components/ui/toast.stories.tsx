import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { toast } from 'sonner';
import { Button } from './button';
import { Toaster } from './toaster';

const meta = {
  title: 'UI/Feedback/Toast',
  parameters: { layout: 'centered' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Notifications: Story = {
  render: () => (
    <>
      <Toaster />
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => toast.success('Product saved.')}>Success</Button>
        <Button variant="destructive" onClick={() => toast.error('Could not save product.')}>
          Error
        </Button>
        <Button variant="secondary" onClick={() => toast.info('New information is available.')}>
          Info
        </Button>
        <Button variant="outline" onClick={() => toast.warning('Review this before continuing.')}>
          Warning
        </Button>
      </div>
    </>
  ),
};
