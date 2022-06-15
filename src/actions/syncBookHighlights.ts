
import { IBatchBlock, IEditorProxy, ILSPluginUser } from '@logseq/libs/dist/LSPlugin.user';
import * as Sentry from '@sentry/react';
import { Transaction } from '@sentry/tracing';
import hash from 'hash.js';
import { getBookPage } from '../hooks/useImportBooks';
import { blocksContainHighlight } from '../utils/containsHighlight';
import { AnnotationType, KindleBook } from '../utils/parseKindleHighlights';


interface SyncBookHighlightsParams {
  book: KindleBook;
  logseq: ILSPluginUser;
  transaction?: Transaction;
}

const updateBookDetails = async ({ book, uuid, editor }: { book: KindleBook; uuid: string; editor: IEditorProxy }) => {
  await Promise.all(["asin", "author", "published"].map(async (key) => {
    // @ts-ignore
    if (!book[key]) {
      return;
    }

    // @ts-ignore
    await editor.upsertBlockProperty(uuid, key, book[key]);
  }));

  if (book.asin) {
    await editor.upsertBlockProperty(uuid, "read", `[View on Kindle](https://read.amazon.com/reader?asin=${book.asin})`);
  }

  if (book.imageUrl) {
    await editor.upsertBlockProperty(uuid, 'cover', `![${book.title}](${book.imageUrl})`);
  }
};

export const syncBookHighlights = async ({book, logseq, transaction}: SyncBookHighlightsParams) => {
  console.info(`Importing from ${book.title}`);
  const span = transaction?.startChild({
    op: "syncBookHighlights",
    description: "Import highlights from Kindle My Clippings file",
    data: {
      highlights: book.annotations.length,
      source: 'kindle_clippings',
      'is_new': true
    }
  });

  try {
    const { page, pageBlocksTree } = await getBookPage(logseq, book);
  const firstBlock = pageBlocksTree[0];

  await logseq.Editor.upsertBlockProperty(firstBlock.uuid, "last_sync", new Date().toISOString());

    function addContentBlock(content: string, type: AnnotationType, start?: number, page?: number) {
      const highlight_id = hash.sha224().update([type.toUpperCase(), start, content].filter(Boolean).join(':')).digest('hex');
      const icon = type === 'Highlight' ? '📌' : type === 'Note' ? '📝' : type === 'Bookmark' ? '🎯' : '❓';

      const properties: Record<string, unknown> = { highlight_id };

      if (page) {
        properties.page = page;
      }

      return {
        content: `${icon} ${content}`,
        properties,
      } as IBatchBlock;
    }

    const createHighlightBlocks = span?.startChild({
      op: 'createHighlightBlocks',
      description: 'Create Blocks',
      data: {
        annotations: book.annotations.length,
      }
    });

    console.info(`Creating blocks`);
    let blocks = book.annotations
      .sort((a, b) => (a.page ?? 0) - (b.page ?? 0))
      .reduce((updates, annotation) => {
      const content = annotation.content ?? '';
      const type = annotation.type;
      const start = annotation.location?.start;
      const page = annotation.page;

      updates.push(addContentBlock(content, type, start, page));

      return updates;
      }, [] as Array<IBatchBlock>)
      .filter((b) => !blocksContainHighlight(b.properties?.highlight_id, pageBlocksTree));

    createHighlightBlocks?.setData('blocks', blocks.length).finish();
    console.info(`Created ${blocks.length} blocks`);

    if (blocks.length) {
      const insertBlocks = span?.startChild({
        op: 'insertBlocks',
        description: 'Insert Blocks',
        data: {
          blocks: blocks.length
        }
      });

      for (const block of blocks) {
        await logseq.Editor.appendBlockInPage(page!.uuid, block.content, { properties: block.properties });
      }

      insertBlocks?.finish();
    }


    span?.setStatus('ok');
    console.info(`Done importing ${book.title}`);
  } catch (ex) {
    console.error(`Error importing ${book.title}`, ex);
    Sentry.captureException(ex);
    // @ts-ignore
    logseq.App.showMsg(ex.toString(), 'warning');
    span?.setStatus('unknown_error');
  } finally {
    span?.finish();
  }
}
