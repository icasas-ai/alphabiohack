import type { ComponentType } from "react"
import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { GlassCard, PanelCard, SurfaceCard } from "@/components/ui/surface-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StorySurface } from "@/stories/ui/story-helpers"

const meta = {
  title: "UI/Surface Card",
  component: SurfaceCard,
  subcomponents: {
    GlassCard,
    PanelCard,
  },
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof SurfaceCard>

export default meta
type Story = StoryObj<typeof meta>

type SurfaceVariantStory = {
  title: string
  description: string
  component: ComponentType<any>
  props: Record<string, unknown>
}

const variants: SurfaceVariantStory[] = [
  {
    title: "Default",
    description: "Uses the base card primitive with no additional surface treatment.",
    component: SurfaceCard,
    props: { variant: "default" as const },
  },
  {
    title: "Panel",
    description: "Matches the soft surface panels used in the booking and marketing flows.",
    component: PanelCard,
    props: {},
  },
  {
    title: "Glass",
    description: "Higher blur and transparency for floating controls and polished hero surfaces.",
    component: GlassCard,
    props: {},
  },
  {
    title: "Highlight",
    description: "Subtle primary tint for featured summaries or selected callouts.",
    component: SurfaceCard,
    props: { variant: "highlight" as const },
  },
  {
    title: "Elevated",
    description: "Heavier lift for dashboards or modal-adjacent sections.",
    component: SurfaceCard,
    props: { variant: "elevated" as const },
  },
]

export const Variants: Story = {
  render: () => (
    <StorySurface
      title="Surface Card"
      description="Reusable surface variants layered on top of the base card primitive. Use these when a screen needs a stronger visual identity than the default card."
    >
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {variants.map((item) => {
          const Comp = item.component

          return (
            <Comp key={item.title} className="min-h-[18rem]" {...item.props}>
              <CardHeader>
                <CardDescription>{item.title}</CardDescription>
                <CardTitle>{item.description}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <Badge variant="info">Reusable surface</Badge>
                <p>
                  The same content can move between surfaces without changing the internal card composition.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline">Inspect</Button>
              </CardFooter>
            </Comp>
          )
        })}
      </div>
    </StorySurface>
  ),
}
