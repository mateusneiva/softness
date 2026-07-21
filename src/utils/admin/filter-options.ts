import {
  ArrowDownWideNarrow,
  ArrowUpDown,
  ArrowUpNarrowWide,
  Calendar,
  CalendarClock,
  CheckCircle2,
  Clock3,
  CreditCard,
  Eye,
  EyeOff,
  GripVertical,
  Hash,
  Layers,
  ListFilter,
  Package,
  Pencil,
  Power,
  Sparkles,
  Tag,
  Truck,
  Type,
  XCircle,
} from 'lucide-react';
import type { FilterOption } from '@/src/types/filters';

export const ORDER_STATUS_FILTER_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'All', icon: ListFilter, tone: 'neutral' },
  { value: 'PENDING', label: 'Pending', icon: Clock3, tone: 'amber' },
  { value: 'PAID', label: 'Paid', icon: CreditCard, tone: 'sky' },
  { value: 'PROCESSING', label: 'Processing', icon: Package, tone: 'amber' },
  { value: 'SHIPPED', label: 'Shipped', icon: Truck, tone: 'violet' },
  { value: 'FULFILLED', label: 'Fulfilled', icon: CheckCircle2, tone: 'emerald' },
  { value: 'CANCELLED', label: 'Cancelled', icon: XCircle, tone: 'slate' },
];

export const ORDER_SORT_OPTIONS: FilterOption[] = [
  { value: 'date-desc', label: 'Newest', icon: Calendar, tone: 'neutral' },
  { value: 'date-asc', label: 'Oldest', icon: CalendarClock, tone: 'neutral' },
  { value: 'status', label: 'Status', icon: Layers, tone: 'violet' },
  { value: 'total-desc', label: 'Highest total', icon: ArrowDownWideNarrow, tone: 'emerald' },
  { value: 'total-asc', label: 'Lowest total', icon: ArrowUpNarrowWide, tone: 'amber' },
  { value: 'items-desc', label: 'Most items', icon: Package, tone: 'sky' },
];

export const VISIBILITY_FILTER_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'All', icon: ListFilter, tone: 'neutral' },
  { value: 'public', label: 'Public', icon: Eye, tone: 'emerald' },
  { value: 'scheduled', label: 'Scheduled', icon: Clock3, tone: 'amber' },
  { value: 'private', label: 'Private', icon: EyeOff, tone: 'slate' },
];

export const PRODUCT_SORT_OPTIONS: FilterOption[] = [
  { value: 'manual', label: 'Manual order', icon: GripVertical, tone: 'neutral' },
  { value: 'name', label: 'Name', icon: Type, tone: 'sky' },
  { value: 'status', label: 'Status', icon: Layers, tone: 'violet' },
  { value: 'release', label: 'Release', icon: Calendar, tone: 'amber' },
  { value: 'edited', label: 'Edited', icon: Pencil, tone: 'neutral' },
  { value: 'price', label: 'Price', icon: Tag, tone: 'emerald' },
];

export const COLLECTION_SORT_OPTIONS: FilterOption[] = [
  { value: 'manual', label: 'Manual order', icon: GripVertical, tone: 'neutral' },
  { value: 'name', label: 'Name', icon: Type, tone: 'sky' },
  { value: 'status', label: 'Status', icon: Layers, tone: 'violet' },
  { value: 'release', label: 'Release', icon: Calendar, tone: 'amber' },
  { value: 'edited', label: 'Edited', icon: Pencil, tone: 'neutral' },
  { value: 'products', label: 'Products', icon: Package, tone: 'emerald' },
];

export const COLLECTION_STATUS_FILTER_OPTIONS: FilterOption[] = [
  ...VISIBILITY_FILTER_OPTIONS,
  { value: 'featured', label: 'Featured', icon: Sparkles, tone: 'amber' },
];

export const COUPON_STATUS_FILTER_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'All', icon: ListFilter, tone: 'neutral' },
  { value: 'active', label: 'Active', icon: Power, tone: 'emerald' },
  { value: 'inactive', label: 'Inactive', icon: Power, tone: 'slate' },
  { value: 'scheduled', label: 'Scheduled', icon: Clock3, tone: 'amber' },
  { value: 'expired', label: 'Expired', icon: XCircle, tone: 'red' },
  { value: 'first', label: 'First purchase', icon: Sparkles, tone: 'sky' },
];

export const COUPON_SORT_OPTIONS: FilterOption[] = [
  { value: 'newest', label: 'Newest', icon: Calendar, tone: 'neutral' },
  { value: 'code', label: 'Code', icon: Hash, tone: 'sky' },
  { value: 'uses', label: 'Uses', icon: ArrowUpDown, tone: 'violet' },
  { value: 'starts', label: 'Starts', icon: CalendarClock, tone: 'amber' },
  { value: 'expires', label: 'Expires', icon: Clock3, tone: 'red' },
];

export const ACCOUNT_ORDER_SORT_OPTIONS: FilterOption[] = [
  { value: 'date-desc', label: 'Newest first', icon: Calendar, tone: 'neutral' },
  { value: 'date-asc', label: 'Oldest first', icon: CalendarClock, tone: 'neutral' },
  { value: 'status', label: 'Status', icon: Layers, tone: 'violet' },
  { value: 'total-desc', label: 'Highest total', icon: ArrowDownWideNarrow, tone: 'emerald' },
  { value: 'total-asc', label: 'Lowest total', icon: ArrowUpNarrowWide, tone: 'amber' },
];
