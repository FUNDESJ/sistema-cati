import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, fullWidth, className = '', id, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
        <label htmlFor={inputId} className="block text-[0.9375rem] font-semibold text-[#1a1a1a] mb-1.5">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-3.5 py-3 border rounded-md text-base leading-snug
            bg-white text-[#1a1a1a]
            placeholder-[#595959]
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
        />
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

Input.displayName = 'Input';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, fullWidth, className = '', id, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
        <label htmlFor={inputId} className="block text-[0.9375rem] font-semibold text-[#1a1a1a] mb-1.5">
          {label}
        </label>
        <textarea
          ref={ref}
          id={inputId}
          className={`
            w-full px-3.5 py-3 border rounded-md text-base leading-snug min-h-[96px] resize-y
            bg-white text-[#1a1a1a]
            placeholder-[#595959]
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
        />
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

Textarea.displayName = 'Textarea';