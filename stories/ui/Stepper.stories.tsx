import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { Stepper } from "@/components/ui/stepper"
import { StoryPanel, StorySurface } from "@/stories/ui/story-helpers"

const baseItems = [
  { id: "type", label: "Appointment Type", status: "complete" as const },
  { id: "service", label: "Service", status: "complete" as const },
  { id: "time", label: "Date & Time", status: "current" as const },
  { id: "details", label: "Details", status: "upcoming" as const },
  { id: "confirm", label: "Confirmation", status: "upcoming" as const },
]

const meta = {
  title: "UI/Stepper",
  component: Stepper,
  args: {
    items: baseItems,
  },
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Stepper>

export default meta
type Story = StoryObj<typeof meta>

export const States: Story = {
  render: () => (
    <StorySurface
      title="Stepper"
      description="Progress navigation for multi-step flows. Supports the compact sticky state used in the booking wizard."
    >
      <div className="grid gap-6">
        <StoryPanel title="Default">
          <Stepper items={baseItems} />
        </StoryPanel>
        <StoryPanel title="Compact">
          <Stepper items={baseItems} compact />
        </StoryPanel>
        <StoryPanel title="Completed">
          <Stepper
            items={baseItems.map((item, index, items) => ({
              ...item,
              status: index === items.length - 1 ? "current" : "complete",
            }))}
          />
        </StoryPanel>
      </div>
    </StorySurface>
  ),
}
