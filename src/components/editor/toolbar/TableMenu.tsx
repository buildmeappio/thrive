import {
  ChevronDown,
  Plus,
  Trash2,
  TableCellsMerge,
  TableCellsSplit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { Editor } from "@tiptap/react";

interface TableMenuProps {
  editor: Editor;
}

export function TableMenu({ editor }: TableMenuProps) {
  if (!editor.isActive("table")) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs"
        >
          Table
          <ChevronDown className="ml-1 h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={() => editor.chain().focus().addColumnBefore().run()}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Column Before
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => editor.chain().focus().addColumnAfter().run()}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Column After
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => editor.chain().focus().deleteColumn().run()}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Column
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => editor.chain().focus().addRowBefore().run()}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Row Before
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => editor.chain().focus().addRowAfter().run()}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Row After
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => editor.chain().focus().deleteRow().run()}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Row
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => editor.chain().focus().mergeCells().run()}
        >
          <TableCellsMerge className="mr-2 h-4 w-4" />
          Merge Cells
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => editor.chain().focus().splitCell().run()}
        >
          <TableCellsSplit className="mr-2 h-4 w-4" />
          Split Cell
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => editor.chain().focus().deleteTable().run()}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Table
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
