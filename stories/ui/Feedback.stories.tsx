import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { StoryPanel, StorySurface } from "@/stories/ui/story-helpers"

const meta = {
  title: "UI/Feedback",
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Components: Story = {
  render: () => (
    <StorySurface title="Feedback primitives" description="Identity, loading, and progress indicators.">
      <div className="grid gap-6 md:grid-cols-3">
        <StoryPanel title="Avatar">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>DG</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">David Guillen</p>
              <p className="text-sm text-muted-foreground">Therapist profile</p>
            </div>
          </div>
        </StoryPanel>
        <StoryPanel title="Progress">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Migration rollout</span>
              <span className="text-muted-foreground">68%</span>
            </div>
            <Progress value={68} />
          </div>
        </StoryPanel>
        <StoryPanel title="Skeleton">
          <div className="space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-full" />
          </div>
        </StoryPanel>
      </div>
    </StorySurface>
  ),
}
