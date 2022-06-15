import * as Sentry from '@sentry/react';
import { Transaction } from '@sentry/tracing';
import React from 'react';
import { syncBookHighlights } from '../../actions/syncBookHighlights';
import { DetailsSearchResult } from '../../hooks/useBookDetailsSearch';
import { KindleBook } from '../../utils/parseKindleHighlights';
import { pause } from '../../utils/pause';
import { BookSelector } from '../pages/BookSelector';
import { BookDetailsSelector } from '../pages/SelectBookDetails';
import { BasicDialog, DialogAction, DialogActions, DialogHeader } from './Basic';

interface ImportBooksDialogProps {
  books: Array<KindleBook>;
  show?: boolean;
  onClose: () => void;
}




export const ImportBooksDialog: React.FC<ImportBooksDialogProps> = ({ books, show, onClose }) => {
  const [currentPage, setCurrentStep] = React.useState(0);
  const [isReadyForImport, setReadyForImport] = React.useState(false);
  const [selectedBooks, setSelectedBooks] = React.useState<Array<KindleBook>>([]);

  const pages = [
    <BookSelector books={books} setSelectedBooks={setSelectedBooks} selectedBooks={selectedBooks} />,
    <BookDetailsSelector books={selectedBooks} />
  ];

  const onImportBooks = () => {
    console.info(`Import Books`);
    onClose();
  }

  const onNextPage = () => {
    setCurrentStep(currentPage + 1);
  };

  const onPreviousPage = () => {
    setCurrentStep(Math.min(currentPage - 1, 0));
  };
  
  if (show) {

    return <>
      <BasicDialog onClose={onClose}>
      <DialogHeader title='Import Book Highlights' />
        {pages[currentPage]}
        <DialogActions>
          <DialogAction label='Back' onClick={onPreviousPage} disabled={currentPage <= 0} />
          <DialogAction label='Next' onClick={onNextPage} disabled={currentPage === pages.length - 1} />
          <DialogAction label='Import' onClick={onImportBooks} disabled={!isReadyForImport} />
      </DialogActions>
      </BasicDialog>
      </>;
  }

  return null;
}



async function importBooks(booksToImport: KindleBook[], books: KindleBook[]) {
  const transaction = Sentry.startTransaction({
    name: 'onImportBooks',
    description: "Import highlights from Kindle My Clippings file",
    data: {
      books: booksToImport.length,
      available_books: books.length,
      source: 'kindle_clippings',
    }
  }) as Transaction;
  Sentry.getCurrentHub().configureScope(scope => scope.setSpan(transaction));
  for (const book of booksToImport) {
    try {
      // @ts-ignore
      await syncBookHighlights({
        book,
        transaction,
        logseq: window.logseq
      });
    } catch (ex) {
      console.error(ex);
      Sentry.captureException(ex);
    }
  }

  transaction.finish();
}
