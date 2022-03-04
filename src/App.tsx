import React, { useRef } from "react";
import { useAppVisible } from "./hooks/useAppVisible";
import * as kc from '@hadynz/kindle-clippings';
import { BasicDialog, DialogAction, DialogActions, DialogHeader } from "./component/dialog/Basic";
import { HighlightIcon } from "./icons/logo";
import { ImportBooksDialog } from "./component/dialog/ImportBooks";
import * as Sentry from '@sentry/react';
import { Transaction } from '@sentry/types';

const isDev = process.env.NODE_ENV === "development";
const SentryRelease = import.meta.env.VERSION as string;
const SentryDsn = import.meta.env.SENTRY_DSN as string;


function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const visible = useAppVisible();
  const [availableBooks, setAvailableBooks] = React.useState<Array<kc.Book> | null>(null);
  const [showImportBooks, setShowImportBooks] = React.useState<boolean>(false);
  const [transaction, setTransaction] = React.useState<Transaction | null>(null);

  React.useEffect(() => {
    Sentry.init({
      dsn: SentryDsn,
      integrations: [],
      environment: isDev ? 'dev' : 'prod',
      release: SentryRelease,
      tracesSampleRate: 1.0,
    });
  });
  
  React.useEffect(() => {
    if (transaction) {
      transaction.finish();
      setTransaction(null);
    }

    if (visible) {
      const t = Sentry.startTransaction({
        name: 'main-dialog',
      });
      
      Sentry.getCurrentHub().configureScope(scope => scope.setSpan(t));
      setTransaction(t);
    }
  }, [visible]);

  const onFileSelected: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    console.info('Open File', event.target.files);

    if (!event.target.files?.length) {
      return;
    }

    var reader = new FileReader();

    reader.onload = () => {
      const rawRows = kc.readMyClippingsFile(reader.result as string);
      const books = kc.groupToBooks(rawRows);
      setAvailableBooks(books.reverse());
      setShowImportBooks(true);

      // @ts-ignore
      event.target.value = null;
    }

    reader.readAsText(event.target.files[0]);
  };

  const showOpenFile = () => {
    fileInputRef.current?.click();
  };

  const hideImportBooks = () => {
    setShowImportBooks(false);

  }

  if (visible) {
    return (
      <>
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
