import { KindleBook } from "./parseKindleHighlights";
import { hashValues } from "./hashValues";

export const getBookId = (book: KindleBook) => {
  const id = ['kindleBook', book.title, book.author ?? book.authors?.join(';')].join('|');

  return hashValues(id);
};