import "@logseq/libs";
import "virtual:windi.css";

import React from "react";
import {createRoot} from "react-dom/client";
import App from "./App";

import { logseq as PL } from "../package.json";
import { SettingsSchema } from "./settingsSchema";
import { FirebaseProvider } from "./hooks/useFirebase";


const isDev = process.env.NODE_ENV === "development";

// @ts-expect-error
const css = (t, ...args) => String.raw(t, ...args);
const magicKey = `__${PL.id}__loaded__`;

function main() {
  const pluginId = logseq.baseInfo.id;
  console.info(`#${pluginId}: MAIN`);
  const container = document.getElementById("app");
  const root = createRoot(container!);
  root.render(
    <React.StrictMode>
      
      <FirebaseProvider>
        <App />
        </FirebaseProvider>
    </React.StrictMode>,
    
  );

  function createModel() {
    return {
      show() {
        logseq.showMainUI();
      },
    };
  }

  logseq.useSettingsSchema(SettingsSchema);

  logseq.provideModel(createModel());
  logseq.setMainUIInlineStyle({
    zIndex: 11,
  });

  const openIconName = [`my-highlights-open`, isDev && 'dev'].filter(Boolean).join('-');

  if (isDev) {
    // @ts-expect-error
    top[magicKey] = true;
  }

  const fillColor = isDev ? "red" : "var(--ls-icon-color)";
  
  logseq.provideStyle(css`
    .${openIconName} {
      width: 32px !important;
    }

    .${openIconName} > svg {
      width: 100%;
    }

    .${openIconName} > svg > path {
      fill: ${fillColor};
    }
  `);


  // TODO: Use themify icons? https://themify.me/themify-icons
  logseq.App.registerUIItem('toolbar', {
    key: openIconName,
    template: `<a data-on-click="show" class="button ${openIconName}">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path stroke="black" strokeWidth="4pt" d="M143.1 320V248.3C143.1 233 151.2 218.7 163.5 209.6L436.6 8.398C444 2.943 452.1 0 462.2 0C473.6 0 484.5 4.539 492.6 12.62L547.4 67.38C555.5 75.46 559.1 86.42 559.1 97.84C559.1 107 557.1 115.1 551.6 123.4L350.4 396.5C341.3 408.8 326.1 416 311.7 416H239.1L214.6 441.4C202.1 453.9 181.9 453.9 169.4 441.4L118.6 390.6C106.1 378.1 106.1 357.9 118.6 345.4L143.1 320zM489.4 99.92L460.1 70.59L245 229L330.1 314.1L489.4 99.92zM23.03 466.3L86.06 403.3L156.7 473.9L125.7 504.1C121.2 509.5 115.1 512 108.7 512H40C26.75 512 16 501.3 16 488V483.3C16 476.1 18.53 470.8 23.03 466.3V466.3z"/></svg>
    </div>`,
  });
}

// @ts-expect-error
if (isDev && top[magicKey]) {
  // Currently there is no way to reload plugins
  location.reload();
} else {
  logseq.ready(main).catch(console.error);
}
