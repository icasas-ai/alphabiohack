import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useState } from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PhoneInput } from "@/components/ui/phone-input"
import { Textarea } from "@/components/ui/textarea"
import { StoryPanel, StorySurface } from "@/stories/ui/story-helpers"

const meta = {
  title: "UI/Input",
  component: Input,
  args: {
    placeholder: "Service title",
    disabled: false,
  },
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Fields: Story = {
  render: () => {
    const [phone, setPhone] = useState("+16194682741")

    return (
      <StorySurface title="Input fields" description="Primitive text and text-like inputs used throughout the app.">
        <div className="grid max-w-4xl gap-6 md:grid-cols-2">
          <StoryPanel title="Text input">
            <div className="grid gap-2">
              <Label htmlFor="service-title">Service title</Label>
              <Input id="service-title" defaultValue="Initial evaluation" />
            </div>
          </StoryPanel>
          <StoryPanel title="Number-like input">
            <div className="grid gap-2">
              <Label htmlFor="price">Price</Label>
              <Input id="price" type="number" defaultValue={90} />
            </div>
          </StoryPanel>
          <StoryPanel title="Phone input">
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <PhoneInput id="phone" value={phone} onChange={setPhone} defaultCountry="US" />
            </div>
          </StoryPanel>
          <StoryPanel title="Textarea">
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                defaultValue="Detailed description for a specialty, service, or availability note."
              />
            </div>
          </StoryPanel>
        </div>
      </StorySurface>
    )
  },
}
