"use client";
import React, { useState, useRef, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui";
import { cn } from "@/lib/utils";

interface MaskedInputProps extends Omit<React.ComponentProps<"input">, "type"> {
  maskChar?: string;
  showToggle?: boolean;
}

export function MaskedInput({
  className,
  value,
  onChange,
  maskChar = "•",
  showToggle = true,
  ...props
}: MaskedInputProps) {
  const [show, setShow] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasValue = typeof value === "string" && value.length > 0;
  const displayValue =
    show || !hasValue ? value : maskChar.repeat(value?.toString().length || 0);

  // Restore cursor position after masking/unmasking
  useEffect(() => {
    if (cursorPosition !== null && inputRef.current) {
      inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
    }
  }, [displayValue, cursorPosition]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (show) {
      // If showing, pass through the change directly
      onChange?.(e);
    } else {
      // If masked, we need to handle the change carefully
      // The user is typing, so we need to extract the actual value
      const newValue = e.target.value;
      // Remove mask characters and get the actual input
      const actualValue = newValue.replace(new RegExp(maskChar, "g"), "");

      // Create a synthetic event with the actual value
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          value: actualValue,
        },
      };

      setCursorPosition(e.target.selectionStart);
      onChange?.(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
    }
  };

  return (
    <div className="relative w-full">
      <Input
        ref={inputRef}
        type="text"
        className={cn(showToggle && hasValue && "pr-10", className)}
        value={displayValue}
        onChange={handleChange}
        {...props}
      />
      {hasValue && showToggle && (
        <button
          type="button"
          onClick={() => {
            setShow((prev) => !prev);
            // Keep focus on input after toggle
            setTimeout(() => {
              if (inputRef.current) {
                inputRef.current.focus();
                // Move cursor to end
                const len = inputRef.current.value.length;
                inputRef.current.setSelectionRange(len, len);
              }
            }, 0);
          }}
          className="absolute top-1/2 right-3 -translate-y-1/2 focus:outline-none cursor-pointer"
          tabIndex={-1}
        >
          {show ? (
            <EyeOff size={20} color="#9EA9AA" />
          ) : (
            <Eye size={20} color="#9EA9AA" />
          )}
        </button>
      )}
    </div>
  );
}
