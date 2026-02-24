import {
  ChevronDown,
  Table as TableIcon,
  ImageIcon,
  Minus,
  FileBoxIcon,
  Square,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Editor } from '@tiptap/react';

interface InsertMenuProps {
  editor: Editor;
  onAddImage: () => void;
  onAddTickBox: () => void;
}

export function InsertMenu({ editor, onAddImage, onAddTickBox }: InsertMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-xs">
          Insert
          <ChevronDown className="ml-1 h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={() =>
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
          }
        >
          <TableIcon className="mr-2 h-4 w-4" />
          Table
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onAddImage}>
          <ImageIcon className="mr-2 h-4 w-4" />
          Image
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus className="mr-2 h-4 w-4" />
          Horizontal Line
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => editor.chain().focus().setPageBreak().run()}>
          <FileBoxIcon className="mr-2 h-4 w-4" />
          Page Break
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onAddTickBox}>
          <Square className="mr-2 h-4 w-4" />
          Tick Box
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
