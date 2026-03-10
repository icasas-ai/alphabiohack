import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { StickyWizardShell } from "@/components/ui/sticky-wizard-shell"
import { Stepper } from "@/components/ui/stepper"
import { SurfaceCard } from "@/components/ui/surface-card"
import { Badge } from "@/components/ui/badge"
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { StorySurface } from "@/stories/ui/story-helpers"

const meta = {
  title: "UI/Wizard Shell",
  component: StickyWizardShell,
  args: {
    header: null,
    children: null,
  },
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof StickyWizardShell>

export default meta
type Story = StoryObj<typeof meta>

const wizardItems = [
  { id: "clinic", label: "Clinic", status: "complete" as const },
  { id: "service", label: "Service", status: "current" as const },
  { id: "time", label: "Date & Time", status: "upcoming" as const },
  { id: "details", label: "Details", status: "upcoming" as const },
]

function DemoCard({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <SurfaceCard variant="panel">
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle>{description}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <p>
          This shell keeps the progress navigation pinned under the header and can offset a sticky sidebar automatically.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-xl border border-border/70 bg-background/70 p-4">
              Section {index + 1}
            </div>
          ))}
        </div>
      </CardContent>
    </SurfaceCard>
  )
}

export const StickyLayout: Story = {
  render: () => (
    <StorySurface
      title="Sticky wizard shell"
      description="Scroll this story to see the sticky stepper header and sticky supporting sidebar work together."
    >
      <div className="app-page-gradient min-h-[1400px] rounded-[2rem] bg-background/70 py-4">
        <StickyWizardShell
          header={({ compact }) => (
            <Stepper items={wizardItems} compact={compact} />
          )}
          sidebar={
            <SurfaceCard variant="glass">
              <CardHeader>
                <CardDescription>Sticky aside</CardDescription>
                <CardTitle>Context summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <Badge variant="info">Auto offset</Badge>
                <p>
                  Useful for wizard summaries, helper panels, or operator context while the main step content changes.
                </p>
              </CardContent>
            </SurfaceCard>
          }
        >
          <DemoCard
            title="Primary step"
            description="Bookable content area"
          />
          <DemoCard
            title="Long flow"
            description="Additional sections keep the sticky shell active"
          />
          <DemoCard
            title="Future use"
            description="This can power setup wizards, onboarding, or internal workflows"
          />
        </StickyWizardShell>
      </div>
    </StorySurface>
  ),
}
