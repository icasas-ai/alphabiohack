import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StorySurface } from "@/stories/ui/story-helpers"

const meta = {
  title: "UI/Card",
  component: Card,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Variants: Story = {
  render: () => (
    <StorySurface title="Card" description="Base composition primitive for summaries, panels, and detail blocks.">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Remaining sessions</CardDescription>
            <CardTitle>128</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Availability period</CardTitle>
            <CardDescription>Office Anytown • Mar 1 to Mar 6</CardDescription>
            <CardAction>
              <Badge>Draft</Badge>
            </CardAction>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Six open days, one excluded date, and sixty-seven remaining sessions.
          </CardContent>
          <CardFooter>
            <Button variant="outline">Review</Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Booking summary</CardTitle>
            <CardDescription>Used in the public booking wizard.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span>Mar 2, 2026</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Time</span>
              <span>10:00 AM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration</span>
              <span>60 minutes</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </StorySurface>
  ),
}
