import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "./input";
import { cn } from "~/lib/utils";

export function PasswordInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  const [show, setShow] = React.useState(false);

  return (
    <div className="relative w-full mt-1">
      <Input
        type={show ? "text" : "password"}
        className={cn("pr-10", className)}
        placeholder="Enter your password"
        {...props}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute top-1/2 right-3 -translate-y-1/2 focus:outline-none"
      >
        {show ? (
          <EyeOff size={20} color="#9EA9AA" />
        ) : (
          <Eye size={20} color="#9EA9AA" />
        )}
      </button>
    </div>
  );
}
