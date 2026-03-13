import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { Calendar } from "@/components/ui/calendar"
import { StoryPanel, StorySurface } from "@/stories/ui/story-helpers"

const meta = {
  title: "UI/Calendar",
  component: Calendar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Calendar>

export default meta
type Story = StoryObj<typeof meta>

export const SingleDate: Story = {
  render: () => (
    <StorySurface title="Calendar" description="Date selection primitive used in booking and availability.">
      <StoryPanel title="Single date">
        <div className="rounded-lg border">
          <Calendar
            mode="single"
            selected={new Date("2026-03-02")}
            disabled={[new Date("2026-03-05"), new Date("2026-03-06")]}
          />
        </div>
      </StoryPanel>
    </StorySurface>
  ),
}
