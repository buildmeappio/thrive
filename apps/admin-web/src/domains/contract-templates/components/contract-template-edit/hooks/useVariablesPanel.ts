import { useState } from "react";
import type { VariablesPanelTab } from "../../../types/variables.types";

export function useVariablesPanel() {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<VariablesPanelTab>("variables");

  const toggleOpen = () => setIsOpen((prev) => !prev);

  return {
    isOpen,
    activeTab,
    toggleOpen,
    setActiveTab,
  };
}
