import { ILSPluginUser } from "@logseq/libs/dist/LSPlugin";
import React from "react";
import { KindleBook } from "../utils/parseKindleHighlights";
import { renderTemplate } from "../utils/renderTemplate";
import { createZettelId } from "../utils/zettelId";
import { DetailsSearchResult } from "./useBookDetailsSearch";

export const createBookPageProperties = (title: string, book: KindleBook) => ({
  title,
  alias: `${book.title.replaceAll('/', '_').split(':')[0]} - Highlights`,
  author: book.author,
  last_sync: new Date().toISOString(),
  type: 'Book'
});

export async function getBookPage(logseq: ILSPluginUser, book: KindleBook) {
  const zettel = createZettelId();
  let path = logseq.settings?.highlight_path ?? `highlights/{type}/{title}`;
  path = renderTemplate(path, {
    type: 'book',
    title: book.title,
    author: book.author ?? logseq.settings?.default_author ?? 'UnknownAuthor',
    zettel,
  });

  console.info(`Loading path ${path}`);
  let page = await logseq.Editor.getPage(path, { includeChildren: true });

  if (!page) {
    console.info(`Creating new page`);
    page = await logseq.Editor.createPage(path, createBookPageProperties(path, book), { createFirstBlock: true });
  }

  const pageBlocksTree = await logseq.Editor.getPageBlocksTree(page!.name);

  return { pageBlocksTree, page };
}

interface UseImportBooksParams {
  books: Array<KindleBook>;
}

export const useImportBooks = ({ books }: UseImportBooksParams) => {
  const [isImporting, setIsImporting] = React.useState(false);


  const importBooks = (books: Array<KindleBook>) => {
    setIsImporting(true);

    try {

    } finally {
      setIsImporting(false);
    }
  }

  return { isImporting, importBooks };
}