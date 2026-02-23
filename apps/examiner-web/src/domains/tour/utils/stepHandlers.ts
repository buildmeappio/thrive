import React from "react";
import type { TourType } from "../types/tour";

export function isStepOpen(stepContainer: HTMLElement): boolean {
  const stepButton = stepContainer.querySelector(
    "button",
  ) as HTMLButtonElement | null;
  if (!stepButton) return false;

  const buttonParent = stepButton.parentElement;
  if (!buttonParent) return false;

  const allChildren = Array.from(buttonParent.children);
  const buttonIndex = allChildren.indexOf(stepButton);

  // Check if there's a div after the button that contains form content
  for (let i = buttonIndex + 1; i < allChildren.length; i++) {
    const sibling = allChildren[i];
    if (sibling.tagName === "DIV") {
      const hasForm =
        sibling.querySelector(
          'form, [class*="Form"], [class*="MultipleFileUploadInput"], [class*="bg-white rounded-2xl"], [class*="rounded-2xl p-6"]',
        ) !== null;
      if (hasForm) {
        return true;
      }
    }
  }

  return false;
}

export function handleStepButtonClick(
  stepContainer: HTMLElement,
  stepIndex: number,
  setIsWaitingForStep: (waiting: boolean) => void,
  pendingStepRef: React.MutableRefObject<number | null>,
  handleStepChange: (index: number) => void,
): void {
  const stepButton = stepContainer.querySelector(
    "button",
  ) as HTMLButtonElement | null;
  if (!stepButton) {
    console.warn("[Tour] Step button not found in container");
    return;
  }

  const isStepAlreadyOpen = isStepOpen(stepContainer);

  if (!isStepAlreadyOpen) {
    // Step is not open, click to open it
    setIsWaitingForStep(true);
    pendingStepRef.current = stepIndex;

    console.log("[Tour] Opening step");
    console.log("[Tour] Step button:", stepButton);
    console.log("[Tour] Step button classes:", stepButton.className);
    console.log("[Tour] Step button disabled:", stepButton.disabled);

    // Wait a bit before clicking to allow any previous step to close
    setTimeout(() => {
      console.log("[Tour] Clicking step button to open step");

      // Store original onClick handler if it exists
      const originalOnClick = (stepButton as any).onclick;

      // Try multiple click methods to ensure it works
      // Method 1: Direct click
      stepButton.click();

      // Method 2: Dispatch click event
      const clickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
      });
      stepButton.dispatchEvent(clickEvent);

      // Method 3: If there's an onClick handler, call it directly
      if (originalOnClick) {
        try {
          originalOnClick(new MouseEvent("click"));
        } catch (e) {
          console.warn("[Tour] Error calling original onClick:", e);
        }
      }

      console.log("[Tour] Step button clicked, waiting for React to render...");
      console.log(
        "[Tour] Button state after click - classes:",
        stepButton.className,
      );

      // Use MutationObserver to watch for DOM changes
      const observer = new MutationObserver((mutations) => {
        // Check if step is now open
        const buttonParent = stepButton.parentElement;
        if (buttonParent) {
          const allChildren = Array.from(buttonParent.children);
          const buttonIndex = allChildren.indexOf(stepButton);

          // Check if there's a div after the button with content
          for (let i = buttonIndex + 1; i < allChildren.length; i++) {
            const sibling = allChildren[i];
            if (sibling.tagName === "DIV" && sibling.children.length > 0) {
              // Also check if button has active styling (border-[#00A8FF])
              const buttonClasses = stepButton.className;
              const hasActiveStyle =
                buttonClasses.includes("border-[#00A8FF]") ||
                buttonClasses.includes("bg-[#F0F9FF]") ||
                getComputedStyle(stepButton).borderColor.includes(
                  "rgb(0, 168, 255)",
                );

              if (hasActiveStyle || sibling.textContent?.trim().length > 0) {
                console.log("[Tour] Step is now open! Resuming tour.");
                observer.disconnect();
                setIsWaitingForStep(false);
                document.body.style.overflow = "";
                pendingStepRef.current = null;
                return;
              }
            }
          }
        }
      });

      // Observe the container for changes
      observer.observe(stepContainer, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class"],
      });

      // Also use polling as fallback
      let attempts = 0;
      const maxAttempts = 30; // 3 seconds total

      const checkStepOpen = () => {
        attempts++;
        const buttonParent = stepButton.parentElement;
        let stepIsOpen = false;

        if (buttonParent) {
          // Check if button has active styling
          const buttonClasses = stepButton.className;
          const computedStyle = window.getComputedStyle(stepButton);
          const borderColor = computedStyle.borderColor;
          const bgColor = computedStyle.backgroundColor;

          const hasActiveStyle =
            buttonClasses.includes("border-[#00A8FF]") ||
            buttonClasses.includes("bg-[#F0F9FF]") ||
            borderColor.includes("rgb(0, 168, 255)") ||
            bgColor.includes("rgb(240, 249, 255)");

          console.log(
            `[Tour] Attempt ${attempts}: hasActiveStyle=${hasActiveStyle}, borderColor=${borderColor}, bgColor=${bgColor}`,
          );

          // Check if form div exists (regardless of active style, in case styling hasn't updated yet)
          const allChildren = Array.from(buttonParent.children);
          const buttonIndex = allChildren.indexOf(stepButton);

          for (let i = buttonIndex + 1; i < allChildren.length; i++) {
            const sibling = allChildren[i];
            if (sibling.tagName === "DIV" && sibling.children.length > 0) {
              console.log(
                `[Tour] Found form div after button with ${sibling.children.length} children`,
              );
              stepIsOpen = true;
              break;
            }
          }

          // Also check if active style is present
          if (hasActiveStyle && !stepIsOpen) {
            // Style is active but no form yet, might still be loading
            console.log(
              "[Tour] Button has active style but form not found yet",
            );
          }
        }

        if (stepIsOpen) {
          observer.disconnect();
          setIsWaitingForStep(false);
          document.body.style.overflow = "";
          pendingStepRef.current = null;
          console.log("[Tour] Step confirmed open via polling, resuming tour");
        } else if (attempts >= maxAttempts) {
          observer.disconnect();
          console.warn(
            "[Tour] Step did not open after max attempts, continuing anyway",
          );
          setIsWaitingForStep(false);
          document.body.style.overflow = "";
          pendingStepRef.current = null;
        } else {
          setTimeout(checkStepOpen, 100);
        }
      };

      // Use requestAnimationFrame to wait for React to render
      // Wait multiple frames to ensure React has time to update
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            // Start checking after React has had time to render
            setTimeout(checkStepOpen, 300);
          });
        });
      });
    }, 1500); // Wait 1.5 seconds to allow previous step to close and UI to settle
  } else {
    // Step is already open, enable scrolling
    document.body.style.overflow = "";
    setIsWaitingForStep(false);
    pendingStepRef.current = null;
  }
}

export function openSidebarIfNeeded(tourType: TourType): boolean {
  const sidebar = document.querySelector("aside") as HTMLElement;
  if (!sidebar) return false;

  const computedStyle = window.getComputedStyle(sidebar);
  const transform = computedStyle.transform;

  // Check if sidebar is hidden (translated off-screen)
  if (transform && transform !== "none" && transform.includes("-280")) {
    const menuButton = document.querySelector(
      '[aria-label*="menu" i], button[class*="Menu"], button svg[class*="Menu"]',
    ) as HTMLElement;
    if (menuButton) {
      menuButton.click();
      return true;
    } else {
      if (tourType === "dashboard") {
        console.warn("[Tour] Could not find menu button to open sidebar");
      }
    }
  }

  return false;
}
