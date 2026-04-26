export type UserRole = 'CUSTOMER' | 'STAFF' | 'ADMIN';

export const ROLE_PRIORITY: Record<UserRole, number> = {
  CUSTOMER: 1,
  STAFF: 2,
  ADMIN: 3,
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
  CUSTOMER: '/',
  STAFF: '/',
  ADMIN: '/',
};

export function getDefaultRoute(roles: string[]): string {
  return '/';
}
