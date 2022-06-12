import {
  searchNearbyBomb,
  increaseTileWeight,
} from 'components/MatrixGrid/MatrixRenderer';

describe('MatrixRender', () => {
  describe('increaseTileWeight', () => {
    it('Should increase exactly surrounding tiles', () => {
      const input = [
        [0, 0, 0, 0, 0],
        [0, 0, -1, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
      ];

      // eslint-disable-next-line max-nested-callbacks
      increaseTileWeight(1, 2, 5, (x, y) => input[x][y]++);
      expect(input).toStrictEqual([
        [0, 1, 1, 1, 0],
        [0, 1, -1, 1, 0],
        [0, 1, 1, 1, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
      ]);
    });
    it('Should ignore the bounds', () => {
      const input = [
        [0, 0, 0, 0, -1],
        [0, 0, 0, 1, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
      ];

      // eslint-disable-next-line max-nested-callbacks
      increaseTileWeight(0, 4, 5, (x, y) => input[x][y]++);
      expect(input).toStrictEqual([
        [0, 0, 0, 1, -1],
        [0, 0, 0, 2, 1],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
      ]);
    });
  });

  describe('searchNearbyBomb', () => {
    const input = [
      [0, 1, 1, 0, 0],
      [0, 0, -1, 1, 0],
      [0, 0, 0, 1, 1],
      [0, 0, 0, 0, 1],
      [0, 0, 0, 0, 0],
    ];
    searchNearbyBomb(input, 0, 0, (x, y) => {
      if (input[x][y] === 1 || isNaN(input[x][y])) return false;
      input[x][y] = NaN;
      return true;
    });
    expect(input).toStrictEqual([
      [NaN, 1, 1, 0, 0],
      [NaN, NaN, -1, 1, 0],
      [NaN, NaN, NaN, 1, 1],
      [NaN, NaN, NaN, NaN, 1],
      [NaN, NaN, NaN, NaN, NaN],
    ]);
  });
});
