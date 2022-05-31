
export interface KindleHighlight {
  timestamp: Date;
  type: 'Highlight' | 'Note' | 'Bookmark';
  content?: string;
  page?: number;
  location: {
    start: number;
    end?: number;
  }
}

export interface KindleBook extends BookMetadata {
  lastHighlight: Date;
  highlights: Array<KindleHighlight>;
}

interface BookMetadata {
  title: string;
  author?: string;
}

const SEPARATOR = '\n==========\n';

export const parseTitleLine = (titleLine: string) => {
  const title = titleLine.replace(/\([^)]+\)$/g, '').trim();
  const authorMatches = /\((?<name>[^)]+)\)$/g.exec(titleLine);

  // @ts-ignore
  const author = authorMatches?.groups?.["name"]?.trim();

  return { title, author };
}

export const parseMetaLine = (metaLine: string): KindleHighlight => {
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

  const locationVal = locationRx.exec(metaLine)?.groups;

  if (!locationVal) {
    throw new Error(`Could not find location: ${metaLine}`);
  }

  let start: number | undefined;
  let end: number | undefined;

  if (locationVal['start']) {
    start = parseInt(locationVal['start']);
  }

  if (locationVal['end']) {
    end = parseInt(locationVal['end']);
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
    location: {
      start,
      end
    }
  } as KindleHighlight;
}

export const parseClipping = (clipping: string): KindleHighlight & BookMetadata => {
  const lines = clipping.trim().split(/\n/);
  console.info({ lines });
  if (lines.length < 2) {
    throw new Error(`Could not parse clipping, not enough lines: ${clipping}`);
  }

  const title = parseTitleLine(lines.shift()!);
  const metadata = parseMetaLine(lines.shift()!);

  const content = lines.join('\n').trim();

  return {
    ...title,
    ...metadata,
    content
  };
}

export const parseKindleHighlights = (content: string): Array<KindleBook> => {
  const clippings = content.split(/^==========$/gm).map(parseClipping);
  return clippings.reduce((result, clipping) => {
    let book = result.find((b) => b.title === clipping.title && b.author === clipping.author);

    if (!book) {
      book = {
        title: clipping.title,
        author: clipping.author,
        highlights: [],
        lastHighlight: clipping.timestamp
      };
      result.push(book);
    }

    if (book.lastHighlight < clipping.timestamp) {
      book.lastHighlight = clipping.timestamp;
    }

    book.highlights.push({
      content: clipping.content,
      location: clipping.location,
      timestamp: clipping.timestamp,
      type: clipping.type,
      page: clipping.page
    });

    return result;
  }, [] as Array<KindleBook>);
}