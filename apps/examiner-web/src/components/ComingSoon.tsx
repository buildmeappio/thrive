import React from 'react';
import { Construction } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComingSoonProps {
  title?: string;
  description?: string;
  className?: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({
  title = 'Coming Soon',
  description = "We're working hard to bring you this feature. Check back soon!",
  className,
}) => {
  return (
    <div
      className={cn('flex min-h-[400px] w-full flex-col items-center justify-center', className)}
    >
      <div className="flex max-w-md flex-col items-center gap-6 px-4 text-center">
        {/* Icon */}
        <div className="bg-muted border-border flex h-20 w-20 items-center justify-center rounded-full border-2">
          <Construction className="text-muted-foreground h-10 w-10" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h2 className="whitespace-nowrap text-[28px] font-semibold text-gray-900 md:text-[34px]">
            {title}
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
