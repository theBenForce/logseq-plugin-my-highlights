import { parseSearchResults } from "./useBookDetailsSearch";
import * as fs from 'fs';
import * as path from 'path';

describe('useBookDetailsSearch', () => {
  describe('parseSearchResults', () => {
    let content: string;
    beforeAll(async () => {
      content = await fs.promises.readFile(path.join(__dirname, '..', '..', 'test_data', 'searchResults.html'), {
        encoding: 'utf-8'
      });
    });

    it('should parse all results', () => {
      const results = parseSearchResults(content);
      expect(results).toHaveLength(22);
    });

    it('should parse ASIN', () => {
      const results = parseSearchResults(content);
      const first = results[0];
      expect(first).toHaveProperty('asin', 'B09V5M8FR5');
    });

    it('should parse author', () => {
      const results = parseSearchResults(content);
      const first = results[0];
      expect(first).toHaveProperty('author', 'Sönke Ahrens');
    });

    it('should parse title', () => {
      const results = parseSearchResults(content);
      const first = results[0];
      expect(first).toHaveProperty('title', 'How to Take Smart Notes: One Simple Technique to Boost Writing, Learning and Thinking');
    });
  });
});