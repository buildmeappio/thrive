import { Palette, Highlighter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TEXT_COLORS, HIGHLIGHT_COLORS } from '../constants';
import type { Editor } from '@tiptap/react';

interface ColorPickerProps {
  editor: Editor;
}

export function ColorPicker({ editor }: ColorPickerProps) {
  return (
    <>
      {/* Text Color */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            title="Text Color"
          >
            <Palette className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2">
          <div className="grid grid-cols-4 gap-1">
            {TEXT_COLORS.map(c => (
              <button
                key={c.color}
                onClick={() =>
                  c.color === 'inherit'
                    ? editor.chain().focus().unsetColor().run()
                    : editor.chain().focus().setColor(c.color).run()
                }
                className="h-6 w-6 cursor-pointer rounded border border-gray-300 transition-transform hover:scale-110"
                style={{
                  backgroundColor: c.color === 'inherit' ? 'white' : c.color,
                }}
                title={c.name}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Highlight Color */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            title="Highlight Color"
          >
            <Highlighter className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2">
          <div className="grid grid-cols-4 gap-1">
            {HIGHLIGHT_COLORS.map(c => (
              <button
                key={c.color || 'none'}
                onClick={() =>
                  c.color === ''
                    ? editor.chain().focus().unsetHighlight().run()
                    : editor.chain().focus().toggleHighlight({ color: c.color }).run()
                }
                className="h-6 w-6 cursor-pointer rounded border border-gray-300 transition-transform hover:scale-110"
                style={{ backgroundColor: c.color || 'white' }}
                title={c.name}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
