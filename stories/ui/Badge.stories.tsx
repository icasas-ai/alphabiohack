import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { Badge } from "@/components/ui/badge"
import { StoryPanel, StorySurface } from "@/stories/ui/story-helpers"

const meta = {
  title: "UI/Badge",
  component: Badge,
  args: {
    children: "Open",
    variant: "default",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline"],
    },
  },
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Variants: Story = {
  render: () => (
    <StorySurface title="Badge" description="Compact status and metadata labels used across booking and admin views.">
      <StoryPanel title="Variants">
        <div className="flex flex-wrap gap-3">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </StoryPanel>
    </StorySurface>
  ),
}
