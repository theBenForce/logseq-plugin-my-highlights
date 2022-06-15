import { initializeApp } from 'firebase/app';
import { getRemoteConfig, fetchAndActivate } from "firebase/remote-config";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAxm9gaPjyfQ4MWXIxq00MNtGrjEWl146E",
  authDomain: "my-highlights-logseq.firebaseapp.com",
  projectId: "my-highlights-logseq",
  storageBucket: "my-highlights-logseq.appspot.com",
  messagingSenderId: "1022062414783",
  appId: "1:1022062414783:web:faa3b34cfb12ba90b46f0a",
  measurementId: "G-Q6P2LN95Q4"
};

const app = initializeApp(firebaseConfig);
export const remoteConfig = getRemoteConfig(app);
export const analytics = getAnalytics(app);

export const refreshConfig = () => fetchAndActivate(remoteConfig);
refreshConfig();