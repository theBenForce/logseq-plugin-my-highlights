import React, { useRef } from "react";
import { useAppVisible } from "./hooks/useAppVisible";
import { KindleBook, parseKindleHighlights } from "./utils/parseKindleHighlights";
import { BasicDialog, DialogAction, DialogActions, DialogHeader } from "./component/dialog/Basic";
import { HighlightIcon } from "./icons/logo";
import { ImportBooksDialog } from "./component/dialog/ImportBooks";
import * as Sentry from '@sentry/react';
import { BrowserTracing } from "@sentry/tracing";
import { useFirebase } from "./hooks/useFirebase";
import { logEvent } from "firebase/analytics";

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
  const [availableBooks, setAvailableBooks] = React.useState<Array<KindleBook> | null>(null);
  const [showImportBooks, setShowImportBooks] = React.useState<boolean>(false);
  Sentry.withScope(scope => scope.setTransactionName("MainDialog"))
  const { analytics } = useFirebase();

  React.useEffect(() => {
    if (visible && analytics) {
      // @ts-ignore
      logEvent(analytics, 'screen_view', {
        firebase_screen: 'Import Dialog'
      });
    }
  }, [visible, analytics]);

  const onFileSelected: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    console.info('Open File', event.target.files);

    if (!event.target.files?.length) {
      console.info(`No files selected`);
      return;
    }

    var reader = new FileReader();

    reader.onload = () => {
      console.info(`File loaded, parsing`);
      const books = parseKindleHighlights(reader.result as string);

      console.info(`Open select book dialog`);
      setAvailableBooks(books);
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

  }

  if (visible) {
    return (<>
        <BasicDialog onClose={() => window.logseq.hideMainUI()}>
          <input ref={fileInputRef} type="file" accept='.txt' onChange={onFileSelected} hidden />
          <DialogHeader title="Import Highlights" icon={<HighlightIcon />} trailing={<a href="https://www.buymeacoffee.com/theBenForce" target="_blank">
            <img src="https://cdn.buymeacoffee.com/buttons/v2/default-violet.png" alt="BuyMeACoffee" width="140" />
            </a>} />

          <DialogActions>
            <DialogAction onClick={showOpenFile} label="Load Clippings File" />
          </DialogActions>
        </BasicDialog>

      <ImportBooksDialog show={showImportBooks} onClose={hideImportBooks} books={availableBooks ?? []} />
      </>
    );
  }
  return null;
}

export default App;
