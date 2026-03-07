"use client";

import { ArrowUpDown, ChevronDown, Copy, Loader2, MoreHorizontal } from "lucide-react";
import {
  ColumnDef,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BOOKING_STATUS_OPTIONS,
  BOOKING_STATUS_TRANSITIONS,
  type BookingStatusValue,
} from "@/lib/utils/booking-status";
import { formatInTZ } from "@/lib/utils/timezone";

export type BookingRow = {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  bookingSchedule: string;
  bookingLocalDate?: string;
  bookingLocalTime?: string;
  status: string;
  location: {
    id?: string;
    title: string;
    address?: string;
    timezone?: string;
  };
  specialty?: {
    id: string;
    name: string;
  };
  service?: {
    id: string;
    description: string;
    cost: number;
    duration: number;
  };
  therapist?: {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
  };
};

interface BookingsDataTableProps {
  data: BookingRow[];
  canManageStatus?: boolean;
  updatingBookingId?: string | null;
  onStatusChange?: (bookingId: string, status: BookingStatusValue) => Promise<void>;
  onEditBooking?: (booking: BookingRow) => void;
}

function getStatusTone(status: string) {
  switch (status) {
    case "Confirmed":
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-900/40";
    case "Pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-900/40";
    case "NeedsAttention":
      return "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-900/40";
    case "InProgress":
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-900/40";
    case "Completed":
      return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-900/40";
    case "Cancelled":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/40";
    case "NoShow":
      return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-900/40";
    default:
      return "bg-muted text-foreground/80 border-border";
  }
}

function getStatusDot(status: string) {
  switch (status) {
    case "Confirmed":
      return "bg-green-500";
    case "Pending":
      return "bg-yellow-500";
    case "NeedsAttention":
      return "bg-rose-500";
    case "InProgress":
      return "bg-blue-500";
    case "Completed":
      return "bg-emerald-500";
    case "Cancelled":
      return "bg-red-500";
    case "NoShow":
      return "bg-orange-500";
    default:
      return "bg-muted-foreground";
  }
}

export function BookingsDataTable({
  data,
  canManageStatus = false,
  updatingBookingId,
  onStatusChange,
  onEditBooking,
}: BookingsDataTableProps) {
  const t = useTranslations("Bookings");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    bookingId: string;
    currentStatus: BookingStatusValue;
    nextStatus: BookingStatusValue;
  } | null>(null);

  const locationOptions = useMemo(
    () =>
      Array.from(
        new Set(data.map((booking) => booking.location?.title).filter(Boolean))
      ).sort(),
    [data]
  );

  const filteredData = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return data.filter((booking) => {
      const matchesSearch =
        !query ||
        `${booking.firstname} ${booking.lastname}`.toLowerCase().includes(query) ||
        booking.email.toLowerCase().includes(query) ||
        booking.phone.toLowerCase().includes(query) ||
        (booking.service?.description ?? "").toLowerCase().includes(query) ||
        (booking.specialty?.name ?? "").toLowerCase().includes(query);

      const matchesLocation =
        locationFilter === "all" || booking.location?.title === locationFilter;

      const matchesStatus =
        statusFilter === "all" || booking.status === statusFilter;

      return matchesSearch && matchesLocation && matchesStatus;
    });
  }, [data, locationFilter, searchTerm, statusFilter]);

  const columns = useMemo<ColumnDef<BookingRow>[]>(
    () => [
      {
        accessorKey: "firstname",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t("firstName")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <div className="font-medium">{row.original.firstname}</div>,
      },
      {
        accessorKey: "lastname",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t("lastName")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <div className="font-medium">{row.original.lastname}</div>,
      },
      {
        accessorKey: "email",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t("email")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <div className="lowercase">{row.original.email}</div>,
      },
      {
        accessorKey: "phone",
        header: t("phone"),
        cell: ({ row }) => <div>{row.original.phone}</div>,
      },
      {
        accessorKey: "status",
        header: t("status"),
        cell: ({ row }) => (
          <Badge variant="outline" className={getStatusTone(row.original.status)}>
            <span
              className={`h-2 w-2 rounded-full ${getStatusDot(row.original.status)}`}
              aria-hidden="true"
            />
            {t(`statusOptions.${row.original.status}`)}
          </Badge>
        ),
      },
      {
        accessorKey: "location",
        header: t("location"),
        cell: ({ row }) => <div>{row.original.location?.title || "-"}</div>,
      },
      {
        accessorKey: "bookingSchedule",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t("date")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const localDate = row.original.bookingLocalDate;
          if (localDate) {
            return <div>{localDate}</div>;
          }

          return (
            <div>
              {formatInTZ(
                new Date(row.original.bookingSchedule),
                "MMM d, yyyy",
                row.original.location?.timezone,
              )}
            </div>
          );
        },
      },
      {
        id: "bookingTime",
        header: t("time"),
        cell: ({ row }) => {
          const localTime = row.original.bookingLocalTime;
          if (localTime) {
            return <div>{localTime}</div>;
          }

          return (
            <div>
              {formatInTZ(
                new Date(row.original.bookingSchedule),
                "HH:mm",
                row.original.location?.timezone,
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "service",
        header: t("service"),
        cell: ({ row }) => <div>{row.original.service?.description || "-"}</div>,
      },
      {
        accessorKey: "specialty",
        header: t("specialty"),
        cell: ({ row }) => <div>{row.original.specialty?.name || "-"}</div>,
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const booking = row.original;
          const status = booking.status as BookingStatusValue;
          const transitions = BOOKING_STATUS_TRANSITIONS[status] ?? [];
          const isUpdating = updatingBookingId === booking.id;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={(event) => event.stopPropagation()}
                >
                  <span className="sr-only">{t("openMenu")}</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{t("actions")}</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={async () => {
                    await navigator.clipboard.writeText(booking.id);
                    toast.success(t("idCopied"));
                  }}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  {t("copyId")}
                </DropdownMenuItem>
                {onEditBooking ? (
                  <DropdownMenuItem onClick={() => onEditBooking(booking)}>
                    {t("editBooking")}
                  </DropdownMenuItem>
                ) : null}
                {canManageStatus && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>{t("updateStatus")}</DropdownMenuLabel>
                    {transitions.length ? (
                      transitions.map((nextStatus) => (
                        <DropdownMenuItem
                          key={nextStatus}
                          disabled={isUpdating}
                          onClick={() =>
                            setPendingStatusChange({
                              bookingId: booking.id,
                              currentStatus: status,
                              nextStatus,
                            })
                          }
                        >
                          {isUpdating ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : null}
                          {t(`markAs.${nextStatus}`)}
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <DropdownMenuItem disabled>
                        {t("noStatusActions")}
                      </DropdownMenuItem>
                    )}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [canManageStatus, onEditBooking, t, updatingBookingId]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
    },
  });

  const hasActiveFilters =
    searchTerm.trim().length > 0 ||
    locationFilter !== "all" ||
    statusFilter !== "all";

  return (
    <div className="motion-stagger w-full space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <Input
          placeholder={t("searchPlaceholder")}
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="w-full lg:max-w-sm"
        />

        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder={t("filterByLocation")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allLocations")}</SelectItem>
              {locationOptions.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder={t("filterByStatus")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allStatuses")}</SelectItem>
              {BOOKING_STATUS_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  {t(`statusOptions.${status}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("");
              setLocationFilter("all");
              setStatusFilter("all");
            }}
            disabled={!hasActiveFilters}
          >
            {t("clearFilters")}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="sm:ml-auto">
                {t("columns")} <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {t(`columnLabels.${column.id}`, {
                      default: column.id,
                    })}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={onEditBooking ? "cursor-pointer hover:bg-muted/40" : undefined}
                  onClick={() => onEditBooking?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      onClick={
                        cell.column.id === "actions"
                          ? (event) => event.stopPropagation()
                          : undefined
                      }
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {t("noResults")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 py-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          {t("showingResults", {
            count: table.getFilteredRowModel().rows.length,
          })}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {t("previous")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {t("next")}
          </Button>
        </div>
      </div>

      <AlertDialog
        open={Boolean(pendingStatusChange)}
        onOpenChange={(open) => {
          if (!open) {
            setPendingStatusChange(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmStatusChangeTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingStatusChange
                ? t("confirmStatusChangeDescription", {
                    current: t(`statusOptions.${pendingStatusChange.currentStatus}`),
                    next: t(`statusOptions.${pendingStatusChange.nextStatus}`),
                  })
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("keepCurrentStatus")}</AlertDialogCancel>
            <AlertDialogAction
              disabled={!pendingStatusChange}
              onClick={() => {
                if (!pendingStatusChange) return;
                void onStatusChange?.(
                  pendingStatusChange.bookingId,
                  pendingStatusChange.nextStatus
                );
                setPendingStatusChange(null);
              }}
            >
              {t("confirmStatusChangeAction")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
