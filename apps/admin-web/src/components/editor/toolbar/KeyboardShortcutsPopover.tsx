import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
          <h4 className="font-semibold text-sm text-gray-900 font-poppins">
            Keyboard Shortcuts
          </h4>
          <div className="space-y-2 text-xs text-gray-700 font-poppins">
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-[10px] font-mono">
                Shift
              </kbd>
              <span>+</span>
              <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-[10px] font-mono">
                Enter
              </kbd>
              <span className="ml-2">
                Add a new line within the same paragraph
              </span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-[10px] font-mono">
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
