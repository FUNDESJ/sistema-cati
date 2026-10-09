import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactElement;
}

const variantClasses: Record<string, string> = {
  primary: 'bg-[#7b1113] text-white hover:bg-[#5c0d0f] active:bg-[#450a0c]',
  secondary: 'bg-white text-[#7b1113] border border-[#7b1113] hover:bg-[#fdf0f0]',
  danger: 'bg-[#a61b1b] text-white hover:bg-[#8a1616]',
  ghost: 'text-[#3d3d3d] hover:bg-[#f4f4f4] hover:text-[#1a1a1a]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading,
      fullWidth,
      disabled,
      children,
      className = '',
      leftIcon,
      ...props
    },
    ref,
  ) => {
    const sizeClasses = {
      sm: 'min-h-[36px] px-3 py-1.5 text-sm gap-1.5',
      md: 'min-h-[44px] px-5 py-2.5 text-[0.9375rem] gap-2',
      lg: 'min-h-[48px] px-6 py-3 text-base gap-2.5',
    };

    return (
      <button
        ref={ref}
        className={`
          inline-flex items-center justify-center font-semibold rounded-md
          transition-colors
          disabled:opacity-55 disabled:cursor-not-allowed
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {leftIcon && !loading && leftIcon}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';