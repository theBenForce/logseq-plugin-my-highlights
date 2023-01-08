import React from 'react';
import { useFeatureFlag } from '../../hooks/useFeatureFlag';
import { getBookPage, useImportBooks } from '../../hooks/useImportBooks';
import { useLogseq } from '../../hooks/useLogseq';
import { AmazonSearchResult } from '../../utils/parseAmazonSearchResults';
import { KindleBook } from '../../utils/parseKindleHighlights';
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
  const isDetailsSelectorEnabled = useFeatureFlag('details_selector');

  const setBookDetails = (bookId: string, details: AmazonSearchResult) => {
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
    <BookSelector key="BookSelector" books={books} setSelectedBooks={setSelectedBooks} selectedBooks={selectedBooks} />,
    isDetailsSelectorEnabled && <BookDetailsSelector key="BookDetailsSelector" books={selectedBooks} setBookDetails={setBookDetails} />
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
          {currentPage > 0 && <DialogAction label='Back' onClick={onPreviousPage} disabled={currentPage <= 0} />}
          {currentPage < pages.length - 1 && <DialogAction label='Next' onClick={onNextPage} disabled={currentPage === pages.length - 1} />}
          <DialogAction label='Import' onClick={onImportBooks} disabled={!selectedBooks.length} />
      </DialogActions>
      </BasicDialog>
      </>;
  }

  return null;
}
