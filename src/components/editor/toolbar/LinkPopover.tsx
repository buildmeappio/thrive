import { Link2, Unlink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ToolbarButton } from "./ToolbarButton";
import type { Editor } from "@tiptap/react";
import type { useLinkHandlers } from "../hooks/useLinkHandlers";

interface LinkPopoverProps {
  editor: Editor;
  linkHandlers: ReturnType<typeof useLinkHandlers>;
}

export function LinkPopover({ editor, linkHandlers }: LinkPopoverProps) {
  const {
    linkUrl,
    setLinkUrl,
    showLinkInput,
    setShowLinkInput,
    setLink,
    applyLink,
    removeLink,
  } = linkHandlers;

  return (
    <>
      <Popover open={showLinkInput} onOpenChange={setShowLinkInput}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 ${editor.isActive("link") ? "bg-gray-200" : ""}`}
            title="Add Link"
            onClick={setLink}
          >
            <Link2 className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-2">
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="https://example.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyLink()}
              className="flex-1"
            />
            <Button size="sm" onClick={applyLink}>
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      {editor.isActive("link") && (
        <ToolbarButton onClick={removeLink} title="Remove Link">
          <Unlink className="h-4 w-4" />
        </ToolbarButton>
      )}
    </>
  );
}
