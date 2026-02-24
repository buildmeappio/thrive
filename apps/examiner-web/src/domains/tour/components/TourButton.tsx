'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

interface TourButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
}

export function TourButton({ onClick, label = 'Take Tour', className }: TourButtonProps) {
  return (
    <Button onClick={onClick} variant="outline" className={className} size="sm">
      {/* <Play className="w-4 h-4 mr-2" /> */}
      {label}
    </Button>
  );
}
