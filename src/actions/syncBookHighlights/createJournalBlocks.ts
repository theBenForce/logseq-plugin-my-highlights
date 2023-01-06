import { ILSPluginUser, PageEntity } from "@logseq/libs/dist/LSPlugin.user";
import { KindleAnnotation, KindleBook } from "../../utils/parseKindleHighlights";
import { format } from "date-fns";


interface CreatePageBlocksParams {
  book: KindleBook;
  logseq: ILSPluginUser;
  page: PageEntity;
}

export const getDateLabel = async (logseq: ILSPluginUser, date: Date): Promise<string> => {
  const configs = await logseq.App.getUserConfigs();
  const preferredDateFormat = configs.preferredDateFormat ?? 'yyyy-MM-DD';

  return format(date, preferredDateFormat);
}

export const createJournalBlocks = async ({ book, logseq, page }: CreatePageBlocksParams) => {
  console.info(`Creating journal blocks`);
  const dateBlocks = new Map<string, Array<KindleAnnotation>>();
  const lastSync = new Date(page.properties?.lastSync ?? 0);

  await Promise.all(book.annotations
    .filter((annotation) => annotation.timestamp.valueOf() > lastSync.valueOf())
    .sort((a, b) => (a.timestamp?.valueOf() ?? 0) - (b.timestamp?.valueOf() ?? 0))
    .map(async (annotation) => {
      const dateLabel = await getDateLabel(logseq, annotation.timestamp);

      if (!dateBlocks.has(dateLabel)) {
        dateBlocks.set(dateLabel, []);
      }

      dateBlocks.get(dateLabel)!.push(annotation);
    }));

  console.info(`Created ${dateBlocks.size} blocks`);

  for (const dateLabel of dateBlocks.keys()) {
    let journalPage = await logseq.Editor.getPage(dateLabel);

    if (journalPage == null) {
      console.info(`Creating journal page for ${dateLabel}`);
      journalPage = await logseq.Editor.createPage(dateLabel, {}, { journal: true, redirect: false });
    }

    const bookBlock = await logseq.Editor.appendBlockInPage(journalPage!.uuid, `[[${page.originalName}]]`, {
      properties: {
        collapsed: true
      }
    });

    if (!bookBlock) {
      throw new Error(`Could not create a book block for date`);
      
    }

    for (const a of dateBlocks.get(dateLabel)!) {
      await logseq.Editor.insertBlock(bookBlock!.uuid, [a.content, `#${a.type}`].join('\n'));
    }
  }
}