export type SupportedIconName = keyof typeof import("lucide-react")

export type SupportedIconDefinition = {
  name: string
  icon: SupportedIconName
  importLabel?: string
  note?: string
}

export type SupportedIconCategory = {
  id: string
  label: string
  description: string
  icons: readonly SupportedIconDefinition[]
}

export const SUPPORTED_ICON_CATEGORIES: readonly SupportedIconCategory[] = [
  {
    id: "navigation",
    label: "Navigation",
    description: "Directional, layout, and app-structure icons used across navigation shells.",
    icons: [
      { name: "ArrowLeft", icon: "ArrowLeft" },
      { name: "ArrowRight", icon: "ArrowRight" },
      { name: "ArrowUpDown", icon: "ArrowUpDown" },
      { name: "ChevronDown", icon: "ChevronDown" },
      { name: "ChevronLeft", icon: "ChevronLeft" },
      { name: "ChevronRight", icon: "ChevronRight" },
      { name: "ChevronUp", icon: "ChevronUpIcon", importLabel: "ChevronUpIcon" },
      { name: "ChevronsLeft", icon: "ChevronsLeft" },
      { name: "ChevronsRight", icon: "ChevronsRight" },
      { name: "ChevronsUpDown", icon: "ChevronsUpDown" },
      { name: "Cog", icon: "Cog" },
      { name: "Home", icon: "Home" },
      { name: "LayoutDashboard", icon: "LayoutDashboard" },
      { name: "LayoutTemplate", icon: "LayoutTemplate" },
      { name: "List", icon: "List" },
      { name: "Menu", icon: "Menu" },
      { name: "Monitor", icon: "Monitor" },
      { name: "MoreHorizontal", icon: "MoreHorizontal" },
      { name: "MoreVertical", icon: "MoreVerticalIcon", importLabel: "MoreVerticalIcon" },
      { name: "PanelLeft", icon: "PanelLeftIcon", importLabel: "PanelLeftIcon" },
    ],
  },
  {
    id: "booking-and-time",
    label: "Booking And Time",
    description: "Scheduling, availability, and appointment-flow icons.",
    icons: [
      { name: "Bell", icon: "Bell" },
      { name: "Calendar", icon: "Calendar" },
      { name: "CalendarCheck2", icon: "CalendarCheck2" },
      { name: "CalendarDays", icon: "CalendarDays" },
      { name: "CalendarPlus", icon: "CalendarPlus" },
      { name: "CalendarRange", icon: "CalendarRange" },
      { name: "Clock", icon: "Clock" },
      { name: "Clock3", icon: "Clock3" },
      { name: "RefreshCw", icon: "RefreshCw" },
      { name: "RotateCcw", icon: "RotateCcw" },
      { name: "TimerReset", icon: "TimerReset" },
      { name: "Video", icon: "Video" },
    ],
  },
  {
    id: "people-and-access",
    label: "People And Access",
    description: "Identity, staff, auth, and account-management icons.",
    icons: [
      { name: "BadgeCheck", icon: "BadgeCheck" },
      { name: "KeyRound", icon: "KeyRound" },
      { name: "LogOut", icon: "LogOut" },
      { name: "ShieldAlert", icon: "ShieldAlert" },
      { name: "ShieldCheck", icon: "ShieldCheck" },
      { name: "User", icon: "User" },
      { name: "UserCog", icon: "UserCog" },
      { name: "UserRound", icon: "UserRound" },
      { name: "Users", icon: "Users" },
    ],
  },
  {
    id: "business-and-communication",
    label: "Business And Communication",
    description: "Business profile, files, contact, and operational actions.",
    icons: [
      { name: "BookOpen", icon: "BookOpen" },
      { name: "Building2", icon: "Building2" },
      { name: "Copy", icon: "Copy" },
      { name: "Download", icon: "Download" },
      { name: "Edit", icon: "Edit" },
      { name: "File", icon: "File" },
      { name: "FileText", icon: "FileText" },
      { name: "Folder", icon: "Folder" },
      { name: "Globe", icon: "Globe" },
      { name: "Globe2", icon: "Globe2" },
      { name: "Image", icon: "ImageIcon", importLabel: "ImageIcon" },
      { name: "Mail", icon: "Mail" },
      { name: "MailCheck", icon: "MailCheck" },
      { name: "MapPin", icon: "MapPin" },
      { name: "NotebookPen", icon: "NotebookPen" },
      { name: "Phone", icon: "Phone" },
      { name: "QrCode", icon: "QrCode" },
      { name: "Save", icon: "Save" },
      { name: "Search", icon: "Search" },
      { name: "Settings", icon: "Settings" },
      { name: "Share", icon: "Share" },
      { name: "Upload", icon: "Upload" },
    ],
  },
  {
    id: "status-and-feedback",
    label: "Status And Feedback",
    description: "System state, alerts, loading, and success or error feedback.",
    icons: [
      { name: "AlertCircle", icon: "AlertCircle" },
      { name: "Check", icon: "Check" },
      { name: "CheckCircle", icon: "CheckCircle" },
      { name: "CheckCircle2", icon: "CheckCircle2" },
      { name: "Circle", icon: "CircleIcon", importLabel: "CircleIcon" },
      { name: "Info", icon: "Info" },
      { name: "Loader2", icon: "Loader2" },
      { name: "Plus", icon: "Plus" },
      { name: "Sparkles", icon: "Sparkles" },
      { name: "Trash2", icon: "Trash2" },
      { name: "X", icon: "X" },
      { name: "XCircle", icon: "XCircle" },
    ],
  },
  {
    id: "data-and-actions",
    label: "Data And Actions",
    description: "Table, analytics, and utility icons used in dense interfaces.",
    icons: [
      { name: "Columns3", icon: "Columns3" },
      { name: "DollarSign", icon: "DollarSign" },
      { name: "GripVertical", icon: "GripVertical" },
      { name: "Maximize2", icon: "Maximize2" },
      { name: "Pencil", icon: "Pencil" },
      { name: "TrendingDown", icon: "TrendingDown" },
      { name: "TrendingUp", icon: "TrendingUp" },
    ],
  },
  {
    id: "brand-and-theme",
    label: "Brand And Theme",
    description: "Social, brand, and theme-switching icons.",
    icons: [
      { name: "Facebook", icon: "Facebook" },
      { name: "Instagram", icon: "Instagram" },
      { name: "Laptop", icon: "Laptop" },
      { name: "Linkedin", icon: "Linkedin" },
      { name: "Moon", icon: "Moon" },
      { name: "Sun", icon: "Sun" },
      { name: "Twitter", icon: "Twitter" },
      { name: "Youtube", icon: "Youtube" },
    ],
  },
  {
    id: "clinical-and-specialty",
    label: "Clinical And Specialty",
    description: "Clinical, specialty, and public-marketing icons used in healthcare flows.",
    icons: [
      { name: "Bone", icon: "Bone" },
      {
        name: "Tooth",
        icon: "Bluetooth",
        importLabel: "Bluetooth as Tooth",
        note: "Lucide does not ship a tooth glyph, so the product currently aliases Bluetooth for dental artwork.",
      },
      { name: "Brain", icon: "Brain" },
      { name: "Eye", icon: "Eye" },
      { name: "Fingerprint", icon: "Fingerprint" },
      { name: "Heart", icon: "Heart" },
      { name: "Leaf", icon: "Leaf" },
      { name: "Stethoscope", icon: "Stethoscope" },
      { name: "Waves", icon: "Waves" },
      { name: "Waypoints", icon: "Waypoints" },
    ],
  },
]

export const SUPPORTED_ICON_COUNT = SUPPORTED_ICON_CATEGORIES.reduce(
  (total, category) => total + category.icons.length,
  0,
)
