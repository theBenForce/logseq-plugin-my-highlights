import { KindleBook } from "./parseKindleHighlights";
import hash from 'hash.js';

export const getBookId = (book: KindleBook) => hash.sha224().update(['kindleBook', book.title, book.author].join('|')).digest('hex');