
import * as kc from '@hadynz/kindle-clippings';
import { IBatchBlock, ILSPluginUser } from '@logseq/libs/dist/LSPlugin.user';
import { goToPage } from '../utils/goToPage';
import hash from 'hash.js';

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

    const blocks = book.annotations.sort((a, b) => (a.page?.from ?? 0) - (b.page?.from ?? 0)).reduce((updates, annotation) => {
      const hid = hash.sha224().update(JSON.stringify({ type: annotation.type, from: annotation.location?.from, to: annotation.location?.to })).digest('hex');

      // for (let i = 1; i < pageBlocksTree.length; i++) {
      //   if(pageBlocksTree[i])
      // }

      // @ts-ignore
      if (!pageBlocksTree.includes(blk => blk.properties.hid === hid)) {
        updates.push({
          content: `> ${annotation.content}
  
        ${annotation.note}`.trim(),
          properties: {
            hid,
          }
        } as IBatchBlock);
      }

      return updates;
    }, [] as Array<IBatchBlock>);

    await logseq.Editor.insertBatchBlock(targetBlock.uuid, blocks, {
      sibling: true
    });

  } catch (ex) {
    // @ts-ignore
    logseq.App.showMsg(ex.toString(), 'warning')
    console.error(ex)
  }
}