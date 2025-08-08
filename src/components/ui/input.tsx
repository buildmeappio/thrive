import * as React from "react";
import { cn } from "~/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-[52.9px] w-full rounded-[7.56px] border-none bg-[#F2F5F6] px-3",
        "placeholder:text-[11.34px] placeholder:leading-[100%] placeholder:font-normal placeholder:tracking-[0.5%] placeholder:text-[#9EA9AA]",
        "focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30 focus-visible:ring-offset-0 focus-visible:outline-none",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
