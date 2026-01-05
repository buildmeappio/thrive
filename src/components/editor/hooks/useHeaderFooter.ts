import { useState, useEffect, useCallback } from "react";
import type { HeaderConfig, FooterConfig } from "../types";

/**
 * Hook for header/footer state management
 * Handles both internal and external state for headers and footers
 */
export function useHeaderFooter(
  externalHeaderConfig?: HeaderConfig,
  externalFooterConfig?: FooterConfig,
  onHeaderChange?: (config: HeaderConfig | undefined) => void,
  onFooterChange?: (config: FooterConfig | undefined) => void,
) {
  const [internalHeaderConfig, setInternalHeaderConfig] = useState<
    HeaderConfig | undefined
  >(externalHeaderConfig);
  const [internalFooterConfig, setInternalFooterConfig] = useState<
    FooterConfig | undefined
  >(externalFooterConfig);
  const [showHeaderModal, setShowHeaderModal] = useState(false);
  const [showFooterModal, setShowFooterModal] = useState(false);

  // Use external configs if provided, otherwise use internal state
  const headerConfig =
    externalHeaderConfig !== undefined
      ? externalHeaderConfig
      : internalHeaderConfig;
  const footerConfig =
    externalFooterConfig !== undefined
      ? externalFooterConfig
      : internalFooterConfig;

  // Sync external configs to internal state
  useEffect(() => {
    if (externalHeaderConfig !== undefined) {
      setInternalHeaderConfig(externalHeaderConfig);
    }
  }, [externalHeaderConfig]);

  useEffect(() => {
    if (externalFooterConfig !== undefined) {
      setInternalFooterConfig(externalFooterConfig);
    }
  }, [externalFooterConfig]);

  const handleHeaderSave = useCallback(
    (config: HeaderConfig) => {
      if (onHeaderChange) {
        onHeaderChange(config);
      } else {
        setInternalHeaderConfig(config);
      }
    },
    [onHeaderChange],
  );

  const handleFooterSave = useCallback(
    (config: FooterConfig) => {
      if (onFooterChange) {
        onFooterChange(config);
      } else {
        setInternalFooterConfig(config);
      }
    },
    [onFooterChange],
  );

  const removeHeader = useCallback(() => {
    if (onHeaderChange) {
      onHeaderChange(undefined);
    } else {
      setInternalHeaderConfig(undefined);
    }
  }, [onHeaderChange]);

  const removeFooter = useCallback(() => {
    if (onFooterChange) {
      onFooterChange(undefined);
    } else {
      setInternalFooterConfig(undefined);
    }
  }, [onFooterChange]);

  return {
    headerConfig,
    footerConfig,
    showHeaderModal,
    setShowHeaderModal,
    showFooterModal,
    setShowFooterModal,
    handleHeaderSave,
    handleFooterSave,
    removeHeader,
    removeFooter,
  };
}
