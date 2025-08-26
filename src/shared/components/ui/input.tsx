import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface InputProps extends React.ComponentProps<'input'> {
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
}

function Input({ className, type, icon: Icon, iconPosition = 'left', ...props }: InputProps) {
  return (
    <div className="relative">
      {Icon && iconPosition === 'left' && (
        <Icon
          className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#A4A4A4]"
          strokeWidth={2}
        />
      )}
      <input
        type={type}
        data-slot="input"
        className={cn(
          "mt-2 flex h-[55px] w-full items-center rounded-[10px] border-none bg-[#F2F5F6] px-3 text-sm text-[#333]",
          "placeholder:text-[14px] placeholder:leading-none placeholder:font-normal placeholder:text-[#9EA9AA]",
          "focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30 focus-visible:ring-offset-0 focus-visible:outline-none",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          Icon && iconPosition === "left" && "pl-11",
          Icon && iconPosition === "right" && "pr-11",
          className
        )}
        {...props}
      />
      {Icon && iconPosition === 'right' && (
        <Icon
          className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#A4A4A4]"
          strokeWidth={2}
        />
      )}
    </div>
  );
}

export { Input };
