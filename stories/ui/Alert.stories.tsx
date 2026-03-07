import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Bell, ShieldAlert } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { StoryPanel, StorySurface } from "@/stories/ui/story-helpers"

const meta = {
  title: "UI/Alert",
  component: Alert,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Alert>

export default meta
type Story = StoryObj<typeof meta>

export const Variants: Story = {
  render: () => (
    <StorySurface title="Alert" description="Message block for inline status, warnings, and destructive states.">
      <div className="grid max-w-3xl gap-6">
        <StoryPanel title="Default">
          <Alert>
            <Bell className="size-4" />
            <AlertDescription>Email is configured for local SMTP delivery.</AlertDescription>
          </Alert>
        </StoryPanel>
        <StoryPanel title="Destructive">
          <Alert variant="destructive">
            <ShieldAlert className="size-4" />
            <AlertDescription>Deleting a period will permanently remove its remaining sessions.</AlertDescription>
          </Alert>
        </StoryPanel>
      </div>
    </StorySurface>
  ),
}
