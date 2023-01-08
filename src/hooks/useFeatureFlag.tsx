import React from "react";
import { useIsDevelopment } from "./useIsDevelopment";
import { useLogseq } from "./useLogseq";
import * as Rox from 'rox-browser';

const flags = {
  enableDetailsSelector: new Rox.Flag(false),
};

Rox.register('', flags);

type FlagNames = keyof typeof flags;

export const useFeatureFlag = (name: FlagNames) => {
  const isDev = useIsDevelopment();
  const logseq = useLogseq();
  const [isSetup, setSetup] = React.useState(false);

  const environmentId = React.useMemo(() => isDev ?
      '63bab1de3bfef5f954d5d6f8' :
      '63bab176c74cbfa2c29df7dc',
    [isDev]);

  React.useEffect(() => {
    Rox.setContext({
      userId: logseq.settings?.user_id,
    });
  }, [logseq]);

  React.useEffect(() => {
    setSetup(false);
    Rox.setup(environmentId, {}).then(() => setSetup(true));
  }, [environmentId]);
  
  const isEnabled = React.useMemo(() => {
    if (!isSetup) return false;

    return flags[name].isEnabled();
  }, [isSetup, name]);

  return isEnabled;
}