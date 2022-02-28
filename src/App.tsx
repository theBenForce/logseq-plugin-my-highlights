import React, { useRef } from "react";
import { useAppVisible } from "./utils";
import * as kc from '@hadynz/kindle-clippings';
import { BasicDialog, DialogAction, DialogActions, DialogHeader } from "./component/dialog/Basic";
import { HighlightIcon } from "./icons/logo";
import { ImportBooksDialog } from "./component/dialog/ImportBooks";

function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const visible = useAppVisible();
  const [availableBooks, setAvailableBooks] = React.useState<Array<kc.Book> | null>(null);
  const [showImportBooks, setShowImportBooks] = React.useState<boolean>(false);

  const onFileSelected: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    console.info('Open File', event.target.files);

    if (!event.target.files?.length) {
      return;
    }

    var reader = new FileReader();

    reader.onload = () => {
      const rawRows = kc.readMyClippingsFile(reader.result as string);
      const books = kc.groupToBooks(rawRows);
      setAvailableBooks(books);
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
          <input ref={fileInputRef} type="file" onChange={onFileSelected} hidden />
          <DialogHeader title="Import Highlights" icon={<HighlightIcon />} />

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
