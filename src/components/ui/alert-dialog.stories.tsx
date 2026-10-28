import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from './alert-dialog';
import { Button } from './button';

const meta = {
  title: 'UI/Overlays/AlertDialog',
  component: AlertDialog,
  tags: ['autodocs'],
} satisfies Meta<typeof AlertDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Confirmation: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">Delete item</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Delete this item?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
          </AlertDialogDescription>
          <div className="mt-6 flex justify-end gap-3">
            <AlertDialogCancel asChild>
              <Button variant="outline">Cancel</Button>
            </AlertDialogCancel>
            <AlertDialogAction>Delete</AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    );
  },
};
