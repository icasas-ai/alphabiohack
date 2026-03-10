import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useState } from "react"
import { Sparkles } from "lucide-react"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Toggle } from "@/components/ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { StoryPanel, StorySurface } from "@/stories/ui/story-helpers"

const meta = {
  title: "UI/Selection Controls",
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const States: Story = {
  render: () => {
    const [reminders, setReminders] = useState(true)
    const [markedClosed, setMarkedClosed] = useState(false)
    const [mode, setMode] = useState("review")

    return (
      <StorySurface title="Selection controls" description="Boolean and option controls used in forms and toolbars.">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <StoryPanel title="Checkbox">
            <div className="flex items-center gap-3">
              <Checkbox
                id="closed-day"
                checked={markedClosed}
                onCheckedChange={(value) => setMarkedClosed(Boolean(value))}
              />
              <Label htmlFor="closed-day">Mark this day as closed</Label>
            </div>
          </StoryPanel>
          <StoryPanel title="Switch">
            <div className="flex items-center justify-between gap-3 rounded-md border p-3">
              <div className="space-y-1">
                <Label htmlFor="send-reminders">Send reminders</Label>
                <p className="text-sm text-muted-foreground">Enable automated appointment notifications.</p>
              </div>
              <Switch
                id="send-reminders"
                checked={reminders}
                onCheckedChange={setReminders}
              />
            </div>
          </StoryPanel>
          <StoryPanel title="Radio group">
            <RadioGroup defaultValue="60" className="grid gap-2">
              {["30", "45", "60"].map((duration) => (
                <div key={duration} className="flex items-center gap-2 rounded-md border p-3">
                  <RadioGroupItem id={`duration-${duration}`} value={duration} />
                  <Label htmlFor={`duration-${duration}`}>{duration} minutes</Label>
                </div>
              ))}
            </RadioGroup>
          </StoryPanel>
          <StoryPanel title="Toggle">
            <div className="flex items-center gap-3">
              <Toggle aria-label="Highlight">
                <Sparkles className="size-4" />
              </Toggle>
              <p className="text-sm text-muted-foreground">Useful for icon-only tool states.</p>
            </div>
          </StoryPanel>
          <StoryPanel title="Toggle group">
            <ToggleGroup type="single" value={mode} onValueChange={(value) => value && setMode(value)}>
              <ToggleGroupItem value="review">Review</ToggleGroupItem>
              <ToggleGroupItem value="edit">Edit</ToggleGroupItem>
              <ToggleGroupItem value="history">History</ToggleGroupItem>
            </ToggleGroup>
          </StoryPanel>
        </div>
      </StorySurface>
    )
  },
}
