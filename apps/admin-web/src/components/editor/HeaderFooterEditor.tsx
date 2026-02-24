'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import ResizableImageExtension from './extension/ResizableImageExtension';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link2,
  Unlink,
  ImageIcon,
  Palette,
  Highlighter,
  Minus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import './EditorContentStyles.css';

type Props = {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

// Color palette for text and highlight colors
const TEXT_COLORS = [
  { name: 'Default', color: 'inherit' },
  { name: 'Black', color: '#000000' },
  { name: 'Dark Gray', color: '#4B5563' },
  { name: 'Gray', color: '#9CA3AF' },
  { name: 'Red', color: '#EF4444' },
  { name: 'Orange', color: '#F97316' },
  { name: 'Yellow', color: '#EAB308' },
  { name: 'Green', color: '#22C55E' },
  { name: 'Blue', color: '#3B82F6' },
  { name: 'Purple', color: '#A855F7' },
  { name: 'Pink', color: '#EC4899' },
];

const HIGHLIGHT_COLORS = [
  { name: 'None', color: '' },
  { name: 'Yellow', color: '#FEF08A' },
  { name: 'Green', color: '#BBF7D0' },
  { name: 'Blue', color: '#BFDBFE' },
  { name: 'Pink', color: '#FBCFE8' },
  { name: 'Purple', color: '#E9D5FF' },
  { name: 'Orange', color: '#FED7AA' },
  { name: 'Gray', color: '#E5E7EB' },
];

export default function HeaderFooterEditor({
  content,
  onChange,
  placeholder: _placeholder = 'Enter header/footer content...',
}: Props) {
  const [isMounted, setIsMounted] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: false, // Disable headings in header/footer
        blockquote: false, // Disable blockquote
        codeBlock: false, // Disable code block
        hardBreak: {
          HTMLAttributes: {
            class: 'hard-break',
          },
        },
      }),
      TextAlign.configure({
        types: ['paragraph'],
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
        },
      }),
      ResizableImageExtension.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'max-w-full h-auto',
        },
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
    ],
    []
  );

  const editor = useEditor({
    extensions,
    content: content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[150px] p-4 font-poppins',
      },
    },
    immediatelyRender: false,
  });

  // Sync external content changes to editor
  useEffect(() => {
    if (!editor || !isMounted) return;
    const currentHtml = editor.getHTML();
    if (currentHtml !== content) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor, isMounted]);

  // Link handlers
  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    setLinkUrl(previousUrl || '');
    setShowLinkInput(true);
  }, [editor]);

  const applyLink = useCallback(() => {
    if (!editor) return;
    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    }
    setShowLinkInput(false);
    setLinkUrl('');
  }, [editor, linkUrl]);

  const removeLink = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
  }, [editor]);

  // Image handler
  const handleImageFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !editor) return;

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        return;
      }

      // Read file as base64
      const reader = new FileReader();
      reader.onload = event => {
        const base64 = event.target?.result as string;
        if (base64) {
          editor.chain().focus().setResizableImage({ src: base64 }).run();
        }
      };
      reader.readAsDataURL(file);

      // Reset input so same file can be selected again
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    },
    [editor]
  );

  // Don't render on server to avoid hydration mismatch
  if (!isMounted || !editor) {
    return (
      <div className="flex min-h-[150px] items-center justify-center overflow-hidden rounded border border-gray-300 bg-white">
        <p className="font-poppins text-gray-500">Loading editor...</p>
      </div>
    );
  }

  // Toolbar button component
  const ToolbarButton = ({
    onClick,
    active,
    disabled,
    children,
    title,
  }: {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title?: string;
  }) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`h-8 w-8 p-0 ${active ? 'bg-gray-200' : ''}`}
    >
      {children}
    </Button>
  );

  return (
    <div className="overflow-hidden rounded border border-gray-300 bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 border-b border-gray-200 bg-gray-50 p-2">
        {/* Text Formatting */}
        <div className="mr-2 flex gap-1 border-r border-gray-200 pr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive('underline')}
            title="Underline"
          >
            <UnderlineIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive('strike')}
            title="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Colors */}
        <div className="mr-2 flex gap-1 border-r border-gray-200 pr-2">
          {/* Text Color */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title="Text Color"
              >
                <Palette className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2">
              <div className="grid grid-cols-4 gap-1">
                {TEXT_COLORS.map(c => (
                  <button
                    key={c.color}
                    onClick={() =>
                      c.color === 'inherit'
                        ? editor.chain().focus().unsetColor().run()
                        : editor.chain().focus().setColor(c.color).run()
                    }
                    className="h-6 w-6 cursor-pointer rounded border border-gray-300 transition-transform hover:scale-110"
                    style={{
                      backgroundColor: c.color === 'inherit' ? 'white' : c.color,
                    }}
                    title={c.name}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Highlight Color */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title="Highlight Color"
              >
                <Highlighter className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2">
              <div className="grid grid-cols-4 gap-1">
                {HIGHLIGHT_COLORS.map(c => (
                  <button
                    key={c.color || 'none'}
                    onClick={() =>
                      c.color === ''
                        ? editor.chain().focus().unsetHighlight().run()
                        : editor.chain().focus().toggleHighlight({ color: c.color }).run()
                    }
                    className="h-6 w-6 cursor-pointer rounded border border-gray-300 transition-transform hover:scale-110"
                    style={{ backgroundColor: c.color || 'white' }}
                    title={c.name}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Links */}
        <div className="mr-2 flex gap-1 border-r border-gray-200 pr-2">
          <Popover open={showLinkInput} onOpenChange={setShowLinkInput}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 ${editor.isActive('link') ? 'bg-gray-200' : ''}`}
                title="Add Link"
                onClick={setLink}
              >
                <Link2 className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-2">
              <div className="flex gap-2">
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={e => setLinkUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && applyLink()}
                  className="flex-1"
                />
                <Button size="sm" onClick={applyLink}>
                  Apply
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          {editor.isActive('link') && (
            <ToolbarButton onClick={removeLink} title="Remove Link">
              <Unlink className="h-4 w-4" />
            </ToolbarButton>
          )}
        </div>

        {/* Alignment */}
        <div className="mr-2 flex gap-1 border-r border-gray-200 pr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            active={editor.isActive({ textAlign: 'left' })}
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            active={editor.isActive({ textAlign: 'center' })}
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            active={editor.isActive({ textAlign: 'right' })}
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Image */}
        <div className="mr-2 flex gap-1 border-r border-gray-200 pr-2">
          <ToolbarButton onClick={() => imageInputRef.current?.click()} title="Insert Image">
            <ImageIcon className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Horizontal Rule */}
        <div className="flex gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Insert Horizontal Rule"
          >
            <Minus className="h-4 w-4" />
          </ToolbarButton>
        </div>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} className="max-h-[300px] min-h-[150px] overflow-y-auto" />

      {/* Hidden file input for image upload */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
        onChange={handleImageFileSelect}
        className="hidden"
      />
    </div>
  );
}
