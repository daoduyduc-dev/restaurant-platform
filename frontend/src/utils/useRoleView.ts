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
    color: 'var(--rose)',
    bgColor: 'rgba(225, 29, 72, 0.1)',
    canCreate: true, canEdit: true, canDelete: true, canAssign: true, canConfigure: true,
    isOperational: false, isMonitoring: false, isAdministrative: true, isCustomer: false,
  },
  MANAGER: {
    label: 'Manager',
    color: 'var(--orange-500)',
    bgColor: 'rgba(212, 175, 55, 0.1)',
    canCreate: true, canEdit: true, canDelete: false, canAssign: true, canConfigure: true,
    isOperational: false, isMonitoring: true, isAdministrative: false, isCustomer: false,
  },
  RECEPTIONIST: {
    label: 'Receptionist',
    color: 'var(--teal)',
    bgColor: 'rgba(13, 148, 136, 0.1)',
    canCreate: true, canEdit: true, canDelete: false, canAssign: false, canConfigure: false,
    isOperational: true, isMonitoring: false, isAdministrative: false, isCustomer: false,
  },
  KITCHEN: {
    label: 'Kitchen',
    color: '#8B5CF6',
    bgColor: 'rgba(139, 92, 246, 0.1)',
    canCreate: false, canEdit: true, canDelete: false, canAssign: false, canConfigure: false,
    isOperational: true, isMonitoring: false, isAdministrative: false, isCustomer: false,
  },
  WAITER: {
    label: 'Waiter',
    color: '#3B82F6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
    canCreate: true, canEdit: true, canDelete: false, canAssign: false, canConfigure: false,
    isOperational: true, isMonitoring: false, isAdministrative: false, isCustomer: false,
  },
  CUSTOMER: {
    label: 'Customer',
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
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
  return ROLE_CONFIGS[upper]?.bgColor || 'rgba(107, 114, 128, 0.1)';
}
