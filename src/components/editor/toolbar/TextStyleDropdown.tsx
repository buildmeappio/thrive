import { ChevronDown, Code, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { Editor } from "@tiptap/react";

interface TextStyleDropdownProps {
    editor: Editor;
}

export function TextStyleDropdown({ editor }: TextStyleDropdownProps) {
    const getCurrentStyle = () => {
        if (editor.isActive("heading", { level: 1 })) return "Heading 1";
        if (editor.isActive("heading", { level: 2 })) return "Heading 2";
        if (editor.isActive("heading", { level: 3 })) return "Heading 3";
        if (editor.isActive("heading", { level: 4 })) return "Heading 4";
        if (editor.isActive("heading", { level: 5 })) return "Heading 5";
        if (editor.isActive("heading", { level: 6 })) return "Heading 6";
        if (editor.isActive("blockquote")) return "Quote";
        if (editor.isActive("codeBlock")) return "Code Block";
        if (editor.isActive("code")) return "Code";
        return "Paragraph";
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs"
                >
                    {getCurrentStyle()}
                    <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-[180px]">
                <DropdownMenuItem
                    onClick={() => editor.chain().focus().setParagraph().run()}
                    className={editor.isActive("paragraph") ? "bg-gray-100" : ""}
                >
                    <span className="text-sm">Paragraph</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() =>
                        editor.chain().focus().setHeading({ level: 1 }).run()
                    }
                    className={
                        editor.isActive("heading", { level: 1 }) ? "bg-gray-100" : ""
                    }
                >
                    <span className="text-2xl font-bold">Heading 1</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() =>
                        editor.chain().focus().setHeading({ level: 2 }).run()
                    }
                    className={
                        editor.isActive("heading", { level: 2 }) ? "bg-gray-100" : ""
                    }
                >
                    <span className="text-xl font-bold">Heading 2</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() =>
                        editor.chain().focus().setHeading({ level: 3 }).run()
                    }
                    className={
                        editor.isActive("heading", { level: 3 }) ? "bg-gray-100" : ""
                    }
                >
                    <span className="text-lg font-bold">Heading 3</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() =>
                        editor.chain().focus().setHeading({ level: 4 }).run()
                    }
                    className={
                        editor.isActive("heading", { level: 4 }) ? "bg-gray-100" : ""
                    }
                >
                    <span className="text-base font-bold">Heading 4</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() =>
                        editor.chain().focus().setHeading({ level: 5 }).run()
                    }
                    className={
                        editor.isActive("heading", { level: 5 }) ? "bg-gray-100" : ""
                    }
                >
                    <span className="text-sm font-bold">Heading 5</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() =>
                        editor.chain().focus().setHeading({ level: 6 }).run()
                    }
                    className={
                        editor.isActive("heading", { level: 6 }) ? "bg-gray-100" : ""
                    }
                >
                    <span className="text-xs font-bold">Heading 6</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={editor.isActive("blockquote") ? "bg-gray-100" : ""}
                >
                    <Quote className="mr-2 h-4 w-4" />
                    <span>Blockquote</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    className={editor.isActive("codeBlock") ? "bg-gray-100" : ""}
                >
                    <Code className="mr-2 h-4 w-4" />
                    <span>Code Block</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    className={editor.isActive("code") ? "bg-gray-100" : ""}
                >
                    <Code className="mr-2 h-4 w-4" />
                    <span>Inline Code</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

