import { useAuthStore } from '../store/authStore';

export type UserRole = 'CUSTOMER' | 'WAITER' | 'RECEPTIONIST' | 'KITCHEN' | 'MANAGER' | 'ADMIN';

export const ROLE_PRIORITY: Record<UserRole, number> = {
  CUSTOMER: 1,
  WAITER: 2,
  RECEPTIONIST: 3,
  KITCHEN: 4,
  MANAGER: 5,
  ADMIN: 6,
};

export function getPrimaryRole(roles: string[]): UserRole {
  if (!roles || roles.length === 0) return 'CUSTOMER';
  
  let highest: UserRole = 'CUSTOMER';
  let highestPriority = 0;
  
  for (const role of roles) {
    const upperRole = role.toUpperCase() as UserRole;
    const priority = ROLE_PRIORITY[upperRole] || 0;
    if (priority > highestPriority) {
      highestPriority = priority;
      highest = upperRole;
    }
  }
  
  return highest;
}

export function hasRole(roles: string[], targetRole: UserRole): boolean {
  return roles.some(r => r.toUpperCase() === targetRole);
}

export function hasAnyRole(roles: string[], targetRoles: UserRole[]): boolean {
  return targetRoles.some(role => hasRole(roles, role));
}

export function hasMinimumRole(roles: string[], minimumRole: UserRole): boolean {
  const primaryRole = getPrimaryRole(roles);
  return ROLE_PRIORITY[primaryRole] >= ROLE_PRIORITY[minimumRole];
}

export const ROLE_ROUTES: Record<UserRole, string> = {
  CUSTOMER: '/customer',
  WAITER: '/waiter',
  RECEPTIONIST: '/receptionist',
  KITCHEN: '/kitchen',
  MANAGER: '/manager',
  ADMIN: '/admin',
};

export function getDefaultRoute(roles: string[]): string {
  const primaryRole = getPrimaryRole(roles);
  return ROLE_ROUTES[primaryRole];
}
