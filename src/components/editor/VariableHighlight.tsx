import { Mark, mergeAttributes } from "@tiptap/core";

export interface VariableHighlightOptions {
  HTMLAttributes: Record<string, any>;
  validVariables: Set<string>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    variableHighlight: {
      /**
       * Set a variable highlight mark
       */
      setVariableHighlight: (attributes?: {
        variable: string;
        isValid: boolean;
      }) => ReturnType;
      /**
       * Toggle a variable highlight mark
       */
      toggleVariableHighlight: (attributes?: {
        variable: string;
        isValid: boolean;
      }) => ReturnType;
      /**
       * Unset a variable highlight mark
       */
      unsetVariableHighlight: () => ReturnType;
    };
  }
}

export const VariableHighlight = Mark.create<VariableHighlightOptions>({
  name: "variableHighlight",

  addOptions() {
    return {
      HTMLAttributes: {},
      validVariables: new Set<string>(),
    };
  },

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
            contenteditable: "false", // Prevent editing inside variable spans
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
          return {
            variable: el.getAttribute("data-variable"),
            isValid: el.getAttribute("data-is-valid") === "true",
            class: el.className, // Preserve class attribute
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const isValid =
      HTMLAttributes["data-is-valid"] === "true" ||
      HTMLAttributes.isValid === true;
    const existingClass =
      HTMLAttributes.class || HTMLAttributes.className || "";
    const baseClass = isValid
      ? "variable-valid bg-[#E0F7FA] text-[#006064] px-1 py-0.5 rounded font-mono text-sm underline"
      : "variable-invalid bg-red-100 text-red-700 px-1 py-0.5 rounded font-mono text-sm underline";

    return [
      "span",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: existingClass ? `${baseClass} ${existingClass}` : baseClass,
        "data-variable":
          HTMLAttributes.variable || HTMLAttributes["data-variable"],
        "data-is-valid": isValid ? "true" : "false",
        contenteditable: "false", // Prevent editing inside variable spans
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setVariableHighlight:
        (attributes) =>
          ({ commands }) => {
            return commands.setMark(this.name, attributes);
          },
      toggleVariableHighlight:
        (attributes) =>
          ({ commands }) => {
            return commands.toggleMark(this.name, attributes);
          },
      unsetVariableHighlight:
        () =>
          ({ commands }) => {
            return commands.unsetMark(this.name);
          },
    };
  },
});
