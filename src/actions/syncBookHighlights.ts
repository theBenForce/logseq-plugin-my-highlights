
import * as kc from '@hadynz/kindle-clippings';
import { IBatchBlock, ILSPluginUser } from '@logseq/libs/dist/LSPlugin.user';
import { goToPage } from '../utils/goToPage';
import hash from 'hash.js';
import { EntryType } from '@hadynz/kindle-clippings/dist/blocks/ParsedBlock';

export const createBookPageProperties = (book: kc.Book) => `title:: [[highlights/books/${book.title}]]
alias:: [[${book.title}]]
author:: "${book.author}"
last_sync:: ${new Date().toISOString()}
type:: Book
highlight_id:: ${hash.ripemd160().update('book').update(book.author).update(book.title).digest('hex')}`;

export const syncBookHighlights = async (book: kc.Book, logseq: ILSPluginUser) => {
  try {
    await goToPage(`highlights/books/${book.title}`, logseq);

    
    const page = await logseq.Editor.getCurrentPage();
    const pageBlocksTree = await logseq.Editor.getCurrentPageBlocksTree()
    
    let targetBlock = pageBlocksTree[0]!;
    
    if (!pageBlocksTree.length) {

      // @ts-ignore
      targetBlock = await logseq.Editor.insertBlock(page?.name, createBookPageProperties(book), { isPageBlock: true });
    } else {
      await logseq.Editor.updateBlock(targetBlock.uuid, createBookPageProperties(book))
    }

    

    function addContentBlock(content: string, type: EntryType, start?: number, page?: string) {
      const highlight_id = hash.sha224().update([type, start, content].filter(Boolean).join(':')).digest('hex');
      const icon = type === 'HIGHLIGHT' ? '📌' : type === 'NOTE' ? '📝' : type === 'BOOKMARK' ? '🎯' : '❓';

      return {
        content: `${icon} ${content}`,
        properties: {
          highlight_id,
          page,
        }
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