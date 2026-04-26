// Bản dịch tiếng Việt cho hệ thống

export const STATUS_TRANSLATIONS = {
  // Order Status
  OPEN: 'Mới tạo',
  PENDING: 'Chờ xử lý',
  COOKING: 'Đang nấu',
  READY: 'Sẵn sàng',
  SERVED: 'Đã phục vụ',
  PAID: 'Đã thanh toán',
  CANCELED: 'Đã hủy',

  // Reservation Status
  RESERVED: 'Đã đặt',
  CHECKED_IN: 'Đã check-in',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
  NO_SHOW: 'Không đến',

  // Table Status
  AVAILABLE: 'Trống',
  OCCUPIED: 'Đang dùng',
  DIRTY: 'Cần dọn',
} as const;

export const translateStatus = (status: string): string => {
  return STATUS_TRANSLATIONS[status as keyof typeof STATUS_TRANSLATIONS] || status;
};
