import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const palettes = [
  'primary',
  'secondary',
  'success',
  'warning',
  'destructive',
  'info',
  'neutral',
] as const;
const semanticTokens = [
  ['background', 'foreground'],
  ['surface', 'surface-foreground'],
  ['muted', 'muted-foreground'],
  ['primary', 'primary-foreground'],
  ['secondary', 'secondary-foreground'],
  ['success', 'success-foreground'],
  ['warning', 'warning-foreground'],
  ['destructive', 'destructive-foreground'],
  ['info', 'info-foreground'],
] as const;

const meta = {
  title: 'Foundations/Colors',
  parameters: {
    layout: 'padded',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const BasePalettes: Story = {
  render: () => (
    <div className="space-y-8">
      {palettes.map((palette) => (
        <section key={palette} aria-labelledby={`${palette}-palette`}>
          <h2 id={`${palette}-palette`} className="mb-2 text-heading-3 capitalize">
            {palette}
          </h2>
          <div className="grid grid-cols-11 gap-1">
            {shades.map((shade) => (
              <div key={shade} className="space-y-1 text-center text-caption">
                <div
                  className="h-12 rounded-sm border border-border"
                  style={{
                    backgroundColor: `var(--palette-${palette}-${shade})`,
                  }}
                />
                <span>{shade}</span>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  ),
};

export const SemanticTokens: Story = {
  render: () => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {semanticTokens.map(([background, foreground]) => (
        <div
          key={background}
          className="rounded-md border border-border p-5"
          style={{
            backgroundColor: `var(--${background})`,
            color: `var(--${foreground})`,
          }}
        >
          <p className="font-medium">{background}</p>
          <p className="text-body-sm">Uses {foreground} for readable content.</p>
        </div>
      ))}
    </div>
  ),
};
