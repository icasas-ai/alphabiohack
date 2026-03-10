import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useState } from "react"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StoryPanel, StorySurface } from "@/stories/ui/story-helpers"

const meta = {
  title: "UI/Select",
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const States: Story = {
  render: () => {
    const [value, setValue] = useState("office")

    return (
      <StorySurface title="Select" description="Radix-based select used for compact option picking in forms.">
        <StoryPanel title="Playground">
          <div className="grid gap-4">
            <Select value={value} onValueChange={setValue}>
              <SelectTrigger className="w-72">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Appointment type</SelectLabel>
                  <SelectItem value="office">Office</SelectItem>
                  <SelectItem value="virtual">Virtual</SelectItem>
                  <SelectSeparator />
                  <SelectItem value="home-visit">Home visit</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">Selected value: {value}</p>
          </div>
        </StoryPanel>
      </StorySurface>
    )
  },
}
