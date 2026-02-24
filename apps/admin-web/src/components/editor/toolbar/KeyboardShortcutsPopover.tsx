import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export function KeyboardShortcutsPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs text-gray-600 hover:text-gray-900"
          title="Keyboard Shortcuts"
        >
          <span className="text-xs">💡 Tips</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-3">
          <h4 className="font-poppins text-sm font-semibold text-gray-900">Keyboard Shortcuts</h4>
          <div className="font-poppins space-y-2 text-xs text-gray-700">
            <div className="flex items-center gap-2">
              <kbd className="rounded border border-gray-300 bg-gray-100 px-2 py-1 font-mono text-[10px]">
                Shift
              </kbd>
              <span>+</span>
              <kbd className="rounded border border-gray-300 bg-gray-100 px-2 py-1 font-mono text-[10px]">
                Enter
              </kbd>
              <span className="ml-2">Add a new line within the same paragraph</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="rounded border border-gray-300 bg-gray-100 px-2 py-1 font-mono text-[10px]">
                Enter
              </kbd>
              <span className="ml-2">Start a new paragraph</span>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
