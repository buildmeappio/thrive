import { Node, mergeAttributes } from "@tiptap/core";

export interface CheckboxGroupOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    checkboxGroup: {
      /**
       * Insert a checkbox group
       */
      insertCheckboxGroup: (options: {
        variableKey: string;
        options: Array<{ label: string; value: string }>;
      }) => ReturnType;
    };
  }
}

export const CheckboxGroupExtension = Node.create<CheckboxGroupOptions>({
  name: "checkboxGroup",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group: "block",

  // Atom nodes don't have content, perfect for preserving raw HTML
  atom: true,

  addAttributes() {
    return {
      "data-variable-type": {
        default: "checkbox_group",
        parseHTML: (element) => element.getAttribute("data-variable-type"),
        renderHTML: (attributes) => {
          if (!attributes["data-variable-type"]) {
            return {};
          }
          return {
            "data-variable-type": attributes["data-variable-type"],
          };
        },
      },
      "data-variable-key": {
        default: null,
        parseHTML: (element) => element.getAttribute("data-variable-key"),
        renderHTML: (attributes) => {
          if (!attributes["data-variable-key"]) {
            return {};
          }
          return {
            "data-variable-key": attributes["data-variable-key"],
          };
        },
      },
      class: {
        default: "checkbox-group-variable",
        parseHTML: (element) => element.getAttribute("class"),
        renderHTML: (attributes) => {
          if (!attributes.class) {
            return {};
          }
          return { class: attributes.class };
        },
      },
      style: {
        default: "margin: 12px 0;",
        parseHTML: (element) => element.getAttribute("style"),
        renderHTML: (attributes) => {
          if (!attributes.style) {
            return {};
          }
          return { style: attributes.style };
        },
      },
      innerHTML: {
        default: "",
        parseHTML: (element) => element.innerHTML,
        renderHTML: (attributes) => {
          // This won't be rendered as an attribute, but we'll use it in renderHTML
          return {};
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-variable-type="checkbox_group"]',
        getAttrs: (node) => {
          if (typeof node === "string") return false;
          const element = node as HTMLElement;
          return {
            "data-variable-type": element.getAttribute("data-variable-type"),
            "data-variable-key": element.getAttribute("data-variable-key"),
            class: element.getAttribute("class"),
            style: element.getAttribute("style"),
            innerHTML: element.innerHTML,
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    // Get innerHTML from node attributes
    const innerHTML = node.attrs.innerHTML || "";
    const { innerHTML: _, ...attrs } = HTMLAttributes;

    // TipTap doesn't support raw HTML rendering, so we need to parse it
    // For now, return the structure and TipTap will serialize it
    // The innerHTML will be preserved in the attribute and can be accessed when needed
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, attrs),
      // Return 0 to indicate no content, but the innerHTML is stored in attributes
      // This is a workaround - TipTap will serialize the node but won't include innerHTML
      // We'll need to handle this in the cleanContent function or when saving
      0,
    ];
  },

  addCommands() {
    return {
      insertCheckboxGroup:
        (options: {
          variableKey: string;
          options: Array<{ label: string; value: string }>;
        }) =>
        ({ commands }) => {
          const displayKey = options.variableKey
            .replace(/^custom\./, "")
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase());

          const checkboxHtml = `<div data-variable-type="checkbox_group" data-variable-key="${options.variableKey}" class="checkbox-group-variable" style="margin: 12px 0;">
  <label class="font-semibold" style="font-weight: 600; display: block; margin-bottom: 8px;">${displayKey}:</label>
  <div class="checkbox-options" style="margin-top: 8px;">
    ${
      options.options
        .map(
          (opt) => `
      <div style="margin-bottom: 4px; display: flex; align-items: center;">
        <span class="checkbox-indicator" data-checkbox-value="${opt.value}" data-variable-key="${options.variableKey}" style="display: inline-block; width: 16px; height: 16px; border: 2px solid #333; margin-right: 8px; vertical-align: middle; flex-shrink: 0;">☐</span>
        <label style="margin: 0; font-weight: normal;">${opt.label}</label>
      </div>
    `,
        )
        .join("") || ""
    }
  </div>
</div>`;

          return commands.insertContent(checkboxHtml);
        },
    };
  },
});
