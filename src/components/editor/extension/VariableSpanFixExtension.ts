import { Extension } from "@tiptap/core";
import { Plugin, PluginKey, TextSelection } from "prosemirror-state";

/**
 * Extension to prevent typing inside variable spans
 * When user types after a variable placeholder (}}), ensure text is placed outside the span
 */
export const VariableSpanFixExtension = Extension.create({
  name: "variableSpanFix",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("variableSpanFix"),
        appendTransaction: (transactions, oldState, newState) => {
          // Only process if this is a user input transaction
          if (!transactions.some((tr) => tr.docChanged)) {
            return null;
          }

          const { selection } = newState;
          const { $from } = selection;

          // Check if we're at the end of a variable span
          const domAtPos = newState.doc.resolve($from.pos);

          // Get the HTML to check for variable spans
          const html = newState.doc.textContent;

          // If transaction changed the document, check if we need to fix variable spans
          const tr = newState.tr;
          const modified = false;

          // We'll let the onUpdate handler in RichTextEditor fix this
          // This plugin is mainly for detection/prevention
          return modified ? tr : null;
        },
        props: {
          handleDOMEvents: {
            // Intercept before input to check if we're typing inside a variable span
            beforeinput: (view, event) => {
              if (
                event.inputType === "insertText" ||
                event.inputType === "insertCompositionText"
              ) {
                const { selection } = view.state;
                const { $from } = selection;
                const pos = $from.pos;

                // Get DOM node at cursor position
                const dom = view.domAtPos(pos);
                if (dom.node && dom.node.nodeType === Node.TEXT_NODE) {
                  let element = dom.node.parentElement;

                  // Walk up to find variable span
                  while (element && element !== view.dom) {
                    if (
                      element.classList.contains("variable-valid") ||
                      element.classList.contains("variable-invalid")
                    ) {
                      const variableKey = element.getAttribute("data-variable");
                      if (variableKey) {
                        const placeholder = `{{${variableKey}}}`;
                        const spanText = element.textContent || "";
                        const placeholderIndex = spanText.indexOf(placeholder);

                        if (placeholderIndex >= 0) {
                          // Calculate cursor position relative to span start
                          const spanStart = view.posAtDOM(element, 0);
                          const cursorPosInSpan = pos - spanStart;
                          const placeholderEndInSpan =
                            placeholderIndex + placeholder.length;

                          // If cursor is at or after the end of placeholder, prevent input
                          // and move cursor outside
                          if (cursorPosInSpan >= placeholderEndInSpan) {
                            event.preventDefault();
                            const spanEnd = view.posAtDOM(element, 1);
                            if (spanEnd !== null && spanEnd !== undefined) {
                              const text = (event as any).data || "";
                              const tr = view.state.tr.insertText(
                                text,
                                spanEnd,
                              );
                              view.dispatch(tr);
                              // Move cursor after inserted text
                              setTimeout(() => {
                                const newPos = spanEnd + text.length;
                                const resolvedPos =
                                  view.state.doc.resolve(newPos);
                                const selection =
                                  TextSelection.near(resolvedPos);
                                view.dispatch(
                                  view.state.tr.setSelection(selection),
                                );
                              }, 0);
                            }
                            return true; // Handled
                          }
                        }
                      }
                      break;
                    }
                    element = element.parentElement;
                  }
                }
              }

              return false; // Let TipTap handle normally
            },
          },
        },
      }),
    ];
  },
});
