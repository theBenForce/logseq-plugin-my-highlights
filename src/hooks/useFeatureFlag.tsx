import React from "react";
import { useIsDevelopment } from "./useIsDevelopment";
import { useLogseq } from "./useLogseq";
import * as Rox from 'rox-browser';

const flags = {
  enableDetailsSelector: new Rox.Flag(false),
};

const config = {
  amazonAssociateTag: new Rox.RoxString('thebenforce0c-20'),
}

Rox.register('', flags);
Rox.register('config', config);

type FlagNames = keyof typeof flags;
type ConfigNames = keyof typeof config;

const useCloudBees = () => {
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

  return isSetup;
}

export const useFeatureFlag = (name: FlagNames) => {
  const isSetup = useCloudBees();
  
  const isEnabled = React.useMemo(() => {
    if (!isSetup) return flags[name].defaultValue;

    return flags[name].isEnabled?.();
  }, [isSetup, name]);

  return isEnabled;
}

export const useConfigFlag = (name: ConfigNames) => {
  const isSetup = useCloudBees();

  const value = React.useMemo(() => {
    if (!isSetup) return config[name].defaultValue;

    return config[name].getValue();
  }, [isSetup, name]);

  return value;
}