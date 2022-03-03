
import * as kc from '@hadynz/kindle-clippings';
import { IBatchBlock, ILSPluginUser } from '@logseq/libs/dist/LSPlugin.user';
import { goToPage } from '../utils/goToPage';
import hash from 'hash.js';
import { EntryType } from '@hadynz/kindle-clippings/dist/blocks/ParsedBlock';
import { renderTemplate } from '../utils/renderTemplate';
import { createZettelId } from '../utils/zettelId';

export const createBookPageProperties = (title: string, book: kc.Book) => `title:: [[${title}]]
alias:: ${book.title.replaceAll('/', '_').split(':')[0]}
author:: "${book.author}"
last_sync:: ${new Date().toISOString()}
type:: Book`;

export const syncBookHighlights = async (book: kc.Book, logseq: ILSPluginUser) => {
  try {
    const zettel = createZettelId();
    let path = logseq.settings?.highlight_path ?? `highlights/{type}/{title}`;
    path = renderTemplate(path, {
      type: 'book',
      title: book.title,
      zettel,
    });

    await goToPage(path, logseq);
    
    const page = await logseq.Editor.getCurrentPage();
    const pageBlocksTree = await logseq.Editor.getCurrentPageBlocksTree()
    
    let targetBlock = pageBlocksTree[0]!;
    
    if (!pageBlocksTree.length) {

      // @ts-ignore
      targetBlock = await logseq.Editor.insertBlock(page?.name, createBookPageProperties(path, book), { isPageBlock: true });
    } else {
      await logseq.Editor.updateBlock(targetBlock.uuid, createBookPageProperties(path, book))
    }

    

    function addContentBlock(content: string, type: EntryType, start?: number, page?: string) {
      const highlight_id = hash.sha224().update([type, start, content].filter(Boolean).join(':')).digest('hex');
      const icon = type === 'HIGHLIGHT' ? '📌' : type === 'NOTE' ? '📝' : type === 'BOOKMARK' ? '🎯' : '❓';

      const properties: Record<string, unknown> = { highlight_id };

      if (page) {
        properties.page = page;
      }

      return {
        content: `${icon} ${content}`,
        properties,
      } as IBatchBlock;
    }

    let blocks = book.annotations.sort((a, b) => (a.page?.from ?? 0) - (b.page?.from ?? 0)).reduce((updates, annotation) => {
      const content = annotation.content;
      const type = annotation.type;
      const start = annotation.location?.from;
      const page = annotation.page?.display;

      updates.push(addContentBlock(content, type, start, page));

      if (annotation.note) {
        updates.push(addContentBlock(annotation.note, 'NOTE', start, page));
      }

      return updates;
    }, [] as Array<IBatchBlock>);

    for (const block of pageBlocksTree) {
      blocks = blocks.filter((b) => b.properties?.highlight_id !== block.properties?.highlightId);
    }

    if (blocks.length) {
      await logseq.Editor.insertBatchBlock(targetBlock.uuid, blocks, {
        sibling: true
      });
    }

  } catch (ex) {
    // @ts-ignore
    logseq.App.showMsg(ex.toString(), 'warning')
    console.error(ex)
  }
}