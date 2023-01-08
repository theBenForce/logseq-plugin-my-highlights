import { logEvent } from "firebase/analytics";
import React from 'react';
import { useBookDetailsSearch } from '../../hooks/useBookDetailsSearch';
import { useConfigFlag } from "../../hooks/useFeatureFlag";
import { useFirebase } from "../../hooks/useFirebase";
import { getBookQuery } from '../../utils/getBookQuery';
import { AmazonSearchResult } from "../../utils/parseAmazonSearchResults";
import { KindleBook } from "../../utils/parseKindleHighlights";

export interface BookDetailsSelectorProps {
  books: Array<KindleBook>;
  setBookDetails: (bookId: string, details: AmazonSearchResult) => void;
}

export const BookDetailsSelector: React.FC<BookDetailsSelectorProps> = ({ books, setBookDetails }) => {
  const [selectedBook, setSelectedBook] = React.useState<KindleBook>(books[0]);
  const { analytics } = useFirebase();
  const [searchQuery, setSearchQuery] = React.useState("");
  const { results: searchResults, search, isBusy: isSearching } = useBookDetailsSearch();

  const amazonAssociateTag = useConfigFlag('amazonAssociateTag');

  React.useEffect(() => {
    onSearch(getBookQuery(selectedBook));
  }, []);

  React.useEffect(() => {
    onSearch(getBookQuery(selectedBook));
  }, [selectedBook]);

  const onSelectBook = (book: KindleBook) => () => {
    logEvent(analytics!, 'search', {
      search_term: [book.title, ...(book.authors ?? [])].filter(Boolean).join(' ')
    });

    setSelectedBook(book);
  };

  const onSearch = (query?: string) => {
    if (query) {
      setSearchQuery(query);
    }

    search(query ?? searchQuery);
  }

  const onSelectDetails = (book: AmazonSearchResult) => () => {
    setBookDetails(selectedBook.bookId, book);
  }


  return <div className='flex flex-row gap-4 p-4'>
    <div className='basis-1/3 flex flex-col scroll-auto h-96 overflow-y-auto gap-2'>
      {books.map(book => <div className={`border rounded flex flex-row grow items-center gap-2 px-2 ${book.bookId === selectedBook.bookId ? 'bg-emerald-200' : ''}`} key={book.bookId} onClick={onSelectBook(book)}>
          <div className="flex flex-col grow truncate">
            <div className="truncate text-lg">{book.title}</div>
            <div className="flex grow flex-row gap-1 justify-between">
              {book.authors && <div className="truncate text-sm flex-1 grow">{book.authors.join('; ')}</div>}
              <div className='text-sm'>Last Highlight {book.lastAnnotation.toLocaleDateString()}</div>
            </div>
          </div>
        </div>)}
    </div>
    <div className='basis-2/3 flex flex-col gap-4'>
      <div className='flex flex-row gap-4'>
        {/* @ts-ignore */}
        <input onChange={(e) => setSearchQuery(e.target.value)} type="text" className='flex-grow border rounded px-2' value={searchQuery} />
        <button onClick={() => onSearch()}>Search</button>
      </div>
      {isSearching && <progress />}
        <div className='grid grid-cols-3 gap-4 scroll-auto h-96 overflow-y-auto p-4'>
        {searchResults.map(book => <div key={book.asin} className={`border rounded flex flex-col w-full ${book.asin === selectedBook.asin ? 'bg-emerald-200' : ''}`} onClick={onSelectDetails(book)}>
        <img src={book.imageUrl} className='w-full' />
        <div className='px-2 flex flex-col w-full'>
        <div className='text-lg'>{book.title}</div>
        <div className='text-sm'>{book.author}</div>
          <div className='text-sm'><a href={`https://amazon.com${book.productPath}?tag=${amazonAssociateTag}`} target="_blank" rel="noreferrer">View Book</a></div>
          </div>
      </div>)}
      </div>
    </div>
  </div>;
}
