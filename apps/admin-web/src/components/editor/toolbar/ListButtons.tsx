import { List, ListOrdered, CheckSquare } from 'lucide-react';
import { ToolbarButton } from './ToolbarButton';
import type { Editor } from '@tiptap/react';

interface ListButtonsProps {
  editor: Editor;
}

export function ListButtons({ editor }: ListButtonsProps) {
  return (
    <>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive('bulletList')}
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive('orderedList')}
        title="Numbered List"
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        active={editor.isActive('taskList')}
        title="Task List"
      >
        <CheckSquare className="h-4 w-4" />
      </ToolbarButton>
    </>
  );
}
