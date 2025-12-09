"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectContextValue {
  value: string;
  onChange: (value: string, label: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SelectContext = React.createContext<SelectContextValue | undefined>(
  undefined
);

const useSelectContext = () => {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error("Select components must be used within Select");
  }
  return context;
};

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  children: React.ReactNode;
  name?: string;
}

const Select = ({
  value: controlledValue,
  onValueChange,
  defaultValue = "",
  children,
  name,
}: SelectProps) => {
  const [uncontrolledValue, setUncontrolledValue] =
    React.useState(defaultValue);
  const [selectedLabel, setSelectedLabel] = React.useState("");
  const [open, setOpen] = React.useState(false);

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  // Extract label from children when value changes
  React.useEffect(() => {
    if (!value) {
      setSelectedLabel("");
      return;
    }

    // Find the SelectItem child that matches the current value
    const findLabel = (children: React.ReactNode): string | null => {
      let label: string | null = null;

      React.Children.forEach(children, (child) => {
        if (label) return; // Already found

        if (React.isValidElement(child)) {
          const props = child.props as { value?: string; children?: React.ReactNode; [key: string]: unknown };
          // Check if this is a SelectItem with matching value
          if (props.value === value) {
            label = typeof props.children === "string" ? props.children : value;
          }
          // Recursively search in nested children (like SelectContent)
          if (props.children) {
            const nestedLabel = findLabel(props.children);
            if (nestedLabel) label = nestedLabel;
          }
        }
      });

      return label;
    };

    const foundLabel = findLabel(children);
    if (foundLabel) {
      setSelectedLabel(foundLabel);
    }
  }, [value, children]);

  const onChange = React.useCallback(
    (newValue: string, newLabel: string) => {
      setSelectedLabel(newLabel);
      if (!isControlled) {
        setUncontrolledValue(newValue);
      }
      onValueChange?.(newValue);
      setOpen(false);
    },
    [isControlled, onValueChange]
  );

  const onOpenChange = React.useCallback((newOpen: boolean) => {
    setOpen(newOpen);
  }, []);

  return (
    <SelectContext.Provider value={{ value, onChange, open, onOpenChange }}>
      <SelectValueContext.Provider value={{ selectedLabel, setSelectedLabel }}>
        <div className="relative">
          {name && <input type="hidden" name={name} value={value} />}
          {children}
        </div>
      </SelectValueContext.Provider>
    </SelectContext.Provider>
  );
};

const SelectGroup = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
);

interface SelectValueContextValue {
  selectedLabel: string;
  setSelectedLabel: (label: string) => void;
}

const SelectValueContext = React.createContext<
  SelectValueContextValue | undefined
>(undefined);

const SelectValue = ({
  placeholder,
  className,
  children,
}: {
  placeholder?: string;
  className?: string;
  children?: React.ReactNode;
}) => {
  const valueContext = React.useContext(SelectValueContext);

  if (children) {
    return <span className={className}>{children}</span>;
  }

  if (valueContext) {
    const hasValue = !!valueContext.selectedLabel;
    return (
      <span className={hasValue ? className : "text-[#A4A4A4]"}>
        {valueContext.selectedLabel || placeholder}
      </span>
    );
  }

  return <span className="text-[#A4A4A4]">{placeholder}</span>;
};
SelectValue.displayName = "SelectValue";

interface SelectTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { open, onOpenChange } = useSelectContext();

    return (
      <button
        ref={ref}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls="select-content"
        aria-haspopup="listbox"
        className={cn(
          "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
          className
        )}
        onClick={() => onOpenChange(!open)}
        {...props}>
        {children}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
    );
  }
);
SelectTrigger.displayName = "SelectTrigger";

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
  position?: "popper" | "item-aligned";
  style?: React.CSSProperties;
}

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, children, position = "popper", style }, _ref) => {
    const { open, onOpenChange } = useSelectContext();
    const contentRef = React.useRef<HTMLDivElement>(null);

    // FIX: Use useLayoutEffect instead of useEffect and add proper cleanup
    React.useEffect(() => {
      if (!open) return;

      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;
        if (contentRef.current && !contentRef.current.contains(target)) {
          // Use setTimeout to avoid state updates during render
          setTimeout(() => onOpenChange(false), 0);
        }
      };

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setTimeout(() => onOpenChange(false), 0);
        }
      };

      // Add slight delay before attaching listeners
      const timeoutId = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);
      }, 0);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
      };
    }, [open, onOpenChange]);

    if (!open) return null;

    return (
      <div
        ref={contentRef}
        id="select-content"
        role="listbox"
        className={cn(
          "scrollbar-thin absolute z-50 mt-1 max-h-96 min-w-[8rem] overflow-y-auto rounded-md border bg-white text-gray-900 shadow-md animate-in fade-in-80",
          position === "popper" && "w-full",
          className
        )}
        style={style}>
        <div className="p-1">{children}</div>
      </div>
    );
  }
);
SelectContent.displayName = "SelectContent";

const SelectLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", className)}
    {...props}
  />
));
SelectLabel.displayName = "SelectLabel";

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children: React.ReactNode;
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, children, value, ...props }, ref) => {
    const { value: selectedValue, onChange } = useSelectContext();
    const valueContext = React.useContext(SelectValueContext);
    const isSelected = selectedValue === value;

    // Update label when component mounts or value changes
    React.useEffect(() => {
      if (isSelected && valueContext) {
        const text = typeof children === "string" ? children : value;
        valueContext.setSelectedLabel(text);
      }
    }, [isSelected, children, value, valueContext]);

    const handleClick = () => {
      const text = typeof children === "string" ? children : value;
      onChange(value, text);
    };

    return (
      <div
        ref={ref}
        role="option"
        aria-selected={isSelected}
        className={cn(
          "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          className
        )}
        onClick={handleClick}
        {...props}>
        <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
          {isSelected && <Check className="h-4 w-4" />}
        </span>
        {children}
      </div>
    );
  }
);
SelectItem.displayName = "SelectItem";

const SelectSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));
SelectSeparator.displayName = "SelectSeparator";

const SelectScrollUpButton = () => null;
const SelectScrollDownButton = () => null;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
