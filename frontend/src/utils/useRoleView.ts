import { useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
import { getPrimaryRole, type UserRole } from './roleUtils';

export interface RoleViewConfig {
  role: UserRole;
  label: string;
  color: string;
  bgColor: string;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canAssign: boolean;
  canConfigure: boolean;
  isOperational: boolean;   // Active work mode (WAITER, RECEPTIONIST, KITCHEN)
  isMonitoring: boolean;    // Observation mode (MANAGER)
  isAdministrative: boolean; // Config/audit mode (ADMIN)
  isCustomer: boolean;
}

const ROLE_CONFIGS: Record<UserRole, Omit<RoleViewConfig, 'role'>> = {
  ADMIN: {
    label: 'Administrator',
    color: 'var(--role-admin)',
    bgColor: 'var(--role-admin-bg)',
    canCreate: true, canEdit: true, canDelete: true, canAssign: true, canConfigure: true,
    isOperational: false, isMonitoring: false, isAdministrative: true, isCustomer: false,
  },
  MANAGER: {
    label: 'Manager',
    color: 'var(--role-manager)',
    bgColor: 'var(--role-manager-bg)',
    canCreate: true, canEdit: true, canDelete: false, canAssign: true, canConfigure: true,
    isOperational: false, isMonitoring: true, isAdministrative: false, isCustomer: false,
  },
  RECEPTIONIST: {
    label: 'Receptionist',
    color: 'var(--role-receptionist)',
    bgColor: 'var(--role-receptionist-bg)',
    canCreate: true, canEdit: true, canDelete: false, canAssign: false, canConfigure: false,
    isOperational: true, isMonitoring: false, isAdministrative: false, isCustomer: false,
  },
  KITCHEN: {
    label: 'Kitchen',
    color: 'var(--role-kitchen)',
    bgColor: 'var(--role-kitchen-bg)',
    canCreate: false, canEdit: true, canDelete: false, canAssign: false, canConfigure: false,
    isOperational: true, isMonitoring: false, isAdministrative: false, isCustomer: false,
  },
  WAITER: {
    label: 'Waiter',
    color: 'var(--role-waiter)',
    bgColor: 'var(--role-waiter-bg)',
    canCreate: true, canEdit: true, canDelete: false, canAssign: false, canConfigure: false,
    isOperational: true, isMonitoring: false, isAdministrative: false, isCustomer: false,
  },
  CUSTOMER: {
    label: 'Customer',
    color: 'var(--role-customer)',
    bgColor: 'var(--role-customer-bg)',
    canCreate: true, canEdit: false, canDelete: false, canAssign: false, canConfigure: false,
    isOperational: false, isMonitoring: false, isAdministrative: false, isCustomer: true,
  },
};

export function useRoleView(): RoleViewConfig {
  const user = useAuthStore(s => s.user);
  return useMemo(() => {
    const role = user?.roles ? getPrimaryRole(user.roles) : 'CUSTOMER';
    return { role, ...ROLE_CONFIGS[role] };
  }, [user?.roles]);
}

export function getRoleColor(role: string): string {
  const upper = role.toUpperCase() as UserRole;
  return ROLE_CONFIGS[upper]?.color || 'var(--gray-500)';
}

export function getRoleBgColor(role: string): string {
  const upper = role.toUpperCase() as UserRole;
  return ROLE_CONFIGS[upper]?.bgColor || 'hsl(215 20% 95%)';
}
