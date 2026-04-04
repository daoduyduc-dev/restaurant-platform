import React from 'react';
import { cn } from './Button';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  success?: boolean;
  helperText?: string;
  showCharCount?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({
    className,
    label,
    error,
    success,
    helperText,
    id,
    maxLength,
    value,
    showCharCount = false,
    ...props
  }, ref) => {
    const textareaId = id || Math.random().toString(36).substring(7);
    const charCount = typeof value === 'string' ? value.length : 0;

    return (
      <div className="textarea-wrapper">
        {label && (
          <label htmlFor={textareaId} className="input-label">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={cn(
            'textarea-field',
            error && 'textarea-error',
            success && 'textarea-success',
            className
          )}
          maxLength={maxLength}
          value={value}
          aria-invalid={!!error}
          aria-describedby={
            error || helperText || showCharCount ? `${textareaId}-message` : undefined
          }
          {...props}
        />
        <div
          className="textarea-footer"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 'var(--sp-2)'
          }}
        >
          {(error || helperText) && (
            <span id={`${textareaId}-message`} className={cn('input-message', error && 'error')}>
              {error || helperText}
            </span>
          )}
          {showCharCount && maxLength && (
            <span
              className="textarea-char-count"
              style={{
                fontSize: 'var(--text-sm)',
                color: charCount > maxLength * 0.9 ? 'var(--rose)' : 'var(--text-muted)',
                marginLeft: 'auto'
              }}
            >
              {charCount}/{maxLength}
            </span>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
