import {
  Home01Icon,
  Search01Icon,
  ShoppingCart01Icon,
  Notification01Icon,
  UserIcon,
  Location01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  Add01Icon,
  MinusSignIcon,
  Delete01Icon,
  Cancel01Icon,
  CheckmarkCircle01Icon,
  Tick01Icon,
  FavouriteIcon,
  HeartIcon,
  StarIcon,
  Mail01Icon,
  LockPasswordIcon,
  EyeIcon,
  EyeOffIcon,
  CallIcon,
  Message01Icon,
  BubbleChatIcon,
  Share01Icon,
  Store01Icon,
  FilterHorizontalIcon,
  Clock01Icon,
  SecurityCheckIcon,
  DeliveryTruck01Icon,
  SparklesIcon,
  SaleTag01Icon,
  Invoice01Icon,
  Settings01Icon,
  Logout01Icon,
  SmartPhone01Icon,
  TShirtIcon,
  Dumbbell01Icon,
  Bicycle01Icon,
  Refresh01Icon,
  AlertCircleIcon,
  GiftIcon,
  CreditCardIcon,
  UserGroupIcon,
  GoogleIcon,
  Book01Icon,
  GameController01Icon,
  RestaurantIcon,
  CustomerService01Icon,
  NoteIcon,
  ShoppingBag01Icon,
  GridIcon,
  Tag01Icon,
  Chat01Icon,
  ArrowUpDownIcon,
  User02Icon,
  // B2B additions
  Package01Icon,
  Building01Icon,
  CrownIcon,
  Calendar01Icon,
  CheckListIcon,
  InformationCircleIcon,
  Edit01Icon,
  Key01Icon,
  ChevronRightIcon,
  ChevronUpIcon,
  Coins01Icon,
  Globe02Icon,
  Analytics01Icon,
} from '@hugeicons/core-free-icons'

export type IconSvgElement = Parameters<typeof import('@hugeicons/react-native').HugeiconsIcon>[0]['icon']

// ── Navigation ────────────────────────────────────────────────────────────────
export {
  Home01Icon as HomeIcon,
  Search01Icon as SearchIcon,
  Store01Icon as SuppliersNavIcon,
  ShoppingCart01Icon as CartIcon,
  Invoice01Icon as OrdersIcon,
  UserIcon as ProfileIcon,
}

// ── Header / Location ─────────────────────────────────────────────────────────
export {
  Location01Icon as LocationIcon,
  ArrowDown01Icon as ChevronDownIcon,
  ArrowUp01Icon as ChevronUpIcon,
  ChevronRightIcon,
  Notification01Icon as NotificationIcon,
  FilterHorizontalIcon as FilterIcon,
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export {
  Mail01Icon as MailIcon,
  LockPasswordIcon as PasswordLockIcon,
  EyeIcon as ShowPasswordIcon,
  EyeOffIcon as HidePasswordIcon,
  CallIcon as PhoneIcon,
  UserIcon as PersonIcon,
  GoogleIcon,
  Store01Icon as StorefrontIcon,
}

// ── Actions ───────────────────────────────────────────────────────────────────
export {
  ArrowLeft01Icon as BackIcon,
  ArrowRight01Icon as ForwardIcon,
  Add01Icon as AddIcon,
  MinusSignIcon as MinusIcon,
  Delete01Icon as TrashIcon,
  Cancel01Icon as CloseIcon,
  CheckmarkCircle01Icon as CheckCircleIcon,
  Tick01Icon as TickIcon,
  Share01Icon as ShareIcon,
  Refresh01Icon as RefreshIcon,
  AlertCircleIcon,
  ArrowUpDownIcon as SortIcon,
}

// ── Products / Wishlist ───────────────────────────────────────────────────────
export {
  FavouriteIcon as WishlistIcon,
  HeartIcon as WishlistActiveIcon,
  StarIcon,
  ShoppingBag01Icon as BagIcon,
}

// ── Vendors / Business ────────────────────────────────────────────────────────
export {
  Store01Icon as VendorStoreIcon,
  Message01Icon as MessageIcon,
  BubbleChatIcon as ChatIcon,
  Clock01Icon as ClockIcon,
  DeliveryTruck01Icon as DeliveryIcon,
  SecurityCheckIcon as VerifiedIcon,
  UserGroupIcon as FollowersIcon,
  User02Icon as UserAltIcon,
}

// ── Cart / Orders ─────────────────────────────────────────────────────────────
export {
  SaleTag01Icon as PromoTagIcon,
  SparklesIcon,
  LockPasswordIcon as LockIcon,
  Tag01Icon as TagIcon,
  Invoice01Icon as ReceiptIcon,
  Bicycle01Icon as ShippedIcon,
  CheckmarkCircle01Icon as DeliveredIcon,
  Cancel01Icon as CancelledIcon,
  Clock01Icon as PendingIcon,
  Refresh01Icon as ProcessingIcon,
}

// ── Profile / Settings ────────────────────────────────────────────────────────
export {
  Settings01Icon as SettingsIcon,
  Logout01Icon as LogoutIcon,
  FavouriteIcon as WishlistMenuIcon,
  CreditCardIcon,
  GiftIcon,
  CustomerService01Icon as SupportIcon,
  NoteIcon as DocumentIcon,
  GridIcon,
  Edit01Icon as EditIcon,
  Key01Icon as KeyIcon,
}

// ── B2B / Business ────────────────────────────────────────────────────────────
export {
  Package01Icon as PackageIcon,
  Building01Icon as BuildingIcon,
  CrownIcon,
  Calendar01Icon as CalendarIcon,
  CheckListIcon as OrderListIcon,
  InformationCircleIcon as InfoIcon,
  Coins01Icon as CoinsIcon,
  Globe02Icon as GlobeIcon,
  Analytics01Icon as AnalyticsIcon,
}

// ── Category icon map — maps Ionicons names (in mock data) to Hugeicons ───────
export const CATEGORY_ICON_MAP: Record<string, IconSvgElement> = {
  'phone-portrait-outline': SmartPhone01Icon as unknown as IconSvgElement,
  'shirt-outline':          TShirtIcon       as unknown as IconSvgElement,
  'home-outline':           Home01Icon       as unknown as IconSvgElement,
  'barbell-outline':        Dumbbell01Icon   as unknown as IconSvgElement,
  'sparkles-outline':       SparklesIcon     as unknown as IconSvgElement,
  'book-outline':           Book01Icon       as unknown as IconSvgElement,
  'fast-food-outline':      RestaurantIcon   as unknown as IconSvgElement,
  'game-controller-outline':GameController01Icon as unknown as IconSvgElement,
  'grid-outline':           GridIcon         as unknown as IconSvgElement,
  'storefront-outline':     Store01Icon      as unknown as IconSvgElement,
  'bag-outline':            ShoppingBag01Icon as unknown as IconSvgElement,
}

export const DEFAULT_CATEGORY_ICON = ShoppingBag01Icon as unknown as IconSvgElement
