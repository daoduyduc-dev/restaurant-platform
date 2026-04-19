import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from './Button';

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface SelectGroup {
  label: string;
  options: SelectOption[];
}

interface SelectProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  options: (SelectOption | SelectGroup)[];
  value?: string | number;
  onChange?: (value: string | number) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
}

const isGroup = (option: SelectOption | SelectGroup): option is SelectGroup => {
  return 'options' in option;
};

export const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({
    options,
    value,
    onChange,
    placeholder = 'Select an option...',
    disabled = false,
    error,
    label,
    className,
    ...props
  }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const selectId = `select-${Math.random().toString(36).substring(7)}`;

    const flatOptions: SelectOption[] = [];
    options.forEach(option => {
      if (isGroup(option)) {
        flatOptions.push(...option.options);
      } else {
        flatOptions.push(option);
      }
    });

    const selectedOption = flatOptions.find(opt => opt.value === value);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;

      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (isOpen) {
            onChange?.(flatOptions[highlightedIndex].value);
            setIsOpen(false);
          } else {
            setIsOpen(true);
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else {
            setHighlightedIndex(prev => (prev + 1) % flatOptions.length);
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (isOpen) {
            setHighlightedIndex(prev => (prev - 1 + flatOptions.length) % flatOptions.length);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          break;
      }
    };

    const handleSelectOption = (optionValue: string | number) => {
      onChange?.(optionValue);
      setIsOpen(false);
    };

    return (
      <div
        ref={containerRef}
        className={cn('select-wrapper', className)}
        {...props}
      >
        {label && (
          <label htmlFor={selectId} className="input-label">
            {label}
          </label>
        )}
        <button
          id={selectId}
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={cn(
            'select-trigger',
            isOpen && 'select-open',
            error && 'select-error'
          )}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-invalid={!!error}
        >
          <span className="select-value">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            size={18}
            className="select-chevron"
            style={{
              transition: 'transform var(--dur-fast) var(--ease-out)',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
            }}
          />
        </button>

        {isOpen && (
          <div className="select-content">
            <div className="select-viewport" role="listbox">
              {options.map((option, groupIndex) => {
                if (isGroup(option)) {
                  return (
                    <div key={`group-${groupIndex}`} className="select-group">
                      <div className="select-group-label">{option.label}</div>
                      <div className="select-group-items">
                        {option.options.map((opt, optIndex) => {
                          const flatIndex = flatOptions.indexOf(opt);
                          return (
                            <button
                              key={`${groupIndex}-${optIndex}`}
                              type="button"
                              className={cn(
                                'select-item',
                                flatIndex === highlightedIndex && 'select-item-highlighted',
                                opt.value === value && 'select-item-selected'
                              )}
                              onClick={() => handleSelectOption(opt.value)}
                              onMouseEnter={() => setHighlightedIndex(flatIndex)}
                              role="option"
                              aria-selected={opt.value === value}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                const flatIndex = flatOptions.indexOf(option);
                return (
                  <button
                    key={`option-${flatIndex}`}
                    type="button"
                    className={cn(
                      'select-item',
                      flatIndex === highlightedIndex && 'select-item-highlighted',
                      option.value === value && 'select-item-selected'
                    )}
                    onClick={() => handleSelectOption(option.value)}
                    onMouseEnter={() => setHighlightedIndex(flatIndex)}
                    role="option"
                    aria-selected={option.value === value}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {error && (
          <span className="input-message error">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
