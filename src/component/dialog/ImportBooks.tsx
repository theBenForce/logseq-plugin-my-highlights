import * as Sentry from '@sentry/react';
import { Transaction } from '@sentry/tracing';
import React from 'react';
import { syncBookHighlights } from '../../actions/syncBookHighlights';
import { DetailsSearchResult } from '../../hooks/useBookDetailsSearch';
import { getBookPage, useImportBooks } from '../../hooks/useImportBooks';
import { useLogseq } from '../../hooks/useLogseq';
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
  const [selectedBooks, setSelectedBooks] = React.useState<Array<KindleBook>>([]);
  const { importBooks } = useImportBooks();
  const logseq = useLogseq();

  const setBookDetails = (bookId: string, details: DetailsSearchResult) => {
    const selectedBook = books.find(x => x.bookId === bookId)!;
    setSelectedBooks([
      ...selectedBooks.filter(x => x.bookId !== bookId),
      {
        ...selectedBook,
        ...details,
      }
    ]);
  }

  const pages = [
    <BookSelector books={books} setSelectedBooks={setSelectedBooks} selectedBooks={selectedBooks} />,
    <BookDetailsSelector books={selectedBooks} setBookDetails={setBookDetails} />
  ];

  const onImportBooks = async () => {
    console.info(`Import Books`);
    await importBooks(selectedBooks);
    onClose();
  }

  const onNextPage = async () => {
    const newBooks = await Promise.all(selectedBooks.map(async (book) => {
      const result = { ...book };

      try {
        const { pageBlocksTree } = await getBookPage({ logseq, book, createPage: false });
        const bookProps = await logseq.Editor.getBlockProperties(pageBlocksTree[0].uuid);

        if (bookProps.asin) {
          result.asin = bookProps.asin;
        }
      } catch (ex) {
        console.error(ex);
      }

      return result
    }));

    setSelectedBooks(newBooks);
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
          <DialogAction label='Import' onClick={onImportBooks} disabled={!selectedBooks.length} />
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
