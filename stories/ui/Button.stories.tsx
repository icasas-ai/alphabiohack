import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { GradientButton } from "@/components/ui/gradient-button"
import { StoryPanel, StorySurface } from "@/stories/ui/story-helpers"

const meta = {
  title: "UI/Button",
  component: Button,
  args: {
    children: "Save changes",
    variant: "default",
    size: "default",
    disabled: false,
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "outline", "ghost", "link", "destructive"],
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon", "icon-sm", "icon-lg"],
    },
  },
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Variants: Story = {
  render: () => (
    <StorySurface title="Button" description="Core action primitive with the variants used across the product.">
      <StoryPanel title="Variants">
        <div className="flex flex-wrap gap-3">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button variant="destructive">Destructive</Button>
          <GradientButton>Gradient</GradientButton>
        </div>
      </StoryPanel>
      <StoryPanel title="Sizes">
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon" aria-label="Add">
            <Plus className="size-4" />
          </Button>
          <Button size="icon-sm" aria-label="Add small">
            <Plus className="size-4" />
          </Button>
          <Button size="icon-lg" aria-label="Add large">
            <Plus className="size-4" />
          </Button>
        </div>
      </StoryPanel>
      <StoryPanel title="States">
        <div className="flex flex-wrap gap-3">
          <Button disabled>Disabled</Button>
          <Button variant="outline" disabled>
            Disabled outline
          </Button>
        </div>
      </StoryPanel>
    </StorySurface>
  ),
}
