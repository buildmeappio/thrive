import { useRef, useCallback } from 'react';
import { toast } from 'sonner';
import type { Editor } from '@tiptap/react';

/**
 * Hook for image handling
 * Handles image file selection, validation, and insertion
 */
export function useImageHandlers(editor: Editor | null) {
  const imageInputRef = useRef<HTMLInputElement>(null);

  const addImage = useCallback(() => {
    imageInputRef.current?.click();
  }, []);

  const handleImageFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !editor) return;

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Invalid image type. Allowed: JPEG, PNG, GIF, WebP, SVG');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size exceeds 5MB limit');
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

  return {
    imageInputRef,
    addImage,
    handleImageFileSelect,
  };
}
