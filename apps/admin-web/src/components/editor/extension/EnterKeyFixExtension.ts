import { Extension } from '@tiptap/core';
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state';
import { splitBlock } from '@tiptap/pm/commands';

/**
 * Extension to ensure Enter key works properly in the editor
 * This fixes issues where Enter key might be blocked by other extensions or form handlers
 * Uses a ProseMirror plugin to handle Enter at a lower level
 */
export const EnterKeyFixExtension = Extension.create({
  name: 'enterKeyFix',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('enterKeyFix'),
        props: {
          handleKeyDown: (view, event) => {
            // Only handle Enter key (without Shift)
            if (event.key === 'Enter' && !event.shiftKey) {
              console.log('🔵 EnterKeyFixExtension: Enter key detected at ProseMirror level', {
                defaultPrevented: event.defaultPrevented,
                target: event.target,
                isFocused: view.hasFocus(),
                viewState: !!view.state,
              });

              // Check if editor has focus
              if (!view.hasFocus()) {
                console.log('🔵 EnterKeyFixExtension: Editor not focused, focusing now');
                view.focus();
              }

              // Prevent any default behavior FIRST
              event.preventDefault();
              event.stopPropagation();
              event.stopImmediatePropagation();

              const { state, dispatch } = view;
              const { schema, selection } = state;
              const { $from } = selection;
              const { paragraph } = schema.nodes;

              if (!paragraph) {
                console.error('❌ EnterKeyFixExtension: Paragraph node type not found');
                return false;
              }

              // Try ProseMirror's splitBlock command first
              const splitResult = splitBlock(state, dispatch);

              if (splitResult && dispatch) {
                console.log('✅ EnterKeyFixExtension: splitBlock succeeded');
                return true;
              }

              // Manual split: split the current block at cursor position
              console.log('⚠️ EnterKeyFixExtension: Using manual split');
              try {
                const pos = $from.pos;
                const depth = $from.depth;

                // Find the block node we're in
                let blockNode = $from.node(depth);
                let blockPos = $from.start(depth);

                // Walk up to find a block-level node
                for (let d = depth; d > 0; d--) {
                  const node = $from.node(d);
                  if (node.type.isBlock) {
                    blockNode = node;
                    blockPos = $from.start(d);
                    break;
                  }
                }

                // Split at the cursor position
                const transaction = state.tr.split(pos);

                if (transaction.steps.length > 0) {
                  dispatch(transaction);
                  console.log('✅ EnterKeyFixExtension: Manual split succeeded');
                  return true;
                }

                // If split didn't work, insert a new paragraph
                const newParagraph = paragraph.create();
                const insertPos = $from.after(depth);
                const insertTransaction = state.tr.insert(insertPos, newParagraph);

                // Move selection to the new paragraph
                const newSelection = TextSelection.near(
                  insertTransaction.doc.resolve(insertPos + 1)
                );
                const finalTransaction = insertTransaction.setSelection(newSelection);

                dispatch(finalTransaction);
                console.log('✅ EnterKeyFixExtension: Inserted new paragraph');
                return true;
              } catch (error) {
                console.error('❌ EnterKeyFixExtension: Error', error);
                return false;
              }
            }
            return false; // Not Enter key, let other handlers process
          },
        },
      }),
    ];
  },

  addKeyboardShortcuts() {
    return {
      // Handle Enter key directly in keyboard shortcuts
      // This runs before ProseMirror plugins, so we handle it here
      Enter: ({ editor }) => {
        console.log('🔵 EnterKeyFixExtension: Enter key via keyboard shortcuts');

        // Ensure editor is focused
        if (!editor.isFocused) {
          editor.commands.focus();
        }

        // Get the current state and view
        const { state, view } = editor;
        const { selection, schema } = state;
        const { $from } = selection;
        const { paragraph } = schema.nodes;

        if (!paragraph) {
          console.error('❌ EnterKeyFixExtension: Paragraph node type not found');
          return false;
        }

        try {
          // Get the current position and depth
          const pos = $from.pos;
          const depth = $from.depth;

          // Find the paragraph node we're in
          let paragraphNode = null;
          let paragraphStart = 0;
          let paragraphEnd = 0;

          // Walk up the tree to find the paragraph
          for (let d = depth; d >= 0; d--) {
            const node = $from.node(d);
            if (node.type === paragraph) {
              paragraphNode = node;
              paragraphStart = $from.start(d);
              paragraphEnd = $from.end(d);
              break;
            }
          }

          if (!paragraphNode) {
            console.error('❌ EnterKeyFixExtension: Not inside a paragraph');
            return false;
          }

          // If we're at the end of the paragraph, insert a new paragraph after
          if (pos >= paragraphEnd - 1) {
            const newParagraph = paragraph.create();
            const transaction = state.tr.insert(paragraphEnd, newParagraph);
            const newPos = paragraphEnd + 1;
            const resolvedPos = transaction.doc.resolve(newPos);
            const finalTransaction = transaction.setSelection(TextSelection.near(resolvedPos));
            view.dispatch(finalTransaction);
            console.log('✅ EnterKeyFixExtension: Inserted new paragraph at end');
            return true;
          }

          // Otherwise, split the paragraph at the cursor position
          const transaction = state.tr.split(pos);

          if (transaction.steps.length > 0) {
            // Move cursor to the new paragraph
            const newPos = pos + 1;
            const resolvedPos = transaction.doc.resolve(newPos);
            const finalTransaction = transaction.setSelection(TextSelection.near(resolvedPos));
            view.dispatch(finalTransaction);
            console.log('✅ EnterKeyFixExtension: Split paragraph succeeded');
            return true;
          }

          // Fallback: try TipTap's command
          console.log('⚠️ EnterKeyFixExtension: Manual split failed, trying TipTap command');
          const result = editor.commands.splitBlock();
          if (result) {
            console.log('✅ EnterKeyFixExtension: TipTap splitBlock succeeded');
            return true;
          }

          console.error('❌ EnterKeyFixExtension: All methods failed');
          return false;
        } catch (error) {
          console.error('❌ EnterKeyFixExtension: Error', error);
          return false;
        }
      },
    };
  },

  // Set priority to ensure this extension runs before others
  priority: 1000,
});
