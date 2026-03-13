import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { LucideIcon } from "lucide-react"
import * as LucideIcons from "lucide-react"
import { useMemo, useState } from "react"

import { Input } from "@/components/ui/input"
import {
  SUPPORTED_ICON_CATEGORIES,
  SUPPORTED_ICON_COUNT,
} from "@/lib/config/supported-icons"
import { StoryPanel, StorySurface } from "@/stories/ui/story-helpers"

const meta = {
  title: "UI/Icon Catalog",
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function IconTile({
  name,
  icon,
  importLabel,
  note,
}: {
  name: string
  icon: keyof typeof LucideIcons
  importLabel?: string
  note?: string
}) {
  const Icon = LucideIcons[icon] as LucideIcon

  return (
    <div className="flex min-h-36 flex-col gap-3 rounded-2xl border border-border/70 bg-card/70 p-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/16 bg-primary/8 text-primary">
        <Icon className="size-5" />
      </div>
      <div className="space-y-1">
        <p className="font-medium text-foreground">{name}</p>
        <p className="text-xs text-muted-foreground">
          {`import { ${importLabel || icon} } from "lucide-react"`}
        </p>
        {note ? <p className="text-xs text-muted-foreground">{note}</p> : null}
      </div>
    </div>
  )
}

export const Gallery: Story = {
  render: () => {
    const [query, setQuery] = useState("")
    const normalizedQuery = query.trim().toLowerCase()

    const filteredCategories = useMemo(() => {
      return SUPPORTED_ICON_CATEGORIES.map((category) => ({
        ...category,
        icons: category.icons.filter((icon) => {
          if (!normalizedQuery) {
            return true
          }

          return [icon.name, icon.icon, icon.importLabel, icon.note]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(normalizedQuery))
        }),
      })).filter((category) => category.icons.length > 0)
    }, [normalizedQuery])

    const visibleIconCount = filteredCategories.reduce(
      (total, category) => total + category.icons.length,
      0,
    )

    return (
      <StorySurface
        title="Supported icon catalog"
        description='This catalog shows the Lucide icons currently supported across the product. Search by display name or import token. Alias exports such as "CalendarIcon" or "XIcon" resolve to the same glyphs, so the catalog lists the canonical product-facing entries instead of every duplicate alias.'
      >
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-full border border-border/70 bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground">
            {SUPPORTED_ICON_COUNT} supported icons
          </span>
          <span className="inline-flex items-center rounded-full border border-border/70 bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground">
            {SUPPORTED_ICON_CATEGORIES.length} categories
          </span>
          <span className="inline-flex items-center rounded-full border border-border/70 bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground">
            {visibleIconCount} currently visible
          </span>
        </div>

        <StoryPanel
          title="Search"
          description="Use this to narrow the catalog by icon name, import token, or note."
        >
          <div className="max-w-md">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder='Try "calendar", "user", or "tooth"'
            />
          </div>
        </StoryPanel>

        {filteredCategories.length === 0 ? (
          <StoryPanel title="No matches" description="Try a broader search term to see more icons.">
            <p className="text-sm text-muted-foreground">
              No supported icons matched <code>{query}</code>.
            </p>
          </StoryPanel>
        ) : (
          <div className="grid gap-6">
            {filteredCategories.map((category) => (
              <StoryPanel
                key={category.id}
                title={category.label}
                description={`${category.description} ${category.icons.length} icon${category.icons.length === 1 ? "" : "s"} shown.`}
              >
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {category.icons.map((icon) => (
                    <IconTile
                      key={`${category.id}-${icon.name}`}
                      name={icon.name}
                      icon={icon.icon}
                      importLabel={icon.importLabel}
                      note={icon.note}
                    />
                  ))}
                </div>
              </StoryPanel>
            ))}
          </div>
        )}
      </StorySurface>
    )
  },
}
