import React from 'react';
import { clsx, type ClassValue } from 'clsx';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
}

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'medium', isLoading, children, disabled, ...props }, ref) => {
    const sizeMap = {
      small: 'btn-sm',
      medium: 'btn-md',
      large: 'btn-lg'
    };

    return (
      <button
        ref={ref}
        className={cn(
          'btn',
          `btn-${variant}`,
          sizeMap[size],
          className
        )}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading && <span className="spinner" style={{ width: '1rem', height: '1rem', borderWidth: '2px' }} />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
