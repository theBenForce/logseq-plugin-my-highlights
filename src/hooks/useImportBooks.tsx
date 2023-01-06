import { BlockEntity, IDBProxy, ILSPluginUser, PageEntity } from "@logseq/libs/dist/LSPlugin";
import React from "react";
import { syncBookHighlights } from "../actions/syncBookHighlights";
import { BookPageProperties } from "../constants";
import { KindleBook } from "../utils/parseKindleHighlights";
import { renderTemplate } from "../utils/renderTemplate";
import { createZettelId } from "../utils/zettelId";
import { useLogseq } from "./useLogseq";


export const nameToLink = ({ reverseNameOrder }: { reverseNameOrder?: boolean; } = {}) => (name: string): string => {
  let result = name;

  if (reverseNameOrder) {
    result = result.split(',').reverse().join(' ').trim();
  }
  
  return `[[${result}]]`;
};

export const createBookPageProperties = (title: string, book: KindleBook, reverseNameOrder: boolean) => ({
  title,
  author: book.authors?.map(nameToLink({ reverseNameOrder }))?.join(' '),
  last_sync: new Date(0).toISOString(),
  type: 'Book'
});

interface GetBookPageParams { logseq: ILSPluginUser; book: KindleBook; createPage?: boolean; }

const getPageByQuery = async (db: IDBProxy, query: string): Promise<PageEntity | null> => {
  const result = await db.q<BlockEntity>(query);

  if (!result?.length) {
    return null;
  }

  const block = result[0];
  return window.logseq.Editor.getPage(block.name, { includeChildren: true });
}

const getPageByAsin = async (db: IDBProxy, asin: string): Promise<PageEntity | null> => {
  console.info(`Getting page by asin`);
  return getPageByQuery(db, `(page-property asin "${asin}")`);
}

const getPageByBookId = async (db: IDBProxy, bookId: string): Promise<PageEntity | null> => {
  console.info(`Getting page by book id`);
  return getPageByQuery(db, `(page-property ${BookPageProperties.SourceBookIds} "${bookId}")`);
}

export async function getBookPage({ logseq, book, createPage = true }: GetBookPageParams) {
  const zettel = createZettelId();


  const path = renderTemplate(logseq.settings?.highlight_path ?? `highlights/{type}/{title}`, {
      type: 'book',
      title: book.title,
      author: book.authors?.[0] ?? logseq.settings?.default_author ?? 'UnknownAuthor',
      zettel,
    });

  console.info(`Loading path ${path}`);
  let page: PageEntity | null = null;
  
  try {
    page = await logseq.Editor.getPage(path, { includeChildren: true });
  } catch (ex) {
    console.error(ex);
  }

  if (!page) {
    page = await getPageByBookId(logseq.DB, book.bookId);
  }

  if (!page && book.asin) {
    page = await getPageByAsin(logseq.DB, book.asin);
  }

  if (!page) {
    // TODO: Try to find page with asin, then book id
    if (!createPage) throw new Error(`Page not found`);
    console.info(`Creating new page`);
    page = await logseq.Editor.createPage(path, createBookPageProperties(path, book, logseq.settings?.author_first_name_first), { createFirstBlock: true });
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