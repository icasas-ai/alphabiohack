"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

type RangeKey = "last7" | "thisWeek" | "last30" | "today" | "all"

interface ChartAreaInteractiveProps {
  title?: string
  subtitle?: string
  data: Array<{ date: string; value: number }>
  range?: RangeKey
  onRangeChange?: (value: RangeKey) => void
  headerAction?: React.ReactNode
  labels?: {
    last7?: string
    last30?: string
    thisWeek?: string
    today?: string
    all?: string
    series?: string
  }
}

const chartConfig = {
  appointments: {
    label: "Appointments",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function ChartAreaInteractive({
  title = "Appointments",
  subtitle,
  data,
  range,
  onRangeChange,
  headerAction,
  labels,
}: ChartAreaInteractiveProps) {
  const isMobile = useIsMobile()
  const [internalRange, setInternalRange] = React.useState<RangeKey>("last30")
  const effectiveRange = range ?? internalRange

  React.useEffect(() => {
    if (isMobile && !range) {
      setInternalRange("last7")
    }
  }, [isMobile, range])

  const handleRangeChange = (v: string) => {
    const next = (v || effectiveRange) as RangeKey
    if (onRangeChange) onRangeChange(next)
    else setInternalRange(next)
  }

  // El dataset ya viene filtrado desde el servidor según el rango actual.
  const filteredData = React.useMemo(() => {
    if (!data?.length) return []
    if (range) return data
    // Si el componente controla el rango internamente, filtrar aquí por conveniencia visual
    const now = new Date()
    let days = 7
    if (effectiveRange === 'last30') days = 30
    if (effectiveRange === 'all') return data
    if (effectiveRange === 'today') {
      const start = new Date(now)
      start.setHours(0,0,0,0)
      return data.filter(d => new Date(d.date) >= start)
    }
    if (effectiveRange === 'thisWeek') {
      const day = now.getDay()
      const diffToMonday = (day + 6) % 7
      const monday = new Date(now)
      monday.setDate(now.getDate() - diffToMonday)
      return data.filter(d => new Date(d.date) >= monday)
    }
    const start = new Date(now)
    start.setDate(now.getDate() - (days - 1))
    return data.filter(d => new Date(d.date) >= start)
  }, [data, effectiveRange, range])

  return (
    <Card className="@container/card">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <CardTitle>{title}</CardTitle>
          {subtitle ? (
            <CardDescription>{subtitle}</CardDescription>
          ) : null}
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          {headerAction}
          <ToggleGroup
            type="single"
            value={effectiveRange}
            onValueChange={handleRangeChange}
            variant="outline"
            className="@[767px]/card:flex hidden"
          >
            <ToggleGroupItem value="last30" className="h-8 px-2.5">
              {labels?.last30 ?? "Last 30 days"}
            </ToggleGroupItem>
            <ToggleGroupItem value="last7" className="h-8 px-2.5">
              {labels?.last7 ?? "Last 7 days"}
            </ToggleGroupItem>
            <ToggleGroupItem value="thisWeek" className="h-8 px-2.5">
              {labels?.thisWeek ?? "This week"}
            </ToggleGroupItem>
            <ToggleGroupItem value="today" className="h-8 px-2.5">
              {labels?.today ?? "Today"}
            </ToggleGroupItem>
          </ToggleGroup>
          <Select value={effectiveRange} onValueChange={handleRangeChange}>
            <SelectTrigger
              className="@[767px]/card:hidden flex w-40"
              aria-label="Select a value"
            >
              <SelectValue placeholder={labels?.last30 ?? "Last 30 days"} />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="last30" className="rounded-lg">
                {labels?.last30 ?? "Last 30 days"}
              </SelectItem>
              <SelectItem value="last7" className="rounded-lg">
                {labels?.last7 ?? "Last 7 days"}
              </SelectItem>
              <SelectItem value="thisWeek" className="rounded-lg">
                {labels?.thisWeek ?? "This week"}
              </SelectItem>
              <SelectItem value="today" className="rounded-lg">
                {labels?.today ?? "Today"}
              </SelectItem>
              <SelectItem value="all" className="rounded-lg">
                {labels?.all ?? "All"}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillAppointments" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-appointments)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-appointments)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <YAxis hide domain={[0, (dataMax: number) => Math.max(1, Math.ceil(dataMax))]} allowDecimals={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="value"
              type="linear"
              fill="url(#fillAppointments)"
              stroke="var(--color-appointments)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
