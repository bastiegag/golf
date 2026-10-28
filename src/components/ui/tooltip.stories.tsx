import { Info } from 'lucide-react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Icon } from './icon';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

const meta = {
  title: 'UI/Overlays/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SupplementalHelp: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" aria-label="More information" className="text-muted-foreground">
            <Icon icon={Info} />
          </button>
        </TooltipTrigger>
        <TooltipContent>Additional context appears here.</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};
