'use client';

import Image from '@tiptap/extension-image';
import { NodeViewWrapper, ReactNodeViewRenderer, ReactNodeViewProps } from '@tiptap/react';
import React, { useState, useRef, useEffect } from 'react';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    resizableImage: {
      setResizableImage: (options: {
        src: string;
        alt?: string;
        width?: number | string;
        height?: number | string;
      }) => ReturnType;
    };
  }
}

const ResizableImageComponent: React.FC<ReactNodeViewProps> = ({
  node,
  updateAttributes,
  selected,
}) => {
  const [width, setWidth] = useState<number | string>((node.attrs as any).width || 'auto');
  const [height, setHeight] = useState<number | string>((node.attrs as any).height || 'auto');
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const startPosRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const nodeWidth = (node.attrs as any).width;
  const nodeHeight = (node.attrs as any).height;

  useEffect(() => {
    setWidth(nodeWidth || 'auto');
    setHeight(nodeHeight || 'auto');
  }, [nodeWidth, nodeHeight]);

  const handleMouseDown = (e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handle);

    if (imgRef.current) {
      const rect = imgRef.current.getBoundingClientRect();
      startPosRef.current = {
        x: e.clientX,
        y: e.clientY,
        width: rect.width,
        height: rect.height,
      };
    }
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!imgRef.current || !resizeHandle) return;

      const deltaX = e.clientX - startPosRef.current.x;
      const deltaY = e.clientY - startPosRef.current.y;

      let newWidth = startPosRef.current.width;
      let newHeight = startPosRef.current.height;

      switch (resizeHandle) {
        case 'se':
          newWidth = Math.max(50, startPosRef.current.width + deltaX);
          newHeight = Math.max(50, startPosRef.current.height + deltaY);
          break;
        case 'sw':
          newWidth = Math.max(50, startPosRef.current.width - deltaX);
          newHeight = Math.max(50, startPosRef.current.height + deltaY);
          break;
        case 'ne':
          newWidth = Math.max(50, startPosRef.current.width + deltaX);
          newHeight = Math.max(50, startPosRef.current.height - deltaY);
          break;
        case 'nw':
          newWidth = Math.max(50, startPosRef.current.width - deltaX);
          newHeight = Math.max(50, startPosRef.current.height - deltaY);
          break;
        case 'e':
          newWidth = Math.max(50, startPosRef.current.width + deltaX);
          break;
        case 'w':
          newWidth = Math.max(50, startPosRef.current.width - deltaX);
          break;
        case 's':
          newHeight = Math.max(50, startPosRef.current.height + deltaY);
          break;
        case 'n':
          newHeight = Math.max(50, startPosRef.current.height - deltaY);
          break;
      }

      setWidth(newWidth);
      setHeight(newHeight);
      updateAttributes({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeHandle(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeHandle, updateAttributes]);

  const imageStyle: React.CSSProperties = {
    width: width === 'auto' ? 'auto' : `${width}px`,
    height: height === 'auto' ? 'auto' : `${height}px`,
    maxWidth: '100%',
    display: 'inline-block',
    verticalAlign: 'middle',
    cursor: isResizing ? 'grabbing' : 'default',
  };

  return (
    <NodeViewWrapper className={`resizable-image-wrapper ${selected ? 'selected' : ''}`}>
      <div
        className="resizable-image-container"
        style={{ display: 'inline-block', position: 'relative' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={(node.attrs as any).src}
          alt={(node.attrs as any).alt || ''}
          style={imageStyle}
          draggable={false}
        />
        {selected && (
          <>
            <div
              className="resize-handle resize-handle-nw"
              onMouseDown={e => handleMouseDown(e, 'nw')}
            />
            <div
              className="resize-handle resize-handle-n"
              onMouseDown={e => handleMouseDown(e, 'n')}
            />
            <div
              className="resize-handle resize-handle-ne"
              onMouseDown={e => handleMouseDown(e, 'ne')}
            />
            <div
              className="resize-handle resize-handle-e"
              onMouseDown={e => handleMouseDown(e, 'e')}
            />
            <div
              className="resize-handle resize-handle-se"
              onMouseDown={e => handleMouseDown(e, 'se')}
            />
            <div
              className="resize-handle resize-handle-s"
              onMouseDown={e => handleMouseDown(e, 's')}
            />
            <div
              className="resize-handle resize-handle-sw"
              onMouseDown={e => handleMouseDown(e, 'sw')}
            />
            <div
              className="resize-handle resize-handle-w"
              onMouseDown={e => handleMouseDown(e, 'w')}
            />
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
};

export default Image.extend({
  name: 'resizableImage',

  selectable: true,

  parseHTML() {
    return [
      {
        tag: 'img[src]',
        getAttrs: element => {
          if (typeof element === 'string') return false;
          return {
            src: element.getAttribute('src'),
            alt: element.getAttribute('alt'),
            title: element.getAttribute('title'),
            width: element.getAttribute('width')
              ? parseInt(element.getAttribute('width') || '0', 10)
              : null,
            height: element.getAttribute('height')
              ? parseInt(element.getAttribute('height') || '0', 10)
              : null,
          };
        },
      },
    ];
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: element => {
          const width = element.getAttribute('width');
          return width ? parseInt(width, 10) : null;
        },
        renderHTML: attributes => {
          if (!attributes.width) {
            return {};
          }
          return {
            width: attributes.width,
          };
        },
      },
      height: {
        default: null,
        parseHTML: element => {
          const height = element.getAttribute('height');
          return height ? parseInt(height, 10) : null;
        },
        renderHTML: attributes => {
          if (!attributes.height) {
            return {};
          }
          return {
            height: attributes.height,
          };
        },
      },
    };
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setResizableImage:
        options =>
        ({ commands }) => {
          // Convert width/height to numbers if they are strings
          const imageOptions: {
            src: string;
            alt?: string;
            width?: number;
            height?: number;
          } = {
            src: options.src,
            alt: options.alt,
          };
          if (options.width !== undefined) {
            imageOptions.width =
              typeof options.width === 'string' ? parseInt(options.width, 10) : options.width;
          }
          if (options.height !== undefined) {
            imageOptions.height =
              typeof options.height === 'string' ? parseInt(options.height, 10) : options.height;
          }
          // Create resizableImage node directly to ensure node view is applied
          return commands.insertContent({
            type: this.name,
            attrs: imageOptions,
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent);
  },
});
