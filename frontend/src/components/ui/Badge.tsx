import React from 'react';
import { cn } from './Button';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'small' | 'medium';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const variantClasses = {
  success: 'badge-success',
  warning: 'badge-warning',
  error: 'badge-error',
  info: 'badge-info',
  neutral: 'badge-neutral'
};

const sizeClasses = {
  small: 'badge-sm',
  medium: 'badge-md'
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'medium',
  icon,
  children,
  className,
  ...props
}) => {
  return (
    <span
      className={cn(
        'badge',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {icon && <span className="badge-icon">{icon}</span>}
      <span className="badge-text">{children}</span>
    </span>
  );
};
