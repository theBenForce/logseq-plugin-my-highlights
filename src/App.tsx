import React, { useRef } from "react";
import { useAppVisible } from "./hooks/useAppVisible";
import * as kc from '@hadynz/kindle-clippings';
import { BasicDialog, DialogAction, DialogActions, DialogHeader } from "./component/dialog/Basic";
import { HighlightIcon } from "./icons/logo";
import { ImportBooksDialog } from "./component/dialog/ImportBooks";
import { KindleLoginDialog } from "./component/dialog/KindleLogin";
import * as Sentry from '@sentry/react';
import { BrowserTracing } from "@sentry/tracing";

const SentryRelease = import.meta.env.VITE_SENTRY_RELEASE as string;
const SentryDsn = import.meta.env.VITE_SENTRY_DSN as string;
const SentryEnvironment = import.meta.env.VITE_SENTRY_ENVIRONEMT as string;
  
Sentry.init({
  dsn: SentryDsn,
  integrations: [new BrowserTracing()],
  environment: SentryEnvironment,
  release: SentryRelease,
  tracesSampleRate: 1.0,
});

function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const visible = useAppVisible();
  const [availableBooks, setAvailableBooks] = React.useState<Array<kc.Book> | null>(null);
  const [showImportBooks, setShowImportBooks] = React.useState<boolean>(false);
  const [showKindleLogin, setShowKindleLogin] = React.useState(false);
  Sentry.withScope(scope => scope.setTransactionName("MainDialog"))

  // const scrapeFromCloud = () => {
  //   modal.once('ready-to-show', () => {
  //     modal.setTitle('Connect your Amazon account to Logseq');
  //     modal.show();
  //   });

  //   modal.webContents.on('did-navigate', async (_event, url) => {
  //     if (url.startsWith("https://read.amazon.com")) {
  //       modal.close();
  //     }
  //   });

  //   modal.loadURL("https://read.amazon.com/notebook");
  // };

  const onFileSelected: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    console.info('Open File', event.target.files);

    if (!event.target.files?.length) {
      console.info(`No files selected`);
      return;
    }

    var reader = new FileReader();

    reader.onload = () => {
      console.info(`File loaded, parsing`);
      const rawRows = kc.readMyClippingsFile(reader.result as string);
      const books = kc.groupToBooks(rawRows);

      console.info(`Open select book dialog`);
      setAvailableBooks(books.reverse());
      setShowImportBooks(true);

      // @ts-ignore
      event.target.value = null;
    }

    console.info(`Reading file ${event.target.files[0]}`);
    reader.readAsText(event.target.files[0]);
  };

  const showOpenFile = () => {
    fileInputRef.current?.click();
  };

  const hideImportBooks = () => {
    setShowImportBooks(false);
  };

  const hideKindleLogin = () => {
    setShowKindleLogin(false);
  };

  const onShowKindleLogin = () => {
    // const w = window.open("https://read.amazon.com/notebook", "_empty");
    // if (w) {
    //   // @ts-ignore
    //   w.apis.on('did-navigate', (event, url) => console.info({ event, url }));
    //   w.addEventListener('load', (event) => {
    //     console.info(event);
    //   });
    //   debugger;
    //   w.location.replace('https://read.amazon.com/notebook?asin=B01FR3UWXE&contentLimitState=&');
    // }
    setShowKindleLogin(true);
  }

  if (visible) {
    return (
      <>
        <BasicDialog show onClose={() => window.logseq.hideMainUI()}>
          <input ref={fileInputRef} type="file" accept='.txt' onChange={onFileSelected} hidden />
          <DialogHeader title="Import Highlights" icon={<HighlightIcon />} trailing={<a href="https://www.buymeacoffee.com/theBenForce" target="_blank">
            <img src="https://cdn.buymeacoffee.com/buttons/v2/default-violet.png" alt="BuyMeACoffee" width="140" />
            </a>} />

          <DialogActions>
            <DialogAction onClick={showOpenFile} label="Load Clippings File" />
            <DialogAction onClick={onShowKindleLogin} label="Load From Cloud" />
          </DialogActions>
        </BasicDialog>

        <ImportBooksDialog show={showImportBooks} onClose={hideImportBooks} books={availableBooks ?? []} />
        <KindleLoginDialog show={showKindleLogin} onClose={hideKindleLogin} />
      </>
    );
  }
  return null;
}

export default App;
