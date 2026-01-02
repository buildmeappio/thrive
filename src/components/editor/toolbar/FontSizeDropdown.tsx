import { ChevronDown, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { FONT_SIZES } from "../constants";
import type { Editor } from "@tiptap/react";

interface FontSizeDropdownProps {
  editor: Editor;
}

export function FontSizeDropdown({ editor }: FontSizeDropdownProps) {
  const getCurrentFontSize = () => {
    const fontSize = editor.getAttributes("textStyle").fontSize;
    if (fontSize) {
      const sizeOption = FONT_SIZES.find((s) => s.value === fontSize);
      return sizeOption ? sizeOption.label : fontSize;
    }
    return "Size";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs"
          title="Font Size"
        >
          <Type className="h-4 w-4 mr-1" />
          <span className="max-w-[60px] truncate">{getCurrentFontSize()}</span>
          <ChevronDown className="ml-1 h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-[120px] max-h-[300px] overflow-y-auto">
        <DropdownMenuItem
          onClick={() => {
            if (editor.commands.unsetFontSize) {
              editor.chain().focus().unsetFontSize().run();
            } else {
              // Fallback: unset fontSize directly via textStyle mark
              editor
                .chain()
                .focus()
                .setMark("textStyle", { fontSize: null })
                .removeEmptyTextStyle()
                .run();
            }
          }}
          className={
            !editor.getAttributes("textStyle").fontSize ? "bg-gray-100" : ""
          }
        >
          <span className="text-sm">Default</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {FONT_SIZES.map((size) => (
          <DropdownMenuItem
            key={size.value}
            onClick={() => {
              if (editor.commands.setFontSize) {
                editor.chain().focus().setFontSize(size.value).run();
              } else {
                // Fallback: set fontSize directly via textStyle mark
                editor
                  .chain()
                  .focus()
                  .setMark("textStyle", { fontSize: size.value })
                  .run();
              }
            }}
            className={
              editor.getAttributes("textStyle").fontSize === size.value
                ? "bg-gray-100"
                : ""
            }
          >
            <span className="text-sm" style={{ fontSize: size.value }}>
              {size.label}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
