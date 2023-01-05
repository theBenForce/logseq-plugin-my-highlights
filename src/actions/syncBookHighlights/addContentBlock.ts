import { IBatchBlock } from "@logseq/libs/dist/LSPlugin.user";
import { hashValues } from "../../utils/hashValues";
import { AnnotationType } from "../../utils/parseKindleHighlights";

export function addContentBlock(content: string, type?: AnnotationType, start?: number, page?: number) {
  const highlight_id = hashValues([type?.toUpperCase(), start, content].filter(Boolean).join(':'));
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