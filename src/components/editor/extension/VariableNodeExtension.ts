import { Node, mergeAttributes } from "@tiptap/core";

export interface VariableNodeOptions {
  HTMLAttributes: Record<string, any>;
  validVariables: Set<string>;
}

// Allowed variable types that can be inserted via the extension
export const INSERTABLE_VARIABLE_TYPES = ["text", "number", "money"] as const;
export type InsertableVariableType = (typeof INSERTABLE_VARIABLE_TYPES)[number];

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    variableNode: {
      /**
       * Insert a variable node
       */
      insertVariable: (options: {
        variable: string;
        variableType?: InsertableVariableType;
      }) => ReturnType;
    };
  }
}

export const VariableNodeExtension = Node.create<VariableNodeOptions>({
  name: "variableNode",

  addOptions() {
    return {
      HTMLAttributes: {},
      validVariables: new Set<string>(),
    };
  },

  // Inline element that sits with text
  group: "inline",
  inline: true,

  // Atomic: cannot be edited, cursor cannot enter
  atom: true,

  // Can be selected as a whole
  selectable: true,

  // Allow drag and drop
  draggable: true,

  addAttributes() {
    return {
      variable: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-variable"),
        renderHTML: (attributes) => {
          if (!attributes.variable) {
            return {};
          }
          return {
            "data-variable": attributes.variable,
          };
        },
      },
      variableType: {
        default: "text",
        parseHTML: (element) =>
          element.getAttribute("data-variable-type") || "text",
        renderHTML: (attributes) => {
          return {
            "data-variable-type": attributes.variableType || "text",
          };
        },
      },
      isValid: {
        default: true,
        parseHTML: (element) => {
          const isValid = element.getAttribute("data-is-valid");
          return isValid === "true";
        },
        renderHTML: (attributes) => {
          return {
            "data-is-valid": attributes.isValid ? "true" : "false",
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-variable]",
        getAttrs: (element) => {
          if (typeof element === "string") return false;
          const el = element as HTMLElement;
          const variable = el.getAttribute("data-variable");
          if (!variable) return false;

          return {
            variable,
            variableType: el.getAttribute("data-variable-type") || "text",
            isValid: el.getAttribute("data-is-valid") === "true",
          };
        },
      },
    ];
  },

  renderHTML({ node }) {
    const variable = node.attrs.variable;
    const isValid = node.attrs.isValid;
    const variableType = node.attrs.variableType || "text";

    const baseClass = isValid
      ? "variable-valid bg-[#E0F7FA] text-[#006064] px-1 py-0.5 rounded font-mono text-sm"
      : "variable-invalid bg-red-100 text-red-700 px-1 py-0.5 rounded font-mono text-sm";

    return [
      "span",
      mergeAttributes(this.options.HTMLAttributes, {
        class: baseClass,
        "data-variable": variable,
        "data-variable-type": variableType,
        "data-is-valid": isValid ? "true" : "false",
        contenteditable: "false",
      }),
      `{{${variable}}}`,
    ];
  },

  addCommands() {
    return {
      insertVariable:
        (options: {
          variable: string;
          variableType?: InsertableVariableType;
        }) =>
        ({ commands }) => {
          const { variable, variableType = "text" } = options;

          // Validate the variable against the allowed set
          const isInValidSet = this.options.validVariables.has(variable);

          // For fee variables, check if format is valid even if not in validVariablesSet
          // This allows users to add fee variables before selecting a fee structure
          // or when the variable exists in a different fee structure
          // Supports both simple variables (fees.base_exam_fee) and composite sub-fields (fees.late_cancellation.hours)
          const isFeeVariable = variable.startsWith("fees.");
          const feeVariableFormatValid = isFeeVariable
            ? /^fees\.[a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)*$/.test(variable)
            : false;

          // For custom variables, check if format is valid even if not in validVariablesSet
          // This allows users to add custom variables that may not be in the current validVariablesSet
          // Format: custom.varname (supports nested: custom.namespace.varname)
          const isCustomVariable = variable.startsWith("custom.");
          const customVariableFormatValid = isCustomVariable
            ? /^custom\.[a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)*$/.test(variable)
            : false;

          const isValid =
            isInValidSet || feeVariableFormatValid || customVariableFormatValid;

          return commands.insertContent({
            type: this.name,
            attrs: {
              variable,
              variableType,
              isValid,
            },
          });
        },
    };
  },
});
