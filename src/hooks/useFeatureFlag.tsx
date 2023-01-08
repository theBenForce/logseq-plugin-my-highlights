import React from "react";
import { useIsDevelopment } from "./useIsDevelopment";
import { useLogseq } from "./useLogseq";

export const useFeatureFlag = (name: string) => {
  const isDev = useIsDevelopment();
  const logseq = useLogseq();
  
  const isEnabled = React.useMemo(() => {
    return isDev || (logseq.settings?.flags?.[name] ?? false);
  }, [isDev, logseq.settings, name]);

  return isEnabled;
}