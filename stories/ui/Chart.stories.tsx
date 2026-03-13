import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { StoryPanel, StorySurface } from "@/stories/ui/story-helpers"

const data = [
  { month: "Jan", bookings: 12, revenue: 24 },
  { month: "Feb", bookings: 18, revenue: 38 },
  { month: "Mar", bookings: 24, revenue: 52 },
  { month: "Apr", bookings: 16, revenue: 33 },
  { month: "May", bookings: 20, revenue: 46 },
]

const chartConfig = {
  bookings: { label: "Bookings", color: "var(--color-chart-1)" },
  revenue: { label: "Revenue", color: "var(--color-chart-2)" },
} satisfies ChartConfig

const meta = {
  title: "UI/Chart",
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const BarExample: Story = {
  render: () => (
    <StorySurface title="Chart" description="Standardized chart wrapper for Recharts-based visualizations.">
      <StoryPanel title="Bookings and revenue">
        <ChartContainer config={chartConfig} className="h-[320px] w-full">
          <BarChart data={data} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="revenue" fill="var(--color-revenue)" radius={6} />
            <Bar dataKey="bookings" fill="var(--color-bookings)" radius={6} />
          </BarChart>
        </ChartContainer>
      </StoryPanel>
    </StorySurface>
  ),
}
