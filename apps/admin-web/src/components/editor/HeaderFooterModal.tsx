'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import HeaderFooterEditor from './HeaderFooterEditor';
import type { HeaderConfig, FooterConfig, HeaderFrequency, FooterFrequency } from './types';

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (config: HeaderConfig | FooterConfig) => void;
  type: 'header' | 'footer';
  initialConfig?: HeaderConfig | FooterConfig;
};

export default function HeaderFooterModal({ open, onClose, onSave, type, initialConfig }: Props) {
  const [content, setContent] = useState('');
  const [heightString, setHeightString] = useState('40');
  const [frequency, setFrequency] = useState<HeaderFrequency | FooterFrequency>('all');

  const height = useMemo(() => {
    return parseInt(heightString) || 40;
  }, [heightString]);

  // Initialize form when modal opens or initialConfig changes
  useEffect(() => {
    if (open) {
      if (initialConfig) {
        setContent(initialConfig.content);
        setHeightString(initialConfig.height.toString());
        setFrequency(initialConfig.frequency);
      } else {
        setContent('');
        setHeightString('40');
        setFrequency('all');
      }
    }
  }, [open, initialConfig]);

  const handleSave = () => {
    const config: HeaderConfig | FooterConfig = {
      content,
      height: Math.max(20, Math.min(200, height)), // Clamp between 20-200px
      frequency: frequency as HeaderFrequency | FooterFrequency,
    };
    onSave(config);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const frequencyOptions = [
    { value: 'all', label: 'All Pages' },
    { value: 'even', label: 'Even Pages Only' },
    { value: 'odd', label: 'Odd Pages Only' },
    { value: 'first', label: 'First Page Only' },
  ];

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {initialConfig ? 'Edit' : 'Add'} {type === 'header' ? 'Header' : 'Footer'}
          </DialogTitle>
          <DialogDescription>
            Configure the {type === 'header' ? 'header' : 'footer'} content, height, and when it
            should appear. Use {'{page}'} for current page number and {'{total}'} for total pages.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Frequency Selection */}
          <div className="space-y-2">
            <Label htmlFor="frequency">Appearance</Label>
            <Select
              value={frequency}
              onValueChange={value => setFrequency(value as HeaderFrequency | FooterFrequency)}
            >
              <SelectTrigger id="frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {frequencyOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Choose when this {type === 'header' ? 'header' : 'footer'} should appear
            </p>
          </div>

          {/* Height Input */}
          <div className="space-y-2">
            <Label htmlFor="height">Height (px)</Label>
            <Input
              id="height"
              type="text"
              value={heightString}
              onChange={e => {
                if (e.target.value.trim() === '') {
                  setHeightString('');
                } else {
                  const numValue = parseInt(e.target.value);
                  if (!isNaN(numValue)) {
                    if (numValue < 0 || numValue > 200) {
                      return;
                    }
                    setHeightString(e.target.value);
                  } else {
                    setHeightString('');
                  }
                }
              }}
            />
            <p className="text-xs text-gray-500">Height in pixels (0-200px, default: 40px)</p>
          </div>

          {/* Content Editor */}
          <div className="space-y-2">
            <Label>Content</Label>
            <HeaderFooterEditor
              content={content}
              onChange={setContent}
              placeholder={`Enter ${type === 'header' ? 'header' : 'footer'} content...`}
            />
            <p className="text-xs text-gray-500">
              Use {'{page}'} for current page number and {'{total}'} for total pages
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save {type === 'header' ? 'Header' : 'Footer'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
