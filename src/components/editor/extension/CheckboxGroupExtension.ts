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

  // Don't make it an atom - we want TipTap to parse the HTML content
  atom: false,

  // Make it selectable so it can be focused
  selectable: true,

  // Allow content so TipTap can parse the inner HTML
  content: "block+",

  // Don't add keyboard shortcuts - let other extensions handle Enter key

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

    // If we're in a browser environment, parse and render the HTML
    if (typeof window !== "undefined" && innerHTML) {
      try {
        // Create a temporary DOM element to parse the HTML
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = innerHTML;

        // Convert the parsed HTML to TipTap's node structure
        const children: any[] = [];

        // Process label element
        const label = tempDiv.querySelector("label.font-semibold");
        if (label) {
          children.push([
            "label",
            {
              class: "font-semibold",
              style: "font-weight: 600; display: block; margin-bottom: 8px;",
            },
            label.textContent || "",
          ]);
        }

        // Process checkbox options
        const optionsDiv = tempDiv.querySelector("div.checkbox-options");
        if (optionsDiv) {
          const optionDivs = optionsDiv.querySelectorAll("div");
          const optionChildren: any[] = [];

          optionDivs.forEach((optDiv) => {
            const checkboxSpan = optDiv.querySelector(
              "span.checkbox-indicator",
            );
            const labelEl = optDiv.querySelector("label");

            if (checkboxSpan && labelEl) {
              optionChildren.push([
                "div",
                {
                  style:
                    "margin-bottom: 4px; display: flex; align-items: center;",
                },
                [
                  "span",
                  {
                    class: "checkbox-indicator",
                    "data-checkbox-value":
                      checkboxSpan.getAttribute("data-checkbox-value") || "",
                    "data-variable-key":
                      checkboxSpan.getAttribute("data-variable-key") || "",
                    style:
                      "display: inline-block; width: 16px; height: 16px; border: 2px solid #333; margin-right: 8px; vertical-align: middle; flex-shrink: 0;",
                  },
                  checkboxSpan.textContent || "☐",
                ],
                [
                  "label",
                  { style: "margin: 0; font-weight: normal;" },
                  labelEl.textContent || "",
                ],
              ]);
            }
          });

          if (optionChildren.length > 0) {
            children.push([
              "div",
              { class: "checkbox-options", style: "margin-top: 8px;" },
              ...optionChildren,
            ]);
          }
        }

        // If we successfully parsed children, return them
        if (children.length > 0) {
          // Ensure data-variable-type is preserved in the output
          const finalAttrs = {
            ...mergeAttributes(this.options.HTMLAttributes, attrs),
            "data-variable-type":
              attrs["data-variable-type"] || "checkbox_group",
          };
          return ["div", finalAttrs, ...children];
        }
      } catch (error) {
        console.error("Error parsing checkbox group HTML:", error);
      }
    }

    // Fallback: return empty div - TipTap will preserve the HTML through parseHTML
    // Ensure data-variable-type is preserved even in fallback
    const fallbackAttrs = {
      ...mergeAttributes(this.options.HTMLAttributes, attrs),
      "data-variable-type": attrs["data-variable-type"] || "checkbox_group",
    };
    return ["div", fallbackAttrs, 0];
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
