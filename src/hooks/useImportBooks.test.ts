import { nameToLink } from './useImportBooks';

describe('useImportBooks', () => {
  describe('nameToLink', () => {
    it('should create a link', () => {
      const result = nameToLink()('Last, First');

      expect(result).toEqual('[[Last, First]]');
    });

    it('should reverse name order when set', () => {
      const result = nameToLink({ reverseNameOrder: true })('Last, First');

      expect(result).toEqual('[[First Last]]');
    })
  });
});