import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { Badge } from "@/components/ui/badge"
import { StoryPanel, StorySurface } from "@/stories/ui/story-helpers"

const inventory = {
  actions: ["button", "gradient-button", "toggle", "toggle-group"],
  forms: [
    "calendar",
    "checkbox",
    "form",
    "input",
    "label",
    "phone-input",
    "radio-group",
    "select",
    "switch",
    "textarea",
  ],
  navigation: [
    "breadcrumb",
    "collapsible",
    "command",
    "scroll-area",
    "separator",
    "sidebar",
    "tabs",
  ],
  overlays: [
    "alert-dialog",
    "dialog",
    "drawer",
    "dropdown-menu",
    "popover",
    "sheet",
    "tooltip",
  ],
  dataAndFeedback: [
    "alert",
    "async-wrapper",
    "avatar",
    "badge",
    "card",
    "chart",
    "dropzone",
    "error-component",
    "progress",
    "skeleton",
    "skeleton-component",
    "sonner",
    "table",
  ],
} as const

const storyCovered = new Set([
  "alert",
  "avatar",
  "badge",
  "breadcrumb",
  "button",
  "calendar",
  "card",
  "chart",
  "checkbox",
  "collapsible",
  "dialog",
  "drawer",
  "dropdown-menu",
  "gradient-button",
  "input",
  "label",
  "phone-input",
  "popover",
  "progress",
  "radio-group",
  "scroll-area",
  "select",
  "separator",
  "sheet",
  "skeleton",
  "switch",
  "table",
  "tabs",
  "textarea",
  "toggle",
  "toggle-group",
  "tooltip",
])

const meta = {
  title: "UI/Inventory",
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = {
  render: () => (
    <StorySurface
      title="UI inventory"
      description="This is the current components/ui surface. Filled badges already have dedicated stories. Outlined badges still exist in the codebase but are not yet isolated into their own focused story."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {Object.entries(inventory).map(([group, items]) => (
          <StoryPanel
            key={group}
            title={group}
            description={`${items.length} primitives in this group.`}
          >
            <div className="flex flex-wrap gap-2">
              {items.map((item) => (
                <Badge key={item} variant={storyCovered.has(item) ? "default" : "outline"}>
                  {item}
                </Badge>
              ))}
            </div>
          </StoryPanel>
        ))}
      </div>
    </StorySurface>
  ),
}
