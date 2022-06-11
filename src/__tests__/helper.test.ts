import { mergeClassname, generateSearchParams } from '../utils/helpers';

describe('Helper functions', () => {
  describe('mergeClassname', () => {
    it('Should generate valid classname', () => {
      const classes = [null, undefined, NaN, 0, 1, 'gg'];
      expect(mergeClassname(...classes)).toBe('0 1 gg');
    });
  });

  describe('generateSearchParams', () => {
    it('Should generate velid search params string', () => {
      const params = {
        thinh: 1,
        meo: 2,
      };
      expect(generateSearchParams(params)).toBe('thinh=1&meo=2');
    });
  });
});
