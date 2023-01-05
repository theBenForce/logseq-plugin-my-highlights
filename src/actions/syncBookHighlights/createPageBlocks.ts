import { BlockEntity, IBatchBlock, ILSPluginUser, PageEntity } from "@logseq/libs/dist/LSPlugin.user";
import { blocksContainHighlight } from "../../utils/containsHighlight";
import { KindleBook } from "../../utils/parseKindleHighlights"
import { addContentBlock } from "./addContentBlock";


interface CreatePageBlocksParams {
  book: KindleBook;
  logseq: ILSPluginUser;
  page: PageEntity;
  pageBlocksTree: Array<BlockEntity>;
}

export const createPageBlocks = async ({book, logseq, page, pageBlocksTree}: CreatePageBlocksParams) => {
  console.info(`Creating blocks`);
    const blocks = book.annotations
      .sort((a, b) => (a.page ?? 0) - (b.page ?? 0))
      .reduce((updates, annotation) => {
      const content = annotation.content ?? '';
      const type = annotation.type;
      const start = annotation.location?.start;

      updates.push(addContentBlock(content, type, start, annotation.page));

      return updates;
      }, [] as Array<IBatchBlock>)
      .filter((b) => !blocksContainHighlight(b.properties?.highlight_id, pageBlocksTree));

    console.info(`Created ${blocks.length} blocks`);

    if (blocks.length) {
      for (const block of blocks) {
        await logseq.Editor.appendBlockInPage(page!.uuid, block.content, { properties: block.properties });
      }
    }
}