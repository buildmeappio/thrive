'use client';

import { MoreVertical, Pencil, Archive } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface TableAction {
  label: string;
  icon?: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  disabled?: boolean;
  variant?: 'default' | 'destructive';
}

interface TableActionsDropdownProps {
  actions: TableAction[];
  className?: string;
  align?: 'start' | 'end' | 'center';
}

export default function TableActionsDropdown({
  actions,
  className,
  align = 'end',
}: TableActionsDropdownProps) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex items-center justify-end', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            onClick={e => e.stopPropagation()}
            className="cursor-pointer rounded-full p-2 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#00A8FF]/20 focus:ring-offset-1"
            aria-label="Actions menu"
          >
            <MoreVertical className="h-4 w-4 text-[#7B8B91]" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align={align}
          className="min-w-[160px] rounded-lg border border-gray-200 bg-white p-1.5 shadow-lg sm:p-2"
        >
          {actions.map((action, index) => (
            <DropdownMenuItem
              key={index}
              onClick={e => {
                e.stopPropagation();
                if (!action.disabled) {
                  action.onClick(e);
                }
              }}
              disabled={action.disabled}
              className={cn(
                'font-poppins flex w-full cursor-pointer items-center gap-2 rounded-sm px-3 py-1.5 text-left text-xs transition-colors sm:px-4 sm:py-2 sm:text-sm',
                'hover:bg-gray-50 focus:bg-gray-50',
                'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
                action.variant === 'destructive'
                  ? 'text-red-600 hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700'
                  : 'text-[#4D4D4D] hover:text-[#000000]'
              )}
            >
              {action.icon || <Pencil className="h-4 w-4 flex-shrink-0" />}
              <span>{action.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
