// ═══ API Response Types ═══

export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T;
}

export interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// ═══ Auth ═══

export interface AuthUser {
  userId: string;
  name: string;
  email: string;
  roles: string[];
}

export interface AuthResponseData {
  accessToken: string;
  refreshToken: string;
  userId: string;
  name: string;
  email: string;
  roles: string[];
}

// ═══ Menu ═══

export interface MenuItemDTO {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  preparationTime: number;
  categoryId: string;
  categoryName: string;
  isAvailable: boolean;
}

// ═══ Table ═══

export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'DIRTY';

export interface TableDTO {
  id: string;
  name: string;
  capacity: number;
  status: TableStatus;
  positionX: number | null;
  positionY: number | null;
  zone: string | null;
  floor: number | null;
  floorName: string | null;
  isVipRoom: boolean | null;
}

// ═══ Order ═══

export type OrderStatus = 'OPEN' | 'PENDING' | 'COOKING' | 'READY' | 'SERVED' | 'PAID' | 'CANCELED';

export interface OrderItemDTO {
  id: string;
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderDTO {
  id: string;
  tableId: string;
  tableName: string;
  status: OrderStatus;
  totalAmount: number;
  items: OrderItemDTO[];
  createdDate: string;
  createdAt: string;
  assignedToId: string | null;
  assignedToName: string | null;
  reservationId: string | null;
}

// ═══ Reservation ═══

export type ReservationStatus = 'PENDING' | 'RESERVED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface ReservationDTO {
  id: string;
  customerName: string;
  phone: string;
  reservationTime: string;
  numberOfGuests: number;
  tableName: string;
  status: ReservationStatus;
}

// ═══ Dashboard ═══

export interface DashboardDTO {
  revenue: { todayRevenue: number; yesterdayRevenue: number; growthPercent: number };
  orders: { todayOrders: number; activeOrders: number; completedOrders: number };
  tables: { total: number; available: number; occupied: number; reserved: number };
  reservations: { todayTotal: number; pending: number; confirmed: number };
}

export interface TopSellingItemDTO {
  menuItemName: string;
  totalQuantity: number;
  totalRevenue: number;
}

export interface RevenueChartDTO {
  name: string;
  revenue: number;
}

export interface LiveOrderDTO {
  id: string;
  table: string;
  status: OrderStatus;
  statusColor: 'warning' | 'success' | 'error' | 'info';
  time: string;
}

// ═══ Report ═══

export interface RevenueReportDTO {
  totalRevenue: number;
  averageOrderValue: number;
  totalOrders: number;
}

// ═══ User / Staff ═══

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  phone: string;
  active: boolean;
  roles: string[];
}

// ═══ Loyalty ═══

export type LoyaltyTier = 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';

export interface LoyaltyDTO {
  userId: string;
  points: number;
  tier: LoyaltyTier;
  totalPointsEarned: number;
  totalPointsRedeemed: number;
  pointsMultiplier: number;
  pointsToNextTier: number;
  nextTier: string;
  lastUpdated: string;
}

// ═══ Profile ═══

export interface ProfileResponse {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  avatarUrl: string | null;
  active: boolean;
  roles: string[];
  createdDate: string;
  lastModifiedDate: string;
  lastLoginDate: string | null;
  roleSpecificData: Record<string, any> | null;
}

// ═══ Settings ═══

export interface SettingsDTO {
  restaurantName: string;
  email: string;
  phone: string;
  address: string;
  openingTime: string;
  closingTime: string;
  noShowGracePeriod: number;
  defaultReservationDuration: number;
  loyaltyPointsPerDollar: number;
  autoAssignWaiter: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

