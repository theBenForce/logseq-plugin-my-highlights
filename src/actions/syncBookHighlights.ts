
import { IBatchBlock, ILSPluginUser } from '@logseq/libs/dist/LSPlugin.user';
import hash from 'hash.js';
import { renderTemplate } from '../utils/renderTemplate';
import { createZettelId } from '../utils/zettelId';
import * as Sentry from '@sentry/react';
import { Transaction } from '@sentry/tracing';
import { blocksContainHighlight } from '../utils/containsHighlight';
import { AnnotationType, KindleBook } from '../utils/parseKindleHighlights';

export const createBookPageProperties = (title: string, book: KindleBook) => ({
  title,
  alias: `${book.title.replaceAll('/', '_').split(':')[0]} - Highlights`,
  author: book.author,
  last_sync: new Date().toISOString(),
  type: 'Book'
});

export const syncBookHighlights = async (book: KindleBook, logseq: ILSPluginUser, transaction?: Transaction) => {
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
    const zettel = createZettelId();
    let path = logseq.settings?.highlight_path ?? `highlights/{type}/{title}`;
    path = renderTemplate(path, {
      type: 'book',
      title: book.title,
      author: book.author ?? logseq.settings?.default_author ?? 'UnknownAuthor',
      zettel,
    });

    const updatePage = span?.startChild({
      op: 'updatePageBlock',
      description: 'Create/Update Page Block'
    });

    console.info(`Loading path ${path}`);
    // await goToPage(path, logseq);
    
    let page = await logseq.Editor.getPage(path, { includeChildren: true });
    
    if (!page) {
      console.info(`Creating new page`);
      page = await logseq.Editor.createPage(path, createBookPageProperties(path, book), {createFirstBlock: true});
      span?.setData('is_new', true);
    } else {
      const pageBlocksTree = await logseq.Editor.getPageBlocksTree(page!.name);
      const firstBlock = pageBlocksTree[0];

      await logseq.Editor.upsertBlockProperty(firstBlock.uuid, "last_sync", new Date().toISOString());
    }
    
    const pageBlocksTree = await logseq.Editor.getPageBlocksTree(page!.name);

    updatePage?.finish();

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