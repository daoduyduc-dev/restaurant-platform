import React from 'react';
import { Check } from 'lucide-react';
import { cn } from './Button';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, id, ...props }, ref) => {
    const checkboxId = id || Math.random().toString(36).substring(7);

    return (
      <div className="checkbox-wrapper">
        <div className="checkbox-container">
          <input
            id={checkboxId}
            ref={ref}
            type="checkbox"
            className={cn('checkbox-input', className)}
            aria-describedby={description ? `${checkboxId}-description` : undefined}
            {...props}
          />
          <label htmlFor={checkboxId} className="checkbox-label">
            <div className="checkbox-box">
              {(props.checked) && <Check size={16} strokeWidth={3} />}
            </div>
            {label && <span className="checkbox-text">{label}</span>}
          </label>
        </div>
        {description && (
          <p id={`${checkboxId}-description`} className="checkbox-description">
            {description}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
