export const joyrideStyles = {
  options: {
    primaryColor: "#00A8FF",
    textColor: "#1F2937",
    overlayColor: "rgba(0, 0, 0, 0.5)",
    arrowColor: "#00A8FF",
    backgroundColor: "#FFFFFF",
    spotlightShadow: "0 0 15px rgba(0, 168, 255, 0.5)",
    zIndex: 10000,
  },
  tooltip: {
    borderRadius: "12px",
    padding: "20px",
  },
  tooltipContainer: {
    textAlign: "left" as const,
  },
  tooltipTitle: {
    fontSize: "18px",
    fontWeight: 600,
    color: "#1F2937",
    marginBottom: "8px",
  },
  tooltipContent: {
    fontSize: "14px",
    lineHeight: "1.5",
    color: "#4B5563",
    padding: "0",
  },
  buttonNext: {
    backgroundColor: "#00A8FF",
    borderRadius: "8px",
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: 500,
    color: "#FFFFFF",
    border: "none",
    cursor: "pointer",
  },
  buttonBack: {
    color: "#6B7280",
    marginRight: "10px",
    fontSize: "14px",
    fontWeight: 500,
  },
  buttonSkip: {
    color: "#6B7280",
    fontSize: "14px",
    fontWeight: 500,
  },
};

export const tourGlobalStyles = `
  .react-joyride__tooltip,
  .react-joyride__tooltip * {
    -webkit-font-smoothing: antialiased !important;
    -moz-osx-font-smoothing: grayscale !important;
    text-rendering: optimizeLegibility !important;
    backface-visibility: hidden !important;
  }
  .react-joyride__floater {
    filter: none !important;
    transition: none !important;
  }
  .react-joyride__floater__element {
    position: absolute !important;
    will-change: transform !important;
  }
  .react-joyride__tooltip__content,
  .react-joyride__tooltip__title {
    transform: none !important;
    will-change: auto !important;
  }
  /* Ensure tooltip container uses proper positioning */
  div[data-popper-placement] {
    position: fixed !important;
  }
  /* Force Popper to recalculate on any changes */
  .react-joyride__spotlight {
    transition: all 0.3s ease-in-out !important;
  }
`;
