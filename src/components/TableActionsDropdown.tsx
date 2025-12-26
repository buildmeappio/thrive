"use client";

import { MoreVertical, Pencil, Archive } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface TableAction {
    label: string;
    icon?: React.ReactNode;
    onClick: (e: React.MouseEvent) => void;
    disabled?: boolean;
    variant?: "default" | "destructive";
}

interface TableActionsDropdownProps {
    actions: TableAction[];
    className?: string;
    align?: "start" | "end" | "center";
}

export default function TableActionsDropdown({
    actions,
    className,
    align = "end",
}: TableActionsDropdownProps) {
    if (actions.length === 0) {
        return null;
    }

    return (
        <div className={cn("flex items-center justify-end", className)}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#00A8FF]/20 focus:ring-offset-1"
                        aria-label="Actions menu"
                    >
                        <MoreVertical className="w-4 h-4 text-[#7B8B91]" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align={align}
                    className="min-w-[160px] bg-white border border-gray-200 rounded-lg shadow-lg p-1.5 sm:p-2"
                >
                    {actions.map((action, index) => (
                        <DropdownMenuItem
                            key={index}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!action.disabled) {
                                    action.onClick(e);
                                }
                            }}
                            disabled={action.disabled}
                            className={cn(
                                "cursor-pointer flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-poppins rounded-sm transition-colors w-full text-left",
                                "hover:bg-gray-50 focus:bg-gray-50",
                                "data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed",
                                action.variant === "destructive"
                                    ? "text-red-600 hover:text-red-700 hover:bg-red-50 focus:text-red-700 focus:bg-red-50"
                                    : "text-[#4D4D4D] hover:text-[#000000]",
                            )}
                        >
                            {action.icon || <Pencil className="w-4 h-4 flex-shrink-0" />}
                            <span>{action.label}</span>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

