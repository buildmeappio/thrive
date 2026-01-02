import React from "react";

interface PageHeaderProps {
  content: string;
  height: number;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ content, height }) => {
  return (
    <div
      className="page-header"
      style={{
        height: `${height}px`,
        maxHeight: `${height}px`,
        width: "100%",
        padding: "0 40px",
        display: "flex",
        alignItems: "center",
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 1,
      }}
    >
      <div
        className="header-content"
        style={{ width: "100%" }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
};
