import { AmazonSearchResult } from "../utils/parseAmazonSearchResults";
import { getBookId } from "./getBookId";

export type AnnotationType = 'Highlight' | 'Note' | 'Bookmark';

export interface KindleLocation {
  start: number;
  end?: number;
}

export interface KindleAnnotation {
  timestamp: Date;
  type?: AnnotationType;
  content?: string;
  page?: number;
  location?: KindleLocation;
}

export interface KindleBook extends BookMetadata {
  lastAnnotation: Date;
  bookId: string;
  annotations: Array<KindleAnnotation>;
}

interface BookMetadata extends Partial<AmazonSearchResult> {
  title: string;
  author?: string;
}

export const parseTitleLine = (titleLine: string) => {
  const title = titleLine.replace(/\([^)]+\)$/g, '').trim();
  const authorMatches = /\((?<author>[^)]+)\)$/g.exec(titleLine);

  let author = authorMatches?.groups?.["author"]?.trim();

  if (author === 'Unknown') {
    author = undefined;
  }

  return { title, author };
}

export const parseMetaLine = (metaLine: string): KindleAnnotation => {

  // TODO: Remove dependency on english keywords
  const typeRx = /^- Your\s(?<type>Note|Highlight|Bookmark)/;
  const pageRx = /page\s+(?<page>\d+)/;
  const locationRx = /Location\s+(?<start>\d+)(-(?<end>\d+))?/;
  const timestampRx = /Added on\s+(?<timestamp>.*)$/;

  const type = typeRx.exec(metaLine)?.groups?.['type'];

  const pageVal = pageRx.exec(metaLine)?.groups?.['page'];
  let page: number | undefined;

  if (pageVal) {
    page = parseInt(pageVal);
  }

  let location: KindleLocation | undefined;
  const locationVal = locationRx.exec(metaLine)?.groups;

  if (locationVal) {
    let start: number | undefined;
    let end: number | undefined;

    if (locationVal['start']) {
      start = parseInt(locationVal['start']);
    }

    if (locationVal['end']) {
      end = parseInt(locationVal['end']);
    }

    if (!start) {
      throw new Error(`Could not find start location in ${locationVal}`);
    }

    location = { start, end };
  }

  let timestamp = new Date();

  const timestampVal = timestampRx.exec(metaLine)?.groups?.['timestamp'];

  if (timestampVal) {
    timestamp = new Date(Date.parse(timestampVal));
  }

  return {
    type,
    page,
    timestamp,
    location,
  } as KindleAnnotation;
}

export const parseClipping = (clipping: string): KindleAnnotation & BookMetadata => {
  const lines = clipping.trim().split(/\n/);
  
  if (lines.length < 2) {
    throw new Error(`Could not parse clipping, not enough lines: ${clipping}`);
  }

  const title = parseTitleLine(lines.shift()!.trim());
  const metadata = parseMetaLine(lines.shift()!.trim());

  const content = lines.join('\n').trim();

  return {
    ...title,
    ...metadata,
    content
  };
}

export const parseKindleHighlights = (content: string): Array<KindleBook> => {
  const clippings = content.split(/^==========$/gm).filter(line => Boolean(line.trim())).map(parseClipping);
  return clippings.reduce((result, clipping) => {
    let book = result.find((b) => b.title === clipping.title && b.author === clipping.author);

    if (!book) {
      book = {
        title: clipping.title,
        author: clipping.author,
        annotations: [],
        lastAnnotation: clipping.timestamp,
        bookId: ""
      };
      book.bookId = getBookId(book);
      result.push(book);
    }

    if (book.lastAnnotation < clipping.timestamp) {
      book.lastAnnotation = clipping.timestamp;
    }

    book.annotations.push({
      content: clipping.content,
      location: clipping.location,
      timestamp: clipping.timestamp,
      type: clipping.type,
      page: clipping.page
    });

    return result;
  }, [] as Array<KindleBook>)
    // @ts-ignore
    .sort((a, b) => b.lastAnnotation - a.lastAnnotation);
}