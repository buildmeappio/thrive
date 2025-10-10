"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  checkedColor?: string;
  checkIconColor?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      checkedColor = "#00A8FF",
      checkIconColor = "white",
      checked,
      onCheckedChange,
      disabled,
      ...props
    },
    ref
  ) => {
    const [internalChecked, setInternalChecked] = React.useState(
      checked || false
    );

    const isControlled = checked !== undefined;
    const isChecked = isControlled ? checked : internalChecked;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newChecked = e.target.checked;

      if (!isControlled) {
        setInternalChecked(newChecked);
      }

      onCheckedChange?.(newChecked);
    };

    const handleClick = () => {
      if (disabled) return;

      const newChecked = !isChecked;

      if (!isControlled) {
        setInternalChecked(newChecked);
      }

      onCheckedChange?.(newChecked);
    };

    return (
      <div className="relative inline-flex items-center">
        <input
          ref={ref}
          type="checkbox"
          checked={isChecked}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only peer"
          {...props}
        />
        <div
          onClick={handleClick}
          className={cn(
            "peer size-5 shrink-0 rounded-sm border shadow-xs transition-all outline-none cursor-pointer",
            "peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/50",
            "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
            "flex items-center justify-center",
            disabled && "cursor-not-allowed opacity-50",
            className
          )}
          style={{
            backgroundColor: isChecked ? checkedColor : "transparent",
            borderColor: isChecked ? checkedColor : "#d1d5db",
          }}>
          {isChecked && (
            <Check
              className="size-3.5"
              style={{ color: checkIconColor }}
              strokeWidth={3}
            />
          )}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
