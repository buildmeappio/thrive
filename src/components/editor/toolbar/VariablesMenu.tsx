import { Hash, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { Editor } from "@tiptap/react";
import type { InsertableVariableType } from "../extension/VariableNodeExtension";

interface VariablesMenuProps {
  editor: Editor;
  availableVariables: Array<{
    namespace: string;
    vars: Array<{ name: string; type?: InsertableVariableType }>;
  }>;
}

export function VariablesMenu({
  editor,
  availableVariables,
}: VariablesMenuProps) {
  if (availableVariables.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs"
          title="Insert Variable"
        >
          <Hash className="h-4 w-4 mr-1" />
          Variables
          <ChevronDown className="ml-1 h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-h-[400px] overflow-y-auto min-w-[250px]">
        {availableVariables.map((group, groupIndex) => (
          <div key={group.namespace}>
            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {group.namespace}
            </div>
            {group.vars.map((varItem) => {
              const varName =
                typeof varItem === "string" ? varItem : varItem.name;
              const varType =
                typeof varItem === "string" ? "text" : varItem.type || "text";
              const fullVariable = `${group.namespace}.${varName}`;
              return (
                <DropdownMenuItem
                  key={fullVariable}
                  onClick={() => {
                    editor
                      .chain()
                      .focus()
                      .insertVariable({
                        variable: fullVariable,
                        variableType: varType,
                      })
                      .run();
                  }}
                  className="font-mono text-xs"
                >
                  {`{{${fullVariable}}}`}
                </DropdownMenuItem>
              );
            })}
            {groupIndex < availableVariables.length - 1 && (
              <DropdownMenuSeparator />
            )}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
