import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { CalendarDays, MoreHorizontal, Settings } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { StoryPanel, StorySurface } from "@/stories/ui/story-helpers"

const meta = {
  title: "UI/Overlays",
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Components: Story = {
  render: () => (
    <StorySurface title="Overlay primitives" description="Transient surfaces for actions, menus, and contextual help.">
      <StoryPanel title="Examples">
        <div className="flex flex-wrap gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">Tooltip</Button>
              </TooltipTrigger>
              <TooltipContent>Small contextual help.</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Popover</Button>
            </PopoverTrigger>
            <PopoverContent className="w-72">
              <p className="font-medium">Quick details</p>
              <p className="mt-2 text-sm text-muted-foreground">Useful for compact supporting content.</p>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <MoreHorizontal className="mr-2 size-4" />
                Menu
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Settings className="size-4" />
                Edit settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CalendarDays className="size-4" />
                View calendar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm delete</DialogTitle>
                <DialogDescription>This blocks the page until the user decides.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button variant="destructive">Delete</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Sheet</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Edit period</SheetTitle>
                <SheetDescription>Side panel editing without leaving the page.</SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>

          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline">Drawer</Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Mobile action sheet</DrawerTitle>
                <DrawerDescription>Good for mobile-friendly confirmations and quick tasks.</DrawerDescription>
              </DrawerHeader>
              <DrawerFooter>
                <Button>Continue</Button>
                <Button variant="outline">Cancel</Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
      </StoryPanel>
    </StorySurface>
  ),
}
