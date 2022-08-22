import { getBookId } from "./getBookId";
import { KindleBook } from "./parseKindleHighlights";

describe('getBookId', () => {
  it('should give the same id if an array of authors is provided', () => {
    const result = getBookId({
      title: 'Abundance: The Future Is Better Than You Think',
      authors: [
        'Diamandis, Peter H.',
        'Kotler, Steven'
      ]
    } as KindleBook);

    expect(result).toEqual('c09ed53e1147551a70d5e4de53802532100ac485f3914c5be09f5f85');
  })
});