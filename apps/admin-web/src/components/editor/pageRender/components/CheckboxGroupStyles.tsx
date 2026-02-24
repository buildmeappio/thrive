import React from 'react';

/**
 * Styles for checkbox group variables
 */
export const CheckboxGroupStyles: React.FC = () => {
  return (
    <style>{`
      .checkbox-group-variable {
        margin: 12px 0;
      }
      .checkbox-group-variable label {
        font-weight: 600;
        display: block;
        margin-bottom: 8px;
      }
      .checkbox-group-variable .checkbox-options {
        margin-top: 8px;
      }
      .checkbox-group-variable .checkbox-options > div {
        margin-bottom: 4px;
        display: flex;
        align-items: center;
      }
      .checkbox-group-variable .checkbox-indicator {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 1px solid #999 !important;
        background-color: #fff !important;
        margin-right: 8px;
        vertical-align: middle;
        flex-shrink: 0;
        text-align: center;
        line-height: 14px;
        font-size: 16px;
        cursor: default;
        color: #000 !important;
      }
      .checkbox-group-variable label {
        font-weight: normal;
        margin-bottom: 0;
      }
      .checkbox-group-variable,
      .checkbox-group-variable *,
      .checkbox-group-variable label,
      .checkbox-group-variable input,
      .checkbox-group-variable div,
      .checkbox-group-variable span {
        border-bottom: none !important;
        text-decoration: none !important;
      }
    `}</style>
  );
};
