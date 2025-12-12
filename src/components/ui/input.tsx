import * as React from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import {
  InputValidationType,
  handleKeyPress,
  handleInputChange,
  sanitizeOnBlur,
  filterInputValue,
} from "@/utils/inputValidation";

interface InputProps extends React.ComponentProps<"input"> {
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  error?: boolean;
  validationType?: InputValidationType;
}

function Input({
  className,
  type,
  icon: Icon,
  iconPosition = "left",
  error,
  validationType = "none",
  onChange,
  onKeyPress,
  onBlur,
  ...props
}: InputProps) {
  const handleKeyPressEvent = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      handleKeyPress(e, validationType);
      onKeyPress?.(e);
    },
    [validationType, onKeyPress],
  );

  const handleChangeEvent = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (
        validationType !== "none" &&
        validationType !== "email" &&
        validationType !== "phone"
      ) {
        const filteredValue = handleInputChange(e, validationType);
        const syntheticEvent = {
          ...e,
          target: {
            ...e.target,
            value: filteredValue,
          },
        };
        onChange?.(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
      } else {
        onChange?.(e);
      }
    },
    [validationType, onChange],
  );

  const handleBlurEvent = React.useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      if (validationType === "text") {
        const sanitizedValue = sanitizeOnBlur(e.target.value, validationType);
        if (sanitizedValue !== e.target.value) {
          e.target.value = sanitizedValue;
          // Trigger onChange with sanitized value
          const syntheticEvent = {
            ...e,
            target: {
              ...e.target,
              value: sanitizedValue,
            },
          };
          onChange?.(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
        }
      }
      onBlur?.(e);
    },
    [validationType, onChange, onBlur],
  );

  const handlePasteEvent = React.useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      // Get pasted text
      const pastedText = e.clipboardData.getData("text");

      // If validation is enabled, filter the pasted text
      if (
        validationType !== "none" &&
        validationType !== "email" &&
        validationType !== "phone"
      ) {
        const filteredValue = filterInputValue(pastedText, validationType);

        // If the filtered value is different, prevent default and set the filtered value
        if (filteredValue !== pastedText) {
          e.preventDefault();
          const input = e.currentTarget;
          const start = input.selectionStart || 0;
          const end = input.selectionEnd || 0;
          const currentValue = input.value || "";
          const newValue =
            currentValue.slice(0, start) +
            filteredValue +
            currentValue.slice(end);

          // Update input value
          input.value = newValue;

          // Set cursor position
          const newCursorPos = start + filteredValue.length;
          setTimeout(() => {
            input.setSelectionRange(newCursorPos, newCursorPos);
          }, 0);

          // Trigger onChange with filtered value
          // Use the input element directly and create a minimal event object
          const syntheticEvent = {
            target: input,
            currentTarget: input,
          } as React.ChangeEvent<HTMLInputElement>;
          // The input.value is already updated above, so this will work
          onChange?.(syntheticEvent);
        } else {
          // Even if no filtering needed, ensure onChange fires after paste completes
          // This helps with form validation timing
          setTimeout(() => {
            const input = e.currentTarget;
            const syntheticEvent = {
              target: input,
              currentTarget: input,
            } as React.ChangeEvent<HTMLInputElement>;
            onChange?.(syntheticEvent);
          }, 0);
        }
      }
    },
    [validationType, onChange],
  );

  return (
    <div className="relative">
      {Icon && iconPosition === "left" && (
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
          error && "ring-2 ring-red-500/30",
          className,
        )}
        onChange={handleChangeEvent}
        onKeyPress={handleKeyPressEvent}
        onBlur={handleBlurEvent}
        onPaste={handlePasteEvent}
        {...props}
      />
      {Icon && iconPosition === "right" && (
        <Icon
          className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#A4A4A4]"
          strokeWidth={2}
        />
      )}
    </div>
  );
}

export { Input };
