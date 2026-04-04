import React from 'react';
import { cn } from './Button';

export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, description, id, value, ...props }, ref) => {
    const radioId = id || Math.random().toString(36).substring(7);

    return (
      <div className="radio-wrapper">
        <div className="radio-container">
          <input
            id={radioId}
            ref={ref}
            type="radio"
            value={value}
            className={cn('radio-input', className)}
            aria-describedby={description ? `${radioId}-description` : undefined}
            {...props}
          />
          <label htmlFor={radioId} className="radio-label">
            <div className="radio-box" />
            {label && <span className="radio-text">{label}</span>}
          </label>
        </div>
        {description && (
          <p id={`${radioId}-description`} className="radio-description">
            {description}
          </p>
        )}
      </div>
    );
  }
);

Radio.displayName = 'Radio';
