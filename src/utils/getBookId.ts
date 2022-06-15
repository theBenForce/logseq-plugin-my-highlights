import { KindleBook } from "./parseKindleHighlights";
import hash from 'hash.js';

export const getBookId = (book: KindleBook) => {
  const id = ['kindleBook', book.title, book.author].join('|');

  if (hash?.sha224) {
    return hash.sha224().update(id).digest('hex');
  }

  return id;
};