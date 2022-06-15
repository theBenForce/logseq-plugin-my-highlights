import { ILSPluginUser } from "@logseq/libs/dist/LSPlugin";
import React from "react";
import { syncBookHighlights } from "../actions/syncBookHighlights";
import { KindleBook } from "../utils/parseKindleHighlights";
import { renderTemplate } from "../utils/renderTemplate";
import { createZettelId } from "../utils/zettelId";
import { DetailsSearchResult } from "./useBookDetailsSearch";
import { useLogseq } from "./useLogseq";

export const createBookPageProperties = (title: string, book: KindleBook) => ({
  title,
  alias: `${book.title.replaceAll('/', '_').split(':')[0]} - Highlights`,
  author: book.author,
  last_sync: new Date().toISOString(),
  type: 'Book'
});

interface GetBookPageParams { logseq: ILSPluginUser; book: KindleBook; createPage?: boolean; }

export async function getBookPage({ logseq, book, createPage = true }: GetBookPageParams) {
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
    if (!createPage) throw new Error(`Page not found`);
    console.info(`Creating new page`);
    page = await logseq.Editor.createPage(path, createBookPageProperties(path, book), { createFirstBlock: true });
  }

  const pageBlocksTree = await logseq.Editor.getPageBlocksTree(page!.name);

  return { pageBlocksTree, page };
}

export const useImportBooks = () => {
  const [isImporting, setIsImporting] = React.useState(false);
  const logseq = useLogseq();


  const importBooks = async (books: Array<KindleBook>) => {
    setIsImporting(true);

    try {
      for(const book of books) {
        await syncBookHighlights({
          book,
          logseq,
        });
      }
    } finally {
      setIsImporting(false);
    }
  }

  return { isImporting, importBooks };
}