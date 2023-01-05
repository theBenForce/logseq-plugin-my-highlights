import { IEditorProxy } from "@logseq/libs/dist/LSPlugin.user";
import { BookPageProperties } from "../../constants";
import { KindleBook } from "../../utils/parseKindleHighlights";

export const updateBookDetails = async ({ book, uuid, editor }: { book: KindleBook; uuid: string; editor: IEditorProxy }) => {
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

  const properties = await editor.getBlockProperties(uuid);
  const existingIds: Array<string> = properties.sourceBookIds ?? [];

  if (!existingIds?.includes(book.bookId)) {
    await editor.upsertBlockProperty(uuid, BookPageProperties.SourceBookIds, [...existingIds, book.bookId]);
  }
};