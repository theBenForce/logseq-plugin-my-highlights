import React from "react";
import { getBookId } from "../../utils/getBookId";
import { KindleBook } from "../../utils/parseKindleHighlights";
import fuzzy from 'fuzzy';

export interface BookSelectorParams {
  books: Array<KindleBook>;
  selectedBooks: Array<KindleBook>;
  setSelectedBooks: (books: Array<KindleBook>) => void;
}

export const BookSelector: React.FC<BookSelectorParams> = ({books, selectedBooks, setSelectedBooks}) => {
  const allChecked = React.useMemo(() => !books.some((book) => !selectedBooks.some((other) => getBookId(other) === getBookId(book))), [books, selectedBooks]);
  const [filterText, setFilterText] = React.useState("");
  const fitleredBooks = React.useMemo<Array<KindleBook>>(() => {
    if (!filterText?.trim()) {
      return books;
    }

    const results: Array<KindleBook> = [];

    for (const book of books) {
      const match = fuzzy.match(filterText, [book.title, book.author].join('\n'), {
        caseSensitive: false,
      });

      if (match?.score >= 0.8) {
        results.push(book);
      }
    }

    return results;
  }, [books, filterText]);

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

  const onFilterChanged: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setFilterText(event.target.value);
  };

  return <>
    <div className="px-4 flex gap-4">
    <input className="border rounded px-2 basis-4 grow" type="text" placeholder="Filter" value={filterText} onChange={onFilterChanged} />
    <div className="flex items-center gap-1 shrink">
      <input type='checkbox' id="chkAllSelected" checked={allChecked} onChange={onToggleAll} />
      <div className="truncate">All</div>
    </div>
      
      </div>
    <div className="p-4 pt-2 scroll-auto h-96 overflow-y-auto flex flex-col gap-1">
      {fitleredBooks.map((book) => <div className='border rounded flex flex-row grow items-center gap-1 px-2' key={book.bookId}>
        <input type='checkbox' checked={selectedBooks.some(other => getBookId(other) === getBookId(book))} onChange={onBookSelected(book)} />
        <div className="flex flex-col grow truncate" style={{flexGrow: 1}}>
          <div className="truncate text-lg">{book.display ?? book.title}</div>
          <div className="flex grow flex-row gap-1 justify-between">
            {book.authors && <div className="truncate text-sm flex-1 grow">{book.authors.join('; ')}</div>}
            <div className='text-sm'>Last Highlight {book.lastAnnotation.toLocaleDateString()}</div>
          </div>
        </div>
      </div>)}
  </div>
</>
};