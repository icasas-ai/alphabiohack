import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StoryPanel, StorySurface } from "@/stories/ui/story-helpers"

const meta = {
  title: "UI/Table",
  component: Table,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Table>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <StorySurface title="Table" description="Low-level table primitive for list and admin data presentation.">
      <StoryPanel title="Availability data">
        <Table>
          <TableCaption>Example availability inventory for one office.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Remaining sessions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Mar 1, 2026</TableCell>
              <TableCell>Office Anytown</TableCell>
              <TableCell><Badge>Open</Badge></TableCell>
              <TableCell className="text-right">8</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Mar 2, 2026</TableCell>
              <TableCell>Office Anytown</TableCell>
              <TableCell><Badge variant="outline">Excluded</Badge></TableCell>
              <TableCell className="text-right">0</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Mar 3, 2026</TableCell>
              <TableCell>Office Seaside</TableCell>
              <TableCell><Badge variant="secondary">Draft</Badge></TableCell>
              <TableCell className="text-right">5</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </StoryPanel>
    </StorySurface>
  ),
}
