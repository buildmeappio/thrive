import {
  findSettingsButton,
  findElementByTourAttribute,
} from "./elementChecker";
import type { TourType } from "../types/tour";

export function positionReportsTableTooltip(
  tooltip: HTMLElement,
  targetElement: HTMLElement,
  tourType: TourType,
): void {
  const elementRect = targetElement.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();

  // Calculate desired position: bottom of element, centered
  const desiredLeft =
    elementRect.left + elementRect.width / 2 - tooltipRect.width / 2;
  const desiredTop = elementRect.bottom + 10;

  // Ensure tooltip stays in viewport
  const adjustedLeft = Math.max(
    10,
    Math.min(desiredLeft, window.innerWidth - tooltipRect.width - 10),
  );
  const adjustedTop =
    desiredTop + tooltipRect.height > window.innerHeight
      ? elementRect.top - tooltipRect.height - 10
      : desiredTop;

  // Apply position
  tooltip.style.position = "fixed";
  tooltip.style.left = `${adjustedLeft}px`;
  tooltip.style.top = `${adjustedTop}px`;
  tooltip.style.transform = "none";
  tooltip.style.margin = "0";

  if (tourType === "dashboard") {
    console.log("[Tour] Manually positioned reports-table tooltip:", {
      elementRect,
      tooltipRect,
      position: { left: adjustedLeft, top: adjustedTop },
    });
  }

  // Also update arrow position if it exists
  const arrow = tooltip.querySelector(
    ".react-joyride__tooltip__arrow",
  ) as HTMLElement;
  if (arrow) {
    arrow.style.top = adjustedTop > elementRect.bottom ? "100%" : "auto";
    arrow.style.bottom = adjustedTop > elementRect.bottom ? "auto" : "100%";
  }
}

export function positionSettingsButtonTooltip(
  tooltip: HTMLElement,
  targetElement: HTMLElement,
  tourType: TourType,
): NodeJS.Timeout {
  const elementRect = targetElement.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();

  // Calculate desired position: right of sidebar element, centered vertically
  const desiredLeft = elementRect.right + 15;
  const desiredTop =
    elementRect.top + elementRect.height / 2 - tooltipRect.height / 2;

  // Ensure tooltip stays in viewport
  const adjustedLeft =
    desiredLeft + tooltipRect.width > window.innerWidth
      ? elementRect.left - tooltipRect.width - 15
      : desiredLeft;
  const adjustedTop = Math.max(
    10,
    Math.min(desiredTop, window.innerHeight - tooltipRect.height - 10),
  );

  // Apply position with !important to override react-joyride styles
  tooltip.style.setProperty("position", "fixed", "important");
  tooltip.style.setProperty("left", `${adjustedLeft}px`, "important");
  tooltip.style.setProperty("top", `${adjustedTop}px`, "important");
  tooltip.style.setProperty("transform", "none", "important");
  tooltip.style.setProperty("margin", "0", "important");

  if (tourType === "dashboard") {
    console.log("[Tour] Manually positioned settings-button tooltip:", {
      elementRect,
      tooltipRect,
      position: { left: adjustedLeft, top: adjustedTop },
    });
  }

  // Also update arrow position if it exists
  const arrow = tooltip.querySelector(
    ".react-joyride__tooltip__arrow",
  ) as HTMLElement;
  if (arrow) {
    arrow.style.left = adjustedLeft > elementRect.right ? "auto" : "20px";
    arrow.style.right = adjustedLeft > elementRect.right ? "20px" : "auto";
  }

  // Set up interval to continuously fix position (react-joyride might try to reposition)
  const positionInterval = setInterval(() => {
    if (document.querySelector(".react-joyride__tooltip")) {
      const currentTooltip = document.querySelector(
        ".react-joyride__tooltip",
      ) as HTMLElement;
      const currentTarget = findSettingsButton();

      if (currentTooltip && currentTarget) {
        const currentElementRect = currentTarget.getBoundingClientRect();
        const currentTooltipRect = currentTooltip.getBoundingClientRect();

        const currentDesiredLeft = currentElementRect.right + 15;
        const currentDesiredTop =
          currentElementRect.top +
          currentElementRect.height / 2 -
          currentTooltipRect.height / 2;

        const currentAdjustedLeft =
          currentDesiredLeft + currentTooltipRect.width > window.innerWidth
            ? currentElementRect.left - currentTooltipRect.width - 15
            : currentDesiredLeft;
        const currentAdjustedTop = Math.max(
          10,
          Math.min(
            currentDesiredTop,
            window.innerHeight - currentTooltipRect.height - 10,
          ),
        );

        currentTooltip.style.setProperty("position", "fixed", "important");
        currentTooltip.style.setProperty(
          "left",
          `${currentAdjustedLeft}px`,
          "important",
        );
        currentTooltip.style.setProperty(
          "top",
          `${currentAdjustedTop}px`,
          "important",
        );
        currentTooltip.style.setProperty("transform", "none", "important");
      } else {
        clearInterval(positionInterval);
      }
    } else {
      clearInterval(positionInterval);
    }
  }, 100);

  // Clear interval when step changes
  setTimeout(() => clearInterval(positionInterval), 10000);

  return positionInterval;
}

export function handleStepAfterPositioning(
  index: number,
  targetSelector: string,
  tourType: TourType,
): void {
  // Handle reports-table step (step 3, index 2)
  if (index === 2 && targetSelector.includes("reports-table")) {
    const tooltip = document.querySelector(
      ".react-joyride__tooltip",
    ) as HTMLElement;
    const targetElement = findElementByTourAttribute("reports-table");

    if (tooltip && targetElement) {
      positionReportsTableTooltip(tooltip, targetElement, tourType);
    }
  }

  // Handle settings-button step (step 6, index 5)
  if (index === 5 && targetSelector.includes("settings-button")) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const tooltip = document.querySelector(
          ".react-joyride__tooltip",
        ) as HTMLElement;
        const targetElement = findSettingsButton();

        if (tooltip && targetElement) {
          if (
            tourType === "dashboard" &&
            !targetElement.hasAttribute("data-tour")
          ) {
            console.log(
              "[Tour] Found settings button by href in step:after, adding data-tour attribute",
            );
            targetElement.setAttribute("data-tour", "settings-button");
          }
          positionSettingsButtonTooltip(tooltip, targetElement, tourType);
        } else {
          if (tourType === "dashboard") {
            console.warn(
              "[Tour] Could not find tooltip or settings-button element:",
              {
                hasTooltip: !!tooltip,
                hasTargetElement: !!targetElement,
              },
            );
          }
        }
      });
    });
  }
}
