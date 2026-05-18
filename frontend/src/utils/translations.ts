// Vietnamese labels shared by operational screens.

export const STATUS_TRANSLATIONS = {
  // Order status
  OPEN: 'Moi tao',
  PENDING: 'Cho bep nhan',
  COOKING: 'Dang nau',
  READY: 'San sang phuc vu',
  SERVED: 'Da phuc vu',
  PAID: 'Da thanh toan',
  CANCELED: 'Da huy',

  // Reservation status
  RESERVED: 'Da dat ban',
  CHECKED_IN: 'Da check-in',
  COMPLETED: 'Hoan thanh',
  CANCELLED: 'Da huy',
  NO_SHOW: 'Khong den',

  // Table status
  AVAILABLE: 'Trong',
  OCCUPIED: 'Dang dung',
  DIRTY: 'Can don',
} as const;

export const translateStatus = (status: string): string => {
  return STATUS_TRANSLATIONS[status as keyof typeof STATUS_TRANSLATIONS] || status;
};
