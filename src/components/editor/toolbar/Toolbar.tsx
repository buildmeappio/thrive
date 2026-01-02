import { useMemo } from "react";
import {
  Undo2,
  Redo2,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Printer,
} from "lucide-react";
import { ToolbarButton } from "./ToolbarButton";
import { TextStyleDropdown } from "./TextStyleDropdown";
import { FontSizeDropdown } from "./FontSizeDropdown";
import { ColorPicker } from "./ColorPicker";
import { LinkPopover } from "./LinkPopover";
import { AlignmentButtons } from "./AlignmentButtons";
import { ListButtons } from "./ListButtons";
import { VariablesMenu } from "./VariablesMenu";
import { CheckboxGroupsMenu } from "./CheckboxGroupsMenu";
import { InsertMenu } from "./InsertMenu";
import { TableMenu } from "./TableMenu";
import { HeaderFooterButtons } from "./HeaderFooterButtons";
import { KeyboardShortcutsPopover } from "./KeyboardShortcutsPopover";
import type { Editor } from "@tiptap/react";
import type { useLinkHandlers } from "../hooks/useLinkHandlers";
import type { useHeaderFooter } from "../hooks/useHeaderFooter";
import type { HeaderConfig, FooterConfig } from "../types";
import {
  INSERTABLE_VARIABLE_TYPES,
  type InsertableVariableType,
} from "../extension/VariableNodeExtension";

interface ToolbarProps {
  editor: Editor;
  linkHandlers: ReturnType<typeof useLinkHandlers>;
  headerFooterHandlers: ReturnType<typeof useHeaderFooter>;
  headerConfig?: HeaderConfig;
  footerConfig?: FooterConfig;
  availableVariables: Array<{ namespace: string; vars: string[] }>;
  customVariables: Array<{
    key: string;
    variableType: "text" | "checkbox_group";
    options?: Array<{ label: string; value: string }> | null;
  }>;
  onAddImage: () => void;
  onAddTickBox: () => void;
  onPrint: () => void;
}

export function Toolbar({
  editor,
  linkHandlers,
  headerFooterHandlers,
  headerConfig,
  footerConfig,
  availableVariables,
  customVariables,
  onAddImage,
  onAddTickBox,
  onPrint,
}: ToolbarProps) {
  // Combine system variables with text-type custom variables
  // Filter out checkbox_group types - they use the CheckboxGroupsMenu
  const mergedVariables = useMemo(() => {
    // Build a map for efficient duplicate checking: namespace -> Set of variable names
    const existingVarsByNamespace = new Map<string, Set<string>>();

    // Process system variables and build the lookup map
    const result: Array<{
      namespace: string;
      vars: Array<{ name: string; type: InsertableVariableType }>;
    }> = availableVariables.map((group) => {
      const vars = group.vars.map((varName) => ({
        name: varName,
        type: "text" as InsertableVariableType,
      }));

      // Track existing variables for this namespace
      existingVarsByNamespace.set(group.namespace, new Set(group.vars));

      return { namespace: group.namespace, vars };
    });

    // Process custom variables in a single pass: filter, check duplicates, and group
    const customGroups = new Map<
      string,
      Array<{ name: string; type: InsertableVariableType }>
    >();

    for (const customVar of customVariables) {
      // Skip checkbox_group types and non-insertable types
      if (
        customVar.variableType &&
        !INSERTABLE_VARIABLE_TYPES.includes(
          customVar.variableType as InsertableVariableType,
        )
      ) {
        continue;
      }

      // Parse namespace and variable name from key (e.g., "custom.varname" -> namespace: "custom", name: "varname")
      const [namespace = "custom", ...nameParts] = customVar.key.split(".");
      const varName = nameParts.join(".") || customVar.key;

      // Check if this variable already exists
      const existingVars = existingVarsByNamespace.get(namespace);
      if (existingVars?.has(varName)) {
        continue; // Skip duplicates
      }

      // Add to custom groups
      if (!customGroups.has(namespace)) {
        customGroups.set(namespace, []);
      }
      customGroups.get(namespace)!.push({
        name: varName,
        type: (customVar.variableType as InsertableVariableType) || "text",
      });

      // Track this variable to prevent future duplicates
      if (!existingVarsByNamespace.has(namespace)) {
        existingVarsByNamespace.set(namespace, new Set());
      }
      existingVarsByNamespace.get(namespace)!.add(varName);
    }

    // Merge custom groups into result
    for (const [namespace, vars] of customGroups) {
      const existingGroup = result.find((g) => g.namespace === namespace);
      if (existingGroup) {
        existingGroup.vars.push(...vars);
      } else {
        result.push({ namespace, vars });
      }
    }

    return result;
  }, [availableVariables, customVariables]);

  return (
    <div className="border-b border-[#E9EDEE] p-2 flex flex-wrap gap-1 bg-gray-50 sticky top-0 z-50 flex-shrink-0 shadow-sm">
      {/* Undo/Redo */}
      <div className="flex gap-1 border-r border-gray-200 pr-2 mr-2">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          title="Undo"
        >
          <Undo2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          title="Redo"
        >
          <Redo2 className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Text Style Dropdown */}
      <div className="flex gap-1 border-r border-gray-200 pr-2 mr-2">
        <TextStyleDropdown editor={editor} />
      </div>

      {/* Text Formatting */}
      <div className="flex gap-1 border-r border-gray-200 pr-2 mr-2">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Underline"
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          active={editor.isActive("subscript")}
          title="Subscript"
        >
          <SubscriptIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          active={editor.isActive("superscript")}
          title="Superscript"
        >
          <SuperscriptIcon className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Font Size */}
      <div className="flex gap-1 border-r border-gray-200 pr-2 mr-2">
        <FontSizeDropdown editor={editor} />
      </div>

      {/* Colors */}
      <div className="flex gap-1 border-r border-gray-200 pr-2 mr-2">
        <ColorPicker editor={editor} />
      </div>

      {/* Links */}
      <div className="flex gap-1 border-r border-gray-200 pr-2 mr-2">
        <LinkPopover editor={editor} linkHandlers={linkHandlers} />
      </div>

      {/* Alignment */}
      <div className="flex gap-1 border-r border-gray-200 pr-2 mr-2">
        <AlignmentButtons editor={editor} />
      </div>

      {/* Lists */}
      <div className="flex gap-1 border-r border-gray-200 pr-2 mr-2">
        <ListButtons editor={editor} />
      </div>

      {/* Variables Menu - only text, number, money types */}
      {mergedVariables.length > 0 && (
        <div className="flex gap-1 border-r border-gray-200 pr-2 mr-2">
          <VariablesMenu editor={editor} availableVariables={mergedVariables} />
        </div>
      )}

      {/* Checkbox Groups Menu */}
      {customVariables.filter((v) => v.variableType === "checkbox_group")
        .length > 0 && (
        <div className="flex gap-1 border-r border-gray-200 pr-2 mr-2">
          <CheckboxGroupsMenu
            editor={editor}
            customVariables={customVariables}
          />
        </div>
      )}

      {/* Insert Menu */}
      <div className="flex gap-1">
        <InsertMenu
          editor={editor}
          onAddImage={onAddImage}
          onAddTickBox={onAddTickBox}
        />
        <TableMenu editor={editor} />

        {/* Header/Footer Buttons */}
        <div className="flex gap-1 border-l border-gray-200 pl-2 ml-2">
          <HeaderFooterButtons
            headerConfig={headerConfig}
            footerConfig={footerConfig}
            headerFooterHandlers={headerFooterHandlers}
          />
        </div>

        {/* Print Button */}
        <div className="flex gap-1 border-l border-gray-200 pl-2 ml-2">
          <ToolbarButton onClick={onPrint} title="Print Template">
            <Printer className="h-4 w-4" />
          </ToolbarButton>
        </div>
      </div>

      {/* Instructions Section */}
      <div className="flex gap-1 border-l border-gray-200 pl-2 ml-2">
        <KeyboardShortcutsPopover />
      </div>
    </div>
  );
}
