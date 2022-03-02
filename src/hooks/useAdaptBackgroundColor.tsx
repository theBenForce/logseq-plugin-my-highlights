import * as React from "react";

// Taken from https://github.com/pengx17/logseq-plugin-link-preview/blob/master/src/App.tsx#L8

// FIXME: adapt for dynamic theme mode change
export const useAdaptBackgroundColor = () => {
  React.useEffect(() => {
    if (frameElement) {
      const baseStyle = getComputedStyle(frameElement);
      const bgColor = baseStyle.getPropertyValue(
        "--ls-secondary-background-color"
      );
      const primaryTextColor = baseStyle.getPropertyValue(
        "--ls-primary-text-color"
      );
      const secondaryTextColor = baseStyle.getPropertyValue(
        "--ls-secondary-text-color"
      );
      const borderColor = baseStyle.getPropertyValue("--ls-border-color");
      document.documentElement.style.setProperty(
        "--ls-secondary-background-color",
        bgColor
      );
      document.documentElement.style.setProperty(
        "--ls-border-color",
        borderColor
      );
      document.documentElement.style.setProperty(
        "--ls-primary-text-color",
        primaryTextColor
      );
      document.documentElement.style.setProperty(
        "--ls-secondary-text-color",
        secondaryTextColor
      );
    }
  }, []);
};