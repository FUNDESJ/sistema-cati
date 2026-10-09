import { forwardRef, type SelectHTMLAttributes } from 'react';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  fullWidth?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, placeholder, fullWidth, className = '', id, ...props }, ref) => {
    const selectId = id || label.toLowerCase().replace(/\s+/g, '-');
    const errorId = `${selectId}-error`;
    const helperId = `${selectId}-helper`;

    return (
      <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
        <label htmlFor={selectId} className="block text-[0.9375rem] font-semibold text-[#1a1a1a] mb-1.5">
          {label}
        </label>
        <select
          ref={ref}
          id={selectId}
          className={`
            w-full px-3.5 py-3 border rounded-md text-base leading-snug
            bg-white text-[#1a1a1a]
            transition-colors
            disabled:bg-[#f4f4f4] disabled:text-[#595959] disabled:cursor-not-allowed
            ${error
              ? 'border-[#a61b1b] focus:outline-none focus:border-[#a61b1b] focus:shadow-[0_0_0_3px_rgb(166_27_27/0.15)]'
              : 'border-[#b8b8b8] hover:border-[#595959] focus:outline-none focus:border-[#7b1113] focus:shadow-[0_0_0_3px_rgb(123_17_19/0.15)]'
            }
          `}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p id={errorId} className="mt-1.5 text-sm font-medium text-[#a61b1b]" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="mt-1.5 text-sm text-[#595959]">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = 'Select';