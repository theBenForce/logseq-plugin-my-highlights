import { KindleBook } from "./parseKindleHighlights";

export const getBookQuery = ({title, author}: KindleBook) => [title, author].filter(Boolean).join(' ');