import React from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { cn } from './Button';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  helperText?: string;
  icon?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, success, helperText, id, icon, clearable, onClear, type, ...props }, ref) => {
    const inputId = id || Math.random().toString(36).substring(7);
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === 'password';
    const displayType = isPassword && showPassword ? 'text' : type;

    const handleClear = () => {
      onClear?.();
    };

    return (
      <div className="input-wrapper">
        {label && (
          <label htmlFor={inputId} className="input-label">
            {label}
          </label>
        )}
        <div className="input-container" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {icon && (
            <div className="input-icon" style={{
              position: 'absolute',
              left: '12px',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--text-muted)',
              pointerEvents: 'none'
            }}>
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            type={displayType}
            className={cn(
              'input-field',
              error && 'input-error',
              success && 'input-success',
              className
            )}
            style={{
              paddingLeft: icon ? '40px' : '14px',
              paddingRight: (isPassword || clearable) ? '40px' : '14px'
            }}
            aria-invalid={!!error}
            aria-describedby={error || helperText ? `${inputId}-message` : undefined}
            {...props}
          />
          <div style={{
            position: 'absolute',
            right: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="input-action-btn"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  color: 'var(--text-muted)'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            )}
            {clearable && props.value && (
              <button
                type="button"
                onClick={handleClear}
                className="input-action-btn"
                aria-label="Clear input"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  color: 'var(--text-muted)'
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
        {(error || helperText) && (
          <span id={`${inputId}-message`} className={cn('input-message', error && 'error')}>
            {error || helperText}
          </span>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
