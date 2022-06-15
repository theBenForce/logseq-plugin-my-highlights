import React from "react";
import { getBookId } from "../../utils/getBookId";
import { KindleBook } from "../../utils/parseKindleHighlights";

export interface BookSelectorParams {
  books: Array<KindleBook>;
  selectedBooks: Array<KindleBook>;
  setSelectedBooks: (books: Array<KindleBook>) => void;
}

export const BookSelector: React.FC<BookSelectorParams> = ({books, selectedBooks, setSelectedBooks}) => {
  const allChecked = React.useMemo(() => !books.some((book) => !selectedBooks.some((other) => getBookId(other) === getBookId(book))), [books, selectedBooks]);
  

  React.useEffect(() => {
    const chkAllSelected = document.getElementById('chkAllSelected');
    if (!chkAllSelected) return;
    // @ts-ignore
    chkAllSelected.indeterminate = selectedBooks.length > 0 && selectedBooks.length < books.length;
  }, [books, selectedBooks])

  const onBookSelected = (book: KindleBook): React.ChangeEventHandler<HTMLInputElement> => (event) => {
    const bookId = getBookId(book);

    if (event.target.checked && !selectedBooks.some(other => getBookId(other) === bookId)) {
      setSelectedBooks([
        ...selectedBooks,
        book,
      ]);
    } else if (!event.target.checked && selectedBooks.some(other => getBookId(other) === bookId)) {
      setSelectedBooks(selectedBooks.filter(other => getBookId(other) !== bookId));
    }
  };

  const onToggleAll = () => {
    if (!allChecked) {
      setSelectedBooks(books);
    } else {
      setSelectedBooks([]);
    }
  };

  return <>
  <div className="px-6 flex items-center gap-1">
        <input type='checkbox' id="chkAllSelected" checked={allChecked} onChange={onToggleAll} />
        <div className="truncate grow">All</div>
      </div>
      <div className="p-4 pt-2 scroll-auto h-96 overflow-y-auto flex flex-col gap-1">
        {books.map((book) => <div className='border rounded flex flex-row grow items-center gap-1 px-2' key={book.title}>
          <input type='checkbox' checked={selectedBooks.some(other => getBookId(other) === getBookId(book))} onChange={onBookSelected(book)} />
          <div className="flex flex-col grow truncate" style={{flexGrow: 1}}>
            <div className="truncate text-lg">{book.title}</div>
            <div className="flex grow flex-row gap-1 justify-between">
              {book.author && <div className="truncate text-sm flex-1 grow">{book.author}</div>}
              <div className='text-sm'>Last Highlight {book.lastAnnotation.toLocaleDateString()}</div>
            </div>
          </div>
        </div>)}
    </div>
  </>
};