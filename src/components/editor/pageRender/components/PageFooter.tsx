import React from "react";

interface PageFooterProps {
  content: string;
  height: number;
}

export const PageFooter: React.FC<PageFooterProps> = ({ content, height }) => {
  return (
    <div
      className="page-footer"
      style={{
        height: `${height}px`,
        maxHeight: `${height}px`,
        width: "100%",
        padding: "0 40px",
        display: "flex",
        alignItems: "center",
        position: "absolute",
        bottom: 0,
        left: 0,
        zIndex: 1,
      }}
    >
      <div
        className="footer-content"
        style={{ width: "100%" }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
};

