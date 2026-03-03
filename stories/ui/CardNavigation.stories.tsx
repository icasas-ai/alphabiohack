import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { ChevronsUpDown, Home } from "lucide-react"

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StoryPanel, StorySurface } from "@/stories/ui/story-helpers"

const meta = {
  title: "UI/Navigation",
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Components: Story = {
  render: () => (
    <StorySurface title="Navigation primitives" description="Compact wayfinding and surface organization primitives.">
      <div className="grid gap-6 xl:grid-cols-2">
        <StoryPanel title="Breadcrumb">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">
                  <Home className="mr-1 size-4" />
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Availability</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbEllipsis />
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>March review</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </StoryPanel>
        <StoryPanel title="Tabs">
          <Tabs defaultValue="review">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="review">Review</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="rounded-md border p-4 text-sm text-muted-foreground">
              Overview tab content
            </TabsContent>
            <TabsContent value="review" className="rounded-md border p-4 text-sm text-muted-foreground">
              Review tab content
            </TabsContent>
            <TabsContent value="history" className="rounded-md border p-4 text-sm text-muted-foreground">
              History tab content
            </TabsContent>
          </Tabs>
        </StoryPanel>
        <StoryPanel title="Collapsible">
          <Collapsible defaultOpen className="rounded-lg border">
            <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-3 text-left">
              <div>
                <p className="font-medium">Availability period summary</p>
                <p className="text-sm text-muted-foreground">Compact details behind a single trigger.</p>
              </div>
              <ChevronsUpDown className="size-4 text-muted-foreground" />
            </CollapsibleTrigger>
            <CollapsibleContent className="border-t px-4 py-3 text-sm text-muted-foreground">
              March 1 to March 6, one excluded date, and sixty-seven remaining sessions.
            </CollapsibleContent>
          </Collapsible>
        </StoryPanel>
        <StoryPanel title="Scroll area and separator">
          <div className="space-y-4">
            <ScrollArea className="h-40 rounded-md border p-4">
              <div className="space-y-3 text-sm text-muted-foreground">
                {Array.from({ length: 8 }, (_, index) => (
                  <div key={index} className="rounded-md bg-muted/40 p-3">
                    Review block #{index + 1}
                  </div>
                ))}
              </div>
            </ScrollArea>
            <Separator />
            <p className="text-sm text-muted-foreground">Separators help break dense vertical content.</p>
          </div>
        </StoryPanel>
      </div>
    </StorySurface>
  ),
}
