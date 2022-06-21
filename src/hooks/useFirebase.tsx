import { Analytics, getAnalytics, setAnalyticsCollectionEnabled, setUserId, setUserProperties } from 'firebase/analytics';
import { FirebaseOptions, initializeApp } from 'firebase/app';
import { fetchAndActivate, getRemoteConfig, RemoteConfig } from 'firebase/remote-config';
import React from 'react';
import { ulid } from 'ulidx';
import { useLogseq } from './useLogseq';

interface FirebaseContext {
  remoteConfig?: RemoteConfig;
  analytics?: Analytics;
  userId?: string;
}

const firebaseConfig = {
  apiKey: "AIzaSyAxm9gaPjyfQ4MWXIxq00MNtGrjEWl146E",
  authDomain: "my-highlights-logseq.firebaseapp.com",
  projectId: "my-highlights-logseq",
  storageBucket: "my-highlights-logseq.appspot.com",
  messagingSenderId: "1022062414783",
  appId: "1:1022062414783:web:faa3b34cfb12ba90b46f0a",
  measurementId: "G-Q6P2LN95Q4",
} as FirebaseOptions;

const firebaseContext = React.createContext<FirebaseContext>({});

export const FirebaseProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [remoteConfig, setRemoteConfig] = React.useState<RemoteConfig>();
  const [analytics, setAnalytics] = React.useState<Analytics>();
  const logseq = useLogseq();
  const userId = React.useMemo(() => {
    let user_id = logseq.settings.user_id;

    if (!user_id) {
      user_id = ulid();
      logseq.updateSettings({
        user_id,
      });
    }

    return user_id;
  }, [logseq]);

  const initFirebase = async () => {
    const app = initializeApp(firebaseConfig);
    const a = getAnalytics(app);
    setAnalyticsCollectionEnabled(a, true);
    setUserId(a,userId)
    setAnalytics(a);

    const rc = getRemoteConfig(app);
    await fetchAndActivate(rc)
    setRemoteConfig(rc);
  }

  React.useEffect(() => {
    initFirebase().then(() => console.info(`Firebase initialized`));
  }, []);

  return <firebaseContext.Provider value={{ remoteConfig, analytics, userId }} children={children} />;
}

export const useFirebase = () => React.useContext(firebaseContext);