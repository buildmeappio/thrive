import * as React from 'react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface InputProps extends React.ComponentProps<'input'> {
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon: Icon, iconPosition = 'left', ...props }, ref) => {
    return (
      <div className="relative mt-2">
        {Icon && iconPosition === 'left' && (
          <Icon
            className="pointer-events-none absolute left-3 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-[#A4A4A4]"
            strokeWidth={2}
          />
        )}
        <input
          ref={ref}
          type={type}
          data-slot="input"
          className={cn(
            'flex h-10 w-full items-center rounded-[10px] border-none bg-[#F2F5F6] px-3 text-sm text-[#333]',
            'placeholder:text-[14px] placeholder:font-normal placeholder:leading-none placeholder:text-[#9EA9AA]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30 focus-visible:ring-offset-0',
            'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
            Icon && iconPosition === 'left' && 'pl-11',
            Icon && iconPosition === 'right' && 'pr-11',
            className
          )}
          {...props}
        />
        {Icon && iconPosition === 'right' && (
          <Icon
            className="pointer-events-none absolute right-3 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-[#A4A4A4]"
            strokeWidth={2}
          />
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
