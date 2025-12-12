import React from "react";
import { Construction } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComingSoonProps {
  title?: string;
  description?: string;
  className?: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({
  title = "Coming Soon",
  description = "We're working hard to bring you this feature. Check back soon!",
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-[400px] w-full",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-6 max-w-md text-center px-4">
        {/* Icon */}
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-muted border-2 border-border">
          <Construction className="w-10 h-10 text-muted-foreground" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h2 className="text-[28px] whitespace-nowrap font-semibold text-gray-900 md:text-[34px]">
            {title}
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
