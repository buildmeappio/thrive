import { Square, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Editor } from "@tiptap/react";

interface CheckboxGroupsMenuProps {
    editor: Editor;
    customVariables: Array<{
        key: string;
        variableType: "text" | "checkbox_group";
        options?: Array<{ label: string; value: string }> | null;
    }>;
}

export function CheckboxGroupsMenu({
    editor,
    customVariables,
}: CheckboxGroupsMenuProps) {
    const checkboxGroups = customVariables.filter(
        (v) => v.variableType === "checkbox_group",
    );

    if (checkboxGroups.length === 0) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs"
                    title="Insert Checkbox Group"
                >
                    <Square className="h-4 w-4 mr-1" />
                    Checkboxes
                    <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-h-[400px] overflow-y-auto min-w-[250px]">
                {checkboxGroups.map((variable) => {
                    const displayKey = variable.key.replace(/^custom\./, "");
                    return (
                        <DropdownMenuItem
                            key={variable.key}
                            onClick={() => {
                                // Insert checkbox group HTML markup
                                // Use Unicode checkbox characters (☐ = unchecked, ☑ = checked) that TipTap will preserve
                                const checkboxHtml = `<div data-variable-type="checkbox_group" data-variable-key="${variable.key}" class="checkbox-group-variable" style="margin: 12px 0;">
  <label class="font-semibold" style="font-weight: 600; display: block; margin-bottom: 8px;">${displayKey.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}:</label>
  <div class="checkbox-options" style="margin-top: 8px;">
    ${variable.options
                                        ?.map(
                                            (opt) => `
      <div style="margin-bottom: 4px; display: flex; align-items: center;">
        <span class="checkbox-indicator" data-checkbox-value="${opt.value}" data-variable-key="${variable.key}" style="display: inline-block; width: 16px; height: 16px; border: 2px solid #333; margin-right: 8px; vertical-align: middle; flex-shrink: 0;">☐</span>
        <label style="margin: 0; font-weight: normal;">${opt.label}</label>
      </div>
    `,
                                        )
                                        .join("") || ""
                                    }
  </div>
</div>`;
                                editor
                                    .chain()
                                    .focus()
                                    .insertContent(checkboxHtml)
                                    .run();
                            }}
                            className="text-xs"
                        >
                            <div>
                                <div className="font-semibold">
                                    {displayKey
                                        .replace(/_/g, " ")
                                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {variable.options?.length || 0} options
                                </div>
                            </div>
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

