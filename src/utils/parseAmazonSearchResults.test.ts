import { parseAmazonSearchResults } from "./parseAmazonSearchResults";
import * as fs from 'fs';
import * as path from 'path';

  describe('parseSearchResults', () => {
    let content: string;
    beforeAll(async () => {
      content = await fs.promises.readFile(path.join(__dirname, '..', '..', 'test_data', 'searchResults.html'), {
        encoding: 'utf-8'
      });
    });

    it('should parse all results', () => {
      const results = parseAmazonSearchResults(content);
      expect(results).toHaveLength(16);
    });

    it('should parse ASIN', () => {
      const results = parseAmazonSearchResults(content);
      const first = results[0];
      expect(first).toHaveProperty('asin', 'B09V5M8FR5');
    });

    it('should parse author', () => {
      const results = parseAmazonSearchResults(content);
      const first = results[0];
      expect(first).toHaveProperty('author', 'Sönke Ahrens');
    });

    it('should parse title', () => {
      const results = parseAmazonSearchResults(content);
      const first = results[0];
      expect(first).toHaveProperty('title', 'How to Take Smart Notes: One Simple Technique to Boost Writing, Learning and Thinking');
    });

    it('should parse product path', () => {
      const results = parseAmazonSearchResults(content);
      const first = results[0];
      expect(first).toHaveProperty('productPath', '/How-Take-Smart-Notes-Technique-ebook/dp/B09V5M8FR5');
    });
  });