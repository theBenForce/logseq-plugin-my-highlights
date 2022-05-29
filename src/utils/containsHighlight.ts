import { BlockEntity, BlockUUIDTuple } from "@logseq/libs/dist/LSPlugin";

export const blocksContainHighlight = (highlight_id: string, blocks: Array<BlockEntity>): boolean => {
  for (const block of blocks) {
    if (block.properties?.highlightId === highlight_id) return true;

    if (block.children?.length) {
      const result = blocksContainHighlight(highlight_id, block.children as Array<BlockEntity>);
      if (result) return true;
    }
  }

  return false;
}