
import { ILSPluginUser } from '@logseq/libs/dist/LSPlugin.user';
import * as Sentry from '@sentry/react';
import { getBookPage } from '../../hooks/useImportBooks';
import { KindleBook } from '../../utils/parseKindleHighlights';
import { createJournalBlocks } from './createJournalBlocks';
import { createPageBlocks } from './createPageBlocks';
import { updateBookDetails } from './updateBookDetails';


interface SyncBookHighlightsParams {
  book: KindleBook;
  logseq: ILSPluginUser;
}

export const syncBookHighlights = async ({book, logseq}: SyncBookHighlightsParams) => {
  console.info(`Importing from ${book.title}`);

  try {
    const { page, pageBlocksTree } = await getBookPage({ logseq, book });
    const firstBlock = pageBlocksTree[0];

    if(page === null) throw new Error('Could not find page');

    if (logseq.settings?.highlight_location === "journal") {
      await createJournalBlocks({
        page: page!,
        book,
        logseq
      })
    } else {
      await createPageBlocks({
        page: page!, pageBlocksTree, book, logseq
      });
    }

    await logseq.Editor.upsertBlockProperty(firstBlock.uuid, "last_sync", new Date().toISOString());
    await updateBookDetails({
      book, uuid: firstBlock.uuid, editor: logseq.Editor
    });

    console.info(`Done importing ${book.title}`);
  } catch (ex) {
    console.error(`Error importing ${book.title}`, ex);
    Sentry.captureException(ex);
    // @ts-ignore
    logseq.UI.showMsg(ex.toString(), 'warning');
  }
}
