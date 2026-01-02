import type { ContractTemplateData } from "./contractTemplate.types";
import type { RefObject } from "react";

/**
 * Editor ref type - using any as TipTap editor type is complex
 */
export type EditorRef = RefObject<any>;

/**
 * Props for the main ContractTemplateEditContent component
 */
export type ContractTemplateEditContentProps = {
  template: ContractTemplateData;
};
