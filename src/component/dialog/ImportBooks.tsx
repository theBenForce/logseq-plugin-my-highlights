import React from 'react';
import * as kc from '@hadynz/kindle-clippings';
import { BasicDialog, DialogAction, DialogActions, DialogHeader } from './Basic';
import { syncBookHighlights } from '../../actions/syncBookHighlights';
import * as Sentry from '@sentry/react';

interface ImportBooksDialogProps {
  books: Array<kc.Book>;
  show?: boolean;
  onClose: () => void;
}

export const ImportBooksDialog: React.FC<ImportBooksDialogProps> = ({ books, show, onClose }) => {
  const [selectedBooks, setSelectedBooks] = React.useState<Array<string>>([]);

  const allChecked = React.useMemo(() => !books.some((book) => !selectedBooks.includes(book.title)), [books, selectedBooks]);

  React.useEffect(() => {
    const chkAllSelected = document.getElementById('chkAllSelected');
    if (!chkAllSelected) return;
    // @ts-ignore
    chkAllSelected.indeterminate = selectedBooks.length > 0 && selectedBooks.length < books.length;
  }, [books, selectedBooks])

  const onImportBooks = async () => {
    console.info(`onImportBooks`);
    const booksToImport = books.filter(({ title }) => selectedBooks.includes(title));
    const transaction = Sentry.startTransaction({
      name: 'onImportBooks',
      description: "Import highlights from Kindle My Clippings file",
      data: {
        books: booksToImport.length,
        available_books: books.length,
        source: 'kindle_clippings',
      }
    });
    Sentry.getCurrentHub().configureScope(scope => scope.setSpan(transaction));

    console.info(`Importing ${booksToImport.length} books`);
    for (const book of booksToImport) {
      try {
        // @ts-ignore
        await syncBookHighlights(book, window.logseq, transaction);
      } catch (ex) {
        Sentry.captureException(ex);
      }
    }

    console.info(`Done importing books`);

    transaction.finish();

    onClose();
  };

  const onBookSelected = (title: string): React.ChangeEventHandler<HTMLInputElement> => (event) => {
    if (event.target.checked && !selectedBooks.includes(title)) {
      setSelectedBooks([
        ...selectedBooks,
        title,
      ]);
    } else if (!event.target.checked && selectedBooks.includes(title)) {
      setSelectedBooks(selectedBooks.filter(t => t !== title));
    }
  };

  const onToggleAll = () => {
    if (!allChecked) {
      setSelectedBooks(books.map(({ title }) => title));
    } else {
      setSelectedBooks([]);
    }
  };
  
  if (show) {
    return <BasicDialog onClose={onClose}>
      <DialogHeader title='Import Book Highlights' />
      <div className="px-6 flex items-center gap-1">
        <input type='checkbox' id="chkAllSelected" checked={allChecked} onChange={onToggleAll} />
        <div className="truncate grow">All</div>
      </div>
      <div className="p-4 pt-2 scroll-auto h-96 overflow-y-auto flex flex-col gap-1">
        {books.map((book) => <div className='border rounded flex items-center gap-1 px-2' key={book.title}>
          <input type='checkbox' checked={selectedBooks.includes(book.title)} onChange={onBookSelected(book.title)} />
          <div className="flex-col grow truncate">
            <div className="truncate text-lg">{book.title}</div>
            {book.author && <div className="truncate text-sm">{book.author}</div>}
          </div>
        </div>)}
      </div>
      <DialogActions>
        <DialogAction label='Import' onClick={onImportBooks} />
      </DialogActions>
    </BasicDialog>;
  }

  return null;
}